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

// --- YORUM YAPMA FONKSİYONU ---
window.yorumYap = function(haberId) {
    const yorumInput = document.getElementById(`input-${haberId}`);
    const yorumMetni = yorumInput.value;
    
    if (yorumMetni.trim() !== "") {
        database.ref(`haberler/${haberId}/yorumlar`).push({
            metin: yorumMetni,
            tarih: new Date().toLocaleString('tr-TR')
        }).then(() => {
            yorumInput.value = ""; 
        });
    } else {
        alert("Lütfen bir yorum yazın!");
    }
};

// --- YENİ: YORUM SİLME FONKSİYONU ---
window.yorumSil = function(haberId, yorumId) {
    if(confirm("Bu yorumu silmek istediğine emin misin?")) {
        database.ref(`haberler/${haberId}/yorumlar/${yorumId}`).remove();
    }
};

// --- HABERLERİ YÜKLEME (YORUM SİLME BUTONU EKLENDİ) ---
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        const popülerListe = document.getElementById('en-cok-okunanlar');
        if (!liste) return;
        
        liste.innerHTML = '';
        if (popülerListe) popülerListe.innerHTML = ''; 

        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            
            // Yorumları hazırlama
            let yorumlarHtml = "";
            if (h.yorumlar) {
                Object.keys(h.yorumlar).forEach(yId => {
                    const y = h.yorumlar[yId];
                    yorumlarHtml += `
                        <li class="tek-yorum" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span><b>Misafir:</b> ${y.metin}</span>
                            <button class="delete-btn" onclick="yorumSil('${id}', '${yId}')" style="background:#d32f2f; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px;">Sil</button>
                        </li>`;
                });
            }

            const grup = document.createElement('div');
            grup.className = 'haber-grup';
            grup.id = `haber-${id}`; 
            
            grup.innerHTML = `
                <article class="news-card" style="position: relative;">
                    <button class="delete-btn" onclick="haberSil('${id}')" style="position: absolute; top: 10px; right: 10px;">Haberi Sil</button>
                    <small>#${h.kategori}</small>
                    <h2>${h.baslik}</h2>
                    <img src="${h.resim}">
                    <p>${h.icerik}</p>
                    
                    <div class="yorum-bolumu">
                        <ul class="yorum-liste" style="list-style: none; padding: 0;">${yorumlarHtml}</ul>
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

            if (popülerListe) {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#haber-${id}" style="text-decoration:none; color:inherit;">• ${h.baslik}</a>`;
                popülerListe.appendChild(li);
            }
        });
    });
}

// --- DİĞER TÜM FONKSİYONLAR (DEĞİŞMEDİ) ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.haber-grup').forEach(grup => {
        grup.style.display = (kat === 'Hepsi' || grup.dataset.kategori === kat) ? 'flex' : 'none';
    });
};

window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        document.body.classList.add('admin-modu'); 
        alert("Yönetici girişi başarılı!");
    } else {
        alert("Hatalı şifre!");
    }
};

window.haberSil = function(id) {
    if(confirm("Haberi silmek istediğine emin misin?")) {
        database.ref('haberler/' + id).remove();
    }
};

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

document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();
    const tarihEl = document.getElementById('tarih-saat');
    if (tarihEl) {
        tarihEl.innerText = new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

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
                alert("Haber yayınlandı!");
                form.reset();
                btn.disabled = false; btn.innerText = "Yayınla";
            });
        };
    }
});
window.adminPaneliniGoster = function() {
    document.getElementById('admin-modal').style.display = 'block';
};

window.adminPaneliniKapat = function() {
    document.getElementById('admin-modal').style.display = 'none';
};

// Şifre doğruysa pencereyi açık tut, yanlışsa uyarı ver (Mevcut paneliAc fonksiyonunu buna göre güncelle)
const eskiPaneliAc = window.paneliAc;
window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        document.body.classList.add('admin-modu');
        // Pencereyi genişlet ki form sığsın
        document.querySelector('.modal-icerik').style.width = "500px";
    } else {
        alert("Hatalı şifre!");
    }
};