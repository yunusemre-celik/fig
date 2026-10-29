import React, { useState, useEffect } from "react";
import { RadialWheel } from "./RadialWheel";
import { PRESET_PROFILES } from "./WheelStudio";
import { FileInfo, WheelItem, WheelMode, WheelProfileId } from "../types";
import {
  hideWheel,
  showMainWindow,
  convertImage,
  convertDocument,
  createPdfFromImages,
  revealInExplorer,
  openInTerminal,
  getFileInfo,
  pickFileDialog,
  openFile,
} from "../services/api";
import { playSuccessChime } from "../utils/sound";
import confetti from "canvas-confetti";
import { FolderOpen, ExternalLink } from "lucide-react";

export const FloatingWheelWindow: React.FC = () => {
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

  const [droppedFile, setDroppedFile] = useState<FileInfo | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);

  // Set transparent window styles immediately
  useEffect(() => {
    document.documentElement.classList.add("wheel-window");
    document.body.classList.add("wheel-window");
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";

    const handleStorage = () => {
      const p = (localStorage.getItem("fig_active_profile") as WheelProfileId) || "office";
      setActiveProfile(p);
      const s = localStorage.getItem("fig_custom_slices");
      if (s) {
        try {
          setCustomSlices(JSON.parse(s));
        } catch {}
      }
    };

    // Clipboard paste listener (Ctrl + V)
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        handleFileDrop(e.clipboardData.files[0]);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleClose = async () => {
    try {
      await hideWheel();
      setStatusMessage(null);
      setLastOutputPath(null);
    } catch (err) {
      console.error("Failed to hide wheel:", err);
    }
  };

  const handleCycleProfile = (direction: 1 | -1 = 1) => {
    const order: WheelProfileId[] = ["office", "design", "dev", "custom"];
    const currIdx = order.indexOf(activeProfile);
    const nextIdx = (currIdx + direction + order.length) % order.length;
    const nextProfile = order[nextIdx];
    setActiveProfile(nextProfile);
    localStorage.setItem("fig_active_profile", nextProfile);
    window.dispatchEvent(new Event("storage"));
  };

  const handleSelectProfile = (id: WheelProfileId) => {
    setActiveProfile(id);
    localStorage.setItem("fig_active_profile", id);
    window.dispatchEvent(new Event("storage"));
  };

  const handleFileDrop = async (file: File) => {
    const filePath = (file as unknown as { path?: string }).path || file.name;
    try {
      const info = await getFileInfo(filePath);
      setDroppedFile(info);
      setStatusMessage(`${info.name} hazır`);
    } catch {
      setDroppedFile({
        name: file.name,
        path: filePath,
        size: file.size,
        formatted_size: `${Math.round(file.size / 1024)} KB`,
        extension: file.name.split(".").pop() || "",
        modified: "Şimdi",
      });
      setStatusMessage(`${file.name} hazır`);
    }
  };

  const getFilterForAction = (id: string): string => {
    if (id.includes("docx") || id.includes("doc")) return "doc";
    if (id.includes("pptx") || id.includes("ppt")) return "ppt";
    if (id.includes("xlsx") || id.includes("xls")) return "xls";
    if (id.includes("pdf") || id === "img_pdf") return "image";
    if (id === "webp" || id === "png" || id === "jpg" || id === "bmp" || id === "crop" || id === "compress") return "image";
    return "all";
  };

  const handleSelectAction = async (actionId: string, _category: WheelMode) => {
    // 1. Terminal action: open terminal directly
    if (actionId === "terminal") {
      await openInTerminal(droppedFile ? droppedFile.path : "");
      await handleClose();
      return;
    }

    // 2. Ensure target file: use droppedFile or open Windows file picker
    let file = droppedFile;
    if (!file) {
      setStatusMessage("Dosya Seçin...");
      const picked = await pickFileDialog(getFilterForAction(actionId));
      if (!picked) {
        setStatusMessage(null);
        return;
      }
      try {
        file = await getFileInfo(picked);
        setDroppedFile(file);
      } catch {
        file = {
          name: picked.split("\\").pop() || picked,
          path: picked,
          size: 0,
          formatted_size: "",
          extension: picked.split(".").pop() || "",
          modified: "Şimdi",
        };
        setDroppedFile(file);
      }
    }

    if (!file) return;

    // 3. Simple utility actions
    if (actionId === "copy_path") {
      await navigator.clipboard.writeText(file.path);
      playSuccessChime();
      setStatusMessage("Yol Kopyalandı!");
      setTimeout(handleClose, 900);
      return;
    }

    if (actionId === "reveal") {
      await revealInExplorer(file.path);
      await handleClose();
      return;
    }

    // 4. Modals (Crop, Compress, QR, Info) -> launch main dashboard with selected file
    if (actionId === "crop" || actionId === "compress" || actionId === "qr" || actionId === "info") {
      await showMainWindow();
      await handleClose();
      return;
    }

    // 5. Document Conversions (Word, PPT, Excel, Text -> PDF)
    if (
      actionId === "docx_pdf" ||
      actionId === "pptx_pdf" ||
      actionId === "xlsx_pdf" ||
      actionId === "txt_pdf"
    ) {
      try {
        setStatusMessage("PDF Yapılıyor...");
        const res = await convertDocument(file.path, "pdf");
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        setStatusMessage(`Hazır: ${res.name}`);
        setLastOutputPath(res.path);
        setTimeout(handleClose, 1600);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // 6. Image Conversions
    if (actionId === "webp" || actionId === "png" || actionId === "jpg" || actionId === "bmp") {
      try {
        setStatusMessage(`${actionId.toUpperCase()} Yapılıyor...`);
        const res = await convertImage(file.path, actionId, 85);
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        setStatusMessage(`Hazır: ${res.name}`);
        setLastOutputPath(res.path);
        setTimeout(handleClose, 1600);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // 7. Image to PDF
    if (actionId === "img_pdf" || actionId === "pdf") {
      try {
        setStatusMessage("PDF Yapılıyor...");
        const res = await createPdfFromImages([file.path]);
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        setStatusMessage(`Hazır: ${res.name}`);
        setLastOutputPath(res.path);
        setTimeout(handleClose, 1600);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // Fallback: show main window
    await showMainWindow();
    await handleClose();
  };

  const activeItems =
    activeProfile === "custom"
      ? customSlices
      : PRESET_PROFILES[activeProfile]?.items || PRESET_PROFILES.office.items;

  const profileDisplayName = PRESET_PROFILES[activeProfile]?.name || "Ofis & Belgeler";

  return (
    <div className="w-[460px] h-[460px] flex items-center justify-center bg-transparent select-none overflow-hidden relative">
      {/* Floating Status Notification Pill */}
      {statusMessage && (
        <div className="absolute top-2 z-50 px-3.5 py-1.5 rounded-full glass-panel border border-amber-400/40 text-amber-300 text-[11px] font-bold shadow-2xl backdrop-blur-2xl animate-in fade-in flex items-center gap-2">
          <span>{statusMessage}</span>
          {lastOutputPath && (
            <div className="flex items-center gap-1.5 ml-1 border-l border-white/20 pl-2">
              <button
                type="button"
                onClick={() => revealInExplorer(lastOutputPath)}
                className="hover:text-white p-0.5"
                title="Klasörde Göster"
              >
                <FolderOpen size={12} />
              </button>
              <button
                type="button"
                onClick={() => openFile(lastOutputPath)}
                className="hover:text-white p-0.5"
                title="Dosyayı Aç"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      <RadialWheel
        isOpen={true}
        onClose={handleClose}
        onSelectAction={handleSelectAction}
        selectedFileNames={droppedFile ? [droppedFile.name] : []}
        customItems={activeItems}
        isStandalone={true}
        profileName={profileDisplayName}
        onCycleProfile={handleCycleProfile}
        onSelectProfile={handleSelectProfile}
        onFileDrop={handleFileDrop}
      />
    </div>
  );
};
