# Figma End-to-End Brand & UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Fig's brand identity, web landing page (`docs/index.html`), and desktop application UI (`src/`) to 1:1 match the Figma obsidian/indigo aesthetic, featuring a new Fig Fruit squircle logo, two-column desktop sidebar workspace, and tooltips-only shortcuts.

**Architecture:** We will implement the new design system from the foundation up: first producing the reusable `FigLogo` vector component and icon assets; then rebuilding the standalone 5-language `docs/index.html` landing page from Figma's export; then upgrading the application's CSS design tokens, two-column workspace shell (`App.tsx` + `Navigation.tsx`), radial wheel, and modals; concluding with a full TypeScript build verification.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite, HTML5/CSS3 (custom design system), Tauri v2.

**Spec:** `docs/superpowers/specs/2026-10-30-figma-redesign-fig-brand.md`

## Global Constraints

- Platform: Windows 10/11 desktop application (`src/`) & static GitHub Pages landing page (`docs/index.html`).
- Canvas & Theme: Strict Obsidian Dark Mode (`#080A11` / `#0A0C14`), dropping light mode toggles.
- Typography: Primary `Inter`, monospaced `"DM Mono", monospace` for shortcuts and status tags.
- Shortcuts: Displayed strictly as hover tooltips; zero permanent inline shortcut card clutter.
- Offline & Local: Retain 100% offline local processing with zero telemetry.
- i18n: Preserve full 5-language support (EN, TR, ES, DE, FR) across web and desktop.

## Review Focus

- Broken icon references when `EarthLogo` is replaced: every file importing `EarthLogo` must import `FigLogo`.
- Shortcut discoverability: when inline cards are removed, every interactive action trigger must have clear hover tooltips (`Ctrl + Space`, `Ctrl + 1..5`, etc.).
- Dropzone & History toggle: switching between "Dropzone" and "History" in the main panel must preserve active files and recent jobs.
- Wheel dismissal: pressing `Esc` or clicking the transparent backdrop outside the wheel in `FloatingWheelWindow.tsx` must close the window immediately.
- Bundle integrity: `npm run build` must compile with zero TypeScript errors and produce valid production assets.

---

### Task 1: Brand Asset & FigLogo Component Creation

**Files:**
- Create: `src/components/FigLogo.tsx`
- Modify: `public/favicon.svg`
- Modify: `src/components/TitleBar.tsx:1-40`
- Modify: `src/components/FloatingWheelWindow.tsx:1-40`

**Interfaces:**
- Produces: `<FigLogo size={number} className={string} glow={boolean} />`

- [ ] **Step 1: Write `src/components/FigLogo.tsx`**
Implement the SVG-based Fig Fruit squircle badge matching Figma's design: squircle border `#202A4B` to `#0F1324`, organic fig silhouette with rotation, leaf `#9BB0FF`, and three glowing seeds.
- [ ] **Step 2: Update `public/favicon.svg`**
Replace the old favicon with the 16x16 / 32x32 squircle Fig mark from the Figma export.
- [ ] **Step 3: Replace `EarthLogo` imports in `TitleBar.tsx` and `FloatingWheelWindow.tsx`**
Update header icon in `TitleBar.tsx` and center indicator in `FloatingWheelWindow.tsx` to use `<FigLogo size={24} />`.
- [ ] **Step 4: Verify build compiles**
Run: `npm run build`
Expected: Passes with no unresolved module errors for FigLogo.
- [ ] **Step 5: Commit**
```bash
git add src/components/FigLogo.tsx public/favicon.svg src/components/TitleBar.tsx src/components/FloatingWheelWindow.tsx
git commit -m "feat(brand): create FigLogo component and update application icon references"
```

---

### Task 2: Web Landing Page Overhaul (`docs/index.html`)

**Files:**
- Modify: `docs/index.html`

**Interfaces:**
- Produces: Standalone production landing page in `docs/index.html` matching Figma's layout with embedded CSS, SVG icons, bento grid, interactive wheel mockup, and 5-language dictionary (EN, TR, ES, DE, FR).

- [ ] **Step 1: Draft the Figma-aligned HTML/CSS structure in `docs/index.html`**
Integrate Figma's hero section, desktop scene preview with radial wheel, bento grid cards (Radial Wheel, Image Studio, Document Engine, Zero Cloud Telemetry, Shortcuts), app window preview, and footer.
- [ ] **Step 2: Implement dynamic 5-language localization**
Add JavaScript translation dictionary with language toggle buttons (`EN`, `TR`, `ES`, `DE`, `FR`) switching headlines, tags, and button text dynamically without page reload.
- [ ] **Step 3: Connect 1-click download actions**
Link "Download Fig for Windows" buttons directly to `Fig.exe` and secondary button to `https://github.com/yunusemre-celik/fig`.
- [ ] **Step 4: Test in browser**
Verify visual fidelity, language switching, and download links in browser.
- [ ] **Step 5: Commit**
```bash
git add docs/index.html
git commit -m "feat(web): overhaul GitHub Pages landing page with Figma obsidian bento design"
```

---

### Task 3: Design Tokens & Styling in `src/App.css`

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Produces: Global obsidian design system CSS variables and helper utility classes.

