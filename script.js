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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. HABERLERİ YÜKLEME (OTOMATİK YAZAR PANELİ İLE) ---
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        if (!liste) return;
        
        liste.innerHTML = '';
        const veri = snapshot.val();
        if (!veri) {
            liste.innerHTML = '<p style="text-align:center; padding:20px;">Henüz haber yayınlanmadı.</p>';
            return;
        }

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            const grup = document.createElement('div');
            grup.className = 'haber-grup';
            grup.dataset.kategori = h.kategori; // Filtreleme için
            
            grup.innerHTML = `
                <article class="news-card">
                    <button class="delete-btn" onclick="haberSil('${id}')" style="display:none;">Sil</button>
                    <small style="color:#d32f2f; font-weight:bold;">#${h.kategori}</small>
                    <h2 style="margin-top:10px;">${h.baslik}</h2>
                    <img src="${h.resim}">
                    <p>${h.icerik}</p>
                </article>

                <div class="kart-yazar-paneli">
                    <img src="${h.yazarResim || 'https://via.placeholder.com/100'}">
                    <h4 style="margin:5px 0;">${h.yazar}</h4>
                    <p style="color:#1a4a8e; font-size:12px; font-weight:bold;">GENÇ YAZAR</p>
                    <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                    <small style="color:#999; font-size:10px;">${h.tarih || '1 Nisan 2026'}</small>
                </div>
            `;
            liste.appendChild(grup);
        });
    });
}

// --- 3. KATEGORİ FİLTRELEME ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.haber-grup').forEach(grup => {
        grup.style.display = (kat === 'Hepsi' || grup.dataset.kategori === kat) ? 'flex' : 'none';
    });
};

// --- 4. ADMİN PANELİ FONKSİYONLARI ---
window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        // Body'ye admin sınıfı ekleyerek SİL butonlarını görünür yaparız
        document.body.classList.add('admin-modu'); 
        alert("Yönetici girişi başarılı. Artık haberleri silebilirsiniz!");
    } else {
        alert("Hatalı şifre!");
    }
};
// --- 5. RESİM BOYUTLANDIRMA VE FORM GÖNDERME ---
async function resmiBoyutlandir(file, w, h) {
    if(!file) return "";
    return new Promise(res => {
        const r = new FileReader();
        r.onload = (e) => {
            const i = new Image();
            i.onload = () => {
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(i, 0, 0, w, h);
                res(c.toDataURL('image/jpeg', 0.7));
            };
            i.src = e.target.result;
        };
        r.readAsDataURL(file);
    });
}
// 2. YORUM GÖNDERME FONKSİYONU
window.yorumYap = function(haberId) {
    const yorumInput = document.getElementById(`input-${haberId}`);
    const yorumMetni = yorumInput.value;
    
    if (yorumMetni.trim() !== "") {
        database.ref(`haberler/${haberId}/yorumlar`).push({
            metin: yorumMetni,
            tarih: new Date().toLocaleString('tr-TR')
        }).then(() => {
            yorumInput.value = ""; // Kutuyu temizle
        });
    }
};
// 3. GÜNCELLENMİŞ HABER YÜKLEME (YORUMLAR DAHİL)
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        if (!liste) return;
        liste.innerHTML = '';
        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            
            // Yorumları Listeleme
            let yorumlarHtml = "";
            if (h.yorumlar) {
                Object.values(h.yorumlar).forEach(y => {
                    yorumlarHtml += `<li class="tek-yorum"><b>Misafir:</b> ${y.metin}</li>`;
                });
            }

            const grup = document.createElement('div');
            grup.className = 'haber-grup';
            grup.innerHTML = `
                <article class="news-card">
                    <button class="delete-btn" onclick="haberSil('${id}')" style="display:none;">Sil</button>
                    <small>#${h.kategori}</small>
                    <h2>${h.baslik}</h2>
                    <img src="${h.resim}">
                    <p>${h.icerik}</p>
                    
                    <div class="yorum-bolumu">
                        <ul class="yorum-liste">${yorumlarHtml}</ul>
                        <div class="yorum-formu">
                            <input type="text" id="input-${id}" placeholder="Yorumunuzu yazın...">
                            <button onclick="yorumYap('${id}')">Gönder</button>
                        </div>
                    </div>
                </article>

                <div class="kart-yazar-paneli">
                    <img src="${h.yazarResim || 'https://via.placeholder.com/100'}">
                    <h4>${h.yazar}</h4>
                    <p style="color:#1a4a8e; font-size:12px; font-weight:bold;">GENÇ YAZAR</p>
                </div>
            `;
            liste.appendChild(grup);
        });
    });
}
// --- 6. SAYFA BAŞLATICI ---
document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();

    // Tarih Güncelleme
    const tarihEl = document.getElementById('tarih-saat');
    if (tarihEl) {
        tarihEl.innerText = new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // Haber Formu Dinleyicisi
    const form = document.getElementById('haber-formu');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerText = "Yayınlanıyor...";

            const hResim = await resmiBoyutlandir(document.getElementById('h-resim').files[0], 800, 500);
            const yResim = await resmiBoyutlandir(document.getElementById('h-yazar-resim').files[0], 250, 250);

            database.ref('haberler').push({
                baslik: document.getElementById('h-baslik').value,
                yazar: document.getElementById('h-yazar').value,
                yazarResim: yResim,
                kategori: document.getElementById('h-kategori').value,
                icerik: document.getElementById('h-icerik').value,
                resim: hResim,
                tarih: new Date().toLocaleDateString('tr-TR')
            }).then(() => {
                alert("Haber başarıyla yayınlandı!");
                form.reset();
                btn.disabled = false; btn.innerText = "Yayınla";
            });
        };
    }
});