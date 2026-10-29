import { useRef, useState, useEffect } from "react";
import { UploadCloud, FolderPlus } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { FigLogo } from "./FigLogo";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onOpenWheel: () => void;
  hasSelectedFiles: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onOpenWheel,
  hasSelectedFiles,
}) => {
  const { t, language } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  // Clipboard paste detection (Ctrl + V for screenshots)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        onFilesSelected(Array.from(e.clipboardData.files));
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onFilesSelected]);

  return (
    <div className="w-full space-y-4">
      {/* Obsidian Dashed Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer group ${
          isDragOver
            ? "border-[#8493FF] bg-[#8493FF]/10 scale-[1.01]"
            : "border-white/[0.12] bg-[#0C0F1A]/60 hover:border-[#8493FF]/50 hover:bg-[#12162A]/70"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Ambient Glow Center Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#202548] border border-[#8493FF]/30 flex items-center justify-center text-[#8493FF] shadow-lg mb-3.5 group-hover:scale-105 group-hover:border-[#8493FF] transition-all">
          <UploadCloud size={22} />
        </div>

        <h3 className="text-sm font-bold text-white mb-1 tracking-tight">
          {t("dropTitle") || "Drop files anywhere"}
        </h3>
        <p className="text-xs text-[#8E95A8] max-w-md mb-4 leading-relaxed">
          {t("dropSubtitle") || "or click to browse from your computer"}
        </p>

        {/* Supported Format Pills */}
        <div className="flex items-center gap-1.5 mb-4">
          {["PDF", "DOCX", "PNG", "MP4", "+36"].map((ext) => (
            <span
              key={ext}
              className="px-2 py-0.5 rounded text-[9px] font-mono text-[#8E95A8] bg-white/[0.04] border border-white/[0.08]"
            >
              {ext}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="glass-btn flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            <FolderPlus size={14} className="text-[#8493FF]" />
            <span>{language === "tr" ? "Dosya Seç" : "Select Files"}</span>
          </button>

          {hasSelectedFiles && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWheel();
              }}
              className="glass-btn-accent flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-sm cursor-pointer"
            >
              <FigLogo size={14} glow={false} />
              <span>{t("openWheelBtn") || "Trigger Wheel"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Visual User Flow Guide with Hover Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#8493FF]/15 border border-[#8493FF]/25 flex items-center justify-center text-[#8493FF] shrink-0 font-bold text-xs">
            1
          </div>
          <div>
            <span className="font-bold text-xs text-white block">
              {language === "tr" ? "Dosyanı Bırak" : "1. Drop File"}
            </span>
            <span className="text-[10px] text-[#646C7E]">
              {language === "tr" ? "Görsel, SS veya Belge" : "Images, PDFs, Office"}
            </span>
          </div>
        </div>

        <div className="has-tooltip glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#8493FF]/15 border border-[#8493FF]/25 flex items-center justify-center text-[#8493FF] shrink-0 font-bold text-xs">
            2
          </div>
          <div>
            <span className="font-bold text-xs text-white block">
              {language === "tr" ? "Hızlı Çarkı Aç" : "2. Trigger Wheel"}
            </span>
            <span className="text-[10px] text-[#646C7E]">
              {language === "tr" ? "İmleç ucunda anında işlem" : "Instant cursor menu"}
            </span>
          </div>
          <div className="tooltip-bubble">Ctrl + Space</div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#6EE7A8] shrink-0 font-bold text-xs">
            3
          </div>
          <div>
            <span className="font-bold text-xs text-white block">
              {language === "tr" ? "Tek Tıkla Çıktı" : "3. 1-Click Export"}
            </span>
            <span className="text-[10px] text-[#646C7E]">
              {language === "tr" ? "Kusursuz yerel dönüşüm" : "Native & private"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
