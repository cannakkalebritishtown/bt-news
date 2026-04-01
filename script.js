// --- 1. FIREBASE VE DEĞİŞKENLER ---
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

// --- 2. YÖNETİCİ GİRİŞİ (Hata Buradaydı, Artık Düzeldi) ---
window.paneliAc = function() {
    const sifreInput = document.getElementById('admin-sifre');
    const girisBolumu = document.getElementById('admin-giris');
    const editorBolumu = document.getElementById('haber-editoru');

    if (sifreInput.value === "1234") {
        girisBolumu.style.display = 'none';
        editorBolumu.style.display = 'block';
        // Silme butonlarını sadece yöneticiye göster
        setTimeout(() => {
            document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'block');
        }, 500);
        alert("Hoş geldin yönetici! 🛠️");
    } else {
        alert("Şifre hatalı, lütfen tekrar dene.");
    }
};

window.paneliKapat = function() {
    document.getElementById('admin-giris').style.display = 'block';
    document.getElementById('haber-editoru').style.display = 'none';
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'none');
    document.getElementById('admin-sifre').value = "";
};

// --- 3. HABERLERİ YÜKLEME ---
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
                <button class="delete-btn" onclick="haberSil('${id}')" style="display:none; position:absolute; right:10px; top:10px; background:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Sil</button>
                <small style="color:#d32f2f; font-weight:bold;">#${h.kategori || 'Gündem'}</small>
                <h3>${h.baslik}</h3>
                <img src="${h.resim}" style="width:100%; border-radius:10px; margin:10px 0;">
                <p>${h.icerik}</p>
                <div style="border-top:1px solid #eee; padding-top:10px; margin-top:10px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="yazarGoster('${h.yazar}', '${h.yazarResim}')">
                    <img src="${h.yazarResim || 'default-avatar.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <span><b>${h.yazar}</b></span>
                </div>
            `;
            liste.appendChild(kart);
        });
    });
}

// --- 4. YAZAR DETAYI GÖSTER ---
window.yazarGoster = (ad, resim) => {
    const yazarAlani = document.getElementById('yazar-detay') || document.getElementById('yazar-alani');
    if (yazarAlani) {
        yazarAlani.innerHTML = `
            <div class="sidebar-widget" style="text-align:center;">
                <h3>✍️ Yazar</h3>
                <img src="${resim || 'default-avatar.png'}" style="width:100px; height:100px; border-radius:50%; border:3px solid #d32f2f; object-fit:cover;">
                <h4>${ad}</h4>
                <p>Genç Yazar Haber Merkezi Üyesi</p>
            </div>
        `;
    }
};

// --- 5. HABER SİLME ---
window.haberSil = (id) => {
    if(confirm("Bu haberi kalıcı olarak silmek istiyor musun?")) {
        database.ref('haberler/' + id).remove().then(() => alert("Haber silindi."));
    }
};

// --- 6. HABER GÖNDERME ---
document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();
    
    const form = document.getElementById('haber-formu');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerText = "Yükleniyor...";

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
                alert("Haber Yayınlandı!");
                form.reset();
                btn.disabled = false; btn.innerText = "Hemen Yayınla";
            });
        };
    }
});

// --- YARDIMCI: RESİM BOYUTLANDIRMA ---
async function resmiBoyutlandir(file, maxWidth, maxHeight) {
    if (!file) return "";
    return new Promise(resolve => {
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

// --- KATEGORİ FİLTRE ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.news-card').forEach(c => {
        c.style.display = (kat === 'Hepsi' || c.dataset.kategori === kat) ? 'block' : 'none';
    });
};