# Canva Tech Editorial Redesign, Earth Globe Logo & Shortcut Cleanliness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Fig's visual identity to the Canva tech editorial aesthetic (`DAHZbEmPn_0`), replace the logo with a 6-segment Earth globe wheel, enforce tooltips-only for keyboard shortcuts, and ensure bulletproof ESC/backdrop dismissal for the wheel.

**Architecture:** Replace generic amber/confetti "AI-slop" tokens with deep midnight indigo (`#0A0B10`, `#13182E`) and royal cobalt (`#1D4ED8`) design tokens across CSS, SVG, and HTML. Build a scalable `EarthLogo` SVG component, remove inline keyboard shortcut cards in favor of hover tooltips, and bind global ESC/backdrop/blur dismiss events in the floating wheel window.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Rust (Tauri v2), Standalone HTML/CSS/JS (`docs/index.html`).

**Spec:** `docs/superpowers/specs/2026-10-30-canva-tech-design-earth-logo-spec.md`

## Global Constraints
- **Zero AI-slop:** No random rainbow cards (red, green, amber, purple clutter), no cheesy sparkle icons, no warm amber gradients.
- **Canva Palette:** Deep Midnight Space (`#0A0B10`), Royal Cobalt (`#1D4ED8`), Tech Indigo (`#1E1B4B`), Electric Cyan (`#38BDF8`), Stark White (`#FFFFFF`).
- **Logo:** Exactly 6 radial segments in Earth colors (3 ocean blues, 2 continent greens, 1 polar white) with subtle globe latitude lines.
- **Shortcuts:** Never displayed as permanent inline UI text or dedicated settings cards; strictly displayed inside hover tooltips.
- **Wheel Dismiss:** `Escape` key OR clicking anywhere outside the wheel MUST immediately close the wheel.
- **i18n:** All 5 languages (EN, TR, ES, DE, FR) must remain fully supported in both app and landing page.

## Review Focus
1. Wheel backdrop click: Clicking transparent area outside 420px wheel must dismiss window immediately without delay.
2. `Esc` key press: Pressing `Esc` in any state (hovered, idle, dragging) must dismiss the wheel window.
3. Settings cleanliness: No visible keyboard shortcut list card taking up vertical space in Settings.
4. Logo rendering: Scalable `EarthLogo` renders sharply at 16px, 28px, 48px, and 128px across dark and light modes.
5. 1-Click download: `docs/index.html` download button continues downloading `Fig.exe` directly with no broken links.

---

### Task 1: Earth Globe 6-Segment Logo Component & Favicon

**Files:**
- Create: `src/components/EarthLogo.tsx`
- Modify: `index.html`

**Interfaces:**
- Produces: `<EarthLogo size={number} className={string} />`

- [ ] **Step 1: Create `src/components/EarthLogo.tsx`**
  - Implement 6-segment circular radial iris:
    - 6 arcs of 60° each:
      - 3 Ocean blues: `#1D4ED8` (Royal Cobalt), `#0284C7` (Cerulean), `#2563EB` (Sapphire)
      - 2 Terrestrial greens: `#10B981` (Emerald), `#059669` (Forest)
      - 1 Polar cloud: `#F8FAFC` (Ice White) with subtle cyan border
    - Overlay subtle planetary longitude & latitude curved lines.
    - Central planetary core circle with atmospheric halo (`#38BDF8` blur).

- [ ] **Step 2: Update `index.html` Favicon to Earth Globe SVG**
  - Replace yellow 'F' square favicon with 6-segment Earth globe SVG data URL.

- [ ] **Step 3: Verify TypeScript Compilation**
  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/EarthLogo.tsx index.html
  git commit -m "feat(brand): create 6-segment Earth globe radial logo and update favicon"
  ```

---

### Task 2: Canva Tech Theme & Design Token Overhaul in CSS

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Produces: CSS design tokens `--tech-midnight`, `--tech-indigo`, `--tech-cobalt`, `--tech-electric`, `.tech-btn-pill`, `.tech-card-editorial`.

- [ ] **Step 1: Replace Amber & Multi-Color Tokens in `src/App.css`**
  - Define Canva Tech tokens:
    - `--apple-bg-canvas: #090A0F`
    - `--apple-bg-panel: rgba(15, 18, 35, 0.85)`
    - `--apple-bg-card: rgba(22, 27, 54, 0.65)`
    - `--apple-bg-card-hover: rgba(30, 38, 75, 0.80)`
    - `--apple-accent: #1D4ED8` (Royal Tech Cobalt)
    - `--apple-accent-hover: #2563EB`
    - `--apple-accent-light: rgba(29, 78, 216, 0.15)`
    - `--apple-border: rgba(255, 255, 255, 0.09)`
    - `--apple-border-focus: #38BDF8`
  - Add Canva-style stark white pill button `.tech-btn-pill` (pure white background, dark blue text, uppercase tracking).

- [ ] **Step 2: Verify Build**
  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 3: Commit**
  ```bash
  git add src/App.css
  git commit -m "feat(css): apply Canva tech cobalt and midnight indigo design tokens"
  ```

---

### Task 3: Strict Shortcut Tooltip Enforcement & Wheel Dismissal

