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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub wheel_display_mode: String,  // "center" (default) or "cursor"
    pub save_as_separate: bool,      // true (default)
    pub output_destination: String,  // "source" (default), "desktop", "downloads"
    pub vibrancy_effect: String,     // "mica" (default)
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            wheel_display_mode: "center".to_string(),
            save_as_separate: true,
            output_destination: "source".to_string(),
            vibrancy_effect: "mica".to_string(),
        }
    }
}

pub fn get_settings_file_path() -> PathBuf {
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("Fig").join("settings.json")
    } else if let Some(dir) = dirs::data_local_dir() {
        dir.join("Fig").join("settings.json")
    } else {
        PathBuf::from(".").join("Fig").join("settings.json")
    }
}

#[cfg_attr(not(test), tauri::command)]
pub fn get_app_settings() -> Result<AppSettings, String> {
    let p = get_settings_file_path();
    if !p.exists() {
        return Ok(AppSettings::default());
    }
    let data = std::fs::read_to_string(&p).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

#[cfg_attr(not(test), tauri::command)]
pub fn save_app_settings(settings: AppSettings) -> Result<(), String> {
    let p = get_settings_file_path();
    if let Some(parent) = p.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(&p, json).map_err(|e| e.to_string())
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

    // Notify Windows Explorer and Desktop to refresh immediately
    #[cfg(target_os = "windows")]
    unsafe {
        windows_sys::Win32::UI::Shell::SHChangeNotify(
            windows_sys::Win32::UI::Shell::SHCNE_ASSOCCHANGED as i32,
            windows_sys::Win32::UI::Shell::SHCNF_IDLIST,
            std::ptr::null(),
            std::ptr::null(),
        );
    }
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
    custom_name: Option<String>,
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
        "ico" => ("ico", image::ImageFormat::Ico),
        "gif" => ("gif", image::ImageFormat::Gif),
        "tiff" | "tif" => ("tiff", image::ImageFormat::Tiff),
        other => return Err(format!("Unsupported target image format: {}", other)),
    };

    let original_ext = in_path
        .extension()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    let out_name = match &custom_name {
        Some(name) => name.clone(),
        None => {
            if original_ext == out_ext {
                format!("{}_converted.{}", stem, out_ext)
            } else {
                format!("{}.{}", stem, out_ext)
            }
        }
    };

    let mut out_path = parent.join(&out_name);
    if out_path == in_path && custom_name.is_none() {
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
        image::ImageFormat::Ico => {
            let resized = if img.width() > 256 || img.height() > 256 {
                img.resize(256, 256, image::imageops::FilterType::Lanczos3)
            } else {
                img
            };
            resized.save_with_format(&out_path, image::ImageFormat::Ico)
                .map_err(|e| format!("Failed to encode ICO: {}", e))?;
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

// 10. Document conversion (Word, PowerPoint, Excel, Text -> PDF)
#[cfg_attr(not(test), tauri::command)]
pub fn convert_document(
    input_path: String,
    target_format: String,
    custom_name: Option<String>,
) -> Result<FileInfo, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Input file does not exist: {}", input_path));
    }

    let ext = in_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let target_ext = target_format.to_lowercase();
    let file_stem = in_path.file_stem().and_then(|s| s.to_str()).unwrap_or("document");
    let parent = in_path.parent().unwrap_or_else(|| Path::new("."));

    let out_file_path = match &custom_name {
        Some(name) => parent.join(name),
        None => {
            let p = parent.join(format!("{}.{}", file_stem, target_ext));
            if p.exists() && p == in_path {
                parent.join(format!("{}_converted.{}", file_stem, target_ext))
            } else {
                p
            }
        }
    };

    let size_before = std::fs::metadata(in_path).map(|m| m.len()).unwrap_or(0);

    match ext.as_str() {
        "docx" | "doc" | "rtf" | "odt" => {
            #[cfg(target_os = "windows")]
            {
                let ps_script = format!(
                    "$ErrorActionPreference='Stop'; $word=New-Object -ComObject Word.Application; $word.Visible=$false; try {{ $doc=$word.Documents.Open('{}'); $doc.SaveAs([ref]'{}', [ref]17); $doc.Close() }} finally {{ $word.Quit() }}",
                    in_path.display(),
                    out_file_path.display()
                );
                let mut cmd = std::process::Command::new("powershell");
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    cmd.creation_flags(0x08000000);
                }
                let output = cmd
                    .args(["-NoProfile", "-NonInteractive", "-Command", &ps_script])
                    .output()
                    .map_err(|e| format!("PowerShell Word conversion failed: {}", e))?;
                if !output.status.success() {
                    return Err(format!("Word conversion error: {}", String::from_utf8_lossy(&output.stderr)));
                }
            }
        }
        "pptx" | "ppt" | "odp" => {
            #[cfg(target_os = "windows")]
            {
                let ps_script = format!(
                    "$ErrorActionPreference='Stop'; $ppt=New-Object -ComObject PowerPoint.Application; try {{ $pres=$ppt.Presentations.Open('{}', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse); $pres.SaveAs('{}', 32); $pres.Close() }} finally {{ $ppt.Quit() }}",
                    in_path.display(),
                    out_file_path.display()
                );
                let mut cmd = std::process::Command::new("powershell");
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    cmd.creation_flags(0x08000000);
                }
                let output = cmd
                    .args(["-NoProfile", "-NonInteractive", "-Command", &ps_script])
                    .output()
                    .map_err(|e| format!("PowerPoint conversion failed: {}", e))?;
                if !output.status.success() {
                    return Err(format!("PowerPoint conversion error: {}", String::from_utf8_lossy(&output.stderr)));
                }
            }
        }
        "xlsx" | "xls" | "csv" | "ods" => {
            #[cfg(target_os = "windows")]
            {
                let ps_script = format!(
                    "$ErrorActionPreference='Stop'; $excel=New-Object -ComObject Excel.Application; $excel.Visible=$false; try {{ $wb=$excel.Workbooks.Open('{}'); $wb.ExportAsFixedFormat(0, '{}'); $wb.Close($false) }} finally {{ $excel.Quit() }}",
                    in_path.display(),
                    out_file_path.display()
                );
                let mut cmd = std::process::Command::new("powershell");
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    cmd.creation_flags(0x08000000);
                }
                let output = cmd
                    .args(["-NoProfile", "-NonInteractive", "-Command", &ps_script])
                    .output()
                    .map_err(|e| format!("Excel conversion failed: {}", e))?;
                if !output.status.success() {
                    return Err(format!("Excel conversion error: {}", String::from_utf8_lossy(&output.stderr)));
                }
            }
        }
        "txt" | "md" => {
            let content = std::fs::read_to_string(in_path)
                .map_err(|e| format!("Failed to read text file: {}", e))?;
            let safe_content = content.replace("(", "\\(").replace(")", "\\)");
            let pdf_bytes = format!(
                "%PDF-1.4\r\n1 0 obj\r\n<< /Type /Catalog /Pages 2 0 R >>\r\nendobj\r\n2 0 obj\r\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\r\nendobj\r\n3 0 obj\r\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\r\nendobj\r\n4 0 obj\r\n<< /Length {} >>\r\nstream\r\nBT\r\n/F1 12 Tf\r\n50 800 Td\r\n({}) Tj\r\nET\r\nendstream\r\nendobj\r\nxref\r\n0 5\r\n0000000000 65535 f \r\ntrailer\r\n<< /Size 5 /Root 1 0 R >>\r\nstartxref\r\n400\r\n%%EOF\r\n",
                safe_content.len() + 30,
                safe_content
            );
            std::fs::write(&out_file_path, pdf_bytes.as_bytes())
                .map_err(|e| format!("Failed to write PDF: {}", e))?;
        }
        _ => {
            return Err(format!("Unsupported document format: {}", ext));
        }
    }

    let out_path_str = out_file_path.to_string_lossy().to_string();
    let size_after = std::fs::metadata(&out_file_path).map(|m| m.len()).unwrap_or(0);
    let action = format!("{} to {}", ext.to_uppercase(), target_ext.to_uppercase());
    record_library_action(&input_path, &out_path_str, &action, size_before, size_after);

    get_file_info(out_path_str)
}

