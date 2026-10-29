# Fig v1.0 Launch & Open Source Design Specification

> **Date:** 2026-10-29  
> **Status:** Approved  
> **Topic:** Apple-style Minimalist Design, 1-Click Consumer Landing Page, and 5-Language Internationalization (i18n)

---

## 1. Intent and Why
Fig is preparing for its public open-source launch on GitHub. To make the app universally accessible, visually timeless, and appealing to both technical and non-technical users:
1. **Consumer-Friendly 1-Click Download Website:** Non-coders should be able to land on a clean, modern web page (hosted on GitHub Pages) and download `Fig.exe` with a single prominent click, complete with a visual 3-step usage guide.
2. **Apple-style Minimalist UI:** Replace heavy dark mesh gradients and bright glowing borders with a refined, distraction-free aesthetic inspired by macOS Sequoia and iOS (San Francisco typography rhythm, clean neutral grays, subtle 0.5px hairline borders, and smooth light/dark adaptability).
3. **5-Language Multi-lingual Engine (i18n):** Support English (EN), Turkish (TR), Spanish (ES), German (DE), and French (FR) across the entire application (Radial Wheel, Image Editor, Settings, Toasts, Dropzone) and on the landing page, auto-detecting system language with manual user override.
4. **Professional GitHub Artifacts:** Comprehensive README.md with badges, feature directory, and shortcuts.

---

## 2. Core Pillars & Architecture

### A. Internationalization (i18n) Engine
- **Languages:** 
  - `en` (English - default global fallback)
  - `tr` (Turkish)
  - `es` (Spanish)
  - `de` (German)
  - `fr` (French)
- **Architecture:** Zero-dependency, lightweight type-safe translation dictionary located in `src/i18n/`.
- **Auto-detection:** Reads `navigator.language` on first launch; remembers user preference in `localStorage` and `AppSettings`.
- **Scope:**
  - Radial Wheel slices (actions, tooltips, profile names)
  - Image Editor (Crop & Censor labels, presets, save options, informational texts)
  - Navigation, DropZone, Library, Settings, and Toast notifications.

### B. Apple Minimalist Redesign (App UI)
- **Palette:**
  - *Dark Mode (macOS Sequoia Dark):* Deep obsidian canvas (`#0A0A0C`), graphite surface (`#16161A`), card fill (`#202024`), border (`rgba(255,255,255,0.08)`), text primary (`#F5F5F7`), text secondary (`#8E8E93`), accent blue (`#0A84FF` / `#3B82F6`).
  - *Light Mode (macOS Sequoia Light):* Snow/fog canvas (`#F5F5F7`), white card surface (`#FFFFFF`), secondary (`#EBEBED`), border (`rgba(0,0,0,0.08)`), text primary (`#1D1D1F`), text secondary (`#6E6E73`), accent blue (`#0071E3`).
- **Typography:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif`.
- **Theme Modes:**
  - `system` (Follows Windows OS theme via `window.matchMedia('(prefers-color-scheme: dark)')`)
  - `dark` (Forced Dark)
  - `light` (Forced Light)
- **Component Refactoring:**
  - Strip `.bg-mesh-glass` and neon drop-shadows.
  - Simplify RadialWheel: refined clean SVG arcs, subtle neutral hover state, crisp icons.
  - Simplify ImageEditorModal: clean toolbar, Apple-style segmented controls, subtle radio and checkbox controls.

### C. 1-Click Consumer Download Website (`docs/index.html`)
- **Hosting Target:** GitHub Pages served from `/docs` branch or root.
- **Visuals:** Apple product page aesthetic with light/dark adaptive CSS.
- **Top Bar:** Fig icon + Name, Language Selector (EN, TR, ES, DE, FR), GitHub repository link.
- **Hero Section:**
  - Headline: "Your files. Simply effortless." / "Dosyaların için tatlı bir kolaylık."
  - Subtitle: "Instant file conversions, smart image crop & censor at your cursor."
  - **Large Primary CTA:** `Windows için İndir (Fig.exe - Ücretsiz)` linking directly to `Fig.exe` or GitHub Releases.
  - Portable badge: "Kurulum gerekmez • 16.6 MB • Windows 10/11"
- **3-Step Visual Guide:**
  1. Download & Launch (No installer, portable executable).
  2. Select Any File (On desktop or in Windows Explorer).
  3. Press `Ctrl + Space` (Radial wheel appears instantly at cursor).
- **Interactive Feature Matrix:**
  - Image Tools (WebP, PNG, JPG, ICO, Interactive Crop & Blur/Censor).
  - PDF Suite (PDF to Excel, PDF to Word, Text extraction, Image extraction).
  - Media Studio (Extract MP3 audio, Video to GIF, MP4, WAV).
  - Office Documents (Word, PPT, Excel to PDF).

### D. GitHub Repository & Documentation
- Clean, polished `README.md` with:
  - Product badges (Windows 11, Tauri v2, Rust, React, License MIT).
  - 1-Click Download button leading to GitHub Pages or latest Release.
  - Animated/visual demonstration table.
  - Full feature guide in English and Turkish.
  - Building from source instructions (`npm run tauri build`).

---

## 3. Constraints
- Zero breaking changes to existing Rust backend (`commands.rs`, `lib.rs`).
- Fast production compile with `npx tauri build --no-bundle`.
- GitHub Pages landing page must be 100% self-contained in `docs/` with zero external build step required.
