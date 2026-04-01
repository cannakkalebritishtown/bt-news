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

// Firebase bağlantısını başlat
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Sayfa yüklendiğinde çalışacaklar
document.addEventListener('DOMContentLoaded', () => {
    const simdi = new Date();
    const el = document.getElementById('tarih-saat');
    if (el) el.innerText = simdi.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    haberleriBuluttanYukle();
});

function haberleriBuluttanYukle() {
    const liste = document.getElementById('haber-listesi');
    database.ref('haberler').on('value', (snapshot) => {
        if (!liste) return;
        liste.innerHTML = '<h2>Son Haberler</h2>';
        const veri = snapshot.val();
        if (!veri) {
            liste.innerHTML += '<p>Henüz haber yok.</p>';
            return;
        }
        Object.keys(veri).reverse().forEach(id => {
            const haber = veri[id];
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.innerHTML = `<h3>${haber.baslik}</h3><p>${haber.icerik}</p>`;
            liste.appendChild(kart);
        });
    });
}
// --- 5. BÖLÜM: HABER KAYDETME (Düzeltilmiş) ---
const haberFormu = document.getElementById('haber-formu');
if (haberFormu) {
    haberFormu.addEventListener('submit', async function(e) {
        e.preventDefault(); // SAYFANIN YENİLENMESİNİ DURDURUR (Çok Önemli!)

        const hDosya = document.getElementById('h-resim').files[0];
        const yDosya = document.getElementById('h-yazar-resim').files[0];

        // Resim okuma fonksiyonu
        const dosyaOku = (f) => new Promise(r => { 
            if(!f) { r(""); return; }
            const rd = new FileReader(); 
            rd.onload = () => r(rd.result); 
            rd.readAsDataURL(f); 
        });
        
        try {
            let hRaw = await dosyaOku(hDosya);
            let yRaw = await dosyaOku(yDosya);

            // Resim boyutlandırma (Script'inde bu fonksiyon olmalı)
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

            // Veriyi Firebase'e itiyoruz
            await database.ref('haberler').push(yeniHaber);
            
            this.reset(); // Formu temizle
            alert("Haber başarıyla buluta yüklendi! ✨");
            
        } catch (hata) {
            console.error("Yükleme hatası:", hata);
            alert("Bir hata oluştu: " + hata.message);
        }
    });
}

window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
    } else { alert("Şifre yanlış!"); }
};