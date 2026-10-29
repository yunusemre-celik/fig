import { invoke } from "@tauri-apps/api/core";
import { FileInfo, LibraryEntry, AppSettings } from "../types";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function getFileInfo(path: string): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("get_file_info", { path });
  }
  return {
    name: path.split("/").pop()?.split("\\").pop() || "sample.png",
    path,
    size: 245760,
    formatted_size: "240 KB",
    extension: "png",
    width: 1920,
    height: 1080,
    modified: "2026-10-29 11:30",
  };
}

export async function convertImage(
  inputPath: string,
  targetFormat: string,
  quality?: number,
  customName?: string
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("convert_image", {
      inputPath,
      targetFormat,
      quality,
      customName,
    });
  }
  return {
    name: customName || `converted.${targetFormat}`,
    path: `C:\\Users\\Mock\\${targetFormat}\\${customName || `converted.${targetFormat}`}`,
    size: 184320,
    formatted_size: "180 KB",
    extension: targetFormat,
    modified: "Şimdi",
  };
}

export async function convertDocument(
  inputPath: string,
  targetFormat: string,
  customName?: string
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("convert_document", {
      inputPath,
      targetFormat,
      customName,
    });
  }
  return {
    name: customName || `converted.${targetFormat}`,
    path: `C:\\Users\\Mock\\${targetFormat}\\${customName || `document.${targetFormat}`}`,
    size: 350000,
    formatted_size: "341 KB",
    extension: targetFormat,
    modified: "Şimdi",
  };
}

export async function convertMedia(
  inputPath: string,
  targetFormat: string,
  customName?: string
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("convert_media", {
      inputPath,
      targetFormat,
      customName,
    });
  }
  return {
    name: customName || `converted.${targetFormat}`,
    path: `C:\\Users\\Mock\\${targetFormat}\\${customName || `media.${targetFormat}`}`,
    size: 1048576,
    formatted_size: "1.0 MB",
    extension: targetFormat,
    modified: "Şimdi",
  };
}

export async function convertPdf(
  inputPath: string,
  targetFormat: string,
  customName?: string
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("convert_pdf", {
      inputPath,
      targetFormat,
      customName,
    });
  }
  return {
    name: customName || `converted.${targetFormat}`,
    path: `C:\\Users\\Mock\\${targetFormat}\\${customName || `document.${targetFormat}`}`,
    size: 204800,
    formatted_size: "200 KB",
    extension: targetFormat,
    modified: "Şimdi",
  };
}

export interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function cropImage(
  inputPath: string,
  x: number,
  y: number,
  width: number,
  height: number,
  overwrite?: boolean
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("crop_image", {
      inputPath,
      x,
      y,
      width,
      height,
      overwrite: overwrite || false,
    });
  }
  return {
    name: "cropped_image.png",
    path: "C:\\Users\\Mock\\cropped_image.png",
    size: 120000,
    formatted_size: "117 KB",
    extension: "png",
    width,
    height,
    modified: "Şimdi",
  };
}

export async function compressImage(
  inputPath: string,
  quality: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("compress_image", {
      inputPath,
      quality,
      maxWidth,
      maxHeight,
    });
  }
  return {
    name: "compressed_image.jpg",
    path: "C:\\Users\\Mock\\compressed_image.jpg",
    size: 95000,
    formatted_size: "92 KB",
    extension: "jpg",
    modified: "Şimdi",
  };
}

export async function censorImage(
  inputPath: string,
  blurSigma?: number,
  regions?: BlurRegion[],
  overwrite?: boolean
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("censor_image", {
      inputPath,
      blurSigma: blurSigma || 16.0,
      regions: regions && regions.length > 0 ? regions : null,
      overwrite: overwrite || false,
    });
  }
  return {
    name: "censored.png",
    path: "C:\\Users\\Mock\\censored.png",
    size: 95000,
    formatted_size: "92 KB",
    extension: "png",
    modified: "Şimdi",
  };
}

export async function readQrCode(inputPath: string): Promise<string> {
  if (isTauri) {
    return await invoke<string>("read_qr_code", { inputPath });
  }
  return "https://github.com/orkunisitmak/nashi-app";
}

