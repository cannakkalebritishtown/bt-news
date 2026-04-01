// --- 1. FIREBASE BAĞLANTISI ---
const firebaseConfig = {
  apiKey: "AIzaSyBndKtgrPBrfkoDOd0cSfHJsf2AnZx-Kyk",
  authDomain: "bt-news-ae667.firebaseapp.com",
  projectId: "bt-news-ae667",
  storageBucket: "bt-news-ae667.firebasestorage.app",
  messagingSenderId: "367457170530",
  appId: "1:367457170530:web:98004ac3d94ed888f08d3b",
  measurementId: "G-KNQ167J3V9",
  databaseURL: "https://bt-news-ae667-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. RESİM KÜÇÜLTME (Hata Çıkmaması İçin En Üstte) ---
const resmiBoyutlandir = (base64Str, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > h) { if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; } }
            else { if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve("");
    });
};

// --- 3. HABERLERİ YÜKLEME ---
function haberleriYukle() {
    const liste = document.getElementById('haber-listesi');
    database.ref('haberler').on('value', (snapshot) => {
        if (!liste) return;
        liste.innerHTML = '<h2>Son Haberler</h2>';
        const veri = snapshot.val();
        if (!veri) { liste.innerHTML += '<p>Henüz haber yok.</p>'; return; }
        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.innerHTML = `<h3>${h.baslik}</h3>${h.resim ? `<img src="${h.resim}" style="width:100%; border-radius:10px;">` : ''}<p>${h.icerik}</p><small>${h.yazar} - ${h.tarih}</small>`;
            liste.appendChild(kart);
        });
    });
}
// --- KATEGORİ FİLTRELEME ---
window.kategoriFiltrele = function(kat) {
    const tumHaberler = document.querySelectorAll('.news-card');
    tumHaberler.forEach(haber => {
        if (kat === 'Hepsi' || haber.dataset.kategori === kat) {
            haber.style.display = 'block';
        } else {
            haber.style.display = 'none';
        }
    });
};

// --- YORUM YAPMA FONKSİYONU ---
window.yorumYap = function(haberId) {
    const yorumInput = document.getElementById(`yorum-in-${haberId}`);
    const yorumText = yorumInput.value;
    if (yorumText) {
        database.ref(`haberler/${haberId}/yorumlar`).push({
            metin: yorumText,
            tarih: new Date().toLocaleString('tr-TR')
        }).then(() => {
            yorumInput.value = "";
            alert("Yorumun gönderildi!");
        });
    }
};

// Haberleri yüklediğin döngünün içine (kart.innerHTML kısmına) 
// dataset ve yorum alanını eklemeyi unutma:
// kart.dataset.kategori = h.kategori;

// --- 4. HABER GÖNDERME ---
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'haber-formu') {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = "Yükleniyor...";

        const hDosya = document.getElementById('h-resim').files[0];
        let resimData = "";

        if (hDosya) {
            const okuyucu = new FileReader();
            resimData = await new Promise(resolve => {
                okuyucu.onload = async () => resolve(await resmiBoyutlandir(okuyucu.result, 800, 600));
                okuyucu.readAsDataURL(hDosya);
            });
        }

        const yeniHaber = {
            baslik: document.getElementById('h-baslik').value,
            yazar: document.getElementById('h-yazar').value,
            icerik: document.getElementById('h-icerik').value,
            resim: resimData,
            tarih: new Date().toLocaleDateString('tr-TR')
        };

        database.ref('haberler').push(yeniHaber).then(() => {
            alert("Haber Yayınlandı! 🗞️");
            e.target.reset();
            btn.disabled = false; btn.innerText = "Hemen Yayınla";
        }).catch(hata => {
            alert("Hata: " + hata.message);
            btn.disabled = false;
        });
    }
});

// --- 5. BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();
    const tarihEl = document.getElementById('tarih-saat');
    if (tarihEl) tarihEl.innerText = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

window.paneliAc = () => {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
    } else { alert("Şifre Yanlış!"); }
};
// --- HABER GÖNDERME BÖLÜMÜ ---
const haberFormu = document.getElementById('haber-formu');

