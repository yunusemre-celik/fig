import React, { useState, useEffect, useCallback } from "react";
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
  getSelectedExplorerFiles,
} from "../services/api";
import { playSuccessChime } from "../utils/sound";
import confetti from "canvas-confetti";
import { FolderOpen, ExternalLink, Files } from "lucide-react";

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

  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);

  // Auto-detect currently selected files in Windows Explorer or on the Desktop
  const refreshExplorerSelection = useCallback(async () => {
    try {
      const paths = await getSelectedExplorerFiles();
      if (paths && paths.length > 0) {
        const infoList: FileInfo[] = [];
        for (const p of paths) {
          try {
            const info = await getFileInfo(p);
            infoList.push(info);
          } catch {
            infoList.push({
              name: p.split("\\").pop() || p,
              path: p,
              size: 0,
              formatted_size: "",
              extension: p.split(".").pop() || "",
              modified: "Şimdi",
            });
          }
        }
        setSelectedFiles(infoList);
        if (infoList.length === 1) {
          setStatusMessage(`${infoList[0].name} seçili`);
        } else {
          setStatusMessage(`${infoList.length} Dosya Seçili`);
        }
      } else {
        setSelectedFiles([]);
        setStatusMessage(null);
      }
    } catch (err) {
      console.warn("Failed to read explorer selection:", err);
    }
  }, []);

  // Set transparent window styles & listeners
  useEffect(() => {
    document.documentElement.classList.add("wheel-window");
    document.body.classList.add("wheel-window");
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";

    // Immediate check for selected explorer files on popup
    refreshExplorerSelection();

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

    const handleFocus = () => {
      refreshExplorerSelection();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshExplorerSelection]);

  const handleClose = async () => {
    try {
      await hideWheel();
      setStatusMessage(null);
      setLastOutputPath(null);
      setSelectedFiles([]);
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

  const getFilterForAction = (id: string): string => {
    if (id.includes("docx") || id.includes("doc")) return "doc";
    if (id.includes("pptx") || id.includes("ppt")) return "ppt";
    if (id.includes("xlsx") || id.includes("xls")) return "xls";
    if (id.includes("pdf") || id === "img_pdf") return "image";
    if (id === "webp" || id === "png" || id === "jpg" || id === "bmp" || id === "crop" || id === "compress") return "image";
    return "all";
  };

  const handleSelectAction = async (actionId: string, _category: WheelMode) => {
    // 1. Terminal action
    if (actionId === "terminal") {
      const folderPath = selectedFiles.length > 0 ? selectedFiles[0].path : "";
      await openInTerminal(folderPath);
      await handleClose();
      return;
    }

    // 2. Ensure target files: use selectedFiles from Windows Explorer, or prompt file picker
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

    // 3. Simple utility actions
    if (actionId === "copy_path") {
      const pathsJoined = files.map((f) => f.path).join("\n");
      await navigator.clipboard.writeText(pathsJoined);
      playSuccessChime();
      setStatusMessage(files.length === 1 ? "Yol Kopyalandı!" : `${files.length} Yol Kopyalandı!`);
      setTimeout(handleClose, 900);
      return;
    }

    if (actionId === "reveal") {
      await revealInExplorer(files[0].path);
      await handleClose();
      return;
    }

    // 4. Modals (Crop, Compress, QR, Info) -> open main dashboard with files
    if (actionId === "crop" || actionId === "compress" || actionId === "qr" || actionId === "info") {
      await showMainWindow();
      await handleClose();
      return;
    }

    // 5. Image to PDF / Multi-image Combine into 1 PDF
    if (actionId === "img_pdf" || (actionId === "pdf" && files.every((f) => ["png", "jpg", "jpeg", "webp", "bmp"].includes(f.extension.toLowerCase())))) {
      try {
        setStatusMessage(files.length > 1 ? `${files.length} Görsel PDF Yapılıyor...` : "PDF Yapılıyor...");
        const res = await createPdfFromImages(files.map((f) => f.path));
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

    // 6. Document Conversions (Word, PPT, Excel -> PDF)
    if (
      actionId === "docx_pdf" ||
      actionId === "pptx_pdf" ||
      actionId === "xlsx_pdf" ||
      actionId === "txt_pdf" ||
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
        }
        setTimeout(handleClose, 1600);
      } catch (err) {
        setStatusMessage(`Hata: ${err}`);
      }
      return;
    }

    // 7. Image Conversions (WebP, PNG, JPG, BMP)
    if (actionId === "webp" || actionId === "png" || actionId === "jpg" || actionId === "bmp") {
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
        }
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
          {selectedFiles.length > 1 && <Files size={12} className="text-amber-400" />}
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
        selectedFileNames={selectedFiles.map((f) => f.name)}
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
