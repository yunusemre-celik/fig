import { useRef, useState, useEffect } from "react";
import { UploadCloud, FolderPlus, Sparkles } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";

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
      {/* Apple Minimalist Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer group apple-card ${
          isDragOver
            ? "border-[var(--apple-accent)] bg-[var(--apple-accent-light)] scale-[1.01]"
            : "border-[var(--apple-border)] hover:border-[var(--apple-accent)]/50 hover:bg-[var(--apple-bg-card-hover)]"
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

        {/* Apple Minimal Icon */}
        <div className="relative mb-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--apple-accent-light)] border border-[var(--apple-accent)]/20 flex items-center justify-center text-[var(--apple-accent)] group-hover:scale-105 transition-transform duration-200">
            <UploadCloud size={28} />
          </div>
        </div>

        <h3 className="text-sm font-bold text-[var(--apple-text-primary)] mb-1 tracking-tight">
          {t("dropTitle")}
        </h3>
        <p className="text-xs text-[var(--apple-text-secondary)] max-w-md mb-4 leading-relaxed">
          {t("dropSubtitle")}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="apple-button flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          >
            <FolderPlus size={14} className="text-[var(--apple-accent)]" />
            <span>{language === "tr" ? "Dosya Seç" : "Select Files"}</span>
          </button>

          {hasSelectedFiles && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWheel();
              }}
              className="apple-button-accent flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-sm"
            >
              <Sparkles size={14} />
              <span>{t("openWheelBtn")}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Visual User Flow Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
        <div className="apple-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--apple-accent-light)] border border-[var(--apple-accent)]/20 flex items-center justify-center text-[var(--apple-accent)] shrink-0 font-bold text-xs">
            1
          </div>
          <div>
            <span className="font-bold text-xs text-[var(--apple-text-primary)] block">
              {language === "tr" ? "Dosyanı Bırak" : "1. Drop File"}
            </span>
            <span className="text-[10px] text-[var(--apple-text-tertiary)]">
              {language === "tr" ? "Görsel, SS veya Belge" : "Images, PDFs, Office"}
            </span>
          </div>
        </div>

        <div className="apple-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--apple-accent-light)] border border-[var(--apple-accent)]/20 flex items-center justify-center text-[var(--apple-accent)] shrink-0 font-bold text-xs">
            2
          </div>
          <div>
            <span className="font-bold text-xs text-[var(--apple-text-primary)] block">
              {language === "tr" ? "Hızlı Çarkı Aç" : "2. Trigger Wheel"}
            </span>
            <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
              Ctrl + Space
            </span>
          </div>
        </div>

        <div className="apple-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 font-bold text-xs">
            3
          </div>
          <div>
            <span className="font-bold text-xs text-[var(--apple-text-primary)] block">
              {language === "tr" ? "Tek Tıkla Çıktı" : "3. 1-Click Export"}
            </span>
            <span className="text-[10px] text-[var(--apple-text-tertiary)]">
              {language === "tr" ? "Kusursuz yerel dönüşüm" : "Native & private"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
