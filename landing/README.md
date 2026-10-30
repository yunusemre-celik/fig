# Fig Landing Page 🌿

Figma'daki 6 sayfalık konsept tasarımının birebir kodlanmış, **full-page snap-scroll**, zengin **Framer Motion** animasyonları ve merkezi link yönetimi içeren modern React + Vite + Tailwind CSS web sitesi.

---

## 🚀 Hızlı Başlangıç

Projeyi yerel bilgisayarınızda çalıştırmak için:

```bash
# Proje dizinine gidin
cd C:\Users\yunus\.gemini\antigravity\scratch\fig-landing

# Bağımlılıkları yükleyin (zaten yüklendi)
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açılan `http://localhost:5173` adresine giderek siteyi tam ekran animasyonlu olarak deneyimleyebilirsiniz.

---

## 🔗 Link Yönetimi (`siteConfig.ts`)

Tüm dış bağlantılar ve sosyal medya hesapları tek bir dosyadan (`src/config/siteConfig.ts`) yönetilmektedir:

* **Fig Repo / İndirme:** `https://github.com/yunusemre-celik/fig`
* **Kişisel GitHub (Sayfa 6):** `https://github.com/yunusemre-celik`
* **X (Twitter):** `https://x.com/hirtzirt`
* **Instagram:** `https://instagram.com/yunusemrecelik.dev`
* **Kişisel Web Sitesi:** `https://yunusemrecelik.dev`
* **LinkedIn:** `https://www.linkedin.com/in/yunusemrecelik00/`

---

## 🎨 Tasarım ve Animasyon Özellikleri

1. **Full-Page Snap Scroll:** Fare tekerleğiyle veya klavye ok tuşlarıyla (Yukarı/Aşağı) her kaydırmada bir sonraki bölüme otomatik oturan slayt akışı.
2. **Yan Gösterge (Bullet Pagination):** Sağ tarafta hangi bölümde olduğunuzu gösteren ve tıklandığında o bölüme zıplayan navigasyon.
3. **Framer Motion Floating Effects:** Yüzen incirler, saat çarkı, masaüstü simgeleri ve Apple Notlar kartları.
4. **Etkileşimli Karusel (Bölüm 3):** Fig masaüstü araç kitinin farklı modları arasında sağ/sol oklarla gerçek slayt geçişi.

---

## 📦 Canlıya Alma (Deploy)

Vercel veya Netlify'a tek tıkla yükleyebilirsiniz:
```bash
npm run build
```
Oluşan `dist` klasörünü doğrudan herhangi bir statik barındırma servisine (Vercel, Netlify, GitHub Pages, Cloudflare Pages) yükleyebilirsiniz.
