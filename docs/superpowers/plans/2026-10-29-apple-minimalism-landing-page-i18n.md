# Fig Launch Implementation Plan: Apple Minimalist Redesign, 1-Click Download Website, and 5-Language i18n

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Fig into an Apple-style minimalist app with multi-language (TR, EN, ES, DE, FR) support, automatic system theme adaptation, and a self-contained 1-click download website in `docs/` ready for GitHub Pages.

**Architecture:** A zero-dependency, type-safe i18n dictionary system (`src/i18n/`) drives dynamic localization across the app and radial wheel. Apple-style semantic CSS variables and design tokens replace mesh/glow styles with macOS Sequoia neutrals. A standalone, responsive landing page in `docs/index.html` gives non-technical users 1-click download access and visual tutorials.

**Tech Stack:** Tauri v2, Rust 2024, React 19, TypeScript, Tailwind CSS, HTML5/CSS3.

**Spec:** `docs/superpowers/specs/2026-10-29-apple-minimalism-landing-page-i18n-design.md`

## Global Constraints
- Target 5 languages: English (`en`), Turkish (`tr`), Spanish (`es`), German (`de`), French (`fr`).
- Automatic OS theme detection (`system`) with manual override (`dark`, `light`).
- Zero console window regressions on Windows (`windows_subsystem = "windows"`).
- Production build via `npx tauri build --no-bundle`.
- Landing page must be 100% self-contained in `docs/` with zero npm build step so GitHub Pages serves it immediately.

## Review Focus
1. Language switching must instantly update all text across the Radial Wheel, Image Editor, Dropzone, and Settings without requiring app restart.
2. Light mode must have high contrast and clean typography without washed-out text or invisible borders.
3. Dark mode must feature rich obsidian/graphite neutrals without legacy orange/yellow glowing shadows.
4. The 1-click download button on the landing page must correctly initiate downloading the executable.
5. Crop and censor drag selections in the Image Editor must remain 100% accurate across both themes.

---

### Task 1: Multilingual (i18n) Engine Setup

**Files:**
- Create: `src/i18n/translations.ts`
- Create: `src/i18n/useTranslation.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `useTranslation()` hook returning `{ t, language, setLanguage, languages }`
- Types: `SupportedLanguage = 'en' | 'tr' | 'es' | 'de' | 'fr'`

- [ ] **Step 1: Define Translation Dictionary**
  In `src/i18n/translations.ts`, implement complete dictionaries for `en`, `tr`, `es`, `de`, `fr` covering:
  - App header, navigation tabs (Home, Documents, Wheel Studio, Library, Settings)
  - DropZone & File Chips actions
  - All wheel slices (WebP, PNG, JPG, ICO, Crop, Censor, PDF conversions, Media tools, System actions)
  - Image Editor modal (Crop, Censor, aspect presets, blur levels, save modes, notes)
  - Settings (Theme, Language, Display Mode, Autostart)
  - Toasts and notifications.

- [ ] **Step 2: Create `useTranslation` Hook**
  In `src/i18n/useTranslation.ts`:
  - Detect initial language from `localStorage.getItem("fig_lang")` or `navigator.language` (matching `tr`, `es`, `de`, `fr`, defaulting to `en`).
  - Provide `t(key: string)` lookup with fallback to English.
  - Broadcast language changes via custom event or React state.

- [ ] **Step 3: Verify TypeScript Compilation**
  Run: `npm run build`
  Expected: PASS with 0 type errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/i18n/ src/types/
  git commit -m "feat(i18n): add 5-language translation dictionary and useTranslation hook"
  ```

---

### Task 2: Apple-style Theme & Design Token System (Light/Dark Auto)

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Modify: `src/components/SettingsView.tsx`

**Interfaces:**
- Consumes: `useTranslation()`, `getAppSettings()`, `saveAppSettings()`
- Produces: Dynamic theme classes (`.theme-dark`, `.theme-light`) and CSS variables (`--bg-primary`, `--bg-surface`, `--border-subtle`, `--text-primary`, `--text-muted`, `--apple-blue`)

