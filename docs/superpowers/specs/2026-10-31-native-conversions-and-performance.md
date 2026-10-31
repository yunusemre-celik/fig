# Fig Native Conversions & Zero-Dependency Performance Spec

- **Author:** Yunus Emre Çelik & Antigravity
- **Date:** 2026-10-31
- **Target Version:** Fig v0.5.0
- **Goal:** Implement high-demand native file conversions (PDF ➔ PNG/JPG page rendering, SVG ➔ PNG, PDF Merge/Split) with zero external dependencies (no Python, no Ghostscript), strictly preserving Fig's sub-10MB portable release size and ultra-low memory footprint.

---

## 1. Context & Motivation

Fig is designed as a native Windows 11 rapid file toolkit with an instant radial wheel (`Alt + Q`).
Currently:
1. `convert_pdf` relies on an external Python script (`pdf_converter.py`) with `pypdf`, `openpyxl`, and `docx`. On a standard user PC without Python installed, these operations fail immediately.
2. The user requested PDF ➔ PNG conversion. Currently, the script only attempts to extract embedded raw images, not render actual document pages as high-resolution PNG/JPG files.
3. The user requires that Fig remains lightweight, secure, and blazingly fast ("Yol A"), avoiding heavy 150MB+ bundles like `file-converter.io` (which bundles FFmpeg, ImageMagick, and Ghostscript).

---

## 2. Architecture & Technical Strategy ("Yol A")

### 2.1 Native PDF ➔ PNG/JPG Rendering (Zero Python Dependency)
- **Windows Built-in Engine:** Windows 10 (Build 10240+) and Windows 11 include `Windows.Data.Pdf.PdfDocument`.
- **Mechanism:**
  - Can be driven either directly via WinRT or a compact native PowerShell script utilizing `[Windows.Data.Pdf.PdfDocument]` without any external software installation.
  - Generates PNG or JPG per page at customizable resolution (scale factor 2.0x = ~192 DPI for crisp clarity).
  - Multi-page handling: If PDF has 1 page, produces `{name}.png`. If multiple pages, produces `{name}_sayfa_1.png`, `{name}_sayfa_2.png`, etc., or outputs to a clean folder.
- **Benefits:**
  - 0 KB added to executable size.
  - Native Windows Direct2D hardware acceleration.
  - Completely immune to Ghostscript CVE vulnerabilities.

### 2.2 UI & Radial Wheel Integration
- In `RadialWheel.tsx` and `FloatingWheelWindow.tsx`:
  - When a PDF file is selected:
    - `pdf_png`: "PDF ➔ PNG Görsel" (Sayfaları yüksek kaliteli PNG yap)
    - `pdf_jpg`: "PDF ➔ JPG Görsel" (Optimize edilmiş JPG sayfaları)
    - `pdf_txt`: "PDF ➔ Metin" (Metin içeriğini TXT olarak dışa aktar)
    - `pdf_docx`: "PDF ➔ Word"
- In `DocumentsView.tsx`:
  - Allow drag-and-dropping PDF to convert to PNG / JPG / TXT with visual progress.

### 2.3 Performance & Resource Constraints
- **Executable Size:** `Fig.exe` must remain under 25 MB; portable ZIP under 10 MB.
- **Idle Memory:** No increase in idle RAM (remains ~25-35 MB).
- **Execution Speed:** 1-5 page PDF rendered in < 2 seconds.
- **Security:** Safe parameter passing with `CREATE_NO_WINDOW`, sanitized output paths, protection against path traversal.

---

## 3. Release & Distribution Flow
1. Verify `cargo check` and clean build.
2. Build optimized release binary: `npm run build && cargo build --release --manifest-path src-tauri/Cargo.toml`.
3. Copy new `Fig.exe` to root and `docs/`.
4. Update `Fig-Windows-x64.zip` in root and `docs/`.
5. Run benchmark / performance measurements (file size, conversion speed, memory usage).
6. Verify landing page download link connects to the updated portable ZIP.
