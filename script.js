// 1. FIREBASE AYARLARI
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

// Firebase Başlatma
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. SAYFA YÜKLENDİĞİNDE HABERLERİ GETİR
document.addEventListener('DOMContentLoaded', () => {
    tarihGuncelle();
    haberleriYukle();
});

function tarihGuncelle() {
    const el = document.getElementById('tarih-saat');
    if (el) el.innerText = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// 3. HABERLERİ BULUTTAN ÇEKME
function haberleriYukle() {
    const liste = document.getElementById('haber-listesi');
    database.ref('haberler').on('value', (snapshot) => {
        if (!liste) return;
        liste.innerHTML = '<h2>Son Haberler</h2>';
        const veri = snapshot.val();
        if (!veri) {
            liste.innerHTML += '<p>Henüz haber yayınlanmadı.</p>';
            return;
        }
        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.innerHTML = `
                <span class="badge">${h.kategori || 'Genel'}</span>
                <h3>${h.baslik}</h3>
                ${h.resim ? `<img src="${h.resim}" style="max-width:100%; border-radius:8px; margin:10px 0;">` : ''}
                <p>${h.icerik}</p>
                <hr>
                <small>Yazar: ${h.yazar} - ${h.tarih}</small>
            `;
            liste.appendChild(kart);
        });
    });
}

// 4. HABER YAYINLAMA (SAYFA YENİLENMESİNİ ENGELLER)
const form = document.getElementById('haber-formu');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // İŞTE BU SATIR SAYFANIN YENİLENMESİNİ DURDURUR!
        
        const baslik = document.getElementById('h-baslik').value;
        const yazar = document.getElementById('h-yazar').value;
        const icerik = document.getElementById('h-icerik').value;
        const kategori = document.getElementById('h-kategori').value;
        const dosya = document.getElementById('h-resim').files[0];

        let resimBase64 = "";
        if (dosya) {
            const okuyucu = new FileReader();
            resimBase64 = await new Promise(resolve => {
                okuyucu.onload = () => resolve(okuyucu.result);
                okuyucu.readAsDataURL(dosya);
            });
        }

        const yeniHaber = {
            baslik, yazar, icerik, kategori,
            resim: resimBase64,
            tarih: new Date().toLocaleDateString('tr-TR')
        };

        database.ref('haberler').push(yeniHaber)
            .then(() => {
                alert("Haber Başarıyla Yayınlandı! ✨");
                form.reset();
            })
            .catch(hata => alert("Hata: " + hata.message));
    });
}

// 5. PANEL KONTROLLERİ
window.paneliAc = () => {
    if (document.getElementById('admin-sifre').value === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
    } else { alert("Şifre hatalı!"); }
};

window.paneliKapat = () => {
    document.getElementById('admin-giris').style.display = 'block';
    document.getElementById('haber-editoru').style.display = 'none';
};