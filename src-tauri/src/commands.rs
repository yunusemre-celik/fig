use std::io::Write;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub formatted_size: String,
    pub extension: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<u32>,
    pub modified: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LibraryEntry {
    pub id: String,
    pub original_name: String,
    pub original_path: String,
    pub output_path: String,
    pub action: String,
    pub size_before: u64,
    pub size_after: u64,
    pub timestamp: String,
}

pub fn format_file_size(bytes: u64) -> String {
    const KB: f64 = 1024.0;
    const MB: f64 = KB * 1024.0;
    const GB: f64 = MB * 1024.0;

    let b = bytes as f64;
    if b < KB {
        format!("{} B", bytes)
    } else if b < MB {
        format!("{:.1} KB", b / KB)
    } else if b < GB {
        format!("{:.1} MB", b / MB)
    } else {
        format!("{:.2} GB", b / GB)
    }
}

pub fn get_library_file_path() -> PathBuf {
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("Fig").join("library.json")
    } else if let Some(dir) = dirs::data_local_dir() {
        dir.join("Fig").join("library.json")
    } else {
        PathBuf::from(".").join("Fig").join("library.json")
    }
}

pub fn read_library_from_path(path: &Path) -> Result<Vec<LibraryEntry>, String> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    let trimmed = data.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }
    serde_json::from_str(trimmed).map_err(|e| format!("Failed to parse library file: {}", e))
}

pub fn write_library_to_path(entries: &[LibraryEntry], path: &Path) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(entries).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}

pub fn record_library_action(
    original_path: &str,
    output_path: &str,
    action: &str,
    size_before: u64,
    size_after: u64,
) {
    let original_name = Path::new(original_path)
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| original_path.to_string());

    let entry = LibraryEntry {
        id: format!("{}-{}", chrono::Local::now().timestamp_millis(), original_name),
        original_name,
        original_path: original_path.to_string(),
        output_path: output_path.to_string(),
        action: action.to_string(),
        size_before,
        size_after,
        timestamp: chrono::Local::now().format("%Y-%m-%d %H:%M").to_string(),
    };

    let _ = add_to_library(entry);
}

// 1. get_file_info
#[cfg_attr(not(test), tauri::command)]
pub fn get_file_info(path: String) -> Result<FileInfo, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("File does not exist: {}", path));
    }

    let metadata = std::fs::metadata(p).map_err(|e| format!("Failed to read file metadata: {}", e))?;
    let size = metadata.len();
    let formatted_size = format_file_size(size);

    let name = p
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();

    let extension = p
        .extension()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    let modified = match metadata.modified() {
        Ok(time) => {
            let datetime: chrono::DateTime<chrono::Local> = time.into();
            datetime.format("%Y-%m-%d %H:%M").to_string()
        }
        Err(_) => "Unknown".to_string(),
    };

    let (width, height) = match image::open(p) {
        Ok(img) => (Some(img.width()), Some(img.height())),
        Err(_) => (None, None),
    };

    let clean_path = match std::fs::canonicalize(p) {
        Ok(can) => {
            let s = can.to_string_lossy().to_string();
            if let Some(stripped) = s.strip_prefix(r"\\?\") {
                stripped.to_string()
            } else {
                s
            }
        }
        Err(_) => path,
    };

    Ok(FileInfo {
        name,
        path: clean_path,
        size,
        formatted_size,
        extension,
        width,
        height,
        modified,
    })
}

