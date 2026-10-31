import React, { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { RadialWheel } from "./RadialWheel";
import { PRESET_PROFILES } from "./WheelStudio";
import { ImageEditorModal, ImageEditorMode } from "./modals/ImageEditorModal";
import { FileInfo, WheelItem, WheelMode, WheelProfileId } from "../types";
import {
  hideWheel,
  expandWheelWindow,
  restoreWheelWindow,
  showMainWindow,
  convertImage,
  cropImage,
  censorImage,
  BlurRegion,
  convertDocument,
  convertMedia,
  convertPdf,
  createPdfFromImages,
  revealInExplorer,
  openInTerminal,
  getFileInfo,
  pickFileDialog,
  openFile,
  getSelectedExplorerFilesInfo,
  getAppSettings,
} from "../services/api";
import { playSuccessChime } from "../utils/sound";
import { useTranslation } from "../i18n/useTranslation";
import confetti from "canvas-confetti";
import { FolderOpen, ExternalLink, Files, Check, X } from "lucide-react";

export const FloatingWheelWindow: React.FC = () => {
  const { t } = useTranslation();
  const [activeProfile, setActiveProfile] = useState<WheelProfileId>(() => {
    return (localStorage.getItem("fig_active_profile") as WheelProfileId) || "office";
  });

  const [wheelDisplayMode, setWheelDisplayMode] = useState<"center" | "cursor">(() => {
    return (localStorage.getItem("fig_wheel_display_mode") as "center" | "cursor") || "center";
  });

  const [customSlices, setCustomSlices] = useState<WheelItem[]>(() => {
    const saved = localStorage.getItem("fig_custom_slices");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return PRESET_PROFILES.office.items;
  });

  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [profileOverride, setProfileOverride] = useState<WheelProfileId | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);
  const [lastOutputName, setLastOutputName] = useState<string | null>(null);

  // Visual Image Editor Modal State (Crop & Censor)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<ImageEditorMode>("crop");
  const [editorFile, setEditorFile] = useState<FileInfo | null>(null);

  // Sync settings
  useEffect(() => {
    getAppSettings().then((s) => {
      setWheelDisplayMode(s.wheel_display_mode);
      localStorage.setItem("fig_wheel_display_mode", s.wheel_display_mode);
    }).catch(() => {});
  }, []);

  const isRefreshingRef = React.useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAutoClose = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(async () => {
    cancelAutoClose();
    setIsClosing(true);
    // Smooth 180ms fade & shrink transition before hiding window
    setTimeout(async () => {
      try {
        await hideWheel();
      } catch (err) {
        console.error("Failed to hide wheel:", err);
      } finally {
        setIsClosing(false);
        setStatusMessage(null);
        setLastOutputPath(null);
        setLastOutputName(null);
        setSelectedFiles([]);
        setProfileOverride(null);
        setIsEditorOpen(false);
        setEditorFile(null);
      }
    }, 180);
  }, [cancelAutoClose]);

  const scheduleAutoClose = useCallback(
    (delayMs: number = 1000) => {
      cancelAutoClose();
      autoCloseTimerRef.current = setTimeout(() => {
        handleClose();
      }, delayMs);
    },
    [cancelAutoClose, handleClose]
  );

  // Auto-detect currently selected files in Windows Explorer or on the Desktop in a single fast pass
  const refreshExplorerSelection = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const infoList = await getSelectedExplorerFilesInfo();
      if (infoList && infoList.length > 0) {
        setSelectedFiles(infoList);
        setProfileOverride(null);
        if (infoList.length === 1) {
          setStatusMessage(`${infoList[0].name} (${t("fileSelected")})`);
        } else {
          setStatusMessage(`${infoList.length} ${t("filesSelected")}`);
        }
      } else {
        setSelectedFiles([]);
        setStatusMessage(null);
      }
    } catch (err) {
      console.warn("Failed to read explorer selection:", err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [t]);

  // Set transparent window styles & listeners
  useEffect(() => {
    document.documentElement.classList.add("wheel-window");
    document.body.classList.add("wheel-window");
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";

    refreshExplorerSelection();

    // Listen to wheel-shown event emitted directly from native Rust hotkey
    const unlistenPromise = listen("wheel-shown", () => {
      cancelAutoClose();
      setIsClosing(false);
      isRefreshingRef.current = false;
      refreshExplorerSelection();
    });

    const handleStorage = () => {
      const p = (localStorage.getItem("fig_active_profile") as WheelProfileId) || "office";
      setActiveProfile(p);
      const m = (localStorage.getItem("fig_wheel_display_mode") as "center" | "cursor") || "center";
      setWheelDisplayMode(m);
      const s = localStorage.getItem("fig_custom_slices");
      if (s) {
        try {
          setCustomSlices(JSON.parse(s));
        } catch {}
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        handleFileDrop(e.clipboardData.files[0]);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("paste", handlePaste);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    const handleBlur = () => {
      // If image editor modal is not open, dismiss wheel on blur
      const isModalActive = document.querySelector(".cursor-crosshair") !== null;
      if (!isModalActive) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    return () => {
      cancelAutoClose();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [refreshExplorerSelection, cancelAutoClose, handleClose]);

  const handleConfirmCrop = async (cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    overwrite: boolean;
  }) => {
    if (!editorFile) return;
    try {
      setStatusMessage("Görsel Kırpılıyor...");
      const res = await cropImage(
        editorFile.path,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height,
        cropData.overwrite
      );
      await closeEditor();
      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      setStatusMessage(cropData.overwrite ? `Üzerine Yazıldı: ${res.name}` : `Hazır: ${res.name}`);
      setLastOutputPath(res.path);
      setLastOutputName(res.name);
      scheduleAutoClose(1200);
    } catch (err) {
      setStatusMessage(`Hata: ${err}`);
      scheduleAutoClose(2500);
    }
  };

  const handleConfirmCensor = async (censorData: {
    blurSigma: number;
    regions: BlurRegion[] | null;
    overwrite: boolean;
  }) => {
    if (!editorFile) return;
    try {
      setStatusMessage("Görsel Sansürleniyor...");
      const res = await censorImage(
        editorFile.path,
        censorData.blurSigma,
        censorData.regions || undefined,
        censorData.overwrite
      );
      await closeEditor();
      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      setStatusMessage(censorData.overwrite ? `Üzerine Yazıldı: ${res.name}` : `Sansürlendi: ${res.name}`);
      setLastOutputPath(res.path);
      setLastOutputName(res.name);
      scheduleAutoClose(1200);
    } catch (err) {
      setStatusMessage(`Hata: ${err}`);
      scheduleAutoClose(2500);
    }
  };

  const openEditor = async (mode: ImageEditorMode, file: FileInfo) => {
    setEditorMode(mode);
    setEditorFile(file);
    setIsEditorOpen(true);
    try {
      await expandWheelWindow();
    } catch {}
  };

  const closeEditor = async () => {
    setIsEditorOpen(false);
    setEditorFile(null);
    try {
      await restoreWheelWindow();
    } catch {}
  };

  const handleCycleProfile = (direction: 1 | -1 = 1) => {
    const order: string[] = selectedFiles.length > 0
      ? ["smart", "office", "design", "media", "dev", "custom"]
      : ["office", "design", "media", "dev", "custom"];
    const current = profileOverride || (selectedFiles.length > 0 ? "smart" : activeProfile);
    const currIdx = order.indexOf(current);
    const nextIdx = (currIdx + direction + order.length) % order.length;
    const next = order[nextIdx];
    if (next === "smart") {
      setProfileOverride(null);
    } else {
      setProfileOverride(next as WheelProfileId);
      setActiveProfile(next as WheelProfileId);
      localStorage.setItem("fig_active_profile", next);
    }
  };

  const handleSelectProfile = (id: WheelProfileId) => {
    setProfileOverride(id);
    setActiveProfile(id);
    localStorage.setItem("fig_active_profile", id);
    window.dispatchEvent(new Event("storage"));
  };

  const handleFileDrop = async (file: File) => {
    const filePath = (file as unknown as { path?: string }).path || file.name;
    try {
      const info = await getFileInfo(filePath);
      setSelectedFiles([info]);
      setStatusMessage(`${info.name} hazır`);
    } catch {
      const fallback: FileInfo = {
        name: file.name,
        path: filePath,
        size: file.size,
        formatted_size: `${Math.round(file.size / 1024)} KB`,
        extension: file.name.split(".").pop() || "",
        modified: "Şimdi",
      };
      setSelectedFiles([fallback]);
      setStatusMessage(`${file.name} hazır`);
    }
  };

  // Smart Contextual Slices Generator
  const getDynamicSlices = (): { profileTitle: string; items: WheelItem[] } => {
    // If the user manually cycled profiles via center < or > buttons, respect that selection
    if (profileOverride) {
      const preset = PRESET_PROFILES[profileOverride] || PRESET_PROFILES.office;
      return {
        profileTitle: preset.name,
        items: profileOverride === "custom" ? customSlices : preset.items,
      };
    }

    if (selectedFiles.length === 1) {
      const ext = selectedFiles[0].extension.toLowerCase();

      // 1. PDF File Contextual Slices (Strictly isolated - never shows Video or Office conversions)
      if (ext === "pdf") {
        return {
          profileTitle: "PDF Akıllı Araçları",
          items: [
            { id: "pdf_png", label: "PDF → PNG Görsel", description: "Sayfaları yüksek netlikte PNG yap", icon: "image", color: "#3B82F6", category: "convert" },
            { id: "pdf_jpg", label: "PDF → JPG Fotoğraf", description: "Sayfaları optimize JPG formatına çevir", icon: "image", color: "#F59E0B", category: "convert" },
            { id: "pdf_docx", label: "PDF → Word", description: "Düzenlenebilir DOCX formatına çevir", icon: "doc", color: "#2563EB", category: "convert" },
            { id: "pdf_txt", label: "PDF → Metin", description: "Tüm metin içeriğini TXT olarak dışa aktar", icon: "txt", color: "#64748B", category: "convert" },
            { id: "pdf_excel", label: "PDF → Excel", description: "Tablo ve verileri XLSX elektronik tablo yap", icon: "xls", color: "#10B981", category: "convert" },
            { id: "reveal", label: "Explorer'da Aç", description: "Dosyayı klasöründe vurgula", icon: "folder", color: "#8B5CF6", category: "actions" },
          ],
        };
      }

      // 2. Word Document Contextual Slices
      if (["docx", "doc", "odt", "rtf"].includes(ext)) {
        return {
          profileTitle: "Word & Metin Belgesi",
          items: [
            { id: "docx_pdf", label: "Word → PDF", description: "Belgeyi PDF formatına dönüştür", icon: "pdf", color: "#EF4444", category: "documents" },
            { id: "copy_path", label: "Yolu Kopyala", description: "Dosya yolunu panoya kopyala", icon: "copy", color: "#10B981", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Dosyayı klasöründe göster", icon: "folder", color: "#F59E0B", category: "actions" },
            { id: "terminal", label: "Terminalde Aç", description: "PowerShell aç", icon: "terminal", color: "#3B82F6", category: "actions" },
            { id: "info", label: "Dosya Bilgisi", description: "Boyut ve detaylar", icon: "info", color: "#8B5CF6", category: "tools" },
            { id: "qr", label: "QR Kod", description: "QR üret", icon: "qr", color: "#06B6D4", category: "tools" },
          ],
        };
      }

      // 3. Excel Spreadsheet Contextual Slices
      if (["xlsx", "xls", "ods", "csv"].includes(ext)) {
        return {
          profileTitle: "Elektronik Tablo",
          items: [
            { id: "xlsx_pdf", label: "Excel → PDF", description: "Tabloyu PDF formatına aktar", icon: "pdf", color: "#EF4444", category: "documents" },
            { id: "copy_path", label: "Yolu Kopyala", description: "Dosya yolunu panoya kopyala", icon: "copy", color: "#10B981", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Dosyayı klasöründe göster", icon: "folder", color: "#F59E0B", category: "actions" },
            { id: "terminal", label: "Terminalde Aç", description: "PowerShell aç", icon: "terminal", color: "#3B82F6", category: "actions" },
            { id: "info", label: "Dosya Bilgisi", description: "Boyut ve detaylar", icon: "info", color: "#8B5CF6", category: "tools" },
            { id: "qr", label: "QR Kod", description: "QR üret", icon: "qr", color: "#06B6D4", category: "tools" },
          ],
        };
      }

      // 4. PowerPoint Presentation Contextual Slices
      if (["pptx", "ppt", "odp"].includes(ext)) {
        return {
          profileTitle: "Sunum Dosyası",
          items: [
            { id: "pptx_pdf", label: "PPT → PDF", description: "PowerPoint sunumunu PDF yap", icon: "pdf", color: "#EF4444", category: "documents" },
            { id: "copy_path", label: "Yolu Kopyala", description: "Dosya yolunu panoya kopyala", icon: "copy", color: "#10B981", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Dosyayı klasöründe göster", icon: "folder", color: "#F59E0B", category: "actions" },
            { id: "terminal", label: "Terminalde Aç", description: "PowerShell aç", icon: "terminal", color: "#3B82F6", category: "actions" },
            { id: "info", label: "Dosya Bilgisi", description: "Boyut ve detaylar", icon: "info", color: "#8B5CF6", category: "tools" },
            { id: "qr", label: "QR Kod", description: "QR üret", icon: "qr", color: "#06B6D4", category: "tools" },
          ],
        };
      }

      // 5. Image Contextual Slices (WebP, PNG, JPG, Censor/Blur, Crop, Image-PDF, ICO, Compress)
      if (["png", "jpg", "jpeg", "webp", "bmp", "ico", "gif", "tiff"].includes(ext)) {
        return {
          profileTitle: "Görsel & Fotoğraf",
          items: [
            { id: "webp", label: "WebP", description: "Hızlı & modern web formatı", icon: "image", color: "#10B981", category: "convert" },
            { id: "png", label: "PNG", description: "Kayıpsız şeffaf görsel", icon: "image", color: "#3B82F6", category: "convert" },
            { id: "jpg", label: "JPG", description: "Optimize web fotoğrafı", icon: "image", color: "#F59E0B", category: "convert" },
            { id: "censor", label: "Sansürle / Blur", description: "Hassas bilgileri bulanıklaştır", icon: "censor", color: "#6366F1", category: "tools" },
            { id: "crop", label: "Kırp & Düzenle", description: "Görseli kırp ve düzenle", icon: "crop", color: "#EC4899", category: "tools" },
            { id: "img_pdf", label: "Görselden PDF", description: "PDF belgesine dönüştür", icon: "pdf", color: "#EF4444", category: "convert" },
            { id: "ico", label: "ICO İkon", description: "256x256 Windows simgesi", icon: "image", color: "#8B5CF6", category: "convert" },
            { id: "compress", label: "Sıkıştır", description: "Kalite & boyut optimizasyonu", icon: "compress", color: "#14B8A6", category: "tools" },
          ],
        };
      }

      // 6. Video Contextual Slices (Strictly isolated - never shows PDF or Office)
      if (["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv"].includes(ext)) {
        return {
          profileTitle: "Video Dönüştürücü",
          items: [
            { id: "extract_audio", label: "Sesi Ayıkla (MP3)", description: "Videodan ses parçasını MP3 çıkar", icon: "music", color: "#F59E0B", category: "convert" },
            { id: "video_gif", label: "Videodan GIF", description: "Videoyu kaliteli GIF yap", icon: "film", color: "#EC4899", category: "convert" },
            { id: "video_mp4", label: "MP4 Video", description: "H.264 evrensel video formatı", icon: "film", color: "#3B82F6", category: "convert" },
            { id: "video_webm", label: "WebM Video", description: "Web için optimize video", icon: "film", color: "#10B981", category: "convert" },
            { id: "audio_wav", label: "WAV Ses Çıkar", description: "Sıkıştırmasız PCM stüdyo ses", icon: "music", color: "#8B5CF6", category: "convert" },
            { id: "reveal", label: "Explorer'da Aç", description: "Dosyayı klasöründe vurgula", icon: "folder", color: "#06B6D4", category: "actions" },
          ],
        };
      }

      // 7. Audio Contextual Slices (Strictly audio formats)
      if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) {
        return {
          profileTitle: "Ses Dönüştürücü",
          items: [
            { id: "extract_audio", label: "MP3 Ses", description: "Evrensel MP3 formatı", icon: "music", color: "#F59E0B", category: "convert" },
            { id: "audio_wav", label: "WAV Ses", description: "Kayıpsız stüdyo kalitesi", icon: "music", color: "#3B82F6", category: "convert" },
            { id: "audio_flac", label: "FLAC Ses", description: "Kayıpsız sıkıştırılmış stüdyo ses", icon: "music", color: "#10B981", category: "convert" },
            { id: "audio_aac", label: "AAC Ses", description: "Apple & modern cihaz formatı", icon: "music", color: "#8B5CF6", category: "convert" },
            { id: "copy_path", label: "Yolu Kopyala", description: "Ses yolunu panoya kopyala", icon: "copy", color: "#06B6D4", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Klasörde göster", icon: "folder", color: "#EC4899", category: "actions" },
          ],
        };
      }
    }

    // 8. Multiple Files Contextual Slices
    if (selectedFiles.length > 1) {
      const allPdfs = selectedFiles.every((f) => f.extension.toLowerCase() === "pdf");
      if (allPdfs) {
        return {
          profileTitle: `${selectedFiles.length} PDF Belgesi Seçili`,
          items: [
            { id: "pdf_png", label: "Toplu PNG Görsel", description: "Tüm PDF'lerin sayfalarını PNG yap", icon: "image", color: "#3B82F6", category: "convert" },
            { id: "pdf_jpg", label: "Toplu JPG Fotoğraf", description: "Tüm PDF'lerin sayfalarını JPG yap", icon: "image", color: "#F59E0B", category: "convert" },
            { id: "pdf_docx", label: "Toplu Word Yap", description: "Tümünü DOCX formatına çevir", icon: "doc", color: "#2563EB", category: "convert" },
            { id: "pdf_txt", label: "Toplu Metin Çıkar", description: "Tüm metinleri TXT olarak al", icon: "txt", color: "#64748B", category: "convert" },
            { id: "copy_path", label: "Yolları Kopyala", description: "Tüm dosya yollarını panoya aktar", icon: "copy", color: "#06B6D4", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Klasörde göster", icon: "folder", color: "#8B5CF6", category: "actions" },
          ],
        };
      }

      const allImages = selectedFiles.every((f) =>
        ["png", "jpg", "jpeg", "webp", "bmp", "ico", "gif", "tiff"].includes(f.extension.toLowerCase())
      );
      if (allImages) {
        return {
          profileTitle: `${selectedFiles.length} Görsel Seçili`,
          items: [
            { id: "img_pdf", label: "Tek PDF Olarak Birleştir", description: "Tüm görselleri tek bir çok sayfalı PDF yap", icon: "pdf", color: "#EF4444", category: "convert" },
            { id: "webp", label: "Toplu WebP Yap", description: "Tümünü WebP formatına dönüştür", icon: "image", color: "#10B981", category: "convert" },
            { id: "png", label: "Toplu PNG Yap", description: "Tümünü PNG formatına dönüştür", icon: "image", color: "#3B82F6", category: "convert" },
            { id: "jpg", label: "Toplu JPG Yap", description: "Tümünü JPG formatına dönüştür", icon: "image", color: "#F59E0B", category: "convert" },
            { id: "censor", label: "Toplu Sansürle / Blur", description: "Tüm görselleri bulanıklaştır", icon: "censor", color: "#6366F1", category: "tools" },
            { id: "copy_path", label: "Yolları Kopyala", description: "Tüm dosya yollarını panoya aktar", icon: "copy", color: "#06B6D4", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Klasörde göster", icon: "folder", color: "#8B5CF6", category: "actions" },
          ],
        };
      }

      const allVideos = selectedFiles.every((f) =>
        ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv", "m4v"].includes(f.extension.toLowerCase())
      );
      if (allVideos) {
        return {
          profileTitle: `${selectedFiles.length} Video Seçili`,
          items: [
            { id: "video_mp4", label: "Toplu MP4 Yap", description: "Tüm videoları evrensel MP4'e dönüştür", icon: "film", color: "#3B82F6", category: "convert" },
            { id: "extract_audio", label: "Toplu Ses Ayıkla (MP3)", description: "Videolardan sesleri MP3 olarak çıkar", icon: "music", color: "#F59E0B", category: "convert" },
            { id: "video_webm", label: "Toplu WebM Yap", description: "Web için optimize video", icon: "film", color: "#10B981", category: "convert" },
            { id: "video_gif", label: "Toplu GIF Yap", description: "Videoları GIF'e dönüştür", icon: "film", color: "#EC4899", category: "convert" },
            { id: "copy_path", label: "Yolları Kopyala", description: "Tüm dosya yollarını panoya aktar", icon: "copy", color: "#06B6D4", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Dosyaları klasöründe göster", icon: "folder", color: "#8B5CF6", category: "actions" },
          ],
        };
      }

      const allAudios = selectedFiles.every((f) =>
        ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"].includes(f.extension.toLowerCase())
      );
      if (allAudios) {
        return {
          profileTitle: `${selectedFiles.length} Ses Dosyası Seçili`,
          items: [
            { id: "extract_audio", label: "Toplu MP3 Yap", description: "Tüm sesleri MP3 formatına dönüştür", icon: "music", color: "#F59E0B", category: "convert" },
            { id: "audio_wav", label: "Toplu WAV Yap", description: "Kayıpsız stüdyo ses formatı", icon: "music", color: "#3B82F6", category: "convert" },
            { id: "audio_flac", label: "Toplu FLAC Yap", description: "Kayıpsız sıkıştırılmış ses", icon: "music", color: "#10B981", category: "convert" },
            { id: "copy_path", label: "Yolları Kopyala", description: "Dosya yollarını panoya aktar", icon: "copy", color: "#06B6D4", category: "actions" },
            { id: "reveal", label: "Explorer'da Aç", description: "Klasörde göster", icon: "folder", color: "#8B5CF6", category: "actions" },
          ],
        };
      }
      return {
        profileTitle: `${selectedFiles.length} Dosya Seçili`,
        items: [
          { id: "all_pdf", label: "Tümünü PDF Yap", description: "Seçili tüm belgeleri PDF'e dönüştür", icon: "pdf", color: "#EF4444", category: "documents" },
          { id: "copy_path", label: "Tüm Yolları Kopyala", description: "Yolları panoya aktar", icon: "copy", color: "#10B981", category: "actions" },
          { id: "reveal", label: "Explorer'da Aç", description: "Dosyaları klasöründe göster", icon: "folder", color: "#F59E0B", category: "actions" },
          { id: "terminal", label: "Terminalde Aç", description: "PowerShell aç", icon: "terminal", color: "#3B82F6", category: "actions" },
          { id: "info", label: "Dosya Bilgisi", description: "Detaylar", icon: "info", color: "#8B5CF6", category: "tools" },
          { id: "qr", label: "QR Kod", description: "QR üret", icon: "qr", color: "#06B6D4", category: "tools" },
        ],
      };
    }

    // Standard Profile fallback when no files selected
    const preset = PRESET_PROFILES[activeProfile] || PRESET_PROFILES.office;
    return {
      profileTitle: preset.name,
      items: activeProfile === "custom" ? customSlices : preset.items,
    };
  };

  const getFilterForAction = (id: string): string => {
    if (id.startsWith("pdf_") || id === "pdf") return "doc";
    if (id.includes("docx") || id.includes("doc")) return "doc";
    if (id.includes("pptx") || id.includes("ppt")) return "ppt";
    if (id.includes("xlsx") || id.includes("xls")) return "xls";
    if (id.includes("pdf") || id === "img_pdf") return "image";
    if (["webp", "png", "jpg", "bmp", "ico", "gif", "tiff", "crop", "compress", "censor"].includes(id)) return "image";
    if (["extract_audio", "video_gif", "video_mp4", "video_webm", "audio_wav", "audio_flac"].includes(id)) return "all";
    return "all";
  };

  const handleSelectAction = async (actionId: string, _category: WheelMode) => {
    if (actionId === "terminal") {
      const folderPath = selectedFiles.length > 0 ? selectedFiles[0].path : "";
      await openInTerminal(folderPath);
      await handleClose();
      return;
    }

    let files = selectedFiles;
    if (files.length === 0) {
      setStatusMessage("Dosya Seçin...");
      const picked = await pickFileDialog(getFilterForAction(actionId));
      if (!picked) {
        setStatusMessage(null);
        return;
      }
      try {
        const info = await getFileInfo(picked);
        files = [info];
        setSelectedFiles([info]);
      } catch {
        const fallback: FileInfo = {
          name: picked.split("\\").pop() || picked,
          path: picked,
          size: 0,
          formatted_size: "",
          extension: picked.split(".").pop() || "",
          modified: "Şimdi",
        };
        files = [fallback];
        setSelectedFiles([fallback]);
      }
    }

    if (files.length === 0) return;

    if (actionId === "copy_path") {
      const pathsJoined = files.map((f) => f.path).join("\n");
      await navigator.clipboard.writeText(pathsJoined);
      playSuccessChime();
      setStatusMessage(files.length === 1 ? t("pathCopied") : `${files.length} ${t("pathsCopied")}`);
      scheduleAutoClose(1000);
      return;
    }

    if (actionId === "reveal") {
      await revealInExplorer(files[0].path);
      await handleClose();
      return;
    }

    if (actionId === "crop") {
      openEditor("crop", files[0]);
      return;
    }

    if (actionId === "censor") {
      openEditor("censor", files[0]);
      return;
    }

    if (actionId === "compress" || actionId === "qr" || actionId === "info") {
      await showMainWindow();
      await handleClose();
      return;
    }

    // 1. PDF conversions (PDF -> PNG, PDF -> JPG, PDF -> Word, PDF -> Text, PDF -> Excel)
    if (actionId === "pdf_png" || actionId === "pdf_jpg" || actionId === "pdf_excel" || actionId === "pdf_docx" || actionId === "pdf_txt" || actionId === "pdf_images") {
      const targetMap: Record<string, string> = {
        pdf_png: "png",
        pdf_jpg: "jpg",
        pdf_excel: "xlsx",
        pdf_docx: "docx",
        pdf_txt: "txt",
        pdf_images: "png",
      };
      const targetExt = targetMap[actionId] || "png";
      try {
        setStatusMessage(files.length > 1 ? `${files.length} PDF Dönüştürülüyor...` : "PDF Dönüştürülüyor...");
        let lastRes: FileInfo | null = null;
        for (const file of files) {
          lastRes = await convertPdf(file.path, targetExt);
        }
        playSuccessChime();
        confetti({ particleCount: 55, spread: 70, origin: { y: 0.55 } });
        if (lastRes) {
          setStatusMessage(`Hazır: ${lastRes.name}`);
          setLastOutputPath(lastRes.path);
          setLastOutputName(lastRes.name);
        }
        scheduleAutoClose(1200);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
        scheduleAutoClose(3000);
      }
      return;
    }

    // 2. Image to PDF / Multi-image Combine into 1 PDF
    if (actionId === "img_pdf" || (actionId === "pdf" && files.every((f) => ["png", "jpg", "jpeg", "webp", "bmp"].includes(f.extension.toLowerCase())))) {
      try {
        setStatusMessage(files.length > 1 ? `${files.length} Görsel PDF Yapılıyor...` : "PDF Yapılıyor...");
        const res = await createPdfFromImages(files.map((f) => f.path));
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        setStatusMessage(`Hazır: ${res.name}`);
        setLastOutputPath(res.path);
        setLastOutputName(res.name);
        scheduleAutoClose(1100);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
        scheduleAutoClose(2500);
      }
      return;
    }

    // 3. Document Conversions (Word, PPT, Excel -> PDF)
    if (
      actionId === "docx_pdf" ||
      actionId === "pptx_pdf" ||
      actionId === "xlsx_pdf" ||
      actionId === "txt_pdf" ||
      actionId === "all_pdf" ||
      actionId === "pdf"
    ) {
      try {
        setStatusMessage(files.length > 1 ? `${files.length} Belge PDF Yapılıyor...` : "PDF Yapılıyor...");
        let lastRes: FileInfo | null = null;
        for (const file of files) {
          lastRes = await convertDocument(file.path, "pdf");
        }
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        if (lastRes) {
          setStatusMessage(files.length > 1 ? `${files.length} Belge PDF Yapıldı!` : `Hazır: ${lastRes.name}`);
          setLastOutputPath(lastRes.path);
          setLastOutputName(lastRes.name);
        }
        scheduleAutoClose(1100);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
        scheduleAutoClose(2500);
      }
      return;
    }

    // 4. Media Conversions (Audio extraction, Video to GIF, MP4, WAV, FLAC, WebM via FFmpeg)
    if (
      actionId === "extract_audio" ||
      actionId === "video_gif" ||
      actionId === "video_mp4" ||
      actionId === "video_webm" ||
      actionId === "audio_wav" ||
      actionId === "audio_flac"
    ) {
      try {
        const actionLabel =
          actionId === "extract_audio"
            ? "Ses Ayıklanıyor (MP3)"
            : actionId === "video_gif"
            ? "Videodan GIF Yapılıyor"
            : actionId === "video_mp4"
            ? "MP4 Yapılıyor"
            : actionId === "video_webm"
            ? "WebM Yapılıyor"
            : actionId === "audio_wav"
            ? "WAV Yapılıyor"
            : "FLAC Yapılıyor";

        setStatusMessage(files.length > 1 ? `${files.length} Dosya ${actionLabel}...` : `${actionLabel}...`);
        let lastRes: FileInfo | null = null;
        for (const file of files) {
          lastRes = await convertMedia(file.path, actionId);
        }
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        if (lastRes) {
          setStatusMessage(files.length > 1 ? `${files.length} Medya Dönüştürüldü!` : `Hazır: ${lastRes.name}`);
          setLastOutputPath(lastRes.path);
          setLastOutputName(lastRes.name);
        }
        scheduleAutoClose(1100);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
        scheduleAutoClose(2500);
      }
      return;
    }

    // 5. Image Conversions (WebP, PNG, JPG, BMP, ICO, GIF, TIFF)
    if (["webp", "png", "jpg", "bmp", "ico", "gif", "tiff"].includes(actionId)) {
      try {
        setStatusMessage(files.length > 1 ? `${files.length} Dosya ${actionId.toUpperCase()} Yapılıyor...` : `${actionId.toUpperCase()} Yapılıyor...`);
        let lastRes: FileInfo | null = null;
        for (const file of files) {
          lastRes = await convertImage(file.path, actionId, 85);
        }
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        if (lastRes) {
          setStatusMessage(files.length > 1 ? `${files.length} Dosya Dönüştürüldü!` : `Hazır: ${lastRes.name}`);
          setLastOutputPath(lastRes.path);
          setLastOutputName(lastRes.name);
        }
        scheduleAutoClose(1100);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
        scheduleAutoClose(2500);
      }
      return;
    }

    await showMainWindow();
    await handleClose();
  };

  const dynamic = getDynamicSlices();

  const isCenterMode = wheelDisplayMode === "center";

  return (
    <div
      className={
        (isCenterMode || isEditorOpen
          ? "fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-black/45 backdrop-blur-md select-none overflow-hidden relative transition-all duration-200"
          : "w-[460px] h-[460px] flex items-center justify-center bg-transparent select-none overflow-hidden relative transition-all duration-200") +
        (isClosing
          ? " opacity-0 scale-95 pointer-events-none"
          : " opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-150")
      }
      onClick={(e) => {
        if (isEditorOpen) return;
        const target = e.target as HTMLElement;
        const isSliceClick = target.closest("g.cursor-pointer");
        const isHubClick = target.closest(".pointer-events-auto");
        const isActionPill = target.closest(".glass-card");
        if (!isSliceClick && !isHubClick && !isActionPill) {
          handleClose();
        }
      }}
    >
      {/* Top Status Notification Pill */}
      {statusMessage && !lastOutputPath && (
        <div className="absolute top-4 z-50 px-4 py-2 rounded-full glass-card border border-white/15 text-white text-xs font-semibold shadow-2xl backdrop-blur-2xl animate-in fade-in flex items-center gap-2">
          {selectedFiles.length > 1 && <Files size={13} className="text-white" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Radial Wheel */}
      <RadialWheel
        isOpen={true}
        onClose={handleClose}
        onSelectAction={handleSelectAction}
        selectedFileNames={selectedFiles.map((f) => f.name)}
        customItems={dynamic.items}
        isStandalone={true}
        profileName={dynamic.profileTitle}
        onCycleProfile={handleCycleProfile}
        onSelectProfile={handleSelectProfile}
        onFileDrop={handleFileDrop}
      />

      {/* Prominent Success & Action Bar (Auto-closes smoothly, pauses on hover) */}
      {lastOutputPath && (
        <div
          onMouseEnter={cancelAutoClose}
          onMouseLeave={() => scheduleAutoClose(1000)}
          className="absolute bottom-6 z-50 px-5 py-3 rounded-2xl glass-card border border-white/15 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-4 max-w-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>{t("conversionDone")}</span>
              <span className="text-zinc-400 font-normal truncate">({lastOutputName})</span>
            </div>
            <div className="text-[10px] text-zinc-500 truncate font-mono mt-0.5" title={lastOutputPath}>
              {lastOutputPath}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                await revealInExplorer(lastOutputPath);
                await handleClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title={t("showInFolder")}
            >
              <FolderOpen size={14} className="text-white" />
              <span>{t("showInFolder")}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await openFile(lastOutputPath);
                await handleClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title={t("openFile")}
            >
              <ExternalLink size={14} />
              <span>{t("openFile")}</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title={t("close")}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Visual Image Editor Modal (Crop & Regional Censor) */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        initialMode={editorMode}
        file={editorFile}
        onClose={closeEditor}
        onConfirmCrop={handleConfirmCrop}
        onConfirmCensor={handleConfirmCensor}
      />
    </div>
  );
};