- [ ] **Step 1: Replace Mesh & Glow CSS with Apple Sequoia Tokens in `src/index.css`**
  - Define `:root` variables for Light theme (Snow canvas `#F5F5F7`, Pure White card `#FFFFFF`, Border `rgba(0,0,0,0.08)`, Text `#1D1D1F`, Muted `#6E6E73`, Accent `#0071E3`).
  - Define `.dark` / `.theme-dark` variables (Obsidian canvas `#0A0A0C`, Graphite surface `#16161A`, Border `rgba(255,255,255,0.08)`, Text `#F5F5F7`, Muted `#8E8E93`, Accent `#0A84FF`).
  - Set global font family to `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif`.
  - Remove legacy `.bg-mesh-glass` and glowing drop shadows.

- [ ] **Step 2: Implement Auto System Theme Listener in `src/App.tsx`**
  - Listen to `window.matchMedia('(prefers-color-scheme: dark)')` when theme is set to `"system"`.
  - Dynamically toggle `dark` and `light` classes on `document.documentElement`.

- [ ] **Step 3: Update `SettingsView.tsx` with Language and Theme Controls**
  - Add Apple-style segmented picker for Theme: `Sistem (Otomatik)`, `Koyu`, `Açık`.
  - Add Language selector supporting: `English (EN)`, `Türkçe (TR)`, `Español (ES)`, `Deutsch (DE)`, `Français (FR)`.
  - Wire up persistent storage with `saveAppSettings` and `localStorage`.

- [ ] **Step 4: Verify Theme and Language Switching**
  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/index.css src/App.tsx src/components/SettingsView.tsx
  git commit -m "feat(theme): implement Apple-style minimalist light/dark theme system and settings"
  ```

---

### Task 3: Apple Minimalist Overhaul of Radial Wheel & Image Editor

**Files:**
- Modify: `src/components/RadialWheel.tsx`
- Modify: `src/components/FloatingWheelWindow.tsx`
- Modify: `src/components/modals/ImageEditorModal.tsx`
- Modify: `src/components/DropZone.tsx`
- Modify: `src/components/FileChips.tsx`

**Interfaces:**
- Consumes: `useTranslation()`, `ImageEditorMode`, `BlurRegion`

- [ ] **Step 1: Redesign `RadialWheel.tsx` with Clean Apple Aesthetics**
  - Replace saturated orange/amber gradients with refined macOS-style neutral frosted slices (`rgba(255, 255, 255, 0.06)` in dark mode, `rgba(0, 0, 0, 0.04)` in light mode).
  - Hover state: Crisp Apple Accent highlight with fine 1.5px border.
  - Slices, labels, and center navigation cycle buttons use localized `t()` strings.

- [ ] **Step 2: Redesign `ImageEditorModal.tsx`**
  - Toolbar with Apple-style segmented pill selector for Mode (`Crop` / `Censor`) and Aspect Ratios (`Free`, `1:1`, `16:9`, `4:3`, `9:16`).
  - Refined blur level badges and clean radio options for save destination.
  - All labels localized across EN, TR, ES, DE, FR.

- [ ] **Step 3: Update `DropZone.tsx` and `FileChips.tsx`**
  - Clean card surface with subtle dashed border on drag over.
  - Modern action chips without harsh neon colors.

- [ ] **Step 4: Verify Build & UI Consistency**
  Run: `npm run build`
  Expected: PASS with clean bundle output.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/
  git commit -m "feat(ui): apply Apple minimalist design and i18n to RadialWheel and modals"
  ```

---

### Task 4: Standalone 1-Click Download Landing Page (`docs/index.html`)

**Files:**
- Create: `docs/index.html`
- Create: `docs/styles.css` (or embedded in `index.html` for zero-asset loading issues)
- Create: `docs/.nojekyll` (ensures GitHub Pages does not run Jekyll processing)

**Interfaces:**
- Produces: GitHub Pages production website ready for deployment.

