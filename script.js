// --- 1. FIREBASE AYARLARI ---
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
        const populer = document.getElementById('populer-liste');
        if (!liste) return;
        
        liste.innerHTML = '<h2>Son Haberler</h2>';
        if (populer) populer.innerHTML = '';
        
        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            if (populer) populer.innerHTML += `<li>${h.baslik}</li>`;

            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.dataset.kategori = h.kategori;
            kart.style.position = "relative";
            kart.innerHTML = `
                <button class="delete-btn" onclick="haberSil('${id}')" style="display:none; position:absolute; right:15px; top:15px; background:#d32f2f; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; z-index:10;">Sil</button>
                <small style="color:#d32f2f; font-weight:bold;">#${h.kategori || 'Genel'}</small>
                <h3>${h.baslik}</h3>
                <img src="${h.resim}" style="width:100%; border-radius:10px; margin:10px 0;">
                <p>${h.icerik}</p>
                <div class="yazar-kutu" style="display:flex; align-items:center; gap:12px; margin-top:15px; padding-top:15px; border-top:1px solid #eee;">
                    <img src="${h.yazarResim || 'default-avatar.png'}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid #1a4a8e;">
                    <div>
                        <strong style="display:block; color:#1a4a8e;">${h.yazar}</strong>
                        <small style="color:#666;">Genç Yazar • ${h.tarih || ''}</small>
                    </div>
                </div>
            `;
            liste.appendChild(kart);
        });
    });
}

// --- 5. KATEGORİ FİLTRE ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.news-card').forEach(c => {
        c.style.display = (kat === 'Hepsi' || c.dataset.kategori === kat) ? 'block' : 'none';
    });
};

// --- 6. HABER GÖNDERME ---
document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();
    const form = document.getElementById('haber-formu');
    if(form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerText = "Yayınlanıyor...";

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
            }).then(() => { 
                alert("Haber Başarıyla Yayınlandı! 🗞️"); 
                form.reset(); 
                btn.disabled = false; btn.innerText = "Hemen Yayınla";
            });
        };
    }
    const tarihEl = document.getElementById('tarih-saat');
    if (tarihEl) tarihEl.innerText = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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