// 1. FIREBASE BAĞLANTISI
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. RESİM KÜÇÜLTME FONKSİYONU (Hata veren yer burasıydı, eklendi!)
function resmiBoyutlandir(base64Str, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (w > h) {
                if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; }
            } else {
                if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
    });
}

// 3. HABERLERİ YÜKLEME
function haberleriYukle() {
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
            const h = veri[id];
            const kart = document.createElement('article');
            kart.className = 'news-card';
            kart.innerHTML = `
                <h3>${h.baslik}</h3>
                ${h.resim ? `<img src="${h.resim}" style="width:100%; border-radius:10px;">` : ''}
                <p>${h.icerik}</p>
                <small>${h.yazar} - ${h.tarih}</small>
            `;
            liste.appendChild(kart);
        });
    });
}

// 4. HABER GÖNDERME
const form = document.getElementById('haber-formu');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const hDosya = document.getElementById('h-resim').files[0];
        const okuyucu = new FileReader();
        
        okuyucu.onload = async () => {
            const kucukResim = await resmiBoyutlandir(okuyucu.result, 800, 600);
            
            const yeniHaber = {
                baslik: document.getElementById('h-baslik').value,
                yazar: document.getElementById('h-yazar').value,
                icerik: document.getElementById('h-icerik').value,
                resim: kucukResim,
                tarih: new Date().toLocaleDateString('tr-TR')
            };

            database.ref('haberler').push(yeniHaber)
                .then(() => {
                    alert("Haber Başarıyla Yayınlandı! 🗞️");
                    form.reset();
                });
        };
        okuyucu.readAsDataURL(hDosya);
    });
}

// 5. SAYFA AÇILIŞI VE PANEL
document.addEventListener('DOMContentLoaded', haberleriYukle);

window.paneliAc = () => {
    if (document.getElementById('admin-sifre').value === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
    } else { alert("Şifre Yanlış!"); }
};