// 10b. Media conversion (Audio & Video conversion, Audio extraction, GIF creation via FFmpeg)
#[cfg_attr(not(test), tauri::command)]
pub fn convert_media(
    input_path: String,
    target_format: String,
    custom_name: Option<String>,
) -> Result<FileInfo, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Girdi dosyası bulunamadı: {}", input_path));
    }

    let size_before = std::fs::metadata(in_path).map(|m| m.len()).unwrap_or(0);
    let stem = in_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "media".to_string());
    let parent = in_path.parent().unwrap_or_else(|| Path::new("."));

    let lower_format = target_format.to_lowercase();
    let norm_format: &str = match lower_format.as_str() {
        "extract_audio" | "audio_mp3" | "mp3" => "mp3",
        "audio_wav" | "wav" => "wav",
        "audio_flac" | "flac" => "flac",
        "audio_aac" | "aac" => "aac",
        "audio_ogg" | "ogg" => "ogg",
        "video_mp4" | "mp4" => "mp4",
        "video_webm" | "webm" => "webm",
        "video_gif" | "gif" => "gif",
        "video_avi" | "avi" => "avi",
        "video_mkv" | "mkv" => "mkv",
        other => other,
    };

    let original_ext = in_path
        .extension()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    let out_name = match &custom_name {
        Some(name) => name.clone(),
        None => {
            if original_ext == norm_format {
                format!("{}_converted.{}", stem, norm_format)
            } else {
                format!("{}.{}", stem, norm_format)
            }
        }
    };

    let mut out_path = parent.join(&out_name);
    if out_path == in_path && custom_name.is_none() {
        out_path = parent.join(format!("{}_converted.{}", stem, norm_format));
    }

    let out_str = out_path.to_string_lossy().to_string();

    let mut cmd = std::process::Command::new("ffmpeg");
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    cmd.arg("-y");
    cmd.arg("-i").arg(&input_path);

    match norm_format {
        "mp3" => {
            cmd.args(["-vn", "-c:a", "libmp3lame", "-q:a", "2"]);
        }
        "wav" => {
            cmd.args(["-vn", "-c:a", "pcm_s16le"]);
        }
        "flac" => {
            cmd.args(["-vn", "-c:a", "flac"]);
        }
        "aac" => {
            cmd.args(["-vn", "-c:a", "aac", "-b:a", "192k"]);
        }
        "ogg" => {
            cmd.args(["-vn", "-c:a", "libvorbis", "-q:a", "4"]);
        }
        "mp4" => {
            cmd.args(["-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"]);
        }
        "webm" => {
            cmd.args(["-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-c:a", "libopus"]);
        }
        "gif" => {
            cmd.args([
                "-vf",
                "fps=12,scale='min(480,iw)':-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer",
                "-loop",
                "0",
            ]);
        }
        "avi" => {
            cmd.args(["-c:v", "mpeg4", "-q:v", "3", "-c:a", "mp3"]);
        }
        "mkv" => {
            cmd.args(["-c:v", "libx264", "-crf", "22", "-c:a", "copy"]);
        }
        other => {
            return Err(format!("Desteklenmeyen medya formatı: {}", other));
        }
    }

    cmd.arg(&out_str);

    let output = cmd.output().map_err(|e| {
        format!("FFmpeg çalıştırılamadı (FFmpeg sistemde kurulu mu?): {}", e)
    })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let short_err = stderr.lines().rev().take(6).collect::<Vec<_>>().join(" ");
        return Err(format!("Medya dönüştürme hatası: {}", short_err));
    }

    let size_after = std::fs::metadata(&out_path).map(|m| m.len()).unwrap_or(0);
    let action = format!("Media to {}", norm_format.to_uppercase());
    record_library_action(&input_path, &out_str, &action, size_before, size_after);

    get_file_info(out_str)
}