if (haberFormu) {
    haberFormu.addEventListener('submit', async function(e) {
        e.preventDefault(); // Sayfanın kendi kendine yenilenmesini durdurur

        console.log("Haber gönderiliyor..."); // Test için konsola yazar

        const hBaslik = document.getElementById('h-baslik').value;
        const hYazar = document.getElementById('h-yazar').value;
        const hIcerik = document.getElementById('h-icerik').value;
        const hDosya = document.getElementById('h-resim').files[0];

        let resimData = "";

        // Eğer resim seçildiyse oku
        if (hDosya) {
            const reader = new FileReader();
            resimData = await new Promise(resolve => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(hDosya);
            });
        }

        const yeniHaber = {
            baslik: hBaslik,
            yazar: hYazar,
            icerik: hIcerik,
            resim: resimData,
            tarih: new Date().toLocaleDateString('tr-TR')
        };

        // Firebase'e gönder
        database.ref('haberler').push(yeniHaber)
            .then(() => {
                alert("Haber başarıyla yayınlandı! 🗞️");
                haberFormu.reset(); // Formu temizle
            })
            .catch(error => {
                alert("Hata oluştu: " + error.message);
            });
    });
} else {
    console.error("HATA: 'haber-formu' ID'li form bulunamadı!");
}
const firebaseConfig = {
  apiKey: "AIzaSyBndKtgrPBrfkoDOd0cSfHJsf2AnZx-Kyk",
  authDomain: "bt-news-ae667.firebaseapp.com",
  projectId: "bt-news-ae667",
  storageBucket: "bt-news-ae667.firebasestorage.app",
  messagingSenderId: "367457170530",
  appId: "1:367457170530:web:98004ac3d94ed888f08d3b",
  databaseURL: "https://bt-news-ae667-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- RESİM KÜÇÜLTME ---
async function resmiBoyutlandir(file, w, h) {
    if (!file) return "";
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// --- HABERLERİ LİSTELEME ---
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        const populer = document.getElementById('populer-liste');
        liste.innerHTML = '<h2>Son Haberler</h2>';
        populer.innerHTML = '';
        
        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            // Popüler listesi (En çok okunanlar temsili)
            populer.innerHTML += `<li onclick="window.scrollTo(0,0)">${h.baslik}</li>`;

            // Haber Kartı
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.dataset.kategori = h.kategori;
            kart.innerHTML = `
                <div class="card-header">
                    <span class="badge">${h.kategori}</span>
                    <button class="delete-btn" onclick="haberSil('${id}')" style="display:none;">🗑️ Sil</button>
                </div>
                <h3>${h.baslik}</h3>
                <img src="${h.resim}" style="width:100%; border-radius:8px;">
                <p>${h.icerik}</p>
                <div class="yorum-bolumu">
                    <input type="text" id="y-${id}" placeholder="Yorum yap...">
                    <button onclick="yorumYap('${id}')">Gönder</button>
                    <div id="yorumlar-${id}"></div>
                </div>
            `;
            // Yazar bilgisini sağa gönder
            kart.onclick = () => {
                document.getElementById('aktif-yazar').innerHTML = `
                    <img src="${h.yazarResim || 'default-yazar.png'}" style="width:80px; border-radius:50%;">
                    <h4>${h.yazar}</h4>
                    <p>Genç Yazar</p>
                `;
            };
            liste.appendChild(kart);
        });
    });
}

// --- HABER SİLME ---
window.haberSil = (id) => {
    if(confirm("Bu haberi silmek istediğine emin misin?")) {
        database.ref(`haberler/${id}`).remove();
    }
};

// --- HABER GÖNDERME ---
document.getElementById('haber-formu').onsubmit = async (e) => {
    e.preventDefault();
    const hResim = await resmiBoyutlandir(document.getElementById('h-resim').files[0], 800, 500);
    const yResim = await resmiBoyutlandir(document.getElementById('h-yazar-resim').files[0], 200, 200);

    const yeni = {
        baslik: document.getElementById('h-baslik').value,
        yazar: document.getElementById('h-yazar').value,
        yazarResim: yResim,
        kategori: document.getElementById('h-kategori').value,
        icerik: document.getElementById('h-icerik').value,
        resim: hResim,
        tarih: new Date().toLocaleDateString('tr-TR')
    };

    database.ref('haberler').push(yeni).then(() => {
        alert("Başarıyla yayınlandı!");
        e.target.reset();
    });
};

// --- KATEGORİ FİLTRE ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.news-card').forEach(c => {
        c.style.display = (kat === 'Hepsi' || c.dataset.kategori === kat) ? 'block' : 'none';
    });
};

// --- PANEL ---
window.paneliAc = () => {
    if(document.getElementById('admin-sifre').value === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        document.querySelectorAll('.delete-btn').forEach(b => b.style.display = 'block');
    }
};

document.addEventListener('DOMContentLoaded', haberleriYukle);