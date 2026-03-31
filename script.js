// Sayfa yüklendiğinde çalışacaklar
document.addEventListener('DOMContentLoaded', () => {
    tarihGuncelle();
    haberleriYukle();
    populerHaberleriGoster();
});

// 1. TARİH VE SAAT
function tarihGuncelle() {
    const simdi = new Date();
    const secenekler = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const el = document.getElementById('tarih-saat');
    if (el) el.innerText = simdi.toLocaleDateString('tr-TR', secenekler);
}

// 2. RESİM KÜÇÜLTME (Hafıza Dostu)
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

// 3. HABERLERİ YÜKLEME
function haberleriYukle() {
    const liste = document.getElementById('haber-listesi');
    if (!liste) return;
    liste.innerHTML = '<h2>Son Haberler</h2>';
    const haberler = JSON.parse(localStorage.getItem('tumHaberler') || "[]");
    
    // YÖNETİCİ KONTROLÜ
    const isYonetici = document.getElementById('haber-editoru').style.display === 'block';

    if (haberler.length === 0) {
        liste.innerHTML += '<p style="color:#888; padding: 20px;">Henüz haber yayınlanmadı. İlk haberi sen yaz!</p>';
    }

    [...haberler].reverse().forEach(haber => {
        const kart = document.createElement('article');
        kart.className = 'news-card';
        
        const yorumlarHtml = (haber.yorumlar || []).map((y, index) => `
            <div class="yorum-satiri">
                <span>💬 ${y}</span>
                ${isYonetici ? `<button onclick="yorumSil(${haber.id}, ${index})" class="yorum-sil-btn">Sil</button>` : ""}
            </div>
        `).join('');

        kart.innerHTML = `
            <div class="news-main-content">
                <span class="badge">${haber.kategori}</span>
                <h3 style="margin: 10px 0;">${haber.baslik}</h3>
                ${haber.resim ? `<img src="${haber.resim}">` : ""}
                <p>${haber.icerik}</p>
                <div class="yorum-bolumu">
                    <div id="yorum-liste-${haber.id}">${yorumlarHtml}</div>
                    <div class="yorum-input-grubu">
                        <input type="text" id="inp-${haber.id}" placeholder="Yorum yap..." class="yorum-input">
                        <button onclick="yorumEkle(${haber.id})" class="yorum-gonder-btn">Gönder</button>
                    </div>
                </div>
            </div>
            <div class="author-sidebar">
                <img src="${haber.yazarResim || 'https://via.placeholder.com/80?text=👤'}" class="author-photo">
                <span class="author-name">${haber.yazar}</span>
                <span class="author-title">Genç Haber Yazarı</span>
                ${isYonetici ? `<button onclick="haberiSil(${haber.id})" class="admin-sil-btn">🗑️ Haberi Sil</button>` : ""}
            </div>
        `;
        liste.appendChild(kart);
    });
}

// 4. GİRİŞ PANELİ FONKSİYONLARI (Burayı Dikkatli Kopyala!)
function paneliAc() {
    const sifreInp = document.getElementById('admin-sifre');
    if (sifreInp.value === "1234") {
        document.getElementById('admin-giris').style.display = 'none';
        document.getElementById('haber-editoru').style.display = 'block';
        haberleriYukle(); // Yönetici butonlarını göstermek için yenile
    } else {
        alert("Şifre yanlış! Lütfen tekrar deneyin.");
    }
}

function paneliKapat() {
    document.getElementById('admin-giris').style.display = 'block';
    document.getElementById('haber-editoru').style.display = 'none';
    haberleriYukle(); // Yönetici butonlarını gizlemek için yenile
}

// 5. HABER KAYDETME
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
            id: Date.now(),
            baslik: document.getElementById('h-baslik').value,
            yazar: document.getElementById('h-yazar').value,
            yazarResim: yKucuk,
            kategori: document.getElementById('h-kategori').value,
            icerik: document.getElementById('h-icerik').value,
            resim: hKucuk,
            tarih: new Date().toLocaleDateString('tr-TR'),
            yorumlar: []
        };

        let haberler = JSON.parse(localStorage.getItem('tumHaberler') || "[]");
        haberler.push(yeniHaber);
        localStorage.setItem('tumHaberler', JSON.stringify(haberler));
        
        this.reset();
        haberleriYukle();
        alert("Haber başarıyla yayına alındı! 🖊️");
    });
}

// 6. YORUM VE SİLME İŞLEMLERİ
function yorumEkle(haberId) {
    const inp = document.getElementById('inp-' + haberId);
    if (!inp.value.trim()) return;
    let haberler = JSON.parse(localStorage.getItem('tumHaberler') || "[]");
    const h = haberler.find(x => x.id === haberId);
    if (h) {
        if (!h.yorumlar) h.yorumlar = [];
        h.yorumlar.push(inp.value);
        localStorage.setItem('tumHaberler', JSON.stringify(haberler));
        haberleriYukle();
    }
}

function yorumSil(haberId, index) {
    if(!confirm("Yorum silinsin mi?")) return;
    let haberler = JSON.parse(localStorage.getItem('tumHaberler') || "[]");
    const h = haberler.find(x => x.id === haberId);
    if (h) {
        h.yorumlar.splice(index, 1);
        localStorage.setItem('tumHaberler', JSON.stringify(haberler));
        haberleriYukle();
    }
}

function haberiSil(id) {
    if(confirm("Haberi tamamen silmek istiyor musunuz?")) {
        let h = JSON.parse(localStorage.getItem('tumHaberler') || "[]").filter(x => x.id !== id);
        localStorage.setItem('tumHaberler', JSON.stringify(h));
        haberleriYukle();
    }
}

function populerHaberleriGoster() {
    const h = JSON.parse(localStorage.getItem('tumHaberler') || "[]");
    const l = document.getElementById('populer-haberler');
    if(l) l.innerHTML = h.slice(-3).reverse().map(x => `<li>• ${x.baslik.substring(0,20)}...</li>`).join('');
}