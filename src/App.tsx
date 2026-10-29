import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Navigation } from "./components/Navigation";
import { DropZone } from "./components/DropZone";
import { FileChips } from "./components/FileChips";
import { RadialWheel } from "./components/RadialWheel";
import { LibraryView } from "./components/LibraryView";
import { SettingsView } from "./components/SettingsView";
import { DocumentsView } from "./components/DocumentsView";
import { WheelStudio, PRESET_PROFILES } from "./components/WheelStudio";
import { FloatingWheelWindow } from "./components/FloatingWheelWindow";
import { ImageEditorModal, ImageEditorMode } from "./components/modals/ImageEditorModal";
import { CompressModal } from "./components/modals/CompressModal";
import { QrModal } from "./components/modals/QrModal";
import { Toast, ToastMessage } from "./components/Toast";
import { FileInfo, LibraryEntry, TabType, WheelMode, WheelProfileId, WheelItem, AppTheme } from "./types";
import { playSuccessChime } from "./utils/sound";
import { useTranslation } from "./i18n/useTranslation";
import {
  getFileInfo,
  convertImage,
  convertMedia,
  cropImage,
  censorImage,
  BlurRegion,
  compressImage,
  readQrCode,
  generateQrCode,
  createPdfFromImages,
  convertDocument,
  getLibrary,
  clearLibrary,
  revealInExplorer,
  openInTerminal,
  openFile,
  showWheelAtCursor,
  pickFileDialog,
} from "./services/api";
import { Sparkles, FileImage, Crop, QrCode, FileText } from "lucide-react";

const isWheelWindow =
  typeof window !== "undefined" && window.location.search.includes("window=wheel");

