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

function haberleriYukle() {
    database.ref('haberler').on('value', (snapshot) => {
        const liste = document.getElementById('haber-listesi');
        if (!liste) return;
        
        liste.innerHTML = '';
        const veri = snapshot.val();
        if (!veri) return;

        Object.keys(veri).reverse().forEach(id => {
            const h = veri[id];
            
            // Haberi ve Yazarı yan yana getiren "Grup" yapısı
            const grup = document.createElement('div');
            grup.className = 'haber-grup';
            
            grup.innerHTML = `
                <article class="news-card">
                    <small style="color:#d32f2f; font-weight:bold;">#${h.kategori}</small>
                    <h2 style="margin-top:10px;">${h.baslik}</h2>
                    <img src="${h.resim}">
                    <p>${h.icerik}</p>
                </article>

                <div class="kart-yazar-paneli">
                    <img src="${h.yazarResim || 'https://via.placeholder.com/100'}">
                    <h4 style="margin:5px 0;">${h.yazar}</h4>
                    <p style="color:#1a4a8e; font-size:12px; font-weight:bold;">GENÇ YAZAR</p>
                    <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                    <small style="color:#999; font-size:10px;">${h.tarih || '1 Nisan 2026'}</small>
                </div>
            `;
            liste.appendChild(grup);
        });
    });
}

document.addEventListener('DOMContentLoaded', haberleriYukle);
document.addEventListener('DOMContentLoaded', () => {
    // Tarih Güncelleme
    const tarihEl = document.getElementById('tarih-saat');
    if (tarihEl) {
        const simdi = new Date();
        tarihEl.innerText = simdi.toLocaleDateString('tr-TR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // En Çok Okunanlar Listesini Doldurma (Örnek)
    const okunanlar = document.getElementById('en-cok-okunanlar');
    if (okunanlar) {
        okunanlar.innerHTML = `
            <li>• Yapay Zeka ve Gelecek</li>
            <li>• Genç Yazarlar Buluşuyor</li>
            <li>• Okul Gazetemiz Yayında!</li>
        `;
    }
});
// ... Diğer fonksiyonların (resmiBoyutlandir, paneliAc vb.) buranın altında kalmalı ...