// 10c. convert_pdf (PDF to Excel, PDF to Word, PDF to Text, PDF to Images via python scripts)
#[cfg_attr(not(test), tauri::command)]
pub fn convert_pdf(
    input_path: String,
    target_format: String,
    custom_name: Option<String>,
) -> Result<FileInfo, String> {
    let in_path = Path::new(&input_path);
    if !in_path.exists() {
        return Err(format!("Girdi PDF dosyası bulunamadı: {}", input_path));
    }

    let size_before = std::fs::metadata(in_path).map(|m| m.len()).unwrap_or(0);
    let stem = in_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "document".to_string());

    let settings = get_app_settings().unwrap_or_default();
    let parent_dir: PathBuf = match settings.output_destination.as_str() {
        "desktop" => dirs::desktop_dir().unwrap_or_else(|| in_path.parent().unwrap_or(Path::new(".")).to_path_buf()),
        "downloads" => dirs::download_dir().unwrap_or_else(|| in_path.parent().unwrap_or(Path::new(".")).to_path_buf()),
        _ => in_path.parent().unwrap_or(Path::new(".")).to_path_buf(),
    };

    let target_lower = target_format.to_lowercase();
    let (py_cmd, out_ext) = match target_lower.as_str() {
        "xlsx" | "excel" | "pdf_excel" => ("to_excel", "xlsx"),
        "docx" | "word" | "pdf_word" => ("to_docx", "docx"),
        "txt" | "text" | "pdf_txt" => ("to_text", "txt"),
        "images" | "png" | "pdf_images" => ("to_images", "png"),
        other => return Err(format!("Desteklenmeyen PDF hedef formatı: {}", other)),
    };

    let out_name = match &custom_name {
        Some(name) => name.clone(),
        None => format!("{}_converted.{}", stem, out_ext),
    };

    let out_path = parent_dir.join(&out_name);
    let out_str = out_path.to_string_lossy().to_string();

    let app_data_script = get_settings_file_path().parent().unwrap_or(Path::new(".")).join("scripts").join("pdf_converter.py");
    let script_path = if Path::new("src-tauri/scripts/pdf_converter.py").exists() {
        PathBuf::from("src-tauri/scripts/pdf_converter.py")
    } else if Path::new("scripts/pdf_converter.py").exists() {
        PathBuf::from("scripts/pdf_converter.py")
    } else if app_data_script.exists() {
        app_data_script
    } else {
        if let Some(parent) = app_data_script.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let script_code = include_str!("../scripts/pdf_converter.py");
        let _ = std::fs::write(&app_data_script, script_code);
        app_data_script
    };

    let mut cmd = std::process::Command::new("python");
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    cmd.arg(&script_path);
    cmd.arg(py_cmd);
    cmd.arg(&input_path);
    cmd.arg(&out_str);

    let output = cmd.output().map_err(|e| format!("Python PDF dönüştürücü çalıştırılamadı: {}", e))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!("PDF dönüştürme hatası: {} {}", stdout, stderr));
    }

    let size_after = std::fs::metadata(&out_path).map(|m| m.len()).unwrap_or(0);
    let action = format!("PDF to {}", out_ext.to_uppercase());
    record_library_action(&input_path, &out_str, &action, size_before, size_after);

    get_file_info(out_str)
}

