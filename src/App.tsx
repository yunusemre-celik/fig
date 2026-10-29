import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { TitleBar } from "./components/TitleBar";
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
import imgStudioThumb from "./assets/images/feature-image-studio.jpg";
import docPdfThumb from "./assets/images/feature-doc-pdf.jpg";
import pdfExtractThumb from "./assets/images/feature-pdf-extract.jpg";
import mediaAudioThumb from "./assets/images/feature-media-audio.jpg";
import { FileInfo, LibraryEntry, TabType, WheelProfileId, WheelItem } from "./types";
import { playSuccessChime } from "./utils/sound";
import { useTranslation } from "./i18n/useTranslation";
import {
  getFileInfo,
  convertImage,
  convertMedia,
  cropImage,
  censorImage,
  compressImage,
  readQrCode,
  generateQrCode,
  convertDocument,
  getLibrary,
  clearLibrary,
  revealInExplorer,
  openFile,
  showWheelAtCursor,
  pickFileDialog,
} from "./services/api";

const isWheelWindow =
  typeof window !== "undefined" && window.location.search.includes("window=wheel");

export function App() {
  const { t, language } = useTranslation();

  // Strict Obsidian Dark Theme setup
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light", "theme-light");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  if (isWheelWindow) {
    return <FloatingWheelWindow />;
  }

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [homeSubView, setHomeSubView] = useState<"dropzone" | "history">("dropzone");
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
    return PRESET_PROFILES.office.items;
  });

  // Modal dialog states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<ImageEditorMode>("crop");
  const [isCompressOpen, setIsCompressOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const addToast = (type: "success" | "error" | "info", title: string, text: string, outputPath?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, text, outputPath }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadLibrary = async () => {
    try {
      const items = await getLibrary();
      setLibraryEntries(items);
    } catch {
      // In dev browser mode
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveTab("home");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveTab("studio");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveTab("documents");
        } else if (e.key === ",") {
          e.preventDefault();
          setActiveTab("settings");
        } else if (e.code === "Space") {
          e.preventDefault();
          handleTriggerWheel();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    setSelectedFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path));
      const filtered = newFiles.filter((f) => !existingPaths.has(f.path));
      return [...prev, ...filtered];
    });
  };

  const handleTriggerWheel = async () => {
    try {
      await showWheelAtCursor();
    } catch {
      setIsWheelOpen(true);
    }
  };

  const handlePickFiles = async () => {
    try {
      const paths = await pickFileDialog();
      if (paths && paths.length > 0) {
        const fileInfos: FileInfo[] = [];
        for (const p of paths) {
          try {
            const info = await getFileInfo(p);
            fileInfos.push(info);
          } catch {}
        }
        setSelectedFiles((prev) => {
          const existingPaths = new Set(prev.map((f) => f.path));
          const filtered = fileInfos.filter((f) => !existingPaths.has(f.path));
          return [...prev, ...filtered];
        });
      }
    } catch (err) {
      addToast("error", "Error", `${err}`);
    }
  };

  const handleProfileChange = (profile: WheelProfileId) => {
    setActiveProfile(profile);
    localStorage.setItem("fig_active_profile", profile);
  };

  const handleUpdateCustomSlices = (items: WheelItem[]) => {
    setCustomSlices(items);
    localStorage.setItem("fig_custom_slices", JSON.stringify(items));
  };

  const handleAction = async (action: string) => {
    setIsWheelOpen(false);
    if (selectedFiles.length === 0) {
      await handlePickFiles();
      return;
    }

    if (action === "crop") {
      setEditorMode("crop");
      setIsEditorOpen(true);
      return;
    }
    if (action === "censor") {
      setEditorMode("censor");
      setIsEditorOpen(true);
      return;
    }
    if (action === "compress") {
      setIsCompressOpen(true);
      return;
    }
    if (action === "qr") {
      setIsQrOpen(true);
      return;
    }

    handleDirectConvert(action);
  };

  const handleDirectConvert = async (format: string) => {
    if (selectedFiles.length === 0) return;
    setIsConverting(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        if (["webp", "png", "jpg", "ico"].includes(format)) {
          await convertImage(file.path, format as any);
        } else if (["mp3", "gif", "mp4", "webm", "wav"].includes(format)) {
          await convertMedia(file.path, format as any);
        } else if (format === "pdf") {
          await convertDocument(file.path, "pdf");
        } else {
          await convertDocument(file.path, format as any);
        }
        successCount++;
        loadLibrary();
      } catch (err) {
        addToast("error", "Error", `${file.name}: ${err}`);
      }
    }

    setIsConverting(false);
    if (successCount > 0) {
      playSuccessChime();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      addToast("success", "Complete", `${successCount} files converted.`);
    }
  };

  const handleConfirmCrop = async (cropData: any) => {
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
      addToast("success", "Crop", `${res.name} saved.`, res.path);
      loadLibrary();
    } catch (err) {
      addToast("error", "Error", `${err}`);
    }
  };

  const handleConfirmCensor = async (censorData: any) => {
    if (selectedFiles.length === 0) return;
    try {
      const res = await censorImage(
        selectedFiles[0].path,
        censorData.blurSigma,
        censorData.regions || undefined,
        censorData.overwrite
      );
      playSuccessChime();
      addToast("success", "Censor", `${res.name} saved.`, res.path);
      loadLibrary();
    } catch (err) {
      addToast("error", "Error", `${err}`);
    }
  };

  const handleConfirmCompress = async (quality: number, maxWidth?: number) => {
    if (selectedFiles.length === 0) return;
    try {
      const res = await compressImage(selectedFiles[0].path, quality, maxWidth);
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
      : PRESET_PROFILES[activeProfile]?.items || PRESET_PROFILES.office.items;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080A11] text-[#F8FAFC] select-none overflow-hidden font-sans relative">
      {/* Native Windows 11 TitleBar */}
      <TitleBar />

      {/* Two-Column Modern Workspace Layout */}
      <div className="workspace-shell">
        {/* Left Sidebar Navigation */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenWheel={handleTriggerWheel}
          onOpenImageStudio={() => {
            if (selectedFiles.length > 0) {
              setEditorMode("crop");
              setIsEditorOpen(true);
            } else {
              handlePickFiles();
            }
          }}
          libraryCount={libraryEntries.length}
        />

        {/* Right Main Content Panel */}
        <main className="dropzone-panel">
          {activeTab === "home" && (
            <div className="flex flex-col w-full max-w-4xl mx-auto animate-in fade-in duration-200">
              {/* Panel Top Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-mono text-[#8E95A8] tracking-widest uppercase">
                    {t("tabHome") || "QUICK CONVERT"}
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
                    {language === "tr" ? "Hangi dosya üzerinde çalışıyoruz?" : "What are we working on?"}
                  </h1>
                </div>

                {/* Dropzone | History View Switch */}
                <div className="flex p-1 bg-[#0B0E17] border border-white/[0.08] rounded-lg gap-1">
                  <button
                    type="button"
                    onClick={() => setHomeSubView("dropzone")}
                    className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                      homeSubView === "dropzone"
                        ? "bg-[#252A41] text-[#B2B7C9] font-medium shadow-sm"
                        : "text-[#646C7E] hover:text-white"
                    }`}
                  >
                    Dropzone
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeSubView("history")}
                    className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      homeSubView === "history"
                        ? "bg-[#252A41] text-[#B2B7C9] font-medium shadow-sm"
                        : "text-[#646C7E] hover:text-white"
                    }`}
                  >
                    <span>History</span>
                    {libraryEntries.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#8493FF]/20 text-[#8493FF]">
                        {libraryEntries.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {homeSubView === "dropzone" ? (
                <>
                  <DropZone
                    onFilesSelected={handleFilesSelected}
                    onOpenWheel={handleTriggerWheel}
                    hasSelectedFiles={selectedFiles.length > 0}
                  />

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

                  {/* Quick Action Bento Tiles */}
                  <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDirectConvert("webp")}
                      className="glass-card p-3.5 text-left group flex flex-col justify-between h-24 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#8493FF]/30 shadow-sm group-hover:scale-105 group-hover:border-[#8493FF] transition-all">
                        <img src={imgStudioThumb} alt="WebP Studio" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">WebP</span>
                        <span className="text-[10px] text-[#8E95A8]">{t("quickWebp")}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectConvert("pdf")}
                      className="glass-card p-3.5 text-left group flex flex-col justify-between h-24 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#8493FF]/30 shadow-sm group-hover:scale-105 group-hover:border-[#8493FF] transition-all">
                        <img src={docPdfThumb} alt="Document to PDF" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">PDF</span>
                        <span className="text-[10px] text-[#8E95A8]">{t("quickPdf")}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction("crop")}
                      className="glass-card p-3.5 text-left group flex flex-col justify-between h-24 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#8493FF]/30 shadow-sm group-hover:scale-105 group-hover:border-[#8493FF] transition-all">
                        <img src={pdfExtractThumb} alt="Crop & Extract" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{t("cropTab")}</span>
                        <span className="text-[10px] text-[#8E95A8]">{t("quickCrop")}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction("qr")}
                      className="glass-card p-3.5 text-left group flex flex-col justify-between h-24 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#8493FF]/30 shadow-sm group-hover:scale-105 group-hover:border-[#8493FF] transition-all">
                        <img src={mediaAudioThumb} alt="Media & Audio" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">QR Code</span>
                        <span className="text-[10px] text-[#8E95A8]">{t("quickQr")}</span>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full animate-in fade-in duration-200">
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
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <DocumentsView
              onSuccess={(_info) => {
                addToast("success", t("sliceDocxPdf"), `${_info.name} created.`, _info.path);
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

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

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
