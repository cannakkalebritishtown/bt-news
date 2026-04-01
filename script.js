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

// Çakışma olmaması için kontrol ederek başlatıyoruz
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. YÖNETİCİ PANELİ GİRİŞİ ---
window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        // Giriş yapınca silme butonlarını görünür yap
        document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'block');
    } else {
        alert("Hatalı şifre!");
    }
};

// --- 3. YAZAR BİLGİSİNİ SAĞDA GÖSTERME (KRİTİK KISIM) ---
window.yazarDetayGoster = function(ad, resim) {
    const yazarAlani = document.getElementById('yazar-detay-ic');
    // Eğer resim yoksa hata vermemesi için boş bir resim linki koyuyoruz
    const profilResmi = resim || 'https://via.placeholder.com/150'; 
    
    yazarAlani.innerHTML = `
        <img src="${profilResmi}" style="width:140px; height:140px; border-radius:50%; border:4px solid #1a4a8e; object-fit:cover; margin-bottom:15px;">
        <h3 style="margin:10px 0;">${ad}</h3>
        <p style="color:#1a4a8e; font-weight:bold;">GENÇ HABER YAZARI</p>
    `;
};

// --- 4. HABERLERİ VERİTABANINDAN ÇEKME ---
function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        if (!liste) return;
        
        liste.innerHTML = '<h2 style="margin-bottom:20px;">Son Haberler</h2>';
        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.dataset.kategori = h.kategori;
            
            // Habere tıklandığında veya yazar ismine tıklandığında sağ panel güncellenir
            kart.innerHTML = `
                <button class="delete-btn" onclick="database.ref('haberler/${id}').remove()" style="display:none;">Sil</button>
                <small style="color:#d32f2f; font-weight:bold;">#${h.kategori}</small>
                <h3 style="cursor:pointer;" onclick="yazarDetayGoster('${h.yazar}', '${h.yazarResim}')">${h.baslik}</h3>
                <img src="${h.resim}" style="width:100%; border-radius:10px; margin:15px 0;">
                <p>${h.icerik}</p>
                <div class="yazar-satir" onclick="yazarDetayGoster('${h.yazar}', '${h.yazarResim}')" style="cursor:pointer; display:flex; align-items:center; gap:10px; margin-top:10px; color:#1a4a8e; font-weight:bold;">
                    ✍️ Yazar: ${h.yazar}
                </div>
            `;
            liste.appendChild(kart);
        });
    });
}

// --- 5. KATEGORİ FİLTRELEME ---
window.kategoriFiltrele = (kat) => {
    document.querySelectorAll('.news-card').forEach(c => {
        c.style.display = (kat === 'Hepsi' || c.dataset.kategori === kat) ? 'block' : 'none';
    });
};

// --- 6. SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR ---
document.addEventListener('DOMContentLoaded', () => {
    haberleriYukle();
    
    // Tarih ayarı
    const tarihEl = document.getElementById('tarih-saat');
    if (tarihEl) {
        tarihEl.innerText = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Haber Gönderme Formu
    const form = document.getElementById('haber-formu');
    if(form) {
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
                alert("Haber Yayınlandı!"); 
                form.reset(); 
                btn.disabled = false; btn.innerText = "Yayınla";
            });
        };
    }
});

// Resim Boyutlandırma (Firebase kotası için önemli)
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