#[cfg_attr(not(test), tauri::command)]
pub fn get_autostart() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("reg")
            .args(["query", r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run", "/v", "Fig"])
            .output();
        if let Ok(out) = output {
            return Ok(out.status.success());
        }
    }
    Ok(false)
}

#[cfg_attr(not(test), tauri::command)]
pub fn set_autostart(enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        if enabled {
            let exe_path = std::env::current_exe()
                .map_err(|e| format!("Failed to get executable path: {}", e))?;
            let cmd_val = format!("\"{}\" --minimized", exe_path.display());
            let status = std::process::Command::new("reg")
                .args([
                    "add",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "Fig",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &cmd_val,
                    "/f",
                ])
                .status()
                .map_err(|e| format!("Failed to set autostart in registry: {}", e))?;
            if !status.success() {
                return Err("Failed to register autostart in Windows registry".into());
            }
        } else {
            let _ = std::process::Command::new("reg")
                .args([
                    "delete",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "Fig",
                    "/f",
                ])
                .status();
        }
    }
    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn show_wheel_window(_app: tauri::AppHandle, mode: Option<String>) -> Result<(), String> {
    #[cfg(not(test))]
    {
        use tauri::Manager;
        if let Some(wheel_window) = _app.get_webview_window("wheel") {
            let settings = get_app_settings().unwrap_or_default();
            let effective_mode = mode.unwrap_or(settings.wheel_display_mode);

            if effective_mode == "cursor" {
                #[cfg(target_os = "windows")]
                unsafe {
                    let mut point = windows_sys::Win32::Foundation::POINT { x: 0, y: 0 };
                    if windows_sys::Win32::UI::WindowsAndMessaging::GetCursorPos(&mut point) != 0 {
                        let _ = wheel_window.set_size(tauri::Size::Physical(tauri::PhysicalSize { width: 460, height: 460 }));
                        let x = point.x - 230;
                        let y = point.y - 230;
                        let _ = wheel_window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
                    }
                }
            } else {
                // "center" mode (Default): Covers monitor dimensions so full frosted blurred backdrop renders!
                if let Ok(Some(monitor)) = wheel_window.current_monitor() {
                    let size = monitor.size();
                    let pos = monitor.position();
                    let _ = wheel_window.set_position(tauri::Position::Physical(*pos));
                    let _ = wheel_window.set_size(tauri::Size::Physical(*size));
                } else {
                    let _ = wheel_window.center();
                }
            }

            let _ = wheel_window.show();
            let _ = wheel_window.set_focus();
        }
    }
    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn show_wheel_at_cursor(_app: tauri::AppHandle) -> Result<(), String> {
    show_wheel_window(_app, None)
}

#[cfg_attr(not(test), tauri::command)]
pub fn hide_wheel(_app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(not(test))]
    {
        use tauri::Manager;
        if let Some(wheel_window) = _app.get_webview_window("wheel") {
            let _ = wheel_window.hide();
        }
    }
    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn show_main_window(_app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(not(test))]
    {
        use tauri::Manager;
        if let Some(main_window) = _app.get_webview_window("main") {
            let _ = main_window.show();
            let _ = main_window.set_focus();
        }
    }
    Ok(())
}

