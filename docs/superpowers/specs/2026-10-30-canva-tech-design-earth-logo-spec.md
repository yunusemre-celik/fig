# Design Spec: Canva Tech Editorial Redesign, Earth Globe Logo & Shortcut Cleanliness

**Date:** 2026-10-30  
**Status:** Ready for Approval  
**Scope:** Desktop Application (`src/`) & GitHub Pages Landing Page (`docs/`)  

---

## 1. Intent & Context
The user requested a complete departure from generic "AI-slop" aesthetics (over-saturated multi-color cards, cheesy badges, cluttering inline keyboard shortcut cards, amber gradients) in favor of a bespoke, professional tech editorial identity based on their provided Canva design (`DAHZbEmPn_0`).

Additionally, two core UX issues must be strictly resolved:
1. **Shortcut Tooltips Only:** Keyboard shortcuts (`Ctrl + Space`, `Ctrl + 1..5`, etc.) were inappropriately displayed as inline clutter cards and badges in the Settings view and UI. They must strictly appear as lightweight hover tooltips when hovering over interactive triggers.
2. **Instant Wheel Dismiss:** When in wheel mode, pressing `Esc` OR clicking anywhere on the empty screen / backdrop outside the wheel must reliably close wheel mode immediately.
3. **Earth Globe 6-Segment Logo:** Replace the generic 'F' box with a custom 6-segment circular wheel resembling planet Earth in terrestrial colors (deep ocean blues, continent emerald, atmospheric cloud white).

---

## 2. Design System & Aesthetic Language (Canva `DAHZbEmPn_0` Alignment)

### 2.1 Color Architecture
- **Canvas / Background:** Deep Tech Space Midnight (`#0A0B10`) transitioning to Deep Royal Indigo (`#13182E` / `#1E1B4B`).
- **Brand Accents:**
  - Electric Tech Cobalt: `#1D4ED8` and `#2563EB`
  - Atmospheric Cyan: `#38BDF8`
  - Stark Architectural White: `#FFFFFF`
  - High Contrast Slate / Muted: `#94A3B8` / `#64748B`
- **Removed:** All rainbow card palettes (random red, green, yellow, purple borders), generic amber buttons, confetti clutter, and childish "sweet" copy.

### 2.2 Typography & Editorial Structure
- Clean, extended geometric headings (`-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`) with tight negative tracking (`-0.03em`).
- Monospaced technical tags (`font-mono text-xs uppercase tracking-wider`).
- Stark white pill buttons with blue text and sharp hover states, echoing the Canva "LEARN MORE" and "CONTACT US" controls.

---

## 3. New Identity: 6-Segment Earth Globe Logo
- **Component:** `src/components/EarthLogo.tsx` (reusable SVG with scalable `size`).
- **Geometry:**
  - Outer circle / iris divided into exactly 6 radial segments (60° arcs each).
  - Segments alternate between:
    - 3 Ocean Segments: Deep Royal Blue (`#1D4ED8`), Cerulean (`#0284C7`), Sapphire (`#2563EB`)
    - 2 Land / Continent Segments: Emerald (`#10B981`), Forest Cyan (`#059669`)
    - 1 Polar / Cloud Segment: Ice White (`#F8FAFC`) with subtle cyan border
  - Subtle planetary longitude/latitude curve overlay giving depth without clutter.
- **Applications:**
  - Desktop app header and window icon.
  - In-app wheel central indicator.
  - Web site header, favicon, and meta tags (`docs/index.html`).

---

## 4. UX & Behavioral Rules

### 4.1 Strict Shortcut Tooltip Enforcement
- **Settings View:** Remove the inline "Keyboard Shortcuts Map / Kısayol Tuşları Haritası" card entirely.
- **Top Bar / Dropzone:** Remove static `<kbd>` inline tags from the body text.
- **Tooltip Implementation:**
  - Hovering on the "Quick Wheel" button shows a floating pill: `Ctrl + Space`.
  - Hovering on Navigation tabs shows: `Ctrl + 1`, `Ctrl + 2`, etc.
  - Zero permanent visual noise when the user is not actively hovering.

### 4.2 Bulletproof Wheel Dismissal
- In `FloatingWheelWindow.tsx`:
  - Fullscreen transparent backdrop (`fixed inset-0 w-screen h-screen z-0`) with `onClick={handleClose}`.
  - Any click outside the SVG wheel radius closes the window immediately.
  - Global `keydown` event listener specifically catches `Escape` at document level and invokes `handleClose()`.
  - Window blur listener (`window.addEventListener("blur", handleClose)`) closes the wheel if the user clicks another window or desktop.

---

## 5. Web Landing Page Overhaul (`docs/index.html`)
- Completely reskinned with the Canva Tech editorial style:
  - Deep blue/indigo gradient hero with line-mesh contour graphics.
  - Stark white pill download CTA ("Download Fig for Windows", 1-click portable .exe).
  - Clean monochrome/cobalt feature cards.
  - Earth 6-segment logo in the navbar.
  - Embedded instant 5-language switcher (EN, TR, ES, DE, FR) preserved.

---

## 6. Approaches Considered & Trade-offs
1. **Approach 1: Deep Tech Editorial (Chosen):** Direct translation of Canva `DAHZbEmPn_0` with cobalt/indigo palettes and sharp contrast.
2. **Approach 2: Pure Monochrome:** Rejected because Canva design explicitly leverages rich blue-indigo depth.
