// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyDg0qFZV7wh6KfocHfw2JRC-Idv8yAaSic",
    authDomain: "whatsapp-156a6.firebaseapp.com",
    databaseURL: "https://whatsapp-156a6-default-rtdb.firebaseio.com",
    projectId: "whatsapp-156a6",
    storageBucket: "whatsapp-156a6.appspot.com",
    messagingSenderId: "236478826016",
    appId: "1:236478826016:web:34a9fa5b51c69f63045e45",
    measurementId: "G-0LY6WH95VM"
};

// Firebase'i Başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// Global Değişkenler
let allProducts = []; 
let featureCount = 0;
let isEditing = false;
let editingProductKey = '';
let existingProductData = {};
window.excelData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();

    // Menü Eventleri
    document.getElementById('navAddProduct').addEventListener('click', () => {
        clearProductForm();
        showAddProductForm();
    });
    document.getElementById('navSettings').addEventListener('click', showSettingsPage);
    document.getElementById('navExcelUpload').addEventListener('click', showExcelUploadPage);
    document.getElementById('navViewAllProducts').addEventListener('click', showAllProductsPage);

    const allProductsSearchInput = document.getElementById('allProductsSearchInput');
    if (allProductsSearchInput) {
        allProductsSearchInput.addEventListener('input', searchAllProducts);
    }

    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', readExcelFile);
    }

    const addMappingBtn = document.getElementById('addMappingBtn');
    if (addMappingBtn) {
        addMappingBtn.addEventListener('click', addMappingField);
    }

    const uploadExcelBtn = document.getElementById('uploadExcelBtn');
    if (uploadExcelBtn) {
        uploadExcelBtn.addEventListener('click', handleExcelUpload);
    }

    const addFeatureBtn = document.getElementById('addFeatureBtn');
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', addFeature);
    }

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProduct);
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            clearProductForm();
            showAllProductsPage();
        });
    }

    const productNameInput = document.getElementById('productName');
    if (productNameInput) {
        productNameInput.addEventListener('input', updatePreview);
    }
    const productCodeInput = document.getElementById('productCode');
    if (productCodeInput) {
        productCodeInput.addEventListener('input', updatePreview);
    }
    const listPriceInput = document.getElementById('listPrice');
    if (listPriceInput) {
        listPriceInput.addEventListener('input', updatePreview);
    }
    const discountedPriceInput = document.getElementById('discountedPrice');
    if (discountedPriceInput) {
        discountedPriceInput.addEventListener('input', updatePreview);
    }
    const productDescriptionInput = document.getElementById('productDescription');
    if (productDescriptionInput) {
        productDescriptionInput.addEventListener('input', updatePreview);
    }
    const productImagesInput = document.getElementById('productImages');
    if (productImagesInput) {
        productImagesInput.addEventListener('change', updateImagePreview);
    }

    const downloadLabelBtn = document.getElementById('downloadLabelBtn');
    if (downloadLabelBtn) {
        downloadLabelBtn.addEventListener('click', downloadLabelAsPNG);
    }

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }

    loadSettings();
    loadSettingsForPreview();

    // Admin Paneli Giriş Kontrolü
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
});

function setActiveNav(navId) {
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeNav = document.getElementById(navId);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

function hideAllSections() {
    const sections = ['addProductForm', 'settingsPage', 'excelUploadPage', 'allProductsPage'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('d-none');
        }
    });
}

function showAddProductForm() {
    hideAllSections();
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.classList.remove('d-none');
    }
    setActiveNav('navAddProduct');
}

function showSettingsPage() {
    hideAllSections();
    const settingsPage = document.getElementById('settingsPage');
    if (settingsPage) {
        settingsPage.classList.remove('d-none');
    }
    setActiveNav('navSettings');
}

function showExcelUploadPage() {
    hideAllSections();
    const excelUploadPage = document.getElementById('excelUploadPage');
    if (excelUploadPage) {
        excelUploadPage.classList.remove('d-none');
    }
    setActiveNav('navExcelUpload');
}

