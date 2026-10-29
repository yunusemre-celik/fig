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
import { CropModal } from "./components/modals/CropModal";
import { CompressModal } from "./components/modals/CompressModal";
import { QrModal } from "./components/modals/QrModal";
import { Toast, ToastMessage } from "./components/Toast";
import { FileInfo, LibraryEntry, TabType, WheelMode, WheelProfileId, WheelItem } from "./types";
import { playSuccessChime } from "./utils/sound";
import {
  getFileInfo,
  convertImage,
  cropImage,
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
  const [isCropOpen, setIsCropOpen] = useState(false);
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
    addToast("info", "Profil Değiştirildi", `Aktif Profil: ${PRESET_PROFILES[id].name}`);
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
    addToast("info", "Dosyalar Eklendi", `${newFiles.length} dosya işleme hazır.`);
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
      if (targetFormat === "pdf") {
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
        // Image conversions: webp, png, jpg, bmp
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
        confetti({ particleCount: 65, spread: 75, origin: { y: 0.8 } });
        addToast(
          "success",
          "Dönüştürme Tamamlandı",
          `${successCount} dosya başarıyla ${targetFormat.toUpperCase()} formatına dönüştürüldü.${
            saveAsSeparate ? " (1 of N numaralandırması uygulandı)" : ""
          }`,
          lastResult.path
        );
        loadLibrary();
      } else {
        addToast(
          "error",
          "Dönüştürme Başarısız",
          "Seçilen dosyalar dönüştürülürken bir hata oluştu. Lütfen dosya formatlarını kontrol edin."
        );
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Action execution from wheel or quick buttons
  const handleAction = async (actionId: string, category: WheelMode) => {
    if (category === "documents" || actionId.endsWith("_pdf")) {
      await handleDirectConvert("pdf");
      return;
    }

    if (category === "convert") {
      await handleDirectConvert(actionId);
      return;
    }

    if (category === "tools") {
      if (actionId === "crop") {
        if (selectedFiles.length === 0) {
          addToast("error", "Görsel Seçilmedi", "Lütfen kırpılacak bir görsel seçin.");
          return;
        }
        setIsCropOpen(true);
      } else if (actionId === "compress") {
        if (selectedFiles.length === 0) {
          addToast("error", "Görsel Seçilmedi", "Lütfen sıkıştırılacak bir görsel seçin.");
          return;
        }
        setIsCompressOpen(true);
      } else if (actionId === "qr") {
        setIsQrOpen(true);
      } else if (actionId === "info") {
        if (selectedFiles.length > 0) {
          const f = selectedFiles[0];
          addToast(
            "info",
            "Dosya Bilgisi",
            `${f.name} • ${f.formatted_size} • ${f.width || "?"}×${f.height || "?"}px`,
            f.path
          );
        }
      }
    } else if (category === "actions") {
      if (selectedFiles.length === 0) {
        if (actionId === "terminal") {
          openInTerminal("");
          addToast("info", "Terminal", "PowerShell terminali açılıyor...");
          return;
        }
        addToast("error", "Dosya Seçilmedi", "Lütfen bir dosya seçin.");
        return;
      }
      const first = selectedFiles[0];
      if (actionId === "copy_path") {
        navigator.clipboard.writeText(first.path);
        addToast("success", "Panoya Kopyalandı", "Dosya yolu başarıyla panoya aktarıldı.");
      } else if (actionId === "reveal") {
        revealInExplorer(first.path);
        addToast("info", "Dosya Gezgini", "Dosya konumu açılıyor...");
      } else if (actionId === "terminal") {
        openInTerminal(first.path);
        addToast("info", "Terminal", "Klasör konumunda PowerShell açılıyor...");
      }
    }
  };

  const handleConfirmCrop = async (cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (selectedFiles.length === 0) return;
    try {
      const res = await cropImage(
        selectedFiles[0].path,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height
      );
      playSuccessChime();
      addToast("success", "Görsel Kırpıldı", `${res.name} oluşturuldu.`, res.path);
      loadLibrary();
    } catch (err) {
      addToast("error", "Kırpma Hatası", `Kırpma işlemi tamamlanamadı: ${err}`);
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
      addToast("success", "Görsel Sıkıştırıldı", `${res.name} oluşturuldu.`, res.path);
      loadLibrary();
    } catch (err) {
      addToast("error", "Sıkıştırma Hatası", `Sıkıştırma tamamlanamadı: ${err}`);
    }
  };

  const currentWheelItems =
    activeProfile === "custom"
      ? customSlices
      : PRESET_PROFILES[activeProfile]?.items || PRESET_PROFILES.design.items;

  return (
    <div className="flex flex-col h-screen w-screen bg-mesh-glass text-neutral-100 select-none overflow-hidden font-sans relative">
      {/* Brand Top Header with Window Vibrancy */}
      <div className="h-10 w-full flex items-center justify-between px-5 glass-panel border-x-0 border-t-0 select-none text-xs z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
            <span className="text-black font-black text-[11px] leading-none">F</span>
          </div>
          <span className="font-bold text-white tracking-wide text-xs">Fig</span>
          <span className="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/25">
            Windows 11 Mica & Acrylic
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Aktif Çark:</span>
            <span className="text-amber-300 font-semibold">{PRESET_PROFILES[activeProfile]?.name}</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="has-tooltip flex items-center gap-1.5 cursor-pointer" onClick={handleTriggerWheel}>
            <span>İmleçte Hızlı Çark:</span>
            <kbd>Ctrl + Space</kbd>
            <div className="tooltip top-full mt-2 right-0 px-2.5 py-1 text-[11px] pointer-events-none">
              Tıkla veya Ctrl+Space bas
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold mb-2 shadow-sm backdrop-blur-md">
                <Sparkles size={13} />
                <span>Windows 11 Native Vibrancy & Dosya Kiti</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Dosyaların için <span className="text-amber-400">tatlı bir kolaylık.</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
                Dosyaları bırakın, tek tıkla doğrudan dönüştürün veya fare imlecinizin ucundaki çark ile anında işleyin.
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

            {/* Quick Action Glass Cards */}
            <div className="w-full max-w-2xl mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleDirectConvert("webp")}
                className="glass-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24 hover:border-emerald-400/40"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
                  <FileImage size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">⚡ WebP'ye Çevir</span>
                  <span className="text-[10px] text-neutral-400">Seçilileri dönüştür</span>
                </div>
              </button>

              <button
                onClick={() => handleDirectConvert("pdf")}
                className="glass-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24 border-rose-500/20 hover:border-rose-400/40"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-sm">
                  <FileText size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">⚡ PDF Yap</span>
                  <span className="text-[10px] text-neutral-400">Görsel veya Belgeleri</span>
                </div>
              </button>

              <button
                onClick={() => handleAction("crop", "tools")}
                className="glass-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-sm">
                  <Crop size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Kırp & Boyutla</span>
                  <span className="text-[10px] text-neutral-400">1:1, 16:9 oranları</span>
                </div>
              </button>

              <button
                onClick={() => handleAction("qr", "tools")}
                className="glass-card p-4 rounded-2xl text-left group flex flex-col justify-between h-24"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-sm">
                  <QrCode size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">QR Kod</span>
                  <span className="text-[10px] text-neutral-400">Oku veya oluştur</span>
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
                "Belge PDF'e Dönüştürüldü",
                `${_info.name} oluşturuldu ve kütüphaneye eklendi.`,
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
              addToast("info", "Kütüphane Temizlendi", "Dönüştürme geçmişi temizlendi.");
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
      <CropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        file={selectedFiles[0] || null}
        onConfirmCrop={handleConfirmCrop}
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
          addToast("success", "QR Kod Oluşturuldu", "QR kod görseli hazırlandı.", res.path);
          return res.path;
        }}
      />

      {/* Glassmorphic Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