**Files:**
- Modify: `src/components/SettingsView.tsx`
- Modify: `src/components/DropZone.tsx`
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/FloatingWheelWindow.tsx`
- Modify: `src/components/RadialWheel.tsx`

**Interfaces:**
- Consumes: `hideWheel()`, `t()`
- Produces: Pure hover-only shortcut tooltips; bulletproof ESC and click-outside dismissal.

- [ ] **Step 1: Remove Inline Shortcuts Card in `SettingsView.tsx`**
  - Delete the entire "Keyboard Shortcuts Map / Kısayol Tuşları Haritası" section from `SettingsView.tsx`.
  - Keep theme, language, display mode, output destination, and privacy sections clean and un-cluttered.

- [ ] **Step 2: Clean Inline Keyboard Tags in `DropZone.tsx` & `Navigation.tsx`**
  - In `DropZone.tsx`: Remove inline `<kbd>Ctrl + V</kbd>` text from the description paragraph.
  - In `Navigation.tsx`: Ensure `<kbd>` tags are strictly contained inside `.tooltip` elements that render only on `:hover`.

- [ ] **Step 3: Implement Bulletproof Dismissal in `FloatingWheelWindow.tsx` & `RadialWheel.tsx`**
  - In `FloatingWheelWindow.tsx`:
    - Ensure outer container handles backdrop click unconditionally:
      ```tsx
      <div className="fixed inset-0 w-screen h-screen ..." onClick={(e) => {
        if (e.target === e.currentTarget && !isEditorOpen) handleClose();
      }}>
      ```
    - Add global document `keydown` listener for `Escape`:
      ```tsx
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("blur", handleClose);
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("blur", handleClose);
        };
      }, []);
      ```
  - In `RadialWheel.tsx`:
    - Allow clicking anywhere on the outer boundary or transparent SVG regions to call `onClose()`.

- [ ] **Step 4: Verify Build**
  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/SettingsView.tsx src/components/DropZone.tsx src/components/Navigation.tsx src/components/FloatingWheelWindow.tsx src/components/RadialWheel.tsx
  git commit -m "fix(ux): enforce shortcut display strictly as hover tooltips and fix wheel ESC/backdrop dismissal"
  ```

---

### Task 4: Integrate Earth Logo & Canva Tech Editorial Layout in App

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/RadialWheel.tsx`
- Modify: `src/components/Navigation.tsx`

**Interfaces:**
- Consumes: `<EarthLogo />`, `useTranslation()`

- [ ] **Step 1: Update Top Header in `App.tsx`**
  - Replace amber 'F' box with `<EarthLogo size={24} />`.
  - Replace "Windows 11 Mica & Acrylic" badge with sleek technical tag: "Fig Tech Core · v0.3.1".
  - Move `Ctrl + Space` into a pure hover tooltip.

- [ ] **Step 2: Update Hero & Quick Action Cards in `App.tsx`**
  - Replace playful "tatlı bir kolaylık" with Canva editorial tone:
    "Leave the heavy lifting to us." / "Dosyalarınız için zahmetsiz teknoloji."
  - Replace multicolored quick cards with cohesive Canva tech cards:
    Deep navy cards with royal cobalt/cyan icons, crisp typography.

- [ ] **Step 3: Update `RadialWheel.tsx` Central Hub & Slices**
  - Central split hub: integrate `<EarthLogo size={36} />` subtly in the central divider or background.
  - Slices: Deep midnight cobalt gradients (`#161B33` to `#1D4ED8`) with electric cyan active highlights.

- [ ] **Step 4: Verify Build**
  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/App.tsx src/components/RadialWheel.tsx src/components/Navigation.tsx
  git commit -m "feat(ui): integrate Earth logo and Canva tech editorial layout in desktop app"
  ```

---

### Task 5: Overhaul Web Landing Page (`docs/index.html`)

**Files:**
- Modify: `docs/index.html`

**Interfaces:**
- Produces: Production GitHub Pages landing page matching Canva `DAHZbEmPn_0` with Earth logo and 5-language switcher.

- [ ] **Step 1: Reskin `docs/index.html` with Canva Tech Editorial Aesthetic**
  - Header: Replace 'F' box with the 6-segment Earth globe SVG logo.
  - Hero Section:
    - Rich midnight indigo to royal cobalt gradient background with technical contour mesh wireframe.
    - Strong editorial heading: "Leave the heavy lifting to us." / "Dosyalarınızı zahmetsizce yönetin."
    - Stark white pill download CTA ("Download Fig for Windows (.exe)") styled like Canva's high-contrast buttons.
  - Feature Sections:
    - Tech editorial cards (Image Studio, Universal Document Suite, Reverse PDF Engine, Media Toolkit) with cobalt accents.
    - Remove cheesy AI sparkle badges and playful rainbow tags.
  - 5-Language Switcher (EN, TR, ES, DE, FR) maintained and updated with mature copy.

- [ ] **Step 2: Verify in Browser & Test Download Link**
  - Verify that clicking download links directly to `Fig.exe`.

- [ ] **Step 3: Commit**
  ```bash
  git add docs/index.html
  git commit -m "feat(landing): complete Canva tech editorial overhaul with Earth logo and professional copy"
  ```

---

### Task 6: Final Verification, Production Build & Deployment

- [ ] **Step 1: Run Full TypeScript Build**
  Run: `npm run build`
  Expected: 0 errors.

- [ ] **Step 2: Stop Running Fig Process**
  `Get-Process -Name 'fig*' | Stop-Process -Force`

- [ ] **Step 3: Compile Standalone Release Binary**
  Run: `npx tauri build --no-bundle`
  Expected: Clean binary built at `src-tauri/target/release/fig.exe`.

- [ ] **Step 4: Update Binaries**
  - Copy `src-tauri/target/release/fig.exe` to `T:\Fig.exe` and `T:\docs\Fig.exe`.
  - Restart background process: `Start-Process 'T:\Fig.exe' -ArgumentList '--minimized'`.

- [ ] **Step 5: Git Commit & Push to GitHub**
  ```bash
  git add .
  git commit -m "release: v0.3.1 with Canva tech design, Earth logo, and shortcut tooltip fix"
  git push origin master
  ```
