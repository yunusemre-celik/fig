# Fig 🍇

<p align="center">
  <strong>Your files, simply effortless. · Dosyaların için tatlı bir kolaylık.</strong><br>
  <em>An Raycast & Linear inspired minimalist radial file toolkit for Windows. Fast, 100% offline, and portable.</em>
</p>

<p align="center">
  <a href="https://yunusemre-celik.github.io/fig/"><img src="https://img.shields.io/badge/Website-GitHub%20Pages-0A84FF?style=for-the-badge&logo=safari&logoColor=white" alt="Landing Page" /></a>
  <a href="https://github.com/yunusemre-celik/fig/releases"><img src="https://img.shields.io/badge/Download-Portable%20.exe-30D158?style=for-the-badge&logo=windows11&logoColor=white" alt="Download" /></a>
  <img src="https://img.shields.io/badge/Platform-Windows%2011%20%2F%2010-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/License-MIT-amber?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌐 1-Click Download Website / İndirme Sayfası

You can download and start using Fig immediately from the standalone GitHub Pages site:
👉 **[Launch Fig Website & 1-Click Download](https://yunusemre-celik.github.io/fig/)**

- **Zero installer:** Single standalone portable executable (`Fig.exe`, ~16 MB).
- **Zero cloud telemetry:** 100% offline, local Rust engine.
- **5 Languages:** English, Türkçe, Español, Deutsch, Français.

---

## ✨ Features (Özellikler)

### 🎯 1. Instant Cursor Radial Wheel (`Ctrl + Space`)
Trigger an Apple-inspired radial action menu right around your mouse cursor with `Ctrl + Space` anywhere in Windows:
- **Intelligent Contextual Slices:** Fig detects what file is currently selected in File Explorer or on your Desktop:
  - **Photos & Images:** WebP, PNG, JPG, ICO, Interactive Crop, Regional Censor/Blur, Image-to-PDF.
  - **Office Documents:** Word (`.docx`), PowerPoint (`.pptx`), Excel (`.xlsx`) to PDF in 1 click.
  - **PDF Documents:** PDF to Excel (`.xlsx`), PDF to Word (`.docx`), Extract images & text.
  - **Videos & Media:** Video to MP3 extraction, Video to high-quality animated GIF, MP4, WebM, WAV, FLAC.
- **Split Hub Navigation:** Click `‹` or `›` or use your mouse wheel / Tab key to cycle through wheel profiles (Office, Design, Media, Developer, Custom).

### 🎨 2. Obsidian Tech Design (Raycast & Linear Polish)
- Deep obsidian palette (#080A11), frosted glass surfaces, subtle 1px border highlights, and Fig Fruit squircle branding.
- **Automatic System Theme:** Syncs automatically with Windows light/dark system themes, or choose your preference in Settings.

### 🖼️ 3. Visual Crop & Regional Censor Studio
- **Precision Crop:** Fixed aspect presets (`Free`, `1:1`, `16:9`, `4:3`, `9:16`).
- **Selective Censor / Blur:** Drag a region over sensitive personal data, faces, or credentials to blur with selectable intensity (`Light`, `Standard`, `Heavy`).
- **Customizable Save Options:** Choose between saving as a separate numbered copy (`(1 of N)`) or overwriting the original file, with an option to remember your choice.

### 🌍 4. Comprehensive 5-Language Support (i18n)
Full localization across both the App and the Web Landing Page:
- 🇬🇧 English (`en`)
- 🇹🇷 Türkçe (`tr`)
- 🇪🇸 Español (`es`)
- 🇩🇪 Deutsch (`de`)
- 🇫🇷 Français (`fr`)

---

## ⌨️ Keyboard Shortcuts (Kısayol Tuşları)

| Shortcut | Description (EN) | Açıklama (TR) |
| :--- | :--- | :--- |
| `Ctrl + Space` | Trigger Radial Wheel at mouse cursor (Global) | İmleç ucunda hızlı çarkı aç/kapat (Global) |
| `Tab` / `Shift + Tab` | Cycle wheel profiles (Office, Design, Media, etc.) | Çark profilleri arasında geçiş yap |
| `←` / `→` or `Scroll` | Rotate & select slices on the wheel | Çark dilimlerini döndür ve seç |
| `Enter` | Execute selected slice action | Seçili çark işlemini çalıştır |
| `Ctrl + 1` | Switch to **Home** tab | Ana Sayfa sekmesine geç |
| `Ctrl + 2` | Switch to **Documents** tab | Belgeler sekmesine geç |
| `Ctrl + 3` | Switch to **Wheel Studio** | Çark Stüdyosu sekmesine geç |
| `Ctrl + 4` | Switch to **History / Library** | İşlem Geçmişi sekmesine geç |
| `Ctrl + ,` | Switch to **Settings** | Ayarlar sekmesine geç |
| `Ctrl + V` | Paste image / screenshot from clipboard | Panodaki görseli doğrudan yapıştır |
| `Esc` | Close floating wheel or open modal | Açık çarkı veya modalı kapat |

---

## 🛠️ Tech Stack & Architecture

- **Backend Core:** [Rust](https://www.rust-lang.org/) + [Tauri v2](https://v2.tauri.app/)
  - Native Windows global hotkey hook (`Ctrl + Space`)
  - Windows Explorer active selection parser (COM / UIAutomation)
  - Pure local processing using `image-rs`, `pdf-extract`, `calamine`, `docx-rs`, `lopdf`, and embedded `ffmpeg`
- **Frontend UI:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Design Language:** Apple macOS Sequoia minimalism + Windows 11 Mica & Acrylic vibrancy
- **Distribution:** Standalone single binary (`Fig.exe`), zero dependencies

---

## 🚀 Development & Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://rustup.rs/) (latest stable)
- Visual Studio 2022 C++ Build Tools (on Windows)

### Setup & Run in Development
```bash
# Clone the repository
git clone https://github.com/yunusemre-celik/fig.git
cd fig

# Install frontend dependencies
npm install

# Run in development mode (hot-reloading React + Tauri backend)
npm run tauri dev
```

### Production Build
```bash
# Build the standalone Windows release executable
npm run build
npx tauri build --no-bundle
```
The compiled binary will be generated at `src-tauri/target/release/fig.exe`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Free for personal and commercial use.
