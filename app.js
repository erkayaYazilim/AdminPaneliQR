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

// Sayfa Yüklenince Başlangıç Fonksiyonu
document.addEventListener('DOMContentLoaded', () => {
    showDashboard();

    // Menü Barı Event Listeners
    document.getElementById('navDashboard').addEventListener('click', showDashboard);
    document.getElementById('navAddProduct').addEventListener('click', () => {
        clearProductForm();
        showAddProductForm();
    });
    document.getElementById('navSettings').addEventListener('click', showSettingsPage);
    document.getElementById('navExcelUpload').addEventListener('click', showExcelUploadPage); // Excel sayfası gösterim fonksiyonu eklendi

    // Arama İşlevi
    document.getElementById('searchInput').addEventListener('input', searchProducts);

    // Excel Dosyası Yükleme Butonu
    document.getElementById('excelFileInput').addEventListener('change', handleExcelUpload);

    // Yeni Ürün Ekleme
    document.getElementById('addFeatureBtn').addEventListener('click', addFeature);
    document.getElementById('saveBtn').addEventListener('click', saveProduct);
    document.getElementById('cancelBtn').addEventListener('click', () => {
        clearProductForm();
        showDashboard();
    });

    // Canlı Önizleme Güncellemeleri
    document.getElementById('productName').addEventListener('input', updatePreview);
    document.getElementById('productCode').addEventListener('input', updatePreview);
    document.getElementById('productPrice').addEventListener('input', updatePreview);
    document.getElementById('productDescription').addEventListener('input', updatePreview);
    document.getElementById('productImages').addEventListener('change', updateImagePreview);

    // Ayarları Kaydetme
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // Ürünleri Yükle
    loadProducts();

    // Ayarları Yükle
    loadSettings();

    // Canlı Önizleme için Ayarları Yükle
    loadSettingsForPreview();
});
document.getElementById('navExcelUpload').addEventListener('click', showExcelUploadPage);
function showExcelUploadPage() {
    hideAllSections(); // Tüm diğer bölümleri gizler
    document.getElementById('excelUploadPage').classList.remove('d-none'); // Excel yükleme sayfasını gösterir
    setActiveNav('navExcelUpload'); // Menüde ilgili öğeyi aktif yapar
}



// Sayfa Gösterim Fonksiyonları
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('d-none');
    setActiveNav('navDashboard');
}

function showAddProductForm() {
    hideAllSections();
    document.getElementById('addProductForm').classList.remove('d-none');
    setActiveNav('navAddProduct');
}

function showSettingsPage() {
    hideAllSections();
    document.getElementById('settingsPage').classList.remove('d-none');
    setActiveNav('navSettings');
}

function hideAllSections() {
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('addProductForm').classList.add('d-none');
    document.getElementById('settingsPage').classList.add('d-none');
    document.getElementById('excelUploadPage').classList.add('d-none');
}


function setActiveNav(navId) {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(navId).classList.add('active');
}

// Ürün Ekleme İşlemleri
let featureCount = 0;
let isEditing = false;
let editingProductKey = '';
let existingProductData = {};

function clearProductForm() {
    // Form alanlarını sıfırlayın
    document.getElementById('productName').value = '';
    document.getElementById('productLink').value = '';
    document.getElementById('productCode').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImages').value = '';
    // Özellikleri temizleyin
    document.getElementById('featuresContainer').innerHTML = '';
    featureCount = 0;
    // Önizlemeyi sıfırlayın
    document.getElementById('previewCarouselInner').innerHTML = '';
    document.getElementById('previewFeaturesTable').innerHTML = '';
    document.getElementById('previewProductLink').innerHTML = '';
    document.getElementById('previewProductName').textContent = 'Ürün Adı';
    document.getElementById('previewProductPrice').textContent = '0.00 TL';
    document.getElementById('previewProductDescription').textContent = 'Ürün açıklaması burada görünecek.';
    // Durumları sıfırlayın
    isEditing = false;
    editingProductKey = '';
    existingProductData = {};
    document.getElementById('formTitle').textContent = 'Yeni Ürün Oluştur';
    document.getElementById('saveBtn').innerHTML = '<i class="bi bi-save me-1"></i> Kaydet ve QR Kod Oluştur';
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('newProductBtn')?.remove();
}

