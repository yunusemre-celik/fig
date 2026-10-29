import { useRef, useState, useEffect } from "react";
import { UploadCloud, FolderPlus, Sparkles } from "lucide-react";

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
      {/* The Glass Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-3xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center justify-center text-center cursor-pointer group glass-panel ${
          isDragOver
            ? "border-amber-400/80 bg-amber-400/[0.08] scale-[1.01] shadow-2xl shadow-amber-500/15"
            : "border-white/[0.12] hover:border-amber-400/50 hover:bg-white/[0.05]"
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

        {/* Glowing Icon */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full group-hover:bg-amber-400/30 transition-all" />
          <div className="relative w-16 h-16 rounded-2xl glass-panel border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xl group-hover:scale-110 transition-transform duration-300">
            <UploadCloud size={30} />
          </div>
        </div>

        <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">
          Görselleri, Ekran Görüntülerini veya Belgeleri Bırakın
        </h3>
        <p className="text-xs text-neutral-400 max-w-md mb-5 leading-relaxed">
          PNG, JPG, WebP, Word, PPT veya Excel dosyalarını sürükleyin. Panodaki ekran görüntülerini doğrudan <kbd>Ctrl + V</kbd> ile yapıştırabilirsiniz.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="glass-btn flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:text-white transition-all"
          >
            <FolderPlus size={15} className="text-amber-400" />
            <span>Dosya Seç</span>
          </button>

          {hasSelectedFiles && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWheel();
              }}
              className="glass-btn-accent flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md"
            >
              <Sparkles size={14} />
              <span>İmleçte Çarkı Aç</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Visual User Flow Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs">
            1
          </div>
          <div>
            <span className="font-bold text-xs text-white block">Dosyanı Bırak</span>
            <span className="text-[10px] text-neutral-400">Görsel, SS veya Belge</span>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs">
            2
          </div>
          <div>
            <span className="font-bold text-xs text-white block">Hızlı Çarkı Aç</span>
            <span className="text-[10px] text-neutral-400">Ctrl + Space ile imleçte</span>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">
            3
          </div>
          <div>
            <span className="font-bold text-xs text-white block">Tek Tıkla Çıktı</span>
            <span className="text-[10px] text-neutral-400">Kusursuz yerel dönüşüm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
