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
} from "../services/api";
import { playSuccessChime } from "../utils/sound";
import confetti from "canvas-confetti";

export const FloatingWheelWindow: React.FC = () => {
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

  const [droppedFile, setDroppedFile] = useState<FileInfo | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Set transparent window styles on mount
  useEffect(() => {
    document.documentElement.classList.add("wheel-window");
    document.body.classList.add("wheel-window");
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";

    // Listen for storage events if user changed profile in main window
    const handleStorage = () => {
      const p = (localStorage.getItem("fig_active_profile") as WheelProfileId) || "design";
      setActiveProfile(p);
      const s = localStorage.getItem("fig_custom_slices");
      if (s) {
        try {
          setCustomSlices(JSON.parse(s));
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleClose = async () => {
    try {
      await hideWheel();
    } catch (err) {
      console.error("Failed to hide wheel:", err);
    }
  };

  const handleCycleProfile = () => {
    const order: WheelProfileId[] = ["design", "office", "dev", "custom"];
    const currIdx = order.indexOf(activeProfile);
    const nextIdx = (currIdx + 1) % order.length;
    const nextProfile = order[nextIdx];
    setActiveProfile(nextProfile);
    localStorage.setItem("fig_active_profile", nextProfile);
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

  const handleSelectAction = async (actionId: string, _category: WheelMode) => {
    // 1. Standalone actions that don't strictly require a dropped file
    if (actionId === "terminal") {
      await openInTerminal(droppedFile ? droppedFile.path : "");
      await handleClose();
      return;
    }

    if (actionId === "copy_path") {
      if (droppedFile) {
        navigator.clipboard.writeText(droppedFile.path);
        playSuccessChime();
        setStatusMessage("Yol kopyalandı!");
      }
      setTimeout(handleClose, 400);
      return;
    }

    if (actionId === "reveal") {
      if (droppedFile) {
        await revealInExplorer(droppedFile.path);
      }
      await handleClose();
      return;
    }

    // 2. Modals (Crop, Compress, QR) -> open in main dashboard
    if (actionId === "crop" || actionId === "compress" || actionId === "qr" || actionId === "info") {
      await showMainWindow();
      await handleClose();
      return;
    }

    // 3. Document Conversions (Word, PPT, Excel, Text -> PDF)
    if (
      actionId === "docx_pdf" ||
      actionId === "pptx_pdf" ||
      actionId === "xlsx_pdf" ||
      actionId === "txt_pdf"
    ) {
      if (!droppedFile) {
        // Direct to Documents tab in main window
        await showMainWindow();
        await handleClose();
        return;
      }

      try {
        setStatusMessage("Dönüştürülüyor...");
        await convertDocument(droppedFile.path, "pdf");
        playSuccessChime();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
        setStatusMessage("PDF Hazır!");
        setTimeout(handleClose, 800);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // 4. Image Conversions
    if (actionId === "webp" || actionId === "png" || actionId === "jpg" || actionId === "bmp") {
      if (!droppedFile) {
        await showMainWindow();
        await handleClose();
        return;
      }

      try {
        setStatusMessage(`${actionId.toUpperCase()} yapılıyor...`);
        await convertImage(droppedFile.path, actionId, 85);
        playSuccessChime();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
        setStatusMessage("Dönüştürüldü!");
        setTimeout(handleClose, 800);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // 5. Combine images to PDF
    if (actionId === "img_pdf" || actionId === "pdf") {
      if (!droppedFile) {
        await showMainWindow();
        await handleClose();
        return;
      }

      try {
        setStatusMessage("PDF oluşturuluyor...");
        await createPdfFromImages([droppedFile.path]);
        playSuccessChime();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
        setStatusMessage("PDF Hazır!");
        setTimeout(handleClose, 800);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // Fallback: Show main window
    await showMainWindow();
    await handleClose();
  };

  const activeItems =
    activeProfile === "custom"
      ? customSlices
      : PRESET_PROFILES[activeProfile]?.items || PRESET_PROFILES.design.items;

  const profileDisplayName = PRESET_PROFILES[activeProfile]?.name || "Özel Çark";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent select-none">
      {statusMessage && (
        <div className="absolute top-2 z-50 px-3 py-1 rounded-full bg-black/85 border border-amber-400/30 text-amber-300 text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in">
          {statusMessage}
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
        onFileDrop={handleFileDrop}
      />
    </div>
  );
};