export function App() {
  const { t, language } = useTranslation();

  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem("fig_theme") as AppTheme) || "system";
  });

  // Dynamic Theme Engine: Auto Sync with System & User Preference
  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = (localStorage.getItem("fig_theme") as AppTheme) || "system";
      const isDark =
        currentTheme === "dark" ||
        (currentTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("theme-dark", isDark);
      document.documentElement.classList.toggle("theme-light", !isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("light", !isDark);
    };

    applyTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => applyTheme();
    media.addEventListener("change", handleMediaChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "fig_theme") {
        setTheme((localStorage.getItem("fig_theme") as AppTheme) || "system");
        applyTheme();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      media.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [theme]);

  if (isWheelWindow) {
    return <FloatingWheelWindow />;
  }

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [libraryEntries, setLibraryEntries] = useState<LibraryEntry[]>([]);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  // Wheel Studio profiles state
  const [activeProfile, setActiveProfile] = useState<WheelProfileId>(() => {
    return (localStorage.getItem("fig_active_profile") as WheelProfileId) || "office";
  });

  const [customSlices, setCustomSlices] = useState<WheelItem[]>(() => {
    const saved = localStorage.getItem("fig_custom_slices");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return PRESET_PROFILES.design.items;
  });

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<ImageEditorMode>("crop");
  const [isCompressOpen, setIsCompressOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Load Library on initial mount
  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const data = await getLibrary();
      setLibraryEntries(data);
    } catch (err) {
      console.error("Failed to load library:", err);
    }
  };

  const handleProfileChange = (id: WheelProfileId) => {
    setActiveProfile(id);
    localStorage.setItem("fig_active_profile", id);
    addToast(
      "info",
      language === "tr" ? "Profil Değiştirildi" : "Profile Changed",
      `${language === "tr" ? "Aktif Profil:" : "Active Profile:"} ${PRESET_PROFILES[id].name}`
    );
  };

  const handleUpdateCustomSlices = (slices: WheelItem[]) => {
    setCustomSlices(slices);
    localStorage.setItem("fig_custom_slices", JSON.stringify(slices));
  };

  const addToast = (
    type: "success" | "error" | "info",
    title: string,
    text: string,
    outputPath?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        text,
        outputPath,
        onReveal: revealInExplorer,
        onOpen: openFile,
      },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Convert HTML5 File objects to FileInfo
  const handleFilesSelected = async (files: File[]) => {
    const newFiles: FileInfo[] = [];
    for (const f of files) {
      const filePath = (f as unknown as { path?: string }).path || f.name;
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const formattedSize =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`;

      try {
        const info = await getFileInfo(filePath);
        newFiles.push(info);
      } catch {
        newFiles.push({
          name: f.name,
          path: filePath,
          size: f.size,
          formatted_size: formattedSize,
          extension: ext,
          modified: "Yeni",
        });
      }
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    addToast(
      "info",
      language === "tr" ? "Dosyalar Eklendi" : "Files Added",
      `${newFiles.length} ${language === "tr" ? "dosya hazır." : "files ready."}`
    );
  };

  // Trigger floating wheel at cursor
  const handleTriggerWheel = async () => {
    try {
      await showWheelAtCursor();
    } catch {
      setIsWheelOpen(true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        handleTriggerWheel();
      } else if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("home");
      } else if (e.ctrlKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("documents");
      } else if (e.ctrlKey && e.key === "3") {
        e.preventDefault();
        setActiveTab("studio");
      } else if (e.ctrlKey && e.key === "4") {
        e.preventDefault();
        setActiveTab("library");
      } else if (e.ctrlKey && e.key === ",") {
        e.preventDefault();
        setActiveTab("settings");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Direct conversion execution for selected files
  const handleDirectConvert = async (targetFormat: string) => {
    let filesToProcess = selectedFiles;
    if (filesToProcess.length === 0) {
      const picked = await pickFileDialog(targetFormat === "pdf" ? "office" : "image");
      if (!picked) return;
      try {
        const info = await getFileInfo(picked);
        setSelectedFiles([info]);
        filesToProcess = [info];
      } catch {
        return;
      }
    }

    setIsConverting(true);
    const saveAsSeparate = localStorage.getItem("fig_save_separate") !== "false";
    const total = selectedFiles.length;
    let successCount = 0;
    let lastResult: FileInfo | null = null;

    try {
      if (
        [
          "extract_audio",
          "audio_mp3",
          "audio_wav",
          "audio_flac",
          "video_mp4",
          "video_webm",
          "video_gif",
        ].includes(targetFormat)
      ) {
        for (let i = 0; i < total; i++) {
          const f = selectedFiles[i];
          const stem = f.name.substring(0, f.name.lastIndexOf(".")) || f.name;
          const extMap: Record<string, string> = {
            extract_audio: "mp3",
            audio_mp3: "mp3",
            audio_wav: "wav",
            audio_flac: "flac",
            video_mp4: "mp4",
            video_webm: "webm",
            video_gif: "gif",
          };
          const targetExt = extMap[targetFormat] || targetFormat;
          const customName = saveAsSeparate
            ? `${stem}_(${i + 1} of ${total}).${targetExt}`
            : undefined;

          try {
            const res = await convertMedia(f.path, targetFormat, customName);
            lastResult = res;
            successCount++;
          } catch (err) {
            console.error(err);
          }
        }
      } else if (targetFormat === "pdf") {
        const allImages = selectedFiles.every((f) =>
          ["png", "jpg", "jpeg", "webp", "bmp", "gif"].includes(f.extension.toLowerCase())
        );

        if (allImages) {
          // Combine images into single multi-page PDF
          const res = await createPdfFromImages(selectedFiles.map((f) => f.path));
          lastResult = res;
          successCount = total;
        } else {
          // Convert individual documents
          for (let i = 0; i < total; i++) {
            const f = selectedFiles[i];
            const stem = f.name.substring(0, f.name.lastIndexOf(".")) || f.name;
            const customName = saveAsSeparate ? `${stem}_(${i + 1} of ${total}).pdf` : undefined;
            try {
              const res = await convertDocument(f.path, "pdf", customName);
              lastResult = res;
              successCount++;
            } catch (err) {
              console.error(err);
            }
          }
        }
      } else {
        // Image conversions: webp, png, jpg, bmp, ico, gif, tiff
        for (let i = 0; i < total; i++) {
          const f = selectedFiles[i];
          const stem = f.name.substring(0, f.name.lastIndexOf(".")) || f.name;
          const customName = saveAsSeparate
            ? `${stem}_(${i + 1} of ${total}).${targetFormat}`
            : undefined;
          try {
            const res = await convertImage(f.path, targetFormat, 85, customName);
            lastResult = res;
            successCount++;
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (successCount > 0 && lastResult) {
        playSuccessChime();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
        addToast(
          "success",
          t("conversionDone"),
          `${successCount} ${language === "tr" ? "dosya başarıyla dönüştürüldü." : "files converted successfully."}`,
          lastResult.path
        );
        loadLibrary();
      } else {
        addToast(
          "error",
          language === "tr" ? "Dönüştürme Başarısız" : "Conversion Failed",
          language === "tr"
            ? "Seçilen dosyalar dönüştürülürken bir hata oluştu."
            : "An error occurred while converting the selected files."
        );
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Action execution from wheel or quick buttons
  const handleAction = async (actionId: string, category: WheelMode) => {
    setIsWheelOpen(false);

    if (category === "documents" || actionId.endsWith("_pdf")) {
      await handleDirectConvert("pdf");
      return;
    }

    if (category === "convert") {
      await handleDirectConvert(actionId);
      return;
    }

    if (category === "tools") {
      if (actionId === "crop" || actionId === "censor") {
        let file = selectedFiles[0];
        if (!file) {
          const picked = await pickFileDialog("image");
          if (!picked) return;
          try {
            file = await getFileInfo(picked);
            setSelectedFiles([file]);
          } catch {
            return;
          }
        }
        setEditorMode(actionId as ImageEditorMode);
        setIsEditorOpen(true);
        return;
      } else if (actionId === "compress") {
        let file = selectedFiles[0];
        if (!file) {
          const picked = await pickFileDialog("image");
          if (!picked) return;
          try {
            file = await getFileInfo(picked);
            setSelectedFiles([file]);
          } catch {
            return;
          }
        }
        setIsCompressOpen(true);
        return;
      } else if (actionId === "qr") {
        setIsQrOpen(true);
        return;
      } else if (actionId === "info") {
        if (selectedFiles.length > 0) {
          const f = selectedFiles[0];
          addToast(
            "info",
            t("sliceInfo"),
            `${f.name} • ${f.formatted_size} • ${f.width || "?"}×${f.height || "?"}px`,
            f.path
          );
        }
        return;
      }
    } else if (category === "actions") {
      if (selectedFiles.length === 0) {
        if (actionId === "terminal") {
          openInTerminal("");
          addToast("info", "Terminal", language === "tr" ? "Terminal açılıyor..." : "Opening terminal...");
          return;
        }
        addToast(
          "error",
          language === "tr" ? "Dosya Seçilmedi" : "No File Selected",
          language === "tr" ? "Lütfen bir dosya seçin." : "Please select a file first."
        );
        return;
      }
      const first = selectedFiles[0];
      if (actionId === "copy_path") {
        navigator.clipboard.writeText(first.path);
        addToast("success", t("pathCopied"), first.path);
      } else if (actionId === "reveal") {
        revealInExplorer(first.path);
      } else if (actionId === "terminal") {
        openInTerminal(first.path);
      }
    }
  };

  const handleConfirmCrop = async (cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    overwrite: boolean;
  }) => {
    if (selectedFiles.length === 0) return;
    try {
      const res = await cropImage(
        selectedFiles[0].path,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height,
        cropData.overwrite
      );
      playSuccessChime();
      addToast(
        "success",
        language === "tr" ? "Görsel Kırpıldı" : "Image Cropped",
        `${res.name} ${cropData.overwrite ? (language === "tr" ? "üzerine kaydedildi." : "overwritten.") : (language === "tr" ? "oluşturuldu." : "created.")}`,
        res.path
      );
      loadLibrary();
    } catch (err) {
      addToast("error", "Error", `${err}`);
    }
  };

  const handleConfirmCensor = async (censorData: {
    blurSigma: number;
    regions: BlurRegion[] | null;
    overwrite: boolean;
  }) => {
    if (selectedFiles.length === 0) return;
    try {
      const res = await censorImage(
        selectedFiles[0].path,
        censorData.blurSigma,
        censorData.regions || undefined,
        censorData.overwrite
      );
      playSuccessChime();
      addToast(
        "success",
        language === "tr" ? "Görsel Sansürlendi" : "Image Censored",
        `${res.name} ${censorData.overwrite ? (language === "tr" ? "üzerine kaydedildi." : "overwritten.") : (language === "tr" ? "oluşturuldu." : "created.")}`,
        res.path
      );
      loadLibrary();
    } catch (err) {
      addToast("error", "Error", `${err}`);
    }
  };

  const handleConfirmCompress = async (quality: number, maxWidth?: number) => {
    if (selectedFiles.length === 0) return;
    try {
      const res = await compressImage(
        selectedFiles[0].path,
        quality,
        maxWidth
      );
      playSuccessChime();
      addToast("success", t("sliceCompress"), `${res.name} created.`, res.path);
      loadLibrary();
    } catch (err) {
      addToast("error", "Error", `${err}`);
    }
  };

  const currentWheelItems =
    activeProfile === "custom"
      ? customSlices
      : PRESET_PROFILES[activeProfile]?.items || PRESET_PROFILES.design.items;

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--apple-bg-canvas)] text-[var(--apple-text-primary)] select-none overflow-hidden font-sans relative transition-colors duration-200">
      {/* Brand Top Header */}
      <div className="h-10 w-full flex items-center justify-between px-5 apple-header border-x-0 border-t-0 select-none text-xs z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
            <span className="text-black font-black text-[11px] leading-none">F</span>
          </div>
          <span className="font-bold text-[var(--apple-text-primary)] tracking-wide text-xs">Fig</span>
          <span className="text-[10px] text-[var(--apple-accent)] font-semibold px-2 py-0.5 rounded-full bg-[var(--apple-accent-light)] border border-[var(--apple-accent)]/20">
            Apple Minimal · Sequoia
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--apple-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span>{t("activeWheel")}</span>
            <span className="text-[var(--apple-accent)] font-semibold">{PRESET_PROFILES[activeProfile]?.name}</span>
          </div>
          <span className="text-[var(--apple-border)]">•</span>
          <div className="has-tooltip flex items-center gap-1.5 cursor-pointer" onClick={handleTriggerWheel}>
            <span>{t("quickWheelHint")}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--apple-bg-control)] border border-[var(--apple-border)] font-mono text-[10px]">
              Ctrl + Space
            </kbd>
            <div className="tooltip top-full mt-2 right-0 px-2.5 py-1 text-[11px] pointer-events-none">
              Ctrl + Space
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenWheel={handleTriggerWheel}
        libraryCount={libraryEntries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {activeTab === "home" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center max-w-4xl w-full mx-auto">
            {/* Hero Brand Card */}
            <div className="w-full text-center my-3 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--apple-accent-light)] border border-[var(--apple-accent)]/25 text-[var(--apple-accent)] text-xs font-semibold mb-2 shadow-sm">
                <Sparkles size={13} />
                <span>{t("heroBadge")}</span>
              </div>
              <h1 className="text-3xl font-black text-[var(--apple-text-primary)] tracking-tight">
                {t("heroTitle1")} <span className="text-[var(--apple-accent)]">{t("heroTitle2")}</span>
              </h1>
              <p className="text-xs text-[var(--apple-text-secondary)] mt-1.5 max-w-md mx-auto leading-relaxed">
                {t("heroDesc")}
              </p>
            </div>

            {/* Drop Zone */}
            <div className="w-full max-w-2xl mt-1">
              <DropZone
                onFilesSelected={handleFilesSelected}
                onOpenWheel={handleTriggerWheel}
                hasSelectedFiles={selectedFiles.length > 0}
              />

              {/* Selected Files with Direct 1-Click Convert Bar */}
              <FileChips
                files={selectedFiles}
                onRemove={(idx) =>
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                onClearAll={() => setSelectedFiles([])}
                onOpenWheel={handleTriggerWheel}
                onReveal={revealInExplorer}
                onDirectConvert={handleDirectConvert}
                isConverting={isConverting}
              />
            </div>

            {/* Quick Action Apple Cards */}
            <div className="w-full max-w-2xl mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleDirectConvert("webp")}
                className="apple-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24 hover:border-[var(--apple-accent)]/50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
                  <FileImage size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--apple-text-primary)] block">WebP</span>
                  <span className="text-[10px] text-[var(--apple-text-secondary)]">{t("quickWebp")}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectConvert("pdf")}
                className="apple-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24 hover:border-[var(--apple-accent)]/50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
                  <FileText size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--apple-text-primary)] block">PDF</span>
                  <span className="text-[10px] text-[var(--apple-text-secondary)]">{t("quickPdf")}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction("crop", "tools")}
                className="apple-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24 hover:border-[var(--apple-accent)]/50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                  <Crop size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--apple-text-primary)] block">{t("cropTab")}</span>
                  <span className="text-[10px] text-[var(--apple-text-secondary)]">{t("quickCrop")}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction("qr", "tools")}
                className="apple-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24 hover:border-[var(--apple-accent)]/50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-105 transition-transform">
                  <QrCode size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--apple-text-primary)] block">QR</span>
                  <span className="text-[10px] text-[var(--apple-text-secondary)]">{t("quickQr")}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentsView
            onSuccess={(_info) => {
              addToast(
                "success",
                t("sliceDocxPdf"),
                `${_info.name} created.`,
                _info.path
              );
              loadLibrary();
            }}
          />
        )}

        {activeTab === "studio" && (
          <WheelStudio
            currentProfile={activeProfile}
            onSelectProfile={handleProfileChange}
            customItems={customSlices}
            onUpdateCustomItems={handleUpdateCustomSlices}
          />
        )}

        {activeTab === "library" && (
          <LibraryView
            entries={libraryEntries}
            onReveal={revealInExplorer}
            onOpenFile={openFile}
            onClear={async () => {
              await clearLibrary();
              setLibraryEntries([]);
              addToast("info", "Library", language === "tr" ? "Kütüphane temizlendi." : "Library cleared.");
            }}
          />
        )}

        {activeTab === "settings" && <SettingsView />}
      </main>

      {/* Fallback In-App Radial Action Wheel */}
      <RadialWheel
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onSelectAction={handleAction}
        selectedFileNames={selectedFiles.map((f) => f.name)}
        customItems={currentWheelItems}
        profileName={PRESET_PROFILES[activeProfile]?.name}
        onCycleProfile={(dir = 1) => {
          const order: WheelProfileId[] = ["office", "design", "dev", "custom"];
          const currIdx = order.indexOf(activeProfile);
          const nextIdx = (currIdx + dir + order.length) % order.length;
          handleProfileChange(order[nextIdx]);
        }}
        onSelectProfile={handleProfileChange}
      />

      {/* Visual Modals */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        initialMode={editorMode}
        file={selectedFiles[0] || null}
        onClose={() => setIsEditorOpen(false)}
        onConfirmCrop={handleConfirmCrop}
        onConfirmCensor={handleConfirmCensor}
      />

      <CompressModal
        isOpen={isCompressOpen}
        onClose={() => setIsCompressOpen(false)}
        file={selectedFiles[0] || null}
        onConfirmCompress={handleConfirmCompress}
      />

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        selectedFile={selectedFiles[0] || null}
        onScanQr={readQrCode}
        onGenerateQr={async (txt) => {
          const res = await generateQrCode(txt);
          loadLibrary();
          addToast("success", "QR Code", "QR code created.", res.path);
          return res.path;
        }}
      />

      {/* Glassmorphic Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