// 2. convert_image
#[cfg_attr(not(test), tauri::command)]
pub fn convert_image(
    input_path: String,
    target_format: String,
    quality: Option<u8>,
) -> Result<FileInfo, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Input file does not exist: {}", input_path));
    }

    let size_before = std::fs::metadata(in_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let img = image::open(in_path)
        .map_err(|e| format!("Failed to decode image {}: {}", input_path, e))?;

    let fmt_clean = target_format.trim().to_lowercase();
    let parent = in_path.parent().unwrap_or_else(|| Path::new("."));
    let stem = in_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "image".to_string());

    let (out_ext, image_format) = match fmt_clean.as_str() {
        "png" => ("png", image::ImageFormat::Png),
        "jpg" | "jpeg" => ("jpg", image::ImageFormat::Jpeg),
        "webp" => ("webp", image::ImageFormat::WebP),
        "bmp" => ("bmp", image::ImageFormat::Bmp),
        other => return Err(format!("Unsupported target image format: {}", other)),
    };

    let original_ext = in_path
        .extension()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    let out_name = if original_ext == out_ext {
        format!("{}_converted.{}", stem, out_ext)
    } else {
        format!("{}.{}", stem, out_ext)
    };

    let mut out_path = parent.join(&out_name);
    if out_path == in_path {
        out_path = parent.join(format!("{}_converted.{}", stem, out_ext));
    }

    match image_format {
        image::ImageFormat::Jpeg => {
            let rgb = img.to_rgb8();
            let mut file = std::fs::File::create(&out_path)
                .map_err(|e| format!("Failed to create output file: {}", e))?;
            let q = quality.unwrap_or(85).clamp(1, 100);
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut file, q);
            encoder
                .encode(rgb.as_raw(), rgb.width(), rgb.height(), image::ExtendedColorType::Rgb8)
                .map_err(|e| format!("Failed to encode JPEG: {}", e))?;
        }
        image::ImageFormat::Bmp => {
            let rgb = img.to_rgb8();
            rgb.save_with_format(&out_path, image::ImageFormat::Bmp)
                .map_err(|e| format!("Failed to encode BMP: {}", e))?;
        }
        image::ImageFormat::WebP => {
            img.save_with_format(&out_path, image::ImageFormat::WebP)
                .map_err(|e| format!("Failed to encode WebP: {}", e))?;
        }
        image::ImageFormat::Png => {
            img.save_with_format(&out_path, image::ImageFormat::Png)
                .map_err(|e| format!("Failed to encode PNG: {}", e))?;
        }
        _ => {
            img.save_with_format(&out_path, image_format)
                .map_err(|e| format!("Failed to save image: {}", e))?;
        }
    }

    let out_path_str = out_path.to_string_lossy().to_string();
    let size_after = std::fs::metadata(&out_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let action = format!("Convert to {}", out_ext.to_uppercase());
    record_library_action(&input_path, &out_path_str, &action, size_before, size_after);

    get_file_info(out_path_str)
}

// 3. crop_image
#[cfg_attr(not(test), tauri::command)]
pub fn crop_image(
    input_path: String,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
) -> Result<FileInfo, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Input file does not exist: {}", input_path));
    }

    if width == 0 || height == 0 {
        return Err("Crop width and height must be greater than zero".to_string());
    }

    let size_before = std::fs::metadata(in_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let img = image::open(in_path)
        .map_err(|e| format!("Failed to decode image {}: {}", input_path, e))?;

    if x >= img.width() || y >= img.height() {
        return Err(format!(
            "Crop starting position ({}, {}) is outside image dimensions ({}x{})",
            x,
            y,
            img.width(),
            img.height()
        ));
    }

    let crop_w = width.min(img.width() - x);
    let crop_h = height.min(img.height() - y);
    let cropped = img.crop_imm(x, y, crop_w, crop_h);

    let parent = in_path.parent().unwrap_or_else(|| Path::new("."));
    let stem = in_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "image".to_string());
    let ext = in_path
        .extension()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "png".to_string());

    let out_path = parent.join(format!("{}_cropped.{}", stem, ext));
    cropped
        .save(&out_path)
        .map_err(|e| format!("Failed to save cropped image: {}", e))?;

    let out_path_str = out_path.to_string_lossy().to_string();
    let size_after = std::fs::metadata(&out_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let action = format!("Crop ({}x{})", crop_w, crop_h);
    record_library_action(&input_path, &out_path_str, &action, size_before, size_after);

    get_file_info(out_path_str)
}

