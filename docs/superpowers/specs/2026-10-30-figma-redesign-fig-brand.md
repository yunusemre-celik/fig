# Design Doc: Figma End-to-End Brand & UI Redesign for Fig

**Date:** 2026-10-30  
**Status:** Ready for Final Approval  
**Target:** Desktop Application (`src/`) & GitHub Pages Landing Page (`docs/index.html`)  

---

## 1. Intent & Context
The user requested a complete visual redesign of the Fig project: the application logo, the web landing page, and the overall desktop UI. The previous version utilized an astronomy/space-themed midnight indigo aesthetic with a 6-segment Earth globe logo.

Following the provided Figma project (`Fig Radial File Toolkit`), Fig is undergoing a complete brand and UX modernization:
1. **Brand Identity:** A stylized organic **Fig Fruit** mark with glowing seed and leaf accents inside a high-gloss dark tech squircle rozet (`#202A4B` → `#0F1324`), accompanied by electric indigo & violet gradients (`#8493FF`, `#5257DC`, `#6366F1`).
2. **Web Showcase (`docs/`):** A high-performance Raycast/Linear-inspired landing page featuring obsidian dark mode (`#080A11`, `#0A0C14`), bento grid showcases, interactive wheel simulation, desktop file workflow mockup, and 1-click download actions.
3. **Desktop Application (`src/`):** A two-column modern workspace with a sleek left sidebar, dropzone and history panel, unified design tokens, typography (`Inter` + `DM Mono`), subtle 1px border highlights, and frosted acrylic card containers.
4. **Tooltips-Only Shortcuts:** Keyboard shortcuts (`Ctrl + Space`, `Ctrl + 1..5`, `Ctrl + V`) are strictly displayed as lightweight hover tooltips, avoiding inline clutter cards.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
* **Unified Brand Identity:** Replace all remnants of the old Earth globe logo with the new Fig Fruit squircle logo across the web navbar, favicons, app titlebar, radial wheel hub, and Windows binary icons (`.ico` / `.png`).
* **100% Figma Web Fidelity:** Replace `docs/index.html` with the new design, retaining 1-click download of `Fig.exe`, GitHub repo badges, and full 5-language internationalization (EN, TR, ES, DE, FR).
* **Two-Column Desktop Workspace Shell:** Transform the desktop application root layout (`src/App.tsx`, `Navigation.tsx`) into a modern two-column layout:
  - **Left Sidebar:** Brand lockup with version pill, local offline indicator (`All processing is local`), and navigation items (`Quick Convert`, `Wheel Studio`, `Documents`, `Image Studio`, `Settings`).
  - **Right Content Panel:** Dynamic workspace displaying the active view with subtle glassmorphism and smooth view transitions.
* **Strict Obsidian Dark Mode:** Pure, distraction-free dark mode (`#080A11` / `#0A0C14`), dropping redundant light mode toggles in favor of high-fidelity Linear/Raycast polish.
* **Tooltips-Only Shortcuts:** Zero permanent inline shortcut cards in settings or dropzones; shortcuts appear strictly on hover over triggers (`Ctrl + Space`, `Ctrl + 1..5`, etc.).
* **Flawless Build:** Ensure `npm run build` succeeds cleanly with zero TypeScript errors or CSS regressions.

### Non-Goals
* Modifying the core Rust Tauri backend (`src-tauri/`) file processing logic (image cropping, PDF extraction, docx conversion). The Rust engine remains untouched.
* Mobile responsive UI: As confirmed by the user, the focus is strictly desktop (1180px–1440px+).

### Anti-Goals
* No generic flat vector icons or inconsistent rainbow borders.
* No inline clutter in settings or modals that distracts from quick keyboard-first workflows.

---

## 3. Approaches Considered & Trade-Offs

### Approach 1: Integrated End-to-End Redesign (Chosen)
* **Description:** Redesign the brand mark/logo, the GitHub Pages landing page (`docs/index.html`), and the React/Tauri desktop application (`src/`) simultaneously.
* **Pros:** Delivers complete visual harmony. A user downloading the application from the website receives the exact same high-end experience shown on the landing page.
* **Cons:** Larger scope touching multiple components and styles in one release.
* **Decision:** Selected by the user.

### Approach 2: Staged Phased Rollout
* **Description:** Update only the website and logo first, deferring desktop app UI changes to a later milestone.
* **Pros:** Faster initial deployment of the landing page.
* **Cons:** Disconnect between website screenshots and the actual running app.
* **Decision:** Rejected in favor of Approach 1.

---

## 4. Design System & Tokens

### 4.1 Color Architecture
* **Canvas / Body:** `#080A11` transitioning to `#0A0C14` with a subtle radial glow at top (`rgba(59, 130, 246, 0.12)`).
* **Card & Surface Backgrounds:** Linear gradient `145deg, rgba(19, 23, 39, 0.86)` to `rgba(12, 15, 26, 0.9)`.
* **Surface Borders:** 1px solid `rgba(255, 255, 255, 0.075)` with hover states highlighting to `rgba(130, 137, 255, 0.25)`.
* **Brand Accents:**
  - Fig Indigo: `#8493FF` and `#5257DC`
  - Fig Violet: `#6366F1`
  - Emerald / Offline: `#6EE7A8` and `#10B981`
  - High-Contrast Pill: `#F4F5F8` background with `#0C0E15` text.
* **Typography:**
  - Headings & Body: `Inter, ui-sans-serif, system-ui, sans-serif`
  - Technical Tags, Shortcuts, & Metrics: `"DM Mono", monospace`

---

## 5. Architectural & Structural Decisions (Settled Calls)

1. **Desktop Shell:** Two-column workspace (`settings-sidebar` + right content panel). 
   - `Quick Convert` hosts the Drag & Drop area with the inline "Dropzone | History" switch.
   - `Wheel Studio` is integrated directly as a primary sidebar navigation item.
   - `Documents` hosts PDF, Word, Excel, and text extraction utilities.
   - `Image Studio` triggers the crop, compress, blur/censor modal workflows with dark obsidian glass styling.
   - `Settings` provides clean toggles for wheel behavior, startup, and sound effects.
2. **Theming:** Exclusively Obsidian Dark. Redundant light mode code and toggles are safely removed.
3. **Shortcut Experience:** Strictly hover tooltips via `title` or custom tooltip bubbles (e.g. hovering over the Quick Convert button shows `Ctrl + 1`, hover over Wheel shows `Ctrl + Space`).
4. **Floating Wheel Window (`FloatingWheelWindow.tsx`):** Maintains its instant cursor popup behavior on `Ctrl + Space` and instant dismissal on `Escape` or backdrop click, restyled with the obsidian glass radial dial and Fig Fruit center mark.

---

## 6. Implementation Touchpoints

* **`src/components/FigLogo.tsx`:** New component rendering scalable SVG Fig Fruit squircle badge.
* **`public/favicon.svg` & `public/favicon.ico`:** Updated with the new mark.
* **`docs/index.html`:** Complete landing page overhaul based on Figma export with 5-language support and direct download.
* **`src/App.css`:** Figma-matched obsidian tokens and utility styles.
* **`src/App.tsx` & `src/components/Navigation.tsx`:** Two-column layout restructure.
* **`src/components/DropZone.tsx`:** Glowing dashed dropzone with supported format tags.
* **`src/components/RadialWheel.tsx` & `FloatingWheelWindow.tsx`:** Restyled radial slices and center hub.
* **`src/components/SettingsView.tsx`:** Clean obsidian settings without inline shortcut cards.
* **Verification:** `npm run build` verification of TypeScript and bundle.
