// --- 1. BÖLÜM: FIREBASE BAĞLANTISI ---
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

// Firebase'i başlatıyoruz (Burayı düzelttik!)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. BÖLÜM: SAYFA YÜKLENDİĞİNDE ÇALIŞANLAR ---
document.addEventListener('DOMContentLoaded', () => {
    tarihGuncelle();
    haberleriBuluttanYukle();
});

function tarihGuncelle() {
    const simdi = new Date();
    const secenekler = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const el = document.getElementById('tarih-saat');
    if (el) el.innerText = simdi.toLocaleDateString('tr-TR', secenekler);
}

// --- 3. BÖLÜM: RESİM KÜÇÜLTME (Hız için) ---
function resmiBoyutlandir(base64Str, maxWidth, maxHeight) {
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
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
    });
}

// --- 4. BÖLÜM: BULUTTAN HABERLERİ ÇEKME ---
function haberleriBuluttanYukle() {
    const liste = document.getElementById('haber-listesi');
    const editorPaneli = document.getElementById('haber-editoru');
    const isYonetici = editorPaneli && editorPaneli.style.display === 'block';
    
    database.ref('haberler').on('value', (snapshot) => {
        if (!liste) return;
        liste.innerHTML = '<h2>Son Haberler</h2>';
        const veri = snapshot.val();
        
        if (!veri) {
            liste.innerHTML += '<p style="color:#888; padding:20px;">Henüz haber yok. İlk haberi yazmaya ne dersin?</p>';
            return;
        }

        const haberler = Object.keys(veri).map(id => ({ id, ...veri[id] }));
        
        [...haberler].reverse().forEach(haber => {
            const kart = document.createElement('article');
            kart.className = 'news-card';
            
            let yorumlarHtml = "";
            if (haber.yorumlar) {
                const yorumDizisi = Object.entries(haber.yorumlar);
                yorumlarHtml = yorumDizisi.map(([yorumId, yorumMetni]) => `
                    <div class="yorum-satiri">
                        <span>💬 ${yorumMetni}</span>
                        ${isYonetici ? `<button onclick="yorumSil('${haber.id}', '${yorumId}')" class="yorum-sil-btn">Sil</button>` : ""}
                    </div>
                `).join('');
            }

            kart.innerHTML = `
                <div class="news-main-content">
                    <span class="badge">${haber.kategori}</span>
                    <h3 style="margin: 10px 0;">${haber.baslik}</h3>
                    ${haber.resim ? `<img src="${haber.resim}" alt="Haber" style="max-width:100%; border-radius:8px;">` : ""}
                    <p>${haber.icerik}</p>
                    <div class="yorum-bolumu">
                        <div id="yorum-liste-${haber.id}">${yorumlarHtml}</div>
                        <div class="yorum-input-grubu">
                            <input type="text" id="inp-${haber.id}" placeholder="Fikrini paylaş..." class="yorum-input">
                            <button onclick="yorumEkle('${haber.id}')" class="yorum-gonder-btn">Gönder</button>
                        </div>
                    </div>
                </div>
                <div class="author-sidebar">
                    <img src="${haber.yazarResim || 'https://via.placeholder.com/80?text=👤'}" class="author-photo">
                    <span class="author-name">${haber.yazar}</span>
                    <span class="author-title">Genç Haber Yazarı</span>
                    ${isYonetici ? `<button onclick="haberiSil('${haber.id}')" class="admin-sil-btn">🗑️ Haberi Sil</button>` : ""}
                </div>
            `;
            liste.appendChild(kart);
        });
    });
}

// --- 5. BÖLÜM: HABER KAYDETME ---
const haberFormu = document.getElementById('haber-formu');
if (haberFormu) {
    haberFormu.addEventListener('submit', async function(e) {
        e.preventDefault();
        const hDosya = document.getElementById('h-resim').files[0];
        const yDosya = document.getElementById('h-yazar-resim').files[0];

        const dosyaOku = (f) => new Promise(r => { if(!f) r(""); const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(f); });
        
        let hRaw = await dosyaOku(hDosya), yRaw = await dosyaOku(yDosya);
        const hKucuk = hRaw ? await resmiBoyutlandir(hRaw, 800, 600) : "";
        const yKucuk = yRaw ? await resmiBoyutlandir(yRaw, 150, 150) : "";

        const yeniHaber = {
            baslik: document.getElementById('h-baslik').value,
            yazar: document.getElementById('h-yazar').value,
            yazarResim: yKucuk,
            kategori: document.getElementById('h-kategori').value,
            icerik: document.getElementById('h-icerik').value,
            resim: hKucuk,
            tarih: new Date().toLocaleDateString('tr-TR')
        };

        database.ref('haberler').push(yeniHaber);
        this.reset();
        alert("Haber başarıyla buluta yüklendi! ✨");
    });
}

// --- 6. BÖLÜM: YORUM VE SİLME ---
window.yorumEkle = function(haberId) {
    const inp = document.getElementById('inp-' + haberId);
    if (!inp.value.trim()) return;
    database.ref('haberler/' + haberId + '/yorumlar').push(inp.value);
    inp.value = "";
};

window.yorumSil = function(haberId, yorumId) {
    if(confirm("Yorum silinsin mi?")) {
        database.ref('haberler/' + haberId + '/yorumlar/' + yorumId).remove();
    }
};

window.haberiSil = function(id) {
    if(confirm("Haberi tamamen silmek istiyor musunuz?")) {
        database.ref('haberler/' + id).remove();
    }
};

window.paneliAc = function() {
    const sifreInp = document.getElementById('admin-sifre');
    if (sifreInp.value === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        haberleriBuluttanYukle();
    } else { alert("Şifre yanlış!"); }
};

window.paneliKapat = function() {
    document.getElementById('admin-giris').style.display = 'block';
    document.getElementById('haber-editoru').style.display = 'none';
    haberleriBuluttanYukle();
};
