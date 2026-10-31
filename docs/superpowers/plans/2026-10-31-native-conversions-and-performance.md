# Native Conversions & Zero-Dependency Performance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement zero-dependency native PDF ➔ PNG/JPG page rendering and clean PDF conversion into Fig, measure performance (speed & RAM), build an optimized release binary, and update the landing page portable download ZIP.

**Architecture:** Utilize Windows 10/11 built-in WinRT `Windows.Data.Pdf.PdfDocument` API via native execution without requiring Python or Ghostscript, maintaining Fig's sub-10MB portable release size and sub-100MB transient memory footprint.

**Tech Stack:** Rust (Tauri v2), WinRT (Windows.Data.Pdf), TypeScript, React, Vite, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-10-31-native-conversions-and-performance.md`

## Global Constraints
- Zero external runtime dependency (No Python, No pip packages, No Ghostscript).
- Portable release ZIP must remain under 10 MB.
- Idle RAM consumption must remain ~25-35 MB.
- Windows 10 & 11 compatibility out of the box.

## Review Focus
- High DPI scaling: Ensure rendered PNGs are sharp (scale 2.0x ~192 DPI).
- Multi-page PDF: Handle 1-page vs multi-page PDFs cleanly without cluttering the folder.
- Non-blocking / Graceful error handling: If a PDF is password protected or corrupt, return a friendly error without freezing.
- File path handling: Special characters (Turkish characters, spaces, punctuation) in file paths must not break execution.
- Landing page download link points to the newly built release zip.

---

### Task 1: Native Windows PDF ➔ PNG/JPG Converter in Rust

**Files:**
- Modify: `src-tauri/src/commands.rs`

- [ ] **Step 1: Implement native PDF page rendering function in `commands.rs`**
  - Replace the external Python dependency in `convert_pdf` with native Windows WinRT `Windows.Data.Pdf` page rendering.
  - Support `png` and `jpg`/`jpeg` formats.
  - Scale factor 2.0x for crisp text rendering.
  - Automatically handle single vs multi-page PDFs (multi-page saved as `{stem}_sayfa_{i}.png`).
  - Provide native fallback for text extraction (`txt`).
- [ ] **Step 2: Add unit tests / compile check in `src-tauri`**
  - Run `cargo check` to verify syntax and types.

---

### Task 2: Frontend API, Wheel & Translation Integration

**Files:**
- Modify: `src/services/api.ts`
- Modify: `src/components/FloatingWheelWindow.tsx`
- Modify: `src/components/RadialWheel.tsx`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Update `src/services/api.ts`**
  - Add explicit targets for `png` / `pdf_png` and `jpg` / `pdf_jpg`.
- [ ] **Step 2: Update Radial Wheel & Floating Window**
  - In `FloatingWheelWindow.tsx`, add `pdf_png` ("PDF ➔ PNG Görsel") and `pdf_jpg` ("PDF ➔ JPG Fotoğraf") when a PDF file is active.
- [ ] **Step 3: Update `translations.ts`**
  - Add localized strings for PDF to PNG/JPG conversions across TR, EN, ES, DE, FR.

---

### Task 3: DocumentsView PDF Conversion Enhancement

**Files:**
- Modify: `src/components/DocumentsView.tsx`

- [ ] **Step 1: Enhance `DocumentsView.tsx`**
  - Add direct support for converting PDFs into PNG or JPG with high resolution.
  - Display informative badges and clear success cards showing output file locations.

---

### Task 4: Performance Benchmarking & Memory Measurements

**Files:**
- Create: `scripts/benchmark_pdf.ps1`

- [ ] **Step 1: Create a test PDF and benchmark script**
  - Measure execution speed in seconds.
  - Measure RAM consumption (MB) before, during, and after rendering.
  - Measure output PNG resolution and file size.
- [ ] **Step 2: Execute benchmark and document results**

---

### Task 5: Production Release Build, Packaging & Landing Page Sync

**Files:**
- Modify: `docs/Fig-Windows-x64.zip`
- Modify: `Fig-Windows-x64.zip`
- Modify: `docs/index.html` (if any download link / version update needed)

- [ ] **Step 1: Run production build**
  - Execute `npm run build && cargo build --release --manifest-path src-tauri/Cargo.toml`.
- [ ] **Step 2: Package portable release ZIP**
  - Update root `Fig.exe` and `docs/Fig.exe`.
  - Create fresh `Fig-Windows-x64.zip` in root and copy to `docs/Fig-Windows-x64.zip`.
  - Verify size is under 10 MB.
- [ ] **Step 3: Verify landing page links**
  - Ensure landing page download buttons link directly to the updated zip.