export async function generateQrCode(text: string): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("generate_qr_code", { text });
  }
  return {
    name: "fig_qrcode.png",
    path: "C:\\Users\\Mock\\Desktop\\fig_qrcode.png",
    size: 45000,
    formatted_size: "44 KB",
    extension: "png",
    width: 512,
    height: 512,
    modified: "Şimdi",
  };
}

export async function createPdfFromImages(imagePaths: string[]): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("create_pdf_from_images", { imagePaths });
  }
  return {
    name: "combined_images.pdf",
    path: "C:\\Users\\Mock\\combined_images.pdf",
    size: 512000,
    formatted_size: "500 KB",
    extension: "pdf",
    modified: "Şimdi",
  };
}

export async function getLibrary(): Promise<LibraryEntry[]> {
  if (isTauri) {
    return await invoke<LibraryEntry[]>("get_library");
  }
  return [];
}

export async function clearLibrary(): Promise<void> {
  if (isTauri) {
    await invoke("clear_library");
  }
}

export async function revealInExplorer(path: string): Promise<void> {
  if (isTauri) {
    await invoke("reveal_in_explorer", { path });
  }
}

export async function openInTerminal(path: string): Promise<void> {
  if (isTauri) {
    await invoke("open_in_terminal", { path });
  }
}

export async function openFile(path: string): Promise<void> {
  if (isTauri) {
    await invoke("open_file", { path });
  }
}

export async function getAutostart(): Promise<boolean> {
  if (isTauri) {
    return await invoke<boolean>("get_autostart");
  }
  return false;
}

export async function setAutostart(enabled: boolean): Promise<void> {
  if (isTauri) {
    await invoke("set_autostart", { enabled });
  }
}

export async function showWheelWindow(mode?: string): Promise<void> {
  if (isTauri) {
    await invoke("show_wheel_window", { mode: mode || null });
  }
}

export async function showWheelAtCursor(): Promise<void> {
  if (isTauri) {
    await invoke("show_wheel_at_cursor");
  }
}

export async function getAppSettings(): Promise<AppSettings> {
  if (isTauri) {
    return await invoke<AppSettings>("get_app_settings");
  }
  return {
    wheel_display_mode: (localStorage.getItem("fig_wheel_display_mode") as "center" | "cursor") || "center",
    save_as_separate: localStorage.getItem("fig_save_separate") !== "false",
    output_destination: (localStorage.getItem("fig_output_destination") as "source" | "desktop" | "downloads") || "source",
    vibrancy_effect: localStorage.getItem("fig_vibrancy") || "mica",
  };
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  if (isTauri) {
    await invoke("save_app_settings", { settings });
  }
  localStorage.setItem("fig_wheel_display_mode", settings.wheel_display_mode);
  localStorage.setItem("fig_save_separate", settings.save_as_separate ? "true" : "false");
  localStorage.setItem("fig_output_destination", settings.output_destination);
  localStorage.setItem("fig_vibrancy", settings.vibrancy_effect);
}

export async function hideWheel(): Promise<void> {
  if (isTauri) {
    await invoke("hide_wheel");
  }
}

export async function expandWheelWindow(): Promise<void> {
  if (isTauri) {
    await invoke("expand_wheel_window");
  }
}

export async function restoreWheelWindow(): Promise<void> {
  if (isTauri) {
    await invoke("restore_wheel_window");
  }
}

export async function showMainWindow(): Promise<void> {
  if (isTauri) {
    await invoke("show_main_window");
  }
}

export async function setWindowVibrancy(effect: string): Promise<void> {
  if (isTauri) {
    await invoke("set_window_vibrancy", { effect });
  }
}

export async function pickFileDialog(filterType?: string): Promise<string | null> {
  if (isTauri) {
    const res = await invoke<string | null>("pick_file_dialog", { filterType: filterType || null });
    return res;
  }
  return null;
}

export async function getSelectedExplorerFiles(): Promise<string[]> {
  if (isTauri) {
    return await invoke<string[]>("get_selected_explorer_files");
  }
  return [];
}
