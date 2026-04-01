// --- 1. FIREBASE AYARLARI (SADECE BİR KEZ) ---
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

// --- 2. YÖNETİCİ GİRİŞİ ---
window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        // Silme butonlarını yöneticiye göster
        document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'block');
    } else {
        alert("Şifre hatalı!");
    }
};

// --- 3. HABER SİLME ---
window.haberSil = function(id) {
    if(confirm("Bu haberi silmek istediğine emin misin?")) {
        database.ref('haberler/' + id).remove().then(() => alert("Haber silindi."));
    }
};

// --- 4. HABERLERİ YÜKLEME ---
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        if (!liste) return;
        liste.innerHTML = '<h2>Son Haberler</h2>';
        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.dataset.kategori = h.kategori;
            kart.innerHTML = `
                <button class="delete-btn" onclick="haberSil('${id}')" style="display:none;">Sil</button>
                <small style="color:#d32f2f; font-weight:bold;">#${h.kategori || 'Genel'}</small>
                <h3>${h.baslik}</h3>
                <img src="${h.resim}" style="width:100%; border-radius:10px;">
                <p>${h.icerik}</p>
                <div class="yazar-bilgi" onclick="yazarGoster('${h.yazar}', '${h.yazarResim}')">
                    <img src="${h.yazarResim || 'default-avatar.png'}" style="width:30px; border-radius:50%;">
                    <span>${h.yazar}</span>
                </div>
            `;
            liste.appendChild(kart);
        });
    });
}

// --- 5. YAZAR GÖSTER ---
window.yazarGoster = (ad, resim) => {
    const alan = document.getElementById('yazar-detay');
    if(alan) {
        alan.innerHTML = `
            <div class="sidebar-widget">
                <h3>✍️ Yazar</h3>
                <img src="${resim || 'default-avatar.png'}" style="width:100px; border-radius:50%; border:3px solid #d32f2f;">
                <h4>${ad}</h4>
            </div>`;
    }
};

// --- 6. KATEGORİ FİLTRE ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.news-card').forEach(c => {
        c.style.display = (kat === 'Hepsi' || c.dataset.kategori === kat) ? 'block' : 'none';
    });
};

// --- 7. HABER GÖNDERME ---
document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();
    const form = document.getElementById('haber-formu');
    if(form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const hResim = await resmiBoyutlandir(document.getElementById('h-resim').files[0], 800, 500);
            const yResim = await resmiBoyutlandir(document.getElementById('h-yazar-resim').files[0], 200, 200);
            
            database.ref('haberler').push({
                baslik: document.getElementById('h-baslik').value,
                yazar: document.getElementById('h-yazar').value,
                yazarResim: yResim,
                kategori: document.getElementById('h-kategori').value,
                icerik: document.getElementById('h-icerik').value,
                resim: hResim,
                tarih: new Date().toLocaleDateString('tr-TR')
            }).then(() => { alert("Yayınlandı!"); form.reset(); });
        };
    }
});

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