import { useRef, useState } from "react";
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer group ${
        isDragOver
          ? "border-amber-400 bg-amber-400/[0.08] scale-[1.01] shadow-2xl shadow-amber-500/10"
          : "border-white/[0.1] hover:border-amber-400/40 bg-[#121722]/50 hover:bg-[#151C2A]/60"
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

      {/* Floating Fruit/Cloud Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
        <UploadCloud size={32} />
      </div>

      <h3 className="text-base font-semibold text-neutral-100 mb-1">
        Dosyaları buraya sürükleyip bırakın
      </h3>
      <p className="text-xs text-neutral-400 max-w-sm mb-4">
        Görseller (PNG, JPG, WebP, BMP), PDF veya metin dosyaları. Panodan yapıştırmak için <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-300 font-mono text-[10px]">Ctrl+V</kbd> kullanabilirsiniz.
      </p>

      {/* Quick Action Badges */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-neutral-200 transition-colors"
        >
          <FolderPlus size={14} className="text-amber-400" />
          <span>Göz At (Ctrl+O)</span>
        </button>

        {hasSelectedFiles && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWheel();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 hover:scale-105"
          >
            <Sparkles size={14} />
            <span>Çarkı Aç (Ctrl+Space)</span>
          </button>
        )}
      </div>
    </div>
  );
};