// 4. compress_image
#[cfg_attr(not(test), tauri::command)]
pub fn compress_image(
    input_path: String,
    quality: u8,
    max_width: Option<u32>,
    max_height: Option<u32>,
) -> Result<FileInfo, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Input file does not exist: {}", input_path));
    }

    let size_before = std::fs::metadata(in_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let mut img = image::open(in_path)
        .map_err(|e| format!("Failed to decode image {}: {}", input_path, e))?;

    let current_w = img.width();
    let current_h = img.height();

    let target_w = max_width.unwrap_or(current_w);
    let target_h = max_height.unwrap_or(current_h);

    if current_w > target_w || current_h > target_h {
        img = img.resize(target_w, target_h, image::imageops::FilterType::Lanczos3);
    }

    let parent = in_path.parent().unwrap_or_else(|| Path::new("."));
    let stem = in_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "image".to_string());
    let original_ext = in_path
        .extension()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_else(|| "jpg".to_string());

    let is_jpeg = original_ext == "jpg" || original_ext == "jpeg";
    let out_ext = if is_jpeg { "jpg" } else { &original_ext };

    let mut out_path = parent.join(format!("{}_compressed.{}", stem, out_ext));
    if out_path == in_path {
        out_path = parent.join(format!("{}_compressed_1.{}", stem, out_ext));
    }

    let q = quality.clamp(1, 100);
    if is_jpeg {
        let rgb = img.to_rgb8();
        let mut file = std::fs::File::create(&out_path)
            .map_err(|e| format!("Failed to create output file: {}", e))?;
        let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut file, q);
        encoder
            .encode(rgb.as_raw(), rgb.width(), rgb.height(), image::ExtendedColorType::Rgb8)
            .map_err(|e| format!("Failed to encode compressed JPEG: {}", e))?;
    } else if out_ext == "webp" {
        img.save_with_format(&out_path, image::ImageFormat::WebP)
            .map_err(|e| format!("Failed to encode compressed WebP: {}", e))?;
    } else {
        img.save(&out_path)
            .map_err(|e| format!("Failed to save compressed image: {}", e))?;
    }

    let out_path_str = out_path.to_string_lossy().to_string();
    let size_after = std::fs::metadata(&out_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let action = format!("Compress (Quality {}%)", q);
    record_library_action(&input_path, &out_path_str, &action, size_before, size_after);

    get_file_info(out_path_str)
}

// 5. read_qr_code
#[cfg_attr(not(test), tauri::command)]
pub fn read_qr_code(input_path: String) -> Result<String, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Input file does not exist: {}", input_path));
    }

    let img = image::open(in_path)
        .map_err(|e| format!("Failed to open image: {}", e))?;

    let gray = img.to_luma8();
    let mut prepared = rqrr::PreparedImage::prepare(gray);
    let grids = prepared.detect_grids();

    if grids.is_empty() {
        return Err("No QR code detected in the image".to_string());
    }

    let mut decoded_bytes = Vec::new();
    grids[0]
        .decode_to(&mut decoded_bytes)
        .map_err(|e| format!("Failed to decode QR code: {:?}", e))?;

    String::from_utf8(decoded_bytes)
        .map_err(|e| format!("QR code content is not valid UTF-8: {}", e))
}

// 6. generate_qr_code
#[cfg_attr(not(test), tauri::command)]
pub fn generate_qr_code(text: String, output_dir: Option<String>) -> Result<FileInfo, String> {
    let clean_text = text.trim();
    if clean_text.is_empty() {
        return Err("QR code text cannot be empty".to_string());
    }

    let code = qrcode::QrCode::new(clean_text.as_bytes())
        .map_err(|e| format!("Failed to generate QR code: {}", e))?;

    let qr_width = code.width();
    let border = 4;
    let module_size = 12;
    let total_modules = qr_width + border * 2;
    let img_size = (total_modules * module_size) as u32;

    let mut img = image::RgbImage::from_pixel(img_size, img_size, image::Rgb([255, 255, 255]));
    let colors = code.to_colors();

    for y in 0..qr_width {
        for x in 0..qr_width {
            if colors[y * qr_width + x] == qrcode::Color::Dark {
                let px_start = ((x + border) * module_size) as u32;
                let py_start = ((y + border) * module_size) as u32;
                for py in py_start..(py_start + module_size as u32) {
                    for px in px_start..(px_start + module_size as u32) {
                        img.put_pixel(px, py, image::Rgb([0, 0, 0]));
                    }
                }
            }
        }
    }

    let target_dir = if let Some(dir) = output_dir {
        PathBuf::from(dir)
    } else if let Some(desktop) = dirs::desktop_dir() {
        desktop
    } else if let Some(pics) = dirs::picture_dir() {
        pics
    } else {
        std::env::temp_dir()
    };

    std::fs::create_dir_all(&target_dir)
        .map_err(|e| format!("Failed to create directory {:?}: {}", target_dir, e))?;

    let filename = format!("fig_qrcode_{}.png", chrono::Local::now().format("%Y%m%d_%H%M%S"));
    let out_path = target_dir.join(filename);

    img.save_with_format(&out_path, image::ImageFormat::Png)
        .map_err(|e| format!("Failed to save QR code image: {}", e))?;

    let out_path_str = out_path.to_string_lossy().to_string();
    let size_after = std::fs::metadata(&out_path).map(|m| m.len()).unwrap_or(0);

    record_library_action(
        &format!("QR: {}", clean_text),
        &out_path_str,
        "QR Code Created",
        0,
        size_after,
    );

    get_file_info(out_path_str)
}

