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
} from "./services/api";
import { Sparkles, FileImage, Crop, QrCode, FileText, ArrowRight } from "lucide-react";

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

  // Wheel Studio profiles state
  const [activeProfile, setActiveProfile] = useState<WheelProfileId>(() => {
    return (localStorage.getItem("fig_active_profile") as WheelProfileId) || "design";
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
    addToast("info", `Aktif Profil: ${PRESET_PROFILES[id].name}`);
  };

  const handleUpdateCustomSlices = (slices: WheelItem[]) => {
    setCustomSlices(slices);
    localStorage.setItem("fig_custom_slices", JSON.stringify(slices));
  };

  const addToast = (type: "success" | "error" | "info", text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
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
    addToast("info", `${newFiles.length} dosya eklendi.`);
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
        setIsWheelOpen((prev) => !prev);
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

  // Action execution from wheel or quick buttons
  const handleAction = async (actionId: string, category: WheelMode) => {
    if (category === "documents" || actionId.endsWith("_pdf")) {
      if (actionId === "img_pdf" || actionId === "pdf") {
        if (selectedFiles.length === 0) {
          addToast("error", "Lütfen önce dönüştürülecek görselleri seçin.");
          return;
        }
        try {
          const res = await createPdfFromImages(selectedFiles.map((f) => f.path));
          playSuccessChime();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          addToast("success", `PDF başarıyla oluşturuldu: ${res.name}`);
          loadLibrary();
        } catch (err) {
          addToast("error", `PDF oluşturulamadı: ${err}`);
        }
        return;
      }

      // Office Document conversion
      if (selectedFiles.length === 0) {
        setActiveTab("documents");
        addToast("info", "Dönüştürmek istediğiniz Word, PPT veya Excel belgesini seçin.");
        return;
      }

      let successCount = 0;
      for (const file of selectedFiles) {
        try {
          await convertDocument(file.path, "pdf");
          successCount++;
        } catch (err) {
          console.error(err);
        }
      }

      if (successCount > 0) {
        playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
        addToast("success", `${successCount} belge PDF formatına dönüştürüldü!`);
        loadLibrary();
      } else {
        addToast("error", "Belge dönüştürme sırasında bir hata oluştu.");
      }
      return;
    }

    if (category === "convert") {
      if (selectedFiles.length === 0) {
        addToast("error", "Lütfen önce dönüştürülecek görselleri seçin.");
        return;
      }

      let successCount = 0;
      for (const file of selectedFiles) {
        try {
          await convertImage(file.path, actionId, 85);
          successCount++;
        } catch (err) {
          console.error(err);
        }
      }

      if (successCount > 0) {
        playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
        addToast(
          "success",
          `${successCount} dosya ${actionId.toUpperCase()} formatına dönüştürüldü!`
        );
        loadLibrary();
      } else {
        addToast("error", "Dönüştürme sırasında bir hata oluştu.");
      }
    } else if (category === "tools") {
      if (actionId === "crop") {
        if (selectedFiles.length === 0) {
          addToast("error", "Lütfen kırpılacak bir görsel seçin.");
          return;
        }
        setIsCropOpen(true);
      } else if (actionId === "compress") {
        if (selectedFiles.length === 0) {
          addToast("error", "Lütfen sıkıştırılacak bir görsel seçin.");
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
            `${f.name} • ${f.formatted_size} • ${f.width || "?"}×${f.height || "?"}px`
          );
        }
      }
    } else if (category === "actions") {
      if (selectedFiles.length === 0) {
        if (actionId === "terminal") {
          openInTerminal("");
          addToast("info", "PowerShell terminali açılıyor...");
          return;
        }
        addToast("error", "Lütfen bir dosya seçin.");
        return;
      }
      const first = selectedFiles[0];
      if (actionId === "copy_path") {
        navigator.clipboard.writeText(first.path);
        addToast("success", "Dosya yolu panoya kopyalandı!");
      } else if (actionId === "reveal") {
        revealInExplorer(first.path);
        addToast("info", "Dosya Gezgini açılıyor...");
      } else if (actionId === "terminal") {
        openInTerminal(first.path);
        addToast("info", "PowerShell terminali açılıyor...");
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
      addToast("success", `Görsel kırpıldı: ${res.name}`);
      loadLibrary();
    } catch (err) {
      addToast("error", `Kırpma hatası: ${err}`);
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
      addToast("success", `Görsel sıkıştırıldı: ${res.name}`);
      loadLibrary();
    } catch (err) {
      addToast("error", `Sıkıştırma hatası: ${err}`);
    }
  };

  const currentWheelItems =
    activeProfile === "custom"
      ? customSlices
      : PRESET_PROFILES[activeProfile]?.items || PRESET_PROFILES.design.items;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Brand Top Header */}
      <div className="h-10 w-full flex items-center justify-between px-5 bg-[#101520] border-b border-white/[0.08] select-none text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
            <span className="text-black font-black text-[11px] leading-none">F</span>
          </div>
          <span className="font-bold text-neutral-100 tracking-wide text-xs">Fig</span>
          <span className="text-[10px] text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            Windows 11 Dosya Araç Kiti
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="text-neutral-400">Profil:</span>
            <span className="text-amber-400 font-semibold">{PRESET_PROFILES[activeProfile]?.name}</span>
          </span>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1.5">
            <span>Hızlı Çark:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-amber-300 font-mono text-[10px]">
              Ctrl + Space
            </kbd>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenWheel={() => setIsWheelOpen(true)}
        libraryCount={libraryEntries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === "home" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center max-w-4xl w-full mx-auto">
            {/* Hero Brand Card */}
            <div className="w-full text-center my-3 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-2">
                <Sparkles size={13} />
                <span>Hızlı, Yerel ve Güvenli Dosya Kiti</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Dosyaların için <span className="text-amber-400">tatlı bir kolaylık.</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Görselleri ve ofis belgelerini anında dönüştürün, kırpın veya fare imlecinizin ucundaki çark ile tek tıkla işleyin.
              </p>
            </div>

            {/* Drop Zone */}
            <div className="w-full max-w-2xl mt-1">
              <DropZone
                onFilesSelected={handleFilesSelected}
                onOpenWheel={() => setIsWheelOpen(true)}
                hasSelectedFiles={selectedFiles.length > 0}
              />

              {/* Selected Files */}
              <FileChips
                files={selectedFiles}
                onRemove={(idx) =>
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                onClearAll={() => setSelectedFiles([])}
                onOpenWheel={() => setIsWheelOpen(true)}
              />
            </div>

            {/* Quick Action Cards */}
            <div className="w-full max-w-2xl mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleAction("webp", "convert")}
                className="p-3.5 rounded-2xl bg-[#121722]/60 hover:bg-[#1A2232] border border-white/[0.08] hover:border-amber-400/40 transition-all text-left group flex flex-col justify-between h-24"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <FileImage size={16} />
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">WebP'ye Çevir</span>
                  <span className="text-[10px] text-neutral-400">Web için %70 hafif</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className="p-3.5 rounded-2xl bg-[#121722]/60 hover:bg-[#1A2232] border border-white/[0.08] hover:border-blue-400/40 transition-all text-left group flex flex-col justify-between h-24"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-white block">Belgeler</span>
                    <span className="text-[10px] text-neutral-400">Word, PPT → PDF</span>
                  </div>
                  <ArrowRight size={13} className="text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              <button
                onClick={() => handleAction("crop", "tools")}
                className="p-3.5 rounded-2xl bg-[#121722]/60 hover:bg-[#1A2232] border border-white/[0.08] hover:border-amber-400/40 transition-all text-left group flex flex-col justify-between h-24"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Crop size={16} />
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">Kırp & Boyutla</span>
                  <span className="text-[10px] text-neutral-400">1:1, 16:9 oranları</span>
                </div>
              </button>

              <button
                onClick={() => handleAction("qr", "tools")}
                className="p-3.5 rounded-2xl bg-[#121722]/60 hover:bg-[#1A2232] border border-white/[0.08] hover:border-purple-400/40 transition-all text-left group flex flex-col justify-between h-24"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <QrCode size={16} />
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">QR Kod</span>
                  <span className="text-[10px] text-neutral-400">Oku veya oluştur</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentsView
            onSuccess={(_info) => {
              addToast("success", "Belge dönüştürüldü ve kütüphaneye eklendi!");
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
              addToast("info", "Kütüphane geçmişi temizlendi.");
            }}
          />
        )}

        {activeTab === "settings" && <SettingsView />}
      </main>

      {/* The Radial Action Wheel */}
      <RadialWheel
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onSelectAction={handleAction}
        selectedFileNames={selectedFiles.map((f) => f.name)}
        customItems={currentWheelItems}
        profileName={PRESET_PROFILES[activeProfile]?.name}
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
          return res.path;
        }}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