function showAllProductsPage() {
    hideAllSections();
    const allProductsPage = document.getElementById('allProductsPage');
    if (allProductsPage) {
        allProductsPage.classList.remove('d-none');
    }
    setActiveNav('navViewAllProducts');
    loadAllProductsWithProgress();
}

function clearProductForm() {
    const formFields = ['productName', 'productLink', 'productCode', 'listPrice', 'discountedPrice', 'productDescription', 'productImages'];
    formFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });

    const featuresContainer = document.getElementById('featuresContainer');
    if (featuresContainer) {
        featuresContainer.innerHTML = '';
    }
    featureCount = 0;

    const previewCarouselInner = document.getElementById('previewCarouselInner');
    if (previewCarouselInner) {
        previewCarouselInner.innerHTML = '';
    }
    const previewFeaturesTable = document.getElementById('previewFeaturesTable');
    if (previewFeaturesTable) {
        previewFeaturesTable.innerHTML = '';
    }
    const previewProductLink = document.getElementById('previewProductLink');
    if (previewProductLink) {
        previewProductLink.innerHTML = '';
    }
    const previewProductName = document.getElementById('previewProductName');
    if (previewProductName) {
        previewProductName.textContent = 'Ürün Adı';
    }
    const previewDiscountedPrice = document.getElementById('previewDiscountedPrice');
    if (previewDiscountedPrice) {
        previewDiscountedPrice.textContent = '0.00 TL';
    }
    const previewListPrice = document.getElementById('previewListPrice');
    if (previewListPrice) {
        previewListPrice.textContent = '';
    }
    const previewProductDescription = document.getElementById('previewProductDescription');
    if (previewProductDescription) {
        previewProductDescription.textContent = 'Ürün açıklaması burada görünecek.';
    }

    isEditing = false;
    editingProductKey = '';
    existingProductData = {};

    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.textContent = 'Yeni Ürün Oluştur';
    }
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="bi bi-save me-1"></i> Kaydet ve QR Kod Oluştur';
    }

    const qrcodeElement = document.getElementById('qrcode');
    if (qrcodeElement) {
        qrcodeElement.innerHTML = '';
    }
    const newProductBtn = document.getElementById('newProductBtn');
    if (newProductBtn) {
        newProductBtn.remove();
    }

    const labelProductName = document.getElementById('labelProductName');
    if (labelProductName) {
        labelProductName.textContent = 'Ürün Adı';
    }
    const labelProductCode = document.getElementById('labelProductCode');
    if (labelProductCode) {
        labelProductCode.textContent = 'Ürün Kodu';
    }
    const labelSalePrice = document.getElementById('labelSalePrice');
    if (labelSalePrice) {
        labelSalePrice.textContent = '0.00 TL (KDV DAHİL)';
    }
    const labelListPrice = document.getElementById('labelListPrice');
    if (labelListPrice) {
        labelListPrice.innerHTML = 'Liste Fiyatı: <strong>0.00 TL</strong> + KDV';
    }
    const labelQRCode = document.getElementById('labelQRCode');
    if (labelQRCode) {
        labelQRCode.innerHTML = '';
    }
}

