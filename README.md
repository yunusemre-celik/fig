# Fig (İncir) 🍇

<p align="center">
  <strong>Your files, a little sweeter. · Dosyaların için tatlı bir kolaylık.</strong><br>
  <em>Tangerine ve Nashi ilhamıyla geliştirilen, Windows 11 için bağımsız ve açık kaynaklı masaüstü dosya araç kiti.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2011-0078D4?logo=windows11&logoColor=white" alt="Windows 11" />
  <img src="https://img.shields.io/badge/Stack-Tauri%20v2%20%2B%20Rust-FFC83D?logo=tauri&logoColor=black" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## ✨ Özellikler (Features)

- **🎡 İkonik İşlem Çarkı (Radial Wheel):** `Ctrl+Space` kısayoluyla veya dosya sürüklerken anında açılan, 360° dairesel pie menü.
  - **Dönüştürme Çarkı:** PNG, JPG, WebP, BMP, PDF
  - **Araçlar Çarkı:** Kırp & Düzenle, Sıkıştır, QR Kod, Dosya Meta Verisi
  - **İşlemler Çarkı:** Dosya Yolunu Kopyala, Dosya Gezgini'nde Göster, Terminalde Aç (PowerShell)
- **🪟 Windows 11 Modern Arayüzü:** Akıcı mika/cam efektleri, koyu tema uyumu, özel başlık çubuğu ve pencere kontrolleri.
- **📥 Sürükle-Bırak & Pano Entegrasyonu:** Dosyaları doğrudan pencereye bırakın veya `Ctrl+V` ile panodaki görselleri/dosyaları içeri aktarın.
- **✂️ Görsel Kırpma & Boyutlandırma:** Serbest, 1:1 Kare, 16:9, 4:3 ve 9:16 oranlarında hassas piksel kırpma.
- **⚡ Görsel Sıkıştırma:** Kalite ve ölçek ayarlarıyla gözle fark edilmeyecek kayıpla %70'e varan dosya boyutu tasarrufu.
- **📱 QR Kod Okuyucu & Oluşturucu:** Görsellerdeki QR kodları anında metne dökün veya bağlantılardan yüksek çözünürlüklü QR PNG oluşturun.
- **📑 Çoklu Görselden PDF Oluşturma:** Seçilen görselleri tek tıkla standart uyumlu çok sayfalı PDF belgesine dönüştürün.
- **📚 Kütüphane & Geçmiş:** Son işlemlerinizin geçmişi (%LOCALAPPDATA%/Fig/library.json), dosya boyutu kazançları ve hızlı gezinme.
- **🔔 Sistem Tepsisi (Tray):** Arka planda sessizce bekler, sağ tık menüsü ile hızlı erişim sağlar.

---

## ⌨️ Kısayol Tuşları (Shortcuts)

| Kısayol | İşlev |
| :--- | :--- |
| `Ctrl + Space` | Hızlı İşlem Çarkını (Radial Wheel) açar/kapatır |
| `Ctrl + 1` | Ana Sayfa sekmesine geçer |
| `Ctrl + 2` | Kütüphane sekmesine geçer |
| `Ctrl + ,` | Ayarlar sekmesine geçer |
| `Ctrl + O` | Dosya seçici iletişim kutusunu açar |
| `Ctrl + V` | Panodaki dosya veya görseli içeri aktarır |
| `Ctrl + F` | Kütüphane içi arama çubuğunu odaklar |
| `Tab` / `Yön Tuşları` | Çark dilimleri arasında gezinir |
| `Enter` | Seçili çark işlemini çalıştırır |
| `Esc` | Açık olan çarkı veya modalı kapatır |

---

## 🛠️ Mimari (Architecture)

Fig, modern çapraz platform ve hafif masaüstü mimarisi standartlarına uygun olarak tasarlanmıştır:
- **Arka Uç (Backend):** Rust (Tauri v2) ile yerel, yüksek performanslı ve güvenli işlem motoru (`image`, `qrcode`, `rqrr`).
- **Ön Yüz (Frontend):** React 19, TypeScript, Tailwind CSS, Lucide Icons ve Web Audio API dokunsal ses motoru.
- **Paketleme:** Küçük boyutlu, bağımsız `.exe` çıktısı.

---

## 🚀 Geliştirme ve Derleme (Build)

### Gereksinimler:
- Node.js (v20+) ve npm
- Rust & Cargo (1.80+)

### Adımlar:
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda başlatın
npm run tauri dev

# Üretim (Release) derlemesi oluşturun
npm run build
cd src-tauri
cargo build --release
```

---

## 📌 Yol Haritası (Roadmap & Open Issues)

- [ ] **Issue #1: FFmpeg Entegrasyonu (Video & Ses Araçları):** Video kırpma (trim), ses çıkarma, video sıkıştırma ve hız değiştirme.
- [ ] **Issue #2: Yüzen Raf (Float Shelf Window):** Ekran kenarına yapışabilen, sürüklenen dosyaları geçici olarak depolayan Dropover/Yoink benzeri mini pencere.
- [ ] **Issue #3: Web Medya İndirici:** YouTube ve açık web bağlantılarından medya indirme desteği.
- [ ] **Issue #4: Office & Belge Dönüştürme:** DOCX, PPTX ve XLSX dosyalarından PDF oluşturma desteği.

---

## 📄 Lisans & Teşekkürler

Fig, [MIT Lisansı](LICENSE) altında açık kaynak olarak dağıtılmaktadır.
Bu proje, macOS ekosistemindeki [Tangerine](https://tangerineformac.com/) ve Orkun Işıtmak'ın [nashi-app](https://github.com/orkunisitmak/nashi-app) projelerinden ilham almıştır.
