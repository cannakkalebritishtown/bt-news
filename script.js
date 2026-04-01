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

window.paneliAc = function() {
    const sifre = document.getElementById('admin-sifre').value;
    if (sifre === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
    } else { alert("Şifre yanlış!"); }
};