function addFeature() {
    featureCount++;
    const featuresContainer = document.getElementById('featuresContainer');
    if (!featuresContainer) return;

    const featureDiv = document.createElement('div');
    featureDiv.classList.add('feature', 'card', 'p-3', 'mb-3');
    featureDiv.setAttribute('data-feature-id', featureCount);
    featureDiv.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5>Özellik ${featureCount}</h5>
            <button type="button" class="btn btn-danger btn-sm remove-feature-btn">
                <i class="bi bi-trash"></i>
            </button>
        </div>
        <div class="mb-3">
            <label for="featureCategory${featureCount}" class="form-label">Kategori:</label>
            <input type="text" id="featureCategory${featureCount}" class="form-control" placeholder="Kategori">
        </div>
        <div class="mb-3">
            <label for="featureDescription${featureCount}" class="form-label">Açıklama:</label>
            <input type="text" id="featureDescription${featureCount}" class="form-control" placeholder="Açıklama">
        </div>
        <div class="mb-3">
            <label for="featureFile${featureCount}" class="form-label">Özellik Dosyası (PDF veya PNG):</label>
            <input type="file" id="featureFile${featureCount}" class="form-control" accept=".pdf,.png">
        </div>
    `;
    featuresContainer.appendChild(featureDiv);

    const removeFeatureBtn = featureDiv.querySelector('.remove-feature-btn');
    if (removeFeatureBtn) {
        removeFeatureBtn.addEventListener('click', () => {
            featureDiv.remove();
            updateFeaturePreview();
            updateLabel();
        });
    }

    const featureInputs = featureDiv.querySelectorAll('input');
    featureInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateFeaturePreview();
            updateLabel();
        });
    });
}

// Etiket Güncelleme Fonksiyonu
function updateLabel() {
    const productName = document.getElementById('productName')?.value.trim() || 'Ürün Adı';
    const productCode = document.getElementById('productCode')?.value.trim() || 'Ürün Kodu';
    const listPriceVal = parseFloat(document.getElementById('listPrice')?.value.trim().replace(',', '.')) || 0.00;
    const discountedPriceVal = parseFloat(document.getElementById('discountedPrice')?.value.trim().replace(',', '.')) || 0.00;

    // Fiyat formatlamak için NumberFormat kullanımı
    const formatter = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const formattedListPrice = formatter.format(listPriceVal).replace('', '');
    const formattedDiscountedPrice = formatter.format(discountedPriceVal).replace('', '');

    // Etiketleri güncelle
    const labelProductName = document.getElementById('labelProductName');
    if (labelProductName) labelProductName.textContent = productName;

    const labelProductCode = document.getElementById('labelProductCode');
    if (labelProductCode) labelProductCode.textContent = productCode;

    const labelSalePrice = document.getElementById('labelSalePrice');
    if (labelSalePrice) labelSalePrice.textContent = `${formattedDiscountedPrice} (KDV DAHİL)`;

    const labelListPrice = document.getElementById('labelListPrice');
    if (labelListPrice) labelListPrice.innerHTML = `Liste Fiyatı: <strong>${formattedListPrice}</strong>  + KDV`;
}



// Canlı Önizleme Güncelleme Fonksiyonu
function updatePreview() {
    const productName = document.getElementById('productName')?.value || 'Ürün Adı';
    const listPriceVal = document.getElementById('listPrice')?.value.trim();
    const discountedPriceVal = document.getElementById('discountedPrice')?.value.trim();
    const listPrice = listPriceVal ? listPriceVal + ' TL' : '';
    const discountedPrice = discountedPriceVal ? discountedPriceVal + ' TL' : '0.00 TL';

    const previewProductName = document.getElementById('previewProductName');
    if (previewProductName) previewProductName.textContent = productName;

    const previewDiscountedPrice = document.getElementById('previewDiscountedPrice');
    if (previewDiscountedPrice) previewDiscountedPrice.textContent = discountedPrice;

    const previewListPrice = document.getElementById('previewListPrice');
    if (previewListPrice) previewListPrice.textContent = listPrice;

    const productDescription = document.getElementById('productDescription')?.value.trim() || 'Ürün açıklaması burada görünecek.';
    const previewProductDescription = document.getElementById('previewProductDescription');
    if (previewProductDescription) previewProductDescription.textContent = productDescription;

    const productLink = document.getElementById('productLink')?.value.trim();
    const previewProductLinkElement = document.getElementById('previewProductLink');
    if (previewProductLinkElement) {
        if (productLink) {
            previewProductLinkElement.innerHTML = `<a href="${productLink}" target="_blank">Ürüne Git</a>`;
        } else {
            previewProductLinkElement.innerHTML = '';
        }
    }

    updateFeaturePreview();
    updateLabel();
    updateLabelQRCode(isEditing ? editingProductKey : 'new_product');
}

function updateLabelQRCode(productKey) {
    const labelQRCodeElement = document.getElementById('labelQRCode');
    if (!labelQRCodeElement) return;
    labelQRCodeElement.innerHTML = '';

    const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;

    new QRCode(labelQRCodeElement, {
        text: qrData,
        width: 350,
        height: 350,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

function downloadQRCode(productKey) {
    const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;
    const tempDiv = document.createElement('div');
    new QRCode(tempDiv, {
        text: qrData,
        width: 256,
        height: 256,
    });
    setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas');
        if (!canvas) return;
        const imgData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imgData;
        downloadLink.download = 'qrcode.png';
        downloadLink.click();
    }, 500);
}

function deleteProduct(productKey) {
    if (confirm('Ürünü silmek istediğinize emin misiniz?')) {
        database.ref('products/' + productKey).remove()
            .then(() => {
                alert('Ürün silindi.');
                loadAllProductsWithProgress();
            })
            .catch(error => {
                console.error('Hata:', error);
                alert('Ürün silinirken bir hata oluştu.');
            });
    }
}

function editProduct(productKey) {
    showAddProductForm();
    clearProductForm();
    isEditing = true;
    editingProductKey = productKey;
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'Ürünü Düzenle';
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="bi bi-save me-1"></i> Güncelle';

    database.ref('products/' + productKey).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                existingProductData = data;
                document.getElementById('productName').value = data.productName;
                document.getElementById('productCode').value = data.productCode || '';
                document.getElementById('productLink').value = data.productLink || '';
                document.getElementById('listPrice').value = data.listPrice || '';
                document.getElementById('discountedPrice').value = data.discountedPrice || '';
                document.getElementById('productDescription').value = data.productDescription;

                if (data.features && data.features.length > 0) {
                    data.features.forEach((feature) => {
                        addFeature();
                        const featureId = featureCount;
                        document.getElementById(`featureCategory${featureId}`).value = feature.category;
                        document.getElementById(`featureDescription${featureId}`).value = feature.description;
                    });
                    updateFeaturePreview();
                }

                updatePreview();
                updateLabel();
                updateImagePreview();
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Ürün yüklenirken bir hata oluştu.');
        });
}

function saveSettings() {
    const email = document.getElementById('settingsEmail')?.value.trim();
    const phone = document.getElementById('settingsPhone')?.value.trim();
    const address = document.getElementById('settingsAddress')?.value.trim();

    const settingsData = {
        email: email,
        phone: phone,
        address: address
    };

    database.ref('settings').set(settingsData)
        .then(() => {
            alert('Ayarlar kaydedildi.');
            loadSettingsForPreview();
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Ayarlar kaydedilirken bir hata oluştu.');
        });
}

function loadSettings() {
    database.ref('settings').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                const settingsEmail = document.getElementById('settingsEmail');
                const settingsPhone = document.getElementById('settingsPhone');
                const settingsAddress = document.getElementById('settingsAddress');
                if (settingsEmail) settingsEmail.value = data.email || '';
                if (settingsPhone) settingsPhone.value = data.phone || '';
                if (settingsAddress) settingsAddress.value = data.address || '';
            }
        })
        .catch(error => {
            console.error('Hata:', error);
        });
}

function loadSettingsForPreview() {
    database.ref('settings').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                const previewPhone = document.getElementById('previewPhone');
                const previewEmail = document.getElementById('previewEmail');
                if (previewPhone) previewPhone.textContent = data.phone || 'Telefon';
                if (previewEmail) previewEmail.textContent = data.email || 'E-posta';
            }
        })
        .catch(error => {
            console.error('Hata:', error);
        });
}

function loadAllProducts() {
    database.ref('products').once('value')
        .then(snapshot => {
            allProducts = [];
            snapshot.forEach(childSnapshot => {
                const productKey = childSnapshot.key;
                const productData = childSnapshot.val();
                allProducts.push({ key: productKey, ...productData });
            });
            showAllProductsPage();
        })
        .catch(error => {
            console.error('Hata:', error);
        });
}

function displayAllProducts(products) {
    const allProductsTableBody = document.querySelector('#allProductsTable tbody');
    if (!allProductsTableBody) return;
    allProductsTableBody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.productName}</td>
            <td>${product.productCode || ''}</td>
            <td>${product.listPrice || ''} TL</td>
            <td>${product.discountedPrice || ''} TL</td>
            <td>${product.stock || 0}</td>
            <td>${product.saleable ? 'Evet' : 'Hayır'}</td>
            <td class="text-end">
                <button class="btn btn-warning btn-sm me-1" onclick="editProduct('${product.key}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.key}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        allProductsTableBody.appendChild(tr);
    });
}

function loadAllProductsWithProgress() {
    const allProductsTableBody = document.querySelector('#allProductsTable tbody');
    if (!allProductsTableBody) return;
    allProductsTableBody.innerHTML = '';

    const allProductsProgress = document.getElementById('allProductsProgress');
    const allProductsProgressBar = document.getElementById('allProductsProgressBar');
    if (allProductsProgress && allProductsProgressBar) {
        allProductsProgress.style.display = 'block';
        allProductsProgressBar.style.width = '0%';
        allProductsProgressBar.textContent = '0%';
    }

    database.ref('products').once('value')
        .then(snapshot => {
            const totalProducts = snapshot.numChildren();
            let loadedProducts = 0;
            allProducts = [];

            snapshot.forEach(childSnapshot => {
                const productKey = childSnapshot.key;
                const productData = childSnapshot.val();
                allProducts.push({ key: productKey, ...productData });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${productData.productName}</td>
                    <td>${productData.productCode || ''}</td>
                    <td>${productData.listPrice || ''} TL</td>
                    <td>${productData.discountedPrice || ''} TL</td>
                    <td>${productData.stock || 0}</td>
                    <td>${productData.saleable ? 'Evet' : 'Hayır'}</td>
                    <td class="text-end">
                        <button class="btn btn-warning btn-sm me-1" onclick="editProduct('${productKey}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${productKey}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                allProductsTableBody.appendChild(tr);

                loadedProducts++;
                const progress = Math.round((loadedProducts / totalProducts) * 100);
                if (allProductsProgressBar) {
                    allProductsProgressBar.style.width = `${progress}%`;
                    allProductsProgressBar.textContent = `${progress}%`;
                }

                if (loadedProducts === totalProducts && allProductsProgress) {
                    allProductsProgress.style.display = 'none';
                }
            });

            const allProductsCount = document.getElementById('allProductsCount');
            if (allProductsCount) {
                allProductsCount.textContent = `Toplam Ürün: ${allProducts.length}`;
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            const allProductsProgress = document.getElementById('allProductsProgress');
            if (allProductsProgress) {
                allProductsProgress.style.display = 'none';
            }
            alert('Ürünler yüklenirken bir hata oluştu.');
        });
}

function searchAllProducts() {
    const searchValue = document.getElementById('allProductsSearchInput').value.trim().toLowerCase();
    const filteredProducts = allProducts.filter(product =>
        (product.productName && product.productName.toLowerCase().includes(searchValue)) ||
        (product.productCode && product.productCode.toLowerCase().includes(searchValue))
    );
    displayAllProducts(filteredProducts);
    const allProductsCount = document.getElementById('allProductsCount');
    if (allProductsCount) {
        allProductsCount.textContent = `Toplam Ürün: ${filteredProducts.length}`;
    }
}

function readExcelFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            alert('Excel dosyası başarıyla yüklendi. Güncelleme işlemini başlatmak için "Yükle ve Güncelle" butonuna basın.');
            window.excelData = excelData;
        };
        reader.readAsArrayBuffer(file);
    }
}

function addMappingField() {
    const mappingContainer = document.getElementById('columnMapping');
    if (!mappingContainer) return;

    const mappingRow = document.createElement('div');
    mappingRow.classList.add('row', 'mb-2');
    mappingRow.innerHTML = `
        <div class="col-md-6">
            <select class="form-select update-field">
                <option value="listPrice">Liste Fiyatı</option>
                <option value="discountedPrice">İndirimli Fiyat</option>
                <option value="stock">Mevcut Stok</option>
                <option value="saleable">Satılabilir</option>
            </select>
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control excel-column-name" placeholder="Excel Sütun İsmi">
        </div>
    `;
    mappingContainer.appendChild(mappingRow);
}

async function handleExcelUpload() {
    if (!window.excelData) {
        alert('Lütfen önce bir Excel dosyası yükleyin.');
        return;
    }

    try {
        const productCodeColumnName = document.getElementById('productCodeColumnName')?.value.trim().toUpperCase();
        if (!productCodeColumnName) {
            alert('Lütfen ürün kodu sütun adını giriniz.');
            return;
        }

        const mappings = [];
        const mappingRows = document.querySelectorAll('#columnMapping .row');
        mappingRows.forEach(row => {
            const field = row.querySelector('.update-field')?.value;
            const columnName = row.querySelector('.excel-column-name')?.value.trim().toUpperCase();
            if (field && columnName) {
                mappings.push({ field, columnName });
            }
        });

        if (mappings.length === 0) {
            alert('Lütfen en az bir alan eşleştirmesi yapın.');
            return;
        }

        const headers = window.excelData[0].map(header => header.toString().toUpperCase());
        const productCodeIndex = headers.indexOf(productCodeColumnName);

        if (productCodeIndex === -1) {
            alert(`Excel dosyasında "${productCodeColumnName}" sütunu bulunamadı.`);
            return;
        }

        mappings.forEach(mapping => {
            mapping.index = headers.indexOf(mapping.columnName);
            if (mapping.index === -1) {
                alert(`Excel dosyasında "${mapping.columnName}" sütunu bulunamadı.`);
            }
        });

        const totalRows = window.excelData.length - 1;
        let processedRows = 0;

        const uploadProgress = document.getElementById('excelUploadProgress');
        const progressBar = document.getElementById('excelProgressBar');
        if (uploadProgress && progressBar) {
            uploadProgress.classList.remove('d-none');
            uploadProgress.style.display = 'block';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }

        for (let i = 1; i < window.excelData.length; i++) {
            const row = window.excelData[i];
            const productCode = row[productCodeIndex];

            if (productCode) {
                const snapshot = await database.ref('products').orderByChild('productCode').equalTo(productCode.toString()).once('value');
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        const updates = {};
                        mappings.forEach(mapping => {
                            const value = row[mapping.index];
                            if (value !== undefined && value !== null && value !== '') {
                                if (mapping.field === 'saleable') {
                                    updates[mapping.field] = value.toString().toLowerCase() === 'evet';
                                } else {
                                    updates[mapping.field] = value.toString();
                                }
                            }
                        });
                        childSnapshot.ref.update(updates);
                    });
                } else {
                    console.log(`Ürün kodu "${productCode}" veritabanında bulunamadı.`);
                }
            }

            processedRows++;
            let progress = Math.round((processedRows / totalRows) * 100);
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
                progressBar.textContent = `${progress}%`;
            }
        }

        alert('Güncelleme işlemi başarıyla tamamlandı.');

        if (uploadProgress && progressBar) {
            uploadProgress.classList.add('d-none');
            uploadProgress.style.display = 'none';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }

        window.excelData = null;
        const excelFileInput = document.getElementById('excelFileInput');
        if (excelFileInput) {
            excelFileInput.value = '';
        }

    } catch (error) {
        console.error('Excel dosyası işlenirken hata oluştu:', error);
        alert('Excel dosyası işlenirken hata oluştu.');
        const uploadProgress = document.getElementById('excelUploadProgress');
        const progressBar = document.getElementById('excelProgressBar');
        if (uploadProgress && progressBar) {
            uploadProgress.classList.add('d-none');
            uploadProgress.style.display = 'none';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }
    }
}

function downloadLabelAsPNG() {
    const labelElement = document.getElementById('labelElement');
    if (!labelElement) return;
    html2canvas(labelElement, {
        scale: 2,
        backgroundColor: null
    }).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'etiket.png';
        link.click();
    });
}

function updateImagePreview() {
    const previewCarouselInner = document.getElementById('previewCarouselInner');
    if (!previewCarouselInner) return;
    previewCarouselInner.innerHTML = '';
    const files = document.getElementById('productImages')?.files;

    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            if (i === 0) {
                carouselItem.classList.add('active');
            }
            const img = document.createElement('img');
            img.src = URL.createObjectURL(files[i]);
            img.className = 'd-block w-100';
            carouselItem.appendChild(img);
            previewCarouselInner.appendChild(carouselItem);
        }
    } else {
        if (isEditing && existingProductData.images && existingProductData.images.length > 0) {
            existingProductData.images.forEach((imageUrl, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.className = 'carousel-item';
                if (index === 0) {
                    carouselItem.classList.add('active');
                }
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'd-block w-100';
                carouselItem.appendChild(img);
                previewCarouselInner.appendChild(carouselItem);
            });
        } else {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item active';
            const img = document.createElement('img');
            img.src = 'placeholder.jpg';
            img.className = 'd-block w-100';
            carouselItem.appendChild(img);
            previewCarouselInner.appendChild(carouselItem);
        }
    }
}

function updateFeaturePreview() {
    const previewFeaturesTable = document.getElementById('previewFeaturesTable');
    if (!previewFeaturesTable) return;
    previewFeaturesTable.innerHTML = '';
    const features = document.querySelectorAll('.feature');
    features.forEach(featureDiv => {
        const featureId = featureDiv.getAttribute('data-feature-id');
        const categoryElement = featureDiv.querySelector(`#featureCategory${featureId}`);
        const descriptionElement = featureDiv.querySelector(`#featureDescription${featureId}`);

        const category = categoryElement ? categoryElement.value.trim() || 'Kategori' : 'Kategori';
        const description = descriptionElement ? descriptionElement.value.trim() || 'Açıklama' : 'Açıklama';

        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = category;
        const td = document.createElement('td');
        td.textContent = description;

        tr.appendChild(th);
        tr.appendChild(td);

        previewFeaturesTable.appendChild(tr);
    });
}