function addFeature() {
    featureCount++;
    const featuresContainer = document.getElementById('featuresContainer');
    const featureDiv = document.createElement('div');
    featureDiv.classList.add('feature', 'card', 'p-3', 'mb-3');
    featureDiv.setAttribute('data-feature-id', featureCount);
    featureDiv.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5>Özellik ${featureCount}</h5>
            <button type="button" class="btn btn-danger btn-sm remove-feature-btn"><i class="bi bi-trash"></i></button>
        </div>
        <div class="mb-3">
            <label for="featureCategory${featureCount}" class="form-label">Kategori:</label>
            <input type="text" id="featureCategory${featureCount}" class="form-control" placeholder="Kategori">
        </div>
        <div class="mb-3">
            <label for="featureImage${featureCount}" class="form-label">Özellik Resmi:</label>
            <input type="file" id="featureImage${featureCount}" class="form-control">
        </div>
        <div class="mb-3">
            <label for="featureDescription${featureCount}" class="form-label">Açıklama:</label>
            <input type="text" id="featureDescription${featureCount}" class="form-control" placeholder="Açıklama">
        </div>
    `;
    featuresContainer.appendChild(featureDiv);

    // Özellik Kaldırma Butonu
    featureDiv.querySelector('.remove-feature-btn').addEventListener('click', () => {
        featureDiv.remove();
        updateFeaturePreview();
    });

    // Canlı Önizleme Güncelleme
    featureDiv.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateFeaturePreview);
    });
    featureDiv.querySelector(`#featureImage${featureCount}`).addEventListener('change', updateFeaturePreview);
}

function updatePreview() {
    // Mevcut önizleme güncellemeleri...
    document.getElementById('previewProductName').textContent = document.getElementById('productName').value || 'Ürün Adı';
    document.getElementById('previewProductPrice').textContent = document.getElementById('productPrice').value ? document.getElementById('productPrice').value + ' TL' : '0.00 TL';
    document.getElementById('previewProductDescription').textContent = document.getElementById('productDescription').value || 'Ürün açıklaması burada görünecek.';


    const productLink = document.getElementById('productLink').value.trim();
    const previewProductLinkElement = document.getElementById('previewProductLink');

    if (productLink) {
        previewProductLinkElement.innerHTML = `<a href="${productLink}" target="_blank">Ürüne Git</a>`;
    } else {
        previewProductLinkElement.innerHTML = '';
    }
    // Özellikleri güncelle
    updateFeaturePreview();

    // Etiket önizlemesini güncelle
    document.getElementById('labelProductName').textContent = document.getElementById('productName').value || 'Ürün Adı';
    document.getElementById('labelProductCode').textContent = document.getElementById('productCode').value || 'Ürün Kodu';

    // Etiket QR kodunu güncelle
    const productKey = isEditing ? editingProductKey : 'new_product';
    updateLabelQRCode(productKey);
}