#[cfg_attr(not(test), tauri::command)]
pub fn set_window_vibrancy(_app: tauri::AppHandle, _effect: String) -> Result<(), String> {
    #[cfg(not(test))]
    #[cfg(target_os = "windows")]
    {
        use tauri::Manager;
        use window_vibrancy::{apply_acrylic, apply_mica, apply_tabbed, clear_vibrancy};
        if let Some(main_window) = _app.get_webview_window("main") {
            let _ = clear_vibrancy(&main_window);
            match _effect.as_str() {
                "mica" => {
                    let _ = apply_mica(&main_window, None);
                }
                "acrylic" => {
                    let _ = apply_acrylic(&main_window, Some((8, 10, 18, 60)));
                }
                "tabbed" => {
                    let _ = apply_tabbed(&main_window, None);
                }
                _ => {}
            }
        }
    }
    Ok(())
}

// 12. Native Windows Open File Dialog
static DIALOG_ACTIVE: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn is_dialog_active() -> bool {
    DIALOG_ACTIVE.load(std::sync::atomic::Ordering::SeqCst)
}

#[cfg_attr(not(test), tauri::command)]
pub fn pick_file_dialog(filter_type: Option<String>) -> Result<Option<String>, String> {
    DIALOG_ACTIVE.store(true, std::sync::atomic::Ordering::SeqCst);
    let result = (|| {
        #[cfg(target_os = "windows")]
        {
            use std::process::Command;
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x08000000;

            let filter_str = match filter_type.as_deref() {
                Some("office") => "Ofis Belgeleri (*.docx;*.pptx;*.xlsx;*.txt)|*.docx;*.doc;*.pptx;*.ppt;*.xlsx;*.xls;*.txt|Tüm Dosyalar (*.*)|*.*",
                Some("image") => "Görseller (*.png;*.jpg;*.webp;*.bmp)|*.png;*.jpg;*.jpeg;*.webp;*.bmp|Tüm Dosyalar (*.*)|*.*",
                Some("doc") => "Word Belgeleri (*.docx;*.doc)|*.docx;*.doc|Tüm Dosyalar (*.*)|*.*",
                Some("ppt") => "PowerPoint Sunumları (*.pptx;*.ppt)|*.pptx;*.ppt|Tüm Dosyalar (*.*)|*.*",
                Some("xls") => "Excel Tabloları (*.xlsx;*.xls)|*.xlsx;*.xls|Tüm Dosyalar (*.*)|*.*",
                _ => "Desteklenen Tüm Dosyalar|*.docx;*.doc;*.pptx;*.ppt;*.xlsx;*.xls;*.png;*.jpg;*.jpeg;*.webp;*.bmp;*.pdf;*.txt|Tüm Dosyalar (*.*)|*.*",
            };

            let script = format!(
                "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; \
                 $f = New-Object System.Windows.Forms.OpenFileDialog; \
                 $f.Title = 'Fig - Dönüştürmek İçin Dosya Seçin'; \
                 $f.Filter = '{}'; \
                 $f.Multiselect = $false; \
                 if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {{ [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::Write($f.FileName) }}",
                filter_str
            );

            let output = Command::new("powershell")
                .args(&["-NoProfile", "-NonInteractive", "-Command", &script])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| format!("Dosya seçici açılamadı: {}", e))?;

            let res = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if res.is_empty() {
                Ok(None)
            } else {
                Ok(Some(res))
            }
        }
        #[cfg(not(target_os = "windows"))]
        {
            Ok(None)
        }
    })();
    DIALOG_ACTIVE.store(false, std::sync::atomic::Ordering::SeqCst);
    result
}

