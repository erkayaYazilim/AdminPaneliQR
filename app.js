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

    // Arama İşlevi
    document.getElementById('searchInput').addEventListener('input', searchProducts);

    // Yeni Ürün Ekleme
    document.getElementById('addFeatureBtn').addEventListener('click', addFeature);
    document.getElementById('saveBtn').addEventListener('click', saveProduct);

    // Canlı Önizleme Güncellemeleri
    document.getElementById('productName').addEventListener('input', updatePreview);
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
}

function setActiveNav(navId) {
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
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
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImages').value = '';
    // Özellikleri temizleyin
    document.getElementById('featuresContainer').innerHTML = '';
    featureCount = 0;
    // Önizlemeyi sıfırlayın
    document.getElementById('previewCarouselInner').innerHTML = '';
    document.getElementById('previewFeaturesTable').innerHTML = '';
    document.getElementById('previewProductName').textContent = 'Ürün Adı';
    document.getElementById('previewProductPrice').textContent = 'Ürün Fiyatı';
    document.getElementById('previewProductDescription').textContent = 'Ürün Açıklaması';
    // Durumları sıfırlayın
    isEditing = false;
    editingProductKey = '';
    existingProductData = {};
    document.getElementById('formTitle').textContent = 'Yeni Ürün Oluştur';
    document.getElementById('saveBtn').textContent = 'Kaydet ve QR Kod Oluştur';
}

function addFeature() {
    featureCount++;
    const featuresContainer = document.getElementById('featuresContainer');
    const featureDiv = document.createElement('div');
    featureDiv.classList.add('feature');
    featureDiv.setAttribute('data-feature-id', featureCount);
    featureDiv.innerHTML = `
        <h4>Özellik ${featureCount}</h4>
        <button type="button" class="btn btn-danger btn-sm remove-feature-btn">X</button>
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
    document.getElementById('previewProductName').textContent = document.getElementById('productName').value || 'Ürün Adı';
    document.getElementById('previewProductPrice').textContent = document.getElementById('productPrice').value ? document.getElementById('productPrice').value + ' TL' : 'Ürün Fiyatı';
    document.getElementById('previewProductDescription').textContent = document.getElementById('productDescription').value || 'Ürün Açıklaması';

    // Özellikleri güncelle
    updateFeaturePreview();
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
        }
    }
}

function updateFeaturePreview() {
    const previewFeaturesTable = document.getElementById('previewFeaturesTable');
    previewFeaturesTable.innerHTML = '';
    const features = document.querySelectorAll('.feature');
    features.forEach(featureDiv => {
        const featureId = featureDiv.getAttribute('data-feature-id');
        const category = featureDiv.querySelector(`#featureCategory${featureId}`).value.trim() || 'Kategori';
        const description = featureDiv.querySelector(`#featureDescription${featureId}`).value.trim() || 'Açıklama';

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
    const productPrice = document.getElementById('productPrice').value.trim();
    const productDescription = document.getElementById('productDescription').value.trim();
    const productImages = document.getElementById('productImages').files;

    if (productName && productPrice && productDescription) {
        // Ürün anahtarı belirle
        let productKey = isEditing ? editingProductKey : database.ref().child('products').push().key;

        // Veriyi hazırlayın
        const productData = {
            productName: productName,
            productPrice: productPrice,
            productDescription: productDescription,
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

            // Formu sıfırla ve başka bir ürün ekleme butonunu göster
            const newProductBtn = document.createElement('button');
            newProductBtn.textContent = 'Yeni Ürün Ekle';
            newProductBtn.classList.add('btn', 'btn-success', 'mt-3');
            newProductBtn.onclick = clearProductForm;
            document.getElementById('addProductForm').appendChild(newProductBtn);

            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';

            loadProducts();

        } catch (error) {
            console.error('Hata:', error);
        }

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

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${productData.images[0] || ''}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${productData.productName}</td>
                <td>${productData.productPrice} TL</td>
                <td><img src="" alt="QR Kod" id="qrImg${productKey}" style="width: 50px; height: 50px;"></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="downloadQRCode('${productKey}')">QR Kod</button>
                    <button class="btn btn-warning btn-sm" onclick="editProduct('${productKey}')">Düzenle</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${productKey}')">Sil</button>
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
        product.productName.toLowerCase().includes(searchValue)
    );

    const productsTableBody = document.querySelector('#productsTable tbody');
    productsTableBody.innerHTML = '';

    filteredProducts.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.images[0] || ''}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>${product.productName}</td>
            <td>${product.productPrice} TL</td>
            <td><img src="" alt="QR Kod" id="qrImg${product.key}" style="width: 50px; height: 50px;"></td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="downloadQRCode('${product.key}')">QR Kod</button>
                <button class="btn btn-warning btn-sm" onclick="editProduct('${product.key}')">Düzenle</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.key}')">Sil</button>
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
            document.getElementById(`qrImg${product.key}`).src = imgData;
        }, 500);
    });
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
    document.getElementById('saveBtn').textContent = 'Güncelle';

    database.ref('products/' + productKey).once('value')
    .then(snapshot => {
        const data = snapshot.val();
        if (data) {
            existingProductData = data;

            // Formu doldur
            document.getElementById('productName').value = data.productName;
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
        }
    })
    .catch(error => {
        console.error('Hata:', error);
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
    })
    .catch(error => {
        console.error('Hata:', error);
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