- [ ] **Step 1: Build the Modern Apple-Style Product Landing Page**
  In `docs/index.html`:
  - **Header:** Fig icon, "Fig", 5-language switcher pills (EN, TR, ES, DE, FR), GitHub link.
  - **Hero Section:**
    - Clean typography: "Your files. Simply effortless." / "Dosyaların için tatlı bir kolaylık."
    - Large 1-click Download CTA: **"Download for Windows (Free .exe)"** linking to the portable release binary.
    - Sub-badge: "No installation required • 16 MB • Windows 10 & 11".
  - **Interactive Wheel Visual Showcase:**
    - Clean SVG representation of the Fig radial wheel showcasing contextual shortcuts (`Ctrl + Space`).
  - **3-Step "How it works" Visual Flow:**
    1. Download & Launch (Instant portable executable).
    2. Click any file (Desktop or Explorer).
    3. Press `Ctrl + Space` (Instantly convert, crop, or censor).
  - **Feature Grid:**
    - Image Suite (Crop, Regional Censor/Blur, WebP, PNG, JPG, ICO).
    - PDF Suite (PDF to Excel, PDF to Word, Text & Image extractor).
    - Media Tools (MP3 extraction, Video to GIF, MP4, WAV).
    - Office Suite (Word to PDF, Excel to PDF, PowerPoint to PDF).
  - **Footer:** Open-source MIT license, GitHub links.

- [ ] **Step 2: Add Embedded Multilingual Translation Engine to Landing Page**
  - JavaScript dictionary providing instant language translation for EN, TR, ES, DE, FR without page reload.
  - Automatically reads `navigator.language` on first visit.

- [ ] **Step 3: Bundle and Copy `Fig.exe` to `docs/Fig.exe`**
  - Place `Fig.exe` into `docs/` so the 1-click download button immediately downloads the executable directly from the site without navigating to GitHub releases.

- [ ] **Step 4: Test in Browser**
  Verify `docs/index.html` renders cleanly in desktop and mobile viewports with functional language switching and working download link.

- [ ] **Step 5: Commit**
  ```bash
  git add docs/
  git commit -m "feat(landing): create Apple-style multilingual 1-click download website in docs/"
  ```

---

### Task 5: GitHub Documentation & Pre-release Cleanup

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Modify: `.gitignore`

- [ ] **Step 1: Write Professional Bilingual `README.md`**
  - Title and badges: Windows 11, Rust, Tauri v2, React 19, MIT License, GitHub Pages Live Demo.
  - Prominent 1-click Download CTA leading to the GitHub Pages site and release.
  - ASCII / Visual architecture overview.
  - Key features breakdown in English with Turkish translation guide.
  - Keyboard shortcuts table (`Ctrl + Space`, center cycle navigation, profile switching).
  - Development and building instructions (`npm run tauri build`).

- [ ] **Step 2: Create MIT `LICENSE`**
  - Standard MIT License for open-source distribution.

- [ ] **Step 3: Sanitize Codebase & Update `.gitignore`**
  - Verify no hardcoded local computer paths (`C:\Users\...`) remain in source code.
  - Ensure build caches and test folders are ignored.

- [ ] **Step 4: Commit**
  ```bash
  git add README.md LICENSE .gitignore
  git commit -m "docs: add comprehensive README, MIT license, and clean up repository"
  ```

---

### Task 6: Final Verification & Production Build

- [ ] **Step 1: Full Frontend TypeScript & Vite Build**
  Run: `npm run build`
  Expected: 0 errors.

- [ ] **Step 2: Full Tauri Release Build**
  Run: `npx tauri build --no-bundle`
  Expected: `Built application at: src-tauri\target\release\fig.exe`.

- [ ] **Step 3: Update Distribution Binaries**
  Copy release binary to root `Fig.exe` and `docs/Fig.exe`.

- [ ] **Step 4: Launch and Perform Smoke Test**
  Launch `Fig.exe --minimized`, trigger `Ctrl + Space`, test theme toggle and language switching.

- [ ] **Step 5: Final Git Commit and Readiness Report**
  Commit all final artifacts and present step-by-step GitHub upload instructions to the user.