- [ ] **Step 1: Define CSS custom properties in `src/App.css`**
Set up `:root` with `--bg-canvas: #080A11`, `--bg-surface: #0A0C14`, `--bg-card: rgba(19, 23, 39, 0.86)`, `--border-subtle: rgba(255, 255, 255, 0.075)`, `--border-hover: rgba(130, 137, 255, 0.25)`, `--text-primary: #F8FAFC`, `--text-muted: #969DAF`, `--accent-indigo: #8493FF`, `--font-mono: 'DM Mono', monospace`.
- [ ] **Step 2: Add two-column workspace grid and card styles**
Add styles for `.workspace-shell`, `.settings-sidebar`, `.dropzone-panel`, `.view-switch`, and hover tooltips (`.tooltip-trigger`, `.tooltip-bubble`).
- [ ] **Step 3: Clean up deprecated light-theme styles**
Remove unused `.theme-light` selectors to prevent styling conflicts.
- [ ] **Step 4: Verify CSS compilation**
Run: `npm run build`
Expected: CSS processes with zero syntax errors.
- [ ] **Step 5: Commit**
```bash
git add src/App.css
git commit -m "style(tokens): define obsidian design tokens, sidebar grid, and tooltip utilities"
```

---

### Task 4: Two-Column Desktop Workspace Shell (`App.tsx` & `Navigation.tsx`)

**Files:**
- Modify: `src/components/Navigation.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `FigLogo.tsx`, `App.css`
- Produces: Modern two-column workspace with left sidebar and right content panel.

- [ ] **Step 1: Redesign `Navigation.tsx` into a vertical workspace sidebar**
Implement the Figma sidebar:
- Account/Workspace block with `<FigLogo small />` and "100% local workspace".
- Menu labels: `WORKSPACE` (Quick Convert with `Ctrl+1` tooltip, Wheel Studio with `Ctrl+2` tooltip, Documents with `Ctrl+3` tooltip, Image Studio with `Ctrl+4` tooltip).
- Menu labels: `PREFERENCES` (Settings with `Ctrl+,` tooltip).
- Sidebar footer pill: "All processing is local · Offline mode active".
- [ ] **Step 2: Update `App.tsx` layout and state management**
Restructure `App.tsx` to render `<TitleBar />` at top, followed by a flex-row container: `<Navigation />` on the left, and the active view on the right.
- [ ] **Step 3: Integrate inline History switch in DropZone view**
Embed the "Dropzone | History" switch directly in the top header of the Quick Convert panel so users can toggle between the upload dropzone and `LibraryView` without leaving the panel.
- [ ] **Step 4: Enforce hover tooltips for shortcuts**
Wrap sidebar buttons with tooltip indicators displaying shortcut keys on hover.
- [ ] **Step 5: Verify build**
Run: `npm run build`
Expected: Successful compile.
- [ ] **Step 6: Commit**
```bash
git add src/components/Navigation.tsx src/App.tsx
git commit -m "feat(ui): restructure desktop app into two-column sidebar workspace with hover tooltips"
```

---

### Task 5: Radial Wheel & Floating Window Polish

**Files:**
- Modify: `src/components/RadialWheel.tsx`
- Modify: `src/components/FloatingWheelWindow.tsx`

**Interfaces:**
- Produces: Restyled obsidian radial wheel with smooth transitions and reliable ESC/click dismissal.

- [ ] **Step 1: Restyle `RadialWheel.tsx` with Figma dark glass dial**
Apply conic radial glass ring, glowing active slice indicator, and centered `<FigLogo />` hub.
- [ ] **Step 2: Polish `FloatingWheelWindow.tsx` backdrop and dismissal**
Ensure fullscreen transparent backdrop catches clicks to dismiss, `Escape` key event listener cleans up state, and window blur closes the wheel immediately.
- [ ] **Step 3: Verify build**
Run: `npm run build`
Expected: Build passes.
- [ ] **Step 4: Commit**
```bash
git add src/components/RadialWheel.tsx src/components/FloatingWheelWindow.tsx
git commit -m "feat(wheel): style radial wheel with obsidian glass dial and bulletproof dismiss"
```

---

### Task 6: Views & Modals Polish (`DropZone.tsx`, `SettingsView.tsx`, Modals)

**Files:**
- Modify: `src/components/DropZone.tsx`
- Modify: `src/components/SettingsView.tsx`
- Modify: `src/components/modals/ImageEditorModal.tsx`
- Modify: `src/components/modals/CropModal.tsx`
- Modify: `src/components/modals/CompressModal.tsx`

**Interfaces:**
- Produces: Polished views and modals fully compliant with the obsidian tech design system.

- [ ] **Step 1: Polish `DropZone.tsx`**
Add radial glowing center backdrop, dashed active border, drop icon, and supported file format pills (`PDF`, `DOCX`, `PNG`, `MP4`, `+36`).
- [ ] **Step 2: Clean `SettingsView.tsx`**
Remove permanent inline shortcut cards; keep clean obsidian cards for wheel trigger shortcut customization, audio feedback toggles, and version info.
- [ ] **Step 3: Restyle image and file modal dialogs**
Apply obsidian glass backgrounds (`rgba(14, 17, 28, 0.95)`), crisp 1px borders, and high-contrast pill action buttons to `ImageEditorModal.tsx`, `CropModal.tsx`, and `CompressModal.tsx`.
- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: Clean compile.
- [ ] **Step 5: Commit**
```bash
git add src/components/DropZone.tsx src/components/SettingsView.tsx src/components/modals/
git commit -m "feat(views): polish dropzone, settings, and modals with obsidian glass styling"
```

---

### Task 7: End-to-End Build & Release Validation

**Files:**
- Modify: `README.md` (if needed to reflect new icon and visual identity)

- [ ] **Step 1: Run comprehensive TypeScript and frontend build**
Run: `npm run build`
Expected: Zero errors, production bundle generated in `dist/`.
- [ ] **Step 2: Verify `docs/index.html`**
Check that GitHub Pages files in `docs/` are in sync and load without missing asset errors.
- [ ] **Step 3: Commit and summarize**
```bash
git add -A
git commit -m "chore(release): complete Figma end-to-end redesign for Fig"
```