struct PdfWriter<W: Write> {
    writer: W,
    current_offset: u64,
}

impl<W: Write> PdfWriter<W> {
    fn new(writer: W) -> Self {
        Self {
            writer,
            current_offset: 0,
        }
    }

    fn write_bytes(&mut self, bytes: &[u8]) -> Result<(), String> {
        self.writer.write_all(bytes).map_err(|e| e.to_string())?;
        self.current_offset += bytes.len() as u64;
        Ok(())
    }

    fn offset(&self) -> u64 {
        self.current_offset
    }
}

// 7. create_pdf_from_images
pub fn generate_pdf(image_paths: &[String], output_path: &Path) -> Result<(), String> {
    if image_paths.is_empty() {
        return Err("No image paths provided for PDF creation".to_string());
    }

    let num_pages = image_paths.len();
    let file = std::fs::File::create(output_path)
        .map_err(|e| format!("Failed to create PDF file: {}", e))?;
    let mut writer = PdfWriter::new(file);

    let mut offsets: Vec<u64> = Vec::new();

    // PDF Header
    writer.write_bytes(b"%PDF-1.4\r\n%\xE2\xE3\xCF\xD3\r\n")?;

    let total_objs = 2 + num_pages * 3;
    offsets.resize(total_objs + 1, 0);

    // Obj 1: Catalog
    offsets[1] = writer.offset();
    writer.write_bytes(b"1 0 obj\r\n<<\r\n  /Type /Catalog\r\n  /Pages 2 0 R\r\n>>\r\nendobj\r\n")?;

    // Obj 2: Pages
    offsets[2] = writer.offset();
    let mut kids = String::new();
    for i in 0..num_pages {
        let page_obj_id = 3 + i * 3;
        kids.push_str(&format!("{} 0 R ", page_obj_id));
    }
    let pages_dict = format!(
        "2 0 obj\r\n<<\r\n  /Type /Pages\r\n  /Kids [ {}]\r\n  /Count {}\r\n>>\r\nendobj\r\n",
        kids, num_pages
    );
    writer.write_bytes(pages_dict.as_bytes())?;

    for (i, img_path) in image_paths.iter().enumerate() {
        let page_id = 3 + i * 3;
        let content_id = 3 + i * 3 + 1;
        let image_id = 3 + i * 3 + 2;

        let img = image::open(img_path)
            .map_err(|e| format!("Failed to open image {}: {}", img_path, e))?;
        let (width, height) = (img.width(), img.height());

        let rgb = img.to_rgb8();
        let mut jpeg_buf = Vec::new();
        let mut jpeg_encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut jpeg_buf, 90);
        jpeg_encoder
            .encode(rgb.as_raw(), width, height, image::ExtendedColorType::Rgb8)
            .map_err(|e| format!("Failed to encode image to JPEG: {}", e))?;

        // 1. Page Object
        offsets[page_id] = writer.offset();
        let page_str = format!(
            "{} 0 obj\r\n<<\r\n  /Type /Page\r\n  /Parent 2 0 R\r\n  /MediaBox [0 0 {} {}]\r\n  /Contents {} 0 R\r\n  /Resources <<\r\n    /XObject <<\r\n      /Im0 {} 0 R\r\n    >>\r\n  >>\r\n>>\r\nendobj\r\n",
            page_id, width, height, content_id, image_id
        );
        writer.write_bytes(page_str.as_bytes())?;

        // 2. Content Stream
        let content_data = format!("q\r\n{} 0 0 {} 0 0 cm\r\n/Im0 Do\r\nQ\r\n", width, height);
        offsets[content_id] = writer.offset();
        let content_obj_str = format!(
            "{} 0 obj\r\n<<\r\n  /Length {}\r\n>>\r\nstream\r\n{}endstream\r\nendobj\r\n",
            content_id, content_data.len(), content_data
        );
        writer.write_bytes(content_obj_str.as_bytes())?;

        // 3. Image XObject
        offsets[image_id] = writer.offset();
        let img_header = format!(
            "{} 0 obj\r\n<<\r\n  /Type /XObject\r\n  /Subtype /Image\r\n  /Width {}\r\n  /Height {}\r\n  /ColorSpace /DeviceRGB\r\n  /BitsPerComponent 8\r\n  /Filter /DCTDecode\r\n  /Length {}\r\n>>\r\nstream\r\n",
            image_id, width, height, jpeg_buf.len()
        );
        writer.write_bytes(img_header.as_bytes())?;
        writer.write_bytes(&jpeg_buf)?;
        writer.write_bytes(b"\r\nendstream\r\nendobj\r\n")?;
    }

    // xref table
    let xref_offset = writer.offset();
    let xref_header = format!("xref\r\n0 {}\r\n0000000000 65535 f \r\n", total_objs + 1);
    writer.write_bytes(xref_header.as_bytes())?;
    for id in 1..=total_objs {
        let entry = format!("{:010} 00000 n \r\n", offsets[id]);
        writer.write_bytes(entry.as_bytes())?;
    }

    // Trailer
    let trailer_str = format!(
        "trailer\r\n<<\r\n  /Size {}\r\n  /Root 1 0 R\r\n>>\r\nstartxref\r\n{}\r\n%%EOF\r\n",
        total_objs + 1, xref_offset
    );
    writer.write_bytes(trailer_str.as_bytes())?;

    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn create_pdf_from_images(
    image_paths: Vec<String>,
    output_path: Option<String>,
) -> Result<FileInfo, String> {
    if image_paths.is_empty() {
        return Err("No images provided for PDF creation".to_string());
    }

    for p in &image_paths {
        if !Path::new(p).exists() {
            return Err(format!("Image file does not exist: {}", p));
        }
    }

    let out_file_path = match output_path {
        Some(p) => PathBuf::from(p),
        None => {
            let first = Path::new(&image_paths[0]);
            let parent = first.parent().unwrap_or_else(|| Path::new("."));
            parent.join("combined_images.pdf")
        }
    };

    if let Some(parent) = out_file_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    let mut total_size_before = 0u64;
    for p in &image_paths {
        if let Ok(meta) = std::fs::metadata(p) {
            total_size_before += meta.len();
        }
    }

    generate_pdf(&image_paths, &out_file_path)?;

    let out_path_str = out_file_path.to_string_lossy().to_string();
    let size_after = std::fs::metadata(&out_file_path).map(|m| m.len()).unwrap_or(0);

    let original_ref = image_paths.first().cloned().unwrap_or_default();
    let action = format!("PDF Combined ({} images)", image_paths.len());
    record_library_action(&original_ref, &out_path_str, &action, total_size_before, size_after);

    get_file_info(out_path_str)
}