document.getElementById('printLabelBtn').addEventListener('click', printLabel);
// Etiket QR kodunu güncelleme fonksiyonu
function updateLabelQRCode(productKey) {
    const labelQRCodeElement = document.getElementById('labelQRCode');
    labelQRCodeElement.innerHTML = '';
    const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;

    new QRCode(labelQRCodeElement, {
        text: qrData,
        width: 70, // piksel cinsinden genişlik
        height: 70, // piksel cinsinden yükseklik
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Etiketi Yazdır fonksiyonu
function printLabel() {
    const labelContent = document.getElementById('labelContent').innerHTML;
    const printWindow = window.open('', '', 'height=450,width=600');
    printWindow.document.write('<html><head><title>Etiket Yazdır</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@page { size: 6cm 4.5cm; margin: 0; }');
    printWindow.document.write('body { margin: 0;padding: 0; }');
    printWindow.document.write('.label { width: 6cm; height: 4.5cm; border: 0px solid #000; position: relative; padding: 0cm; box-sizing: border-box; font-family: Arial, sans-serif; }');
    printWindow.document.write('.label-top-left { position: absolute; top: 0.2cm; left: 0.2cm; }');
    printWindow.document.write('.company-name { font-size: 12pt; font-weight: bold; margin-bottom: 0.1cm; }');
    printWindow.document.write('.product-code, .product-name { font-size: 8pt; margin-bottom: 0.1cm; }');
    printWindow.document.write('.label-bottom-right { position: absolute; bottom: 0.2cm; right: 0.2cm; border: 1px solid #000; padding: 0.1cm; }');
    printWindow.document.write('#labelQRCode canvas { width: 1.9cm !important; height: 1.9cm !important; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div class="label">');
    printWindow.document.write(labelContent);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function updateImagePreview() {
    const previewCarouselInner = document.getElementById('previewCarouselInner');
    previewCarouselInner.innerHTML = '';
    const files = document.getElementById('productImages').files;

    if (files.length > 0) {
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
        // Düzenleme sırasında, eğer yeni resim seçilmezse, mevcut resimleri önizlemede göster
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
            // Varsayılan resim
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item active';
            const img = document.createElement('img');
            img.src = 'placeholder.jpg'; // Varsayılan resim yolu
            img.className = 'd-block w-100';
            carouselItem.appendChild(img);
            previewCarouselInner.appendChild(carouselItem);
        }
    }
}

function updateFeaturePreview() {
    const previewFeaturesTable = document.getElementById('previewFeaturesTable');
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
    const productName = document.getElementById('productName').value.trim();
    const productCode = document.getElementById('productCode').value.trim();
    const productPrice = document.getElementById('productPrice').value.trim();
    const productLink = document.getElementById('productLink').value.trim();
    const productDescription = document.getElementById('productDescription').value.trim();
    const productImages = document.getElementById('productImages').files;

    if (productName && productCode && productPrice && productDescription) {
        // Ürün anahtarı belirle
        let productKey = isEditing ? editingProductKey : database.ref().child('products').push().key;

        // Veriyi hazırlayın
        const productData = {
            productName: productName,
            productCode: productCode,
            productPrice: productPrice,
            productDescription: productDescription,
            productLink: productLink,
            images: isEditing ? existingProductData.images || [] : [],
            features: []
        };

        try {
            // Yükleme Progress Bar'ını göster
            const uploadProgress = document.getElementById('uploadProgress');
            const progressBar = document.getElementById('progressBar');
            uploadProgress.classList.remove('d-none');
            let totalFiles = productImages.length + document.querySelectorAll('.feature input[type="file"]').length;
            let uploadedFiles = 0;

            // Ürün resimlerini yükle
            if (productImages.length > 0) {
                productData.images = []; // Eski resimleri sıfırla
                for (let i = 0; i < productImages.length; i++) {
                    const imageFile = productImages[i];
                    const storageRef = storage.ref().child(`products/${productKey}/images/${imageFile.name}`);
                    const snapshot = await storageRef.put(imageFile);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    productData.images.push(downloadURL);

                    // Progress Bar'ı güncelle
                    uploadedFiles++;
                    let progress = Math.round((uploadedFiles / totalFiles) * 100);
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = progress + '%';
                }
            }

            // Özellikleri topla
            const features = document.querySelectorAll('.feature');
            for (let i = 0; i < features.length; i++) {
                const featureDiv = features[i];
                const featureId = featureDiv.getAttribute('data-feature-id');
                const category = featureDiv.querySelector(`#featureCategory${featureId}`).value.trim();
                const description = featureDiv.querySelector(`#featureDescription${featureId}`).value.trim();
                const featureImageFile = featureDiv.querySelector(`#featureImage${featureId}`).files[0];

                let featureImageURL = '';
                if (featureImageFile) {
                    const storageRef = storage.ref().child(`products/${productKey}/features/${featureImageFile.name}`);
                    const snapshot = await storageRef.put(featureImageFile);
                    featureImageURL = await snapshot.ref.getDownloadURL();

                    // Progress Bar'ı güncelle
                    uploadedFiles++;
                    let progress = Math.round((uploadedFiles / totalFiles) * 100);
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = progress + '%';
                } else if (isEditing && existingProductData.features && existingProductData.features[i]) {
                    featureImageURL = existingProductData.features[i].image || '';
                }

                productData.features.push({
                    category: category,
                    description: description,
                    image: featureImageURL
                });
            }

            // Veriyi Realtime Database'e ekle
            await database.ref('products/' + productKey).set(productData);

            alert(isEditing ? 'Ürün güncellendi!' : 'Kayıt başarılı! QR kodu aşağıda görüntüleyebilir ve indirebilirsiniz.');

            // QR kodunu oluştur ve kullanıcıya göster
            const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;

            const qrcodeElement = document.getElementById('qrcode');
            qrcodeElement.innerHTML = ''; // Önceki QR kodunu temizle

            new QRCode(qrcodeElement, {
                text: qrData,
                width: 256,
                height: 256,
            });

            // QR kodunu indirilebilir yap
            setTimeout(() => {
                const canvas = qrcodeElement.querySelector('canvas');
                const imgData = canvas.toDataURL('image/png');

                // Ürün ismini dosya adına uygun hale getirin
                const sanitizedProductName = productName.replace(/[<>:"\/\\|?*]+/g, '_');

                const downloadLink = document.createElement('a');
                downloadLink.href = imgData;
                downloadLink.download = `${sanitizedProductName}.png`;
                downloadLink.textContent = 'QR Kodu İndir';
                downloadLink.classList.add('btn', 'btn-primary', 'mt-3');
                qrcodeElement.appendChild(downloadLink);
            }, 500);

            // Etiket QR kodunu güncelle
            updateLabelQRCode(productKey);

            // Formu sıfırla ve başka bir ürün ekleme butonunu göster
            const newProductBtn = document.createElement('button');
            newProductBtn.textContent = 'Yeni Ürün Ekle';
            newProductBtn.id = 'newProductBtn';
            newProductBtn.classList.add('btn', 'btn-success', 'mt-3');
            newProductBtn.onclick = () => {
                clearProductForm();
                showAddProductForm();
            };
            document.getElementById('addProductForm').appendChild(newProductBtn);

            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';

            loadProducts();

        } catch (error) {
            console.error('Hata:', error);
            alert('Ürün kaydedilirken bir hata oluştu.');
            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }

        // Etiketi göster
        document.getElementById('labelContainer').scrollIntoView({ behavior: 'smooth' });

    } else {
        alert('Lütfen tüm alanları doldurun.');
    }
}

// Ürünleri Yükleme ve Arama İşlevleri
let allProducts = [];

function loadProducts() {
    database.ref('products').once('value')
    .then(snapshot => {
        const productsTableBody = document.querySelector('#productsTable tbody');
        productsTableBody.innerHTML = '';
        allProducts = [];

        snapshot.forEach(childSnapshot => {
            const productKey = childSnapshot.key;
            const productData = childSnapshot.val();
            allProducts.push({ key: productKey, ...productData });

            const imageSrc = (productData.images && productData.images.length > 0) ? productData.images[0] : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imageSrc}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${productData.productName}</td>
                <td>${productData.productCode || ''}</td>
                <td>${productData.productPrice} TL</td>
                <td><img src="" alt="QR Kod" id="qrImg${productKey}" style="width: 50px; height: 50px;"></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="downloadQRCode('${productKey}')"><i class="bi bi-download"></i></button>
                    <button class="btn btn-warning btn-sm" onclick="editProduct('${productKey}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${productKey}')"><i class="bi bi-trash"></i></button>
                </td>
            `;
            productsTableBody.appendChild(tr);

            // QR kodu oluştur ve img etiketi içine yerleştir
            const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;
            const tempDiv = document.createElement('div');
            new QRCode(tempDiv, {
                text: qrData,
                width: 50,
                height: 50,
            });
            setTimeout(() => {
                const canvas = tempDiv.querySelector('canvas');
                const imgData = canvas.toDataURL('image/png');
                document.getElementById(`qrImg${productKey}`).src = imgData;
            }, 500);
        });
    })
    .catch(error => {
        console.error('Hata:', error);
    });
}

function searchProducts() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = allProducts.filter(product =>
        product.productName.toLowerCase().includes(searchValue) ||
        (product.productCode && product.productCode.toLowerCase().includes(searchValue))
    );

    const productsTableBody = document.querySelector('#productsTable tbody');
    productsTableBody.innerHTML = '';

    filteredProducts.forEach(product => {
        const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${imageSrc}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>${product.productName}</td>
            <td>${product.productCode || ''}</td>
            <td>${product.productPrice} TL</td>
            <td><img src="" alt="QR Kod" id="qrImg${product.key}" style="width: 50px; height: 50px;"></td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="downloadQRCode('${product.key}')"><i class="bi bi-download"></i></button>
                <button class="btn btn-warning btn-sm" onclick="editProduct('${product.key}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.key}')"><i class="bi bi-trash"></i></button>
            </td>
        `;
        productsTableBody.appendChild(tr);

        // QR kodu oluştur ve img etiketi içine yerleştir
        const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${product.key}`;
        const tempDiv = document.createElement('div');
        new QRCode(tempDiv, {
            text: qrData,
            width: 50,
            height: 50,
        });
        setTimeout(() => {
            const canvas = tempDiv.querySelector('canvas');
            const imgData = canvas.toDataURL('image/png');
            document.getElementById(`qrImg${product.key}`).src = imgData;
        }, 500);
    });
}

// Excel Dosyasını İşleme ve Fiyat Güncelleme
async function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Başlık satırını al
            const headers = jsonData[0].map(header => header.toString().toUpperCase());
            const adiIndex = headers.indexOf('ADI');
            const koduIndex = headers.indexOf('KODU');
            const fiyatIndex = headers.indexOf('FİYAT');

            if (adiIndex === -1 || koduIndex === -1 || fiyatIndex === -1) {
                alert('Excel dosyası uygun formatta değil. Lütfen "ADI", "KODU" ve "FİYAT" sütunlarını kontrol edin.');
                return;
            }

            // İşlem göstergesi
            const totalRows = jsonData.length - 1;
            let processedRows = 0;

            // Yükleme Progress Bar'ını göster
            const uploadProgress = document.getElementById('excelUploadProgress');
            const progressBar = document.getElementById('excelProgressBar');
            uploadProgress.classList.remove('d-none');

            // Her satırı işle
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                const adi = row[adiIndex];
                const kodu = row[koduIndex];
                const fiyat = row[fiyatIndex];

                if (kodu && fiyat) {
                    // Veritabanında ürün kodu eşleşen ürünleri bul
                    const snapshot = await database.ref('products').orderByChild('productCode').equalTo(kodu.toString()).once('value');
                    snapshot.forEach(childSnapshot => {
                        // Ürün fiyatını güncelle
                        childSnapshot.ref.update({ productPrice: fiyat.toString() });
                    });
                }

                processedRows++;
                // İlerleme yüzdesini göster
                let progress = Math.round((processedRows / totalRows) * 100);
                progressBar.style.width = progress + '%';
                progressBar.textContent = progress + '%';
            }

            alert('Fiyatlar başarıyla güncellendi.');
            loadProducts();

            // Yükleme Progress Bar'ını gizle
            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';

        } catch (error) {
            console.error('Excel dosyası işlenirken hata oluştu:', error);
            alert('Excel dosyası işlenirken hata oluştu.');
            // Yükleme Progress Bar'ını gizle
            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }
    }
}


// QR Kodunu İndirme
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
        const imgData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imgData;
        downloadLink.download = 'qrcode.png';
        downloadLink.click();
    }, 500);
}

// Ürünü Silme
function deleteProduct(productKey) {
    if (confirm('Ürünü silmek istediğinize emin misiniz?')) {
        database.ref('products/' + productKey).remove()
        .then(() => {
            alert('Ürün silindi.');
            loadProducts();
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Ürün silinirken bir hata oluştu.');
        });
    }
}

// Ürünü Düzenleme
function editProduct(productKey) {
    // Formu göster
    showAddProductForm();
    // Formu temizle
    clearProductForm();
    // Durumları ayarla
    isEditing = true;
    editingProductKey = productKey;
    document.getElementById('formTitle').textContent = 'Ürünü Düzenle';
    document.getElementById('saveBtn').innerHTML = '<i class="bi bi-save me-1"></i> Güncelle';

    database.ref('products/' + productKey).once('value')
    .then(snapshot => {
        const data = snapshot.val();
        if (data) {
            existingProductData = data;

            // Formu doldur
            document.getElementById('productName').value = data.productName;
            document.getElementById('productCode').value = data.productCode || '';
            document.getElementById('productLink').value = data.productLink || '';
            document.getElementById('productPrice').value = data.productPrice;
            document.getElementById('productDescription').value = data.productDescription;

            // Resimleri önizlemeye ekle
            if (data.images && data.images.length > 0) {
                const previewCarouselInner = document.getElementById('previewCarouselInner');
                previewCarouselInner.innerHTML = '';
                data.images.forEach((imageUrl, index) => {
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
            }

            // Özellikleri forma ekle
            if (data.features && data.features.length > 0) {
                data.features.forEach((feature) => {
                    addFeature();
                    const featureId = featureCount;
                    document.getElementById(`featureCategory${featureId}`).value = feature.category;
                    document.getElementById(`featureDescription${featureId}`).value = feature.description;
                    // Özellik resimleri için ekleme yapabilirsiniz
                });
                // Özellik önizlemesini güncelle
                updateFeaturePreview();
            }

            // Canlı önizlemeyi güncelle
            updatePreview();
            // Resim önizlemesini güncelle
            updateImagePreview();
        }
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Ürün yüklenirken bir hata oluştu.');
    });
}

// Ayarları Kaydetme ve Yükleme
function saveSettings() {
    const email = document.getElementById('settingsEmail').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();
    const address = document.getElementById('settingsAddress').value.trim();

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
            document.getElementById('settingsEmail').value = data.email || '';
            document.getElementById('settingsPhone').value = data.phone || '';
            document.getElementById('settingsAddress').value = data.address || '';
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
            document.getElementById('previewPhone').textContent = data.phone || 'Telefon';
            document.getElementById('previewEmail').textContent = data.email || 'E-posta';
        }
    })
    .catch(error => {
        console.error('Hata:', error);
    });
}