// 13. Auto-detect currently selected files in Windows Explorer & Desktop
#[cfg_attr(not(test), tauri::command)]
pub fn get_selected_explorer_files() -> Result<Vec<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let script = r#"
$shell = New-Object -ComObject Shell.Application
$paths = [System.Collections.Generic.List[string]]::new()

# 1. Check open Explorer folder windows
try {
    foreach ($w in $shell.Windows()) {
        try {
            $sel = $w.Document.SelectedItems()
            if ($sel -and $sel.Count -gt 0) {
                foreach ($it in $sel) {
                    if ($it.Path) { $paths.Add($it.Path) }
                }
                if ($paths.Count -gt 0) { break }
            }
        } catch {}
    }
} catch {}

# 2. Check Desktop selection if no open Explorer window had items
if ($paths.Count -eq 0) {
    try {
        $dw = $shell.Windows().FindWindowSW(0, 0, 8, 0, 1)
        if ($dw -and $dw.Document) {
            $sel = $dw.Document.SelectedItems()
            if ($sel -and $sel.Count -gt 0) {
                foreach ($it in $sel) {
                    if ($it.Path) { $paths.Add($it.Path) }
                }
            }
        }
    } catch {}
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$paths | ForEach-Object { [Console]::WriteLine($_) }
"#;

        let output = Command::new("powershell")
            .args(&["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("Seçili dosyalar okunamadı: {}", e))?;

        let text = String::from_utf8_lossy(&output.stdout);
        let files: Vec<String> = text
            .lines()
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty() && std::path::Path::new(l).exists())
            .collect();

        Ok(files)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(Vec::new())
    }
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
        let res_jpg = convert_image(in_path.to_string_lossy().to_string(), "jpg".to_string(), Some(90), None).unwrap();
        assert_eq!(res_jpg.extension, "jpg");
        assert!(Path::new(&res_jpg.path).exists());
        assert_eq!(res_jpg.width, Some(64));
        assert_eq!(res_jpg.height, Some(64));

        // PNG -> WebP with custom numbering
        let res_webp = convert_image(in_path.to_string_lossy().to_string(), "webp".to_string(), None, Some("sample_(1 of 3).webp".to_string())).unwrap();
        assert_eq!(res_webp.extension, "webp");
        assert_eq!(res_webp.name, "sample_(1 of 3).webp");
        assert!(Path::new(&res_webp.path).exists());
        assert_eq!(res_webp.width, Some(64));
        assert_eq!(res_webp.height, Some(64));

        // PNG -> BMP
        let res_bmp = convert_image(in_path.to_string_lossy().to_string(), "bmp".to_string(), None, None).unwrap();
        assert_eq!(res_bmp.extension, "bmp");
        assert!(Path::new(&res_bmp.path).exists());
        assert_eq!(res_bmp.width, Some(64));
        assert_eq!(res_bmp.height, Some(64));

        // JPG -> PNG
        let res_png = convert_image(res_jpg.path.clone(), "png".to_string(), None, None).unwrap();
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