async function saveProduct() {
    const productName = document.getElementById('productName')?.value.trim();
    const productCode = document.getElementById('productCode')?.value.trim();
    const listPrice = document.getElementById('listPrice')?.value.trim();
    const discountedPrice = document.getElementById('discountedPrice')?.value.trim();
    const productLink = document.getElementById('productLink')?.value.trim();
    const productDescription = document.getElementById('productDescription')?.value.trim();
    const productImages = document.getElementById('productImages')?.files;

    if (productName && productCode && productDescription) {
        let productKey = isEditing ? editingProductKey : database.ref().child('products').push().key;

        const productData = {
            productName: productName,
            productCode: productCode,
            listPrice: listPrice,
            discountedPrice: discountedPrice,
            productDescription: productDescription,
            productLink: productLink,
            images: isEditing ? existingProductData.images || [] : [],
            features: [],
            stock: existingProductData.stock || 0,
            saleable: existingProductData.saleable || false
        };

        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');

        try {
            let totalFiles = (productImages ? productImages.length : 0) + document.querySelectorAll('.feature input[type="file"]').length;
            let uploadedFiles = 0;

            if (uploadProgress && progressBar) {
                uploadProgress.classList.remove('d-none');
                uploadProgress.style.display = 'block';
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
            }

            if (productImages && productImages.length > 0) {
                productData.images = [];
                for (let i = 0; i < productImages.length; i++) {
                    const imageFile = productImages[i];
                    const storageRef = storage.ref().child(`products/${productKey}/images/${imageFile.name}`);
                    const snapshot = await storageRef.put(imageFile);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    productData.images.push(downloadURL);

                    uploadedFiles++;
                    if (progressBar) {
                        let progress = Math.round((uploadedFiles / totalFiles) * 100);
                        progressBar.style.width = `${progress}%`;
                        progressBar.textContent = `${progress}%`;
                    }
                }
            }

            const features = document.querySelectorAll('.feature');
            for (let i = 0; i < features.length; i++) {
                const featureDiv = features[i];
                const featureId = featureDiv.getAttribute('data-feature-id');
                const category = featureDiv.querySelector(`#featureCategory${featureId}`)?.value.trim();
                const description = featureDiv.querySelector(`#featureDescription${featureId}`)?.value.trim();
                const featureFile = featureDiv.querySelector(`#featureFile${featureId}`)?.files[0];

                let featureFileURL = '';

                if (featureFile) {
                    const storageRef = storage.ref().child(`products/${productKey}/features/${featureFile.name}`);
                    const snapshot = await storageRef.put(featureFile);
                    featureFileURL = await snapshot.ref.getDownloadURL();

                    uploadedFiles++;
                    if (progressBar) {
                        let progress = Math.round((uploadedFiles / totalFiles) * 100);
                        progressBar.style.width = `${progress}%`;
                        progressBar.textContent = `${progress}%`;
                    }
                } else if (isEditing && existingProductData.features && existingProductData.features[i]) {
                    featureFileURL = existingProductData.features[i].fileURL || '';
                }

                productData.features.push({
                    category: category || 'Kategori',
                    description: description || 'Açıklama',
                    fileURL: featureFileURL
                });
            }

            await database.ref('products/' + productKey).set(productData);

            alert(isEditing ? 'Ürün güncellendi!' : 'Kayıt başarılı! QR kodu aşağıda görüntüleyebilir ve indirebilirsiniz.');

            const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;
            const qrcodeElement = document.getElementById('qrcode');
            if (qrcodeElement) {
                qrcodeElement.innerHTML = '';
                new QRCode(qrcodeElement, {
                    text: qrData,
                    width: 256,
                    height: 256,
                });

                setTimeout(() => {
                    const canvas = qrcodeElement.querySelector('canvas');
                    if (!canvas) return;
                    const imgData = canvas.toDataURL('image/png');
                    const sanitizedProductName = productName.replace(/[<>:"\/\\|?*]+/g, '_');
                    const downloadLink = document.createElement('a');
                    downloadLink.href = imgData;
                    downloadLink.download = `${sanitizedProductName}.png`;
                    downloadLink.textContent = 'QR Kodu İndir';
                    downloadLink.classList.add('btn', 'btn-primary', 'mt-3');
                    qrcodeElement.appendChild(downloadLink);
                }, 500);
            }

            updateLabelQRCode(productKey);

            const newProductBtn = document.createElement('button');
            newProductBtn.textContent = 'Yeni Ürün Ekle';
            newProductBtn.id = 'newProductBtn';
            newProductBtn.classList.add('btn', 'btn-success', 'mt-3');
            newProductBtn.onclick = () => {
                clearProductForm();
                showAddProductForm();
            };
            const addProductForm = document.getElementById('addProductForm');
            if (addProductForm) {
                addProductForm.appendChild(newProductBtn);
            }

            if (uploadProgress && progressBar) {
                uploadProgress.classList.add('d-none');
                uploadProgress.style.display = 'none';
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
            }

            const labelContainer = document.getElementById('labelContainer');
            if (labelContainer) {
                labelContainer.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            console.error('Hata:', error);
            alert('Ürün kaydedilirken bir hata oluştu.');
            if (uploadProgress && progressBar) {
                uploadProgress.classList.add('d-none');
                uploadProgress.style.display = 'none';
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
            }
        }
    }
}