// 8. reveal_in_explorer & open_in_terminal & open_file
#[cfg_attr(not(test), tauri::command)]
pub fn reveal_in_explorer(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    #[cfg(target_os = "windows")]
    {
        let mut cmd = std::process::Command::new("explorer");
        if p.is_file() {
            cmd.arg(format!("/select,{}", path));
        } else {
            cmd.arg(&path);
        }
        cmd.spawn()
            .map_err(|e| format!("Failed to launch explorer: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        let mut cmd = std::process::Command::new("open");
        if p.is_file() {
            cmd.arg("-R").arg(&path);
        } else {
            cmd.arg(&path);
        }
        cmd.spawn()
            .map_err(|e| format!("Failed to open finder: {}", e))?;
    }

    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    {
        let target = if p.is_file() {
            p.parent().unwrap_or(p)
        } else {
            p
        };
        std::process::Command::new("xdg-open")
            .arg(target)
            .spawn()
            .map_err(|e| format!("Failed to open file manager: {}", e))?;
    }

    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn open_in_terminal(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let dir = if p.is_file() {
        p.parent().unwrap_or(p)
    } else {
        p
    };

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("powershell")
            .args(["-NoExit", "-Command", &format!("Set-Location -LiteralPath '{}'", dir.display())])
            .spawn()
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-a", "Terminal", &dir.to_string_lossy()])
            .spawn()
            .map_err(|e| format!("Failed to open terminal: {}", e))?;
    }

    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    {
        std::process::Command::new("x-terminal-emulator")
            .current_dir(dir)
            .spawn()
            .or_else(|_| {
                std::process::Command::new("gnome-terminal")
                    .current_dir(dir)
                    .spawn()
            })
            .map_err(|e| format!("Failed to launch terminal: {}", e))?;
    }

    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn open_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("File does not exist: {}", path));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    Ok(())
}

// 9. LibraryEntry persistence
#[cfg_attr(not(test), tauri::command)]
pub fn get_library() -> Result<Vec<LibraryEntry>, String> {
    let path = get_library_file_path();
    read_library_from_path(&path)
}

#[cfg_attr(not(test), tauri::command)]
pub fn add_to_library(entry: LibraryEntry) -> Result<(), String> {
    let path = get_library_file_path();
    let mut entries = read_library_from_path(&path).unwrap_or_default();
    entries.insert(0, entry);
    write_library_to_path(&entries, &path)
}

#[cfg_attr(not(test), tauri::command)]
pub fn clear_library() -> Result<(), String> {
    let path = get_library_file_path();
    write_library_to_path(&[], &path)
}

// -------------------------------------------------------------
// Unit Tests
// -------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("fig_test_{}_{}", name, chrono::Local::now().timestamp_nanos_opt().unwrap_or(0)));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn create_dummy_png(path: &Path, width: u32, height: u32) {
        let img = image::RgbImage::from_fn(width, height, |x, y| {
            image::Rgb([(x % 256) as u8, (y % 256) as u8, 128])
        });
        img.save_with_format(path, image::ImageFormat::Png).unwrap();
    }

    fn create_dummy_jpg(path: &Path, width: u32, height: u32) {
        let img = image::RgbImage::from_fn(width, height, |x, y| {
            image::Rgb([(x % 256) as u8, (y % 256) as u8, 200])
        });
        img.save_with_format(path, image::ImageFormat::Jpeg).unwrap();
    }

    #[test]
    fn test_format_file_size() {
        assert_eq!(format_file_size(500), "500 B");
        assert_eq!(format_file_size(1024), "1.0 KB");
        assert_eq!(format_file_size(1536), "1.5 KB");
        assert_eq!(format_file_size(1024 * 1024), "1.0 MB");
        assert_eq!(format_file_size(1024 * 1024 * 1024 * 2), "2.00 GB");
    }

    #[test]
    fn test_get_file_info_image() {
        let dir = create_test_dir("info_img");
        let file_path = dir.join("test_image.png");
        create_dummy_png(&file_path, 120, 80);

        let info = get_file_info(file_path.to_string_lossy().to_string()).unwrap();
        assert_eq!(info.name, "test_image.png");
        assert_eq!(info.extension, "png");
        assert_eq!(info.width, Some(120));
        assert_eq!(info.height, Some(80));
        assert!(info.size > 0);
        assert!(!info.formatted_size.is_empty());
        assert!(!info.modified.is_empty());

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_get_file_info_non_image() {
        let dir = create_test_dir("info_txt");
        let file_path = dir.join("notes.txt");
        let mut f = std::fs::File::create(&file_path).unwrap();
        writeln!(f, "Hello Fig desktop toolkit").unwrap();

        let info = get_file_info(file_path.to_string_lossy().to_string()).unwrap();
        assert_eq!(info.name, "notes.txt");
        assert_eq!(info.extension, "txt");
        assert_eq!(info.width, None);
        assert_eq!(info.height, None);
        assert!(info.size > 0);

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_get_file_info_non_existent() {
        let res = get_file_info("C:\\non_existent_file_xyz_123.fake".to_string());
        assert!(res.is_err());
    }

    #[test]
    fn test_convert_image_png_to_jpg_webp_bmp() {
        let dir = create_test_dir("convert");
        let in_path = dir.join("sample.png");
        create_dummy_png(&in_path, 64, 64);

        // PNG -> JPG
        let res_jpg = convert_image(in_path.to_string_lossy().to_string(), "jpg".to_string(), Some(90)).unwrap();
        assert_eq!(res_jpg.extension, "jpg");
        assert!(Path::new(&res_jpg.path).exists());
        assert_eq!(res_jpg.width, Some(64));
        assert_eq!(res_jpg.height, Some(64));

        // PNG -> WebP
        let res_webp = convert_image(in_path.to_string_lossy().to_string(), "webp".to_string(), None).unwrap();
        assert_eq!(res_webp.extension, "webp");
        assert!(Path::new(&res_webp.path).exists());
        assert_eq!(res_webp.width, Some(64));
        assert_eq!(res_webp.height, Some(64));

        // PNG -> BMP
        let res_bmp = convert_image(in_path.to_string_lossy().to_string(), "bmp".to_string(), None).unwrap();
        assert_eq!(res_bmp.extension, "bmp");
        assert!(Path::new(&res_bmp.path).exists());
        assert_eq!(res_bmp.width, Some(64));
        assert_eq!(res_bmp.height, Some(64));

        // JPG -> PNG
        let res_png = convert_image(res_jpg.path.clone(), "png".to_string(), None).unwrap();
        assert_eq!(res_png.extension, "png");
        assert!(Path::new(&res_png.path).exists());

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_crop_image() {
        let dir = create_test_dir("crop");
        let in_path = dir.join("to_crop.png");
        create_dummy_png(&in_path, 100, 100);

        let res = crop_image(in_path.to_string_lossy().to_string(), 10, 20, 50, 40).unwrap();
        assert!(Path::new(&res.path).exists());
        assert_eq!(res.width, Some(50));
        assert_eq!(res.height, Some(40));

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_crop_image_out_of_bounds() {
        let dir = create_test_dir("crop_invalid");
        let in_path = dir.join("bounds.png");
        create_dummy_png(&in_path, 50, 50);

        let err = crop_image(in_path.to_string_lossy().to_string(), 60, 60, 10, 10);
        assert!(err.is_err());

        let err_zero = crop_image(in_path.to_string_lossy().to_string(), 0, 0, 0, 10);
        assert!(err_zero.is_err());

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_compress_image() {
        let dir = create_test_dir("compress");
        let in_path = dir.join("photo.jpg");
        create_dummy_jpg(&in_path, 400, 300);

        let res_high = compress_image(in_path.to_string_lossy().to_string(), 95, None, None).unwrap();
        assert!(Path::new(&res_high.path).exists());

        let res_low = compress_image(in_path.to_string_lossy().to_string(), 25, Some(200), Some(150)).unwrap();
        assert!(Path::new(&res_low.path).exists());
        assert!(res_low.width.unwrap() <= 200);
        assert!(res_low.height.unwrap() <= 150);
        assert!(res_low.size < res_high.size);

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_qr_code_generate_and_read() {
        let dir = create_test_dir("qr");
        let test_message = "https://fig.local/tool/test-123";

        let qr_info = generate_qr_code(test_message.to_string(), Some(dir.to_string_lossy().to_string())).unwrap();
        assert!(Path::new(&qr_info.path).exists());
        assert_eq!(qr_info.extension, "png");
        assert!(qr_info.width.unwrap() > 0);

        let decoded = read_qr_code(qr_info.path).unwrap();
        assert_eq!(decoded, test_message);

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_read_qr_code_no_qr() {
        let dir = create_test_dir("no_qr");
        let in_path = dir.join("blank.png");
        create_dummy_png(&in_path, 100, 100);

        let res = read_qr_code(in_path.to_string_lossy().to_string());
        assert!(res.is_err());

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_create_pdf_from_images() {
        let dir = create_test_dir("pdf");
        let img1 = dir.join("page1.png");
        let img2 = dir.join("page2.jpg");
        let img3 = dir.join("page3.bmp");

        create_dummy_png(&img1, 150, 200);
        create_dummy_jpg(&img2, 300, 400);

        let bmp_img = image::RgbImage::from_fn(100, 100, |_, _| image::Rgb([50, 100, 150]));
        bmp_img.save_with_format(&img3, image::ImageFormat::Bmp).unwrap();

        let paths = vec![
            img1.to_string_lossy().to_string(),
            img2.to_string_lossy().to_string(),
            img3.to_string_lossy().to_string(),
        ];

        let out_pdf = dir.join("result.pdf");
        let pdf_info = create_pdf_from_images(paths, Some(out_pdf.to_string_lossy().to_string())).unwrap();

        assert_eq!(pdf_info.extension, "pdf");
        assert!(Path::new(&pdf_info.path).exists());
        assert!(pdf_info.size > 0);

        let pdf_bytes = std::fs::read(&pdf_info.path).unwrap();
        let pdf_text = String::from_utf8_lossy(&pdf_bytes);

        assert!(pdf_text.starts_with("%PDF-1.4"));
        assert!(pdf_text.contains("/Type /Catalog"));
        assert!(pdf_text.contains("/Type /Pages"));
        assert!(pdf_text.contains("/Count 3"));
        assert!(pdf_text.contains("/Filter /DCTDecode"));
        assert!(pdf_text.contains("xref"));
        assert!(pdf_text.contains("trailer"));
        assert!(pdf_text.trim_end().ends_with("%%EOF"));

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_reveal_and_terminal_validation() {
        let dir = create_test_dir("paths_check");
        let non_existent = dir.join("does_not_exist.xyz");
        assert!(reveal_in_explorer(non_existent.to_string_lossy().to_string()).is_err());
        assert!(open_in_terminal(non_existent.to_string_lossy().to_string()).is_err());
        assert!(open_file(non_existent.to_string_lossy().to_string()).is_err());

        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn test_library_persistence_custom_path() {
        let dir = create_test_dir("lib_test");
        let lib_path = dir.join("library.json");

        let initial = read_library_from_path(&lib_path).unwrap();
        assert!(initial.is_empty());

        let entry1 = LibraryEntry {
            id: "entry-1".to_string(),
            original_name: "test.png".to_string(),
            original_path: "C:\\path\\test.png".to_string(),
            output_path: "C:\\path\\test.webp".to_string(),
            action: "Convert to WEBP".to_string(),
            size_before: 1000,
            size_after: 400,
            timestamp: "2026-10-28 20:00".to_string(),
        };

        let entry2 = LibraryEntry {
            id: "entry-2".to_string(),
            original_name: "crop.jpg".to_string(),
            original_path: "C:\\path\\crop.jpg".to_string(),
            output_path: "C:\\path\\crop_cropped.jpg".to_string(),
            action: "Crop".to_string(),
            size_before: 2000,
            size_after: 800,
            timestamp: "2026-10-28 20:05".to_string(),
        };

        write_library_to_path(&[entry1.clone()], &lib_path).unwrap();
        let loaded = read_library_from_path(&lib_path).unwrap();
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0], entry1);

        write_library_to_path(&[entry2.clone(), entry1.clone()], &lib_path).unwrap();
        let loaded2 = read_library_from_path(&lib_path).unwrap();
        assert_eq!(loaded2.len(), 2);
        assert_eq!(loaded2[0], entry2);

        write_library_to_path(&[], &lib_path).unwrap();
        let cleared = read_library_from_path(&lib_path).unwrap();
        assert!(cleared.is_empty());

        let _ = std::fs::remove_dir_all(dir);
    }
}
