// --- 1. FIREBASE BAĞLANTISI ---
const firebaseConfig = {
  apiKey: "AIzaSyBndKtgrPBrfkoDOd0cSfHJsf2AnZx-Kyk",
  authDomain: "bt-news-ae667.firebaseapp.com",
  projectId: "bt-news-ae667",
  storageBucket: "bt-news-ae667.firebasestorage.app",
  messagingSenderId: "367457170530",
  appId: "1:367457170530:web:98004ac3d94ed888f08d3b",
  databaseURL: "https://bt-news-ae667-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. YARDIMCI FONKSİYONLAR (Resim Boyutlandırma) ---
async function resmiBoyutlandir(file, maxWidth, maxHeight) {
    if (!file) return "";
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > h) { if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; } }
                else { if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// --- 3. HABERLERİ LİSTELEME VE YÜKLEME ---
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        const populer = document.getElementById('populer-liste');
        if (!liste) return;
        
        liste.innerHTML = '<h2>Son Haberler</h2>';
        if (populer) populer.innerHTML = '';
        
        const veri = snapshot.val();
        if (!veri) {
            liste.innerHTML += '<p>Henüz haber yok.</p>';
            return;
        }

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            
            // Popüler Listesi
            if (populer) {
                populer.innerHTML += `<li style="cursor:pointer;" onclick="window.scrollTo(0,0)">${h.baslik}</li>`;
            }

            // Haber Kartı
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.dataset.kategori = h.kategori;
            kart.innerHTML = `
                <button class="delete-btn" onclick="haberSil('${id}')" style="display:none;">Sil</button>
                <small style="color:#d32f2f; font-weight:bold;">#${h.kategori}</small>
                <h3>${h.baslik}</h3>
                <img src="${h.resim}" style="width:100%; border-radius:10px;">
                <p>${h.icerik}</p>
                <div class="yorum-bolumu" style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
                    <input type="text" id="y-in-${id}" placeholder="Yorum yaz..." style="width:70%;">
                    <button onclick="yorumYap('${id}')" style="width:25%;">Gönder</button>
                </div>
            `;
            
            // Yazar Kartını Göster (Tıklayınca Sağ Panele Gider)
            kart.onclick = () => {
                const yazarDetay = document.getElementById('yazar-detay');
                if (yazarDetay) {
                    yazarDetay.innerHTML = `
                        <div class="yazar-box">
                            <h3>✍️ Yazar</h3>
                            <img src="${h.yazarResim || 'default-yazar.png'}">
                            <h4>${h.yazar}</h4>
                            <p>Genç Yazar</p>
                        </div>
                    `;
                }
            };
            liste.appendChild(kart);
        });
    });
}

// --- 4. HABER SİLME ---
window.haberSil = (id) => {
    if(confirm("Bu haberi silmek istediğine emin misin?")) {
        database.ref(`haberler/${id}`).remove()
            .then(() => alert("Haber silindi."))
            .catch(err => alert("Hata: " + err.message));
    }
};

// --- 5. KATEGORİ FİLTRELEME ---
window.kategoriFiltrele = (kat) => {
    const tumHaberler = document.querySelectorAll('.news-card');
    tumHaberler.forEach(haber => {
        haber.style.display = (kat === 'Hepsi' || haber.dataset.kategori === kat) ? 'block' : 'none';
    });
};

// --- 6. YORUM YAP