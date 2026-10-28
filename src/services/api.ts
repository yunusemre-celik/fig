import { invoke } from "@tauri-apps/api/core";
import { FileInfo, LibraryEntry } from "../types";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function getFileInfo(path: string): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("get_file_info", { path });
  }
  // Mock fallback for browser dev
  return {
    name: path.split("/").pop()?.split("\\").pop() || "sample.png",
    path,
    size: 245760,
    formatted_size: "240 KB",
    extension: "png",
    width: 1920,
    height: 1080,
    modified: "2026-10-28 20:30",
  };
}

export async function convertImage(
  inputPath: string,
  targetFormat: string,
  quality?: number
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("convert_image", {
      inputPath,
      targetFormat,
      quality,
    });
  }
  return {
    name: `converted.${targetFormat}`,
    path: `C:\\Users\\Mock\\${targetFormat}\\converted.${targetFormat}`,
    size: 184320,
    formatted_size: "180 KB",
    extension: targetFormat,
    modified: "Şimdi",
  };
}

export async function cropImage(
  inputPath: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<FileInfo> {
  if (isTauri) {
    return await invoke<FileInfo>("crop_image", {
      inputPath,
      x,
      y,
      width,
      height,
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
  return [
    {
      id: "1",
      original_name: "screenshot_2026.png",
      original_path: "C:\\Users\\Mock\\Pictures\\screenshot_2026.png",
      output_path: "C:\\Users\\Mock\\Pictures\\screenshot_2026.webp",
      action: "WebP Dönüştürme",
      size_before: 1250000,
      size_after: 320000,
      timestamp: "Bugün 20:15",
    },
    {
      id: "2",
      original_name: "avatar_crop.jpg",
      original_path: "C:\\Users\\Mock\\Downloads\\avatar.jpg",
      output_path: "C:\\Users\\Mock\\Downloads\\avatar_cropped.jpg",
      action: "Kırpma (1:1)",
      size_before: 850000,
      size_after: 410000,
      timestamp: "Dün 18:42",
    },
  ];
}

export async function clearLibrary(): Promise<void> {
  if (isTauri) {
    await invoke("clear_library");
  }
}

export async function revealInExplorer(path: string): Promise<void> {
  if (isTauri) {
    await invoke("reveal_in_explorer", { path });
  } else {
    console.log("Reveal in explorer:", path);
  }
}

export async function openInTerminal(path: string): Promise<void> {
  if (isTauri) {
    await invoke("open_in_terminal", { path });
  } else {
    console.log("Open in terminal:", path);
  }
}

export async function openFile(path: string): Promise<void> {
  if (isTauri) {
    await invoke("open_file", { path });
  } else {
    console.log("Open file:", path);
  }
}
