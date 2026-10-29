import React, { useState } from "react";
import { FileInfo } from "../types";
import { X, Sparkles, Trash2, Eye, FileText, ExternalLink } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";

interface FileChipsProps {
  files: FileInfo[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onOpenWheel: () => void;
  onReveal?: (path: string) => void;
}

export const FileChips: React.FC<FileChipsProps> = ({
  files,
  onRemove,
  onClearAll,
  onOpenWheel,
  onReveal,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (files.length === 0) return null;

  const isImageFile = (ext: string) => {
    return ["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].includes(ext.toLowerCase());
  };

  const getDocBadge = (ext: string) => {
    const e = ext.toLowerCase();
    if (["docx", "doc", "rtf"].includes(e)) {
      return { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", label: "WORD" };
    }
    if (["pptx", "ppt"].includes(e)) {
      return { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400", label: "POWERPOINT" };
    }
    if (["xlsx", "xls", "csv"].includes(e)) {
      return { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", label: "EXCEL" };
    }
    if (e === "pdf") {
      return { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-400", label: "PDF" };
    }
    return { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400", label: ext.toUpperCase() };
  };

  return (
    <>
      <div className="w-full mt-4 p-4 rounded-2xl glass-panel animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide">
              Hazır Dosyalar & Ekran Görüntüleri
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {files.length} Dosya
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWheel}
              className="glass-btn-accent flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all shadow-sm"
            >
              <Sparkles size={13} />
              <span>Çark ile İşle</span>
            </button>
            <button
              onClick={onClearAll}
              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition-all"
              title="Tümünü Temizle"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Files & Screenshots Grid with Visual Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {files.map((file, idx) => {
            const isImg = isImageFile(file.extension);
            const docBadge = getDocBadge(file.extension);
            const imgSrc = isImg
              ? file.path.startsWith("blob:") || file.path.startsWith("http")
                ? file.path
                : convertFileSrc(file.path)
              : null;

            return (
              <div
                key={`${file.path}-${idx}`}
                className="group relative flex items-center gap-3 p-2.5 rounded-xl glass-card transition-all"
              >
                {/* Visual Thumbnail or Document Icon */}
                {isImg && imgSrc ? (
                  <div
                    onClick={() => setPreviewImage(imgSrc)}
                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/[0.1] shrink-0 cursor-zoom-in group/thumb shadow-sm"
                  >
                    <img
                      src={imgSrc}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
                      onError={(e) => {
                        // Fallback icon if preview fails
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye size={14} className="text-white drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 border ${docBadge.bg} ${docBadge.border} ${docBadge.text}`}
                  >
                    <FileText size={16} />
                    <span className="text-[8px] font-black tracking-tighter mt-0.5">
                      {docBadge.label.substring(0, 4)}
                    </span>
                  </div>
                )}

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                    <span className="font-mono text-neutral-300">{file.formatted_size}</span>
                    {file.width && file.height && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="text-amber-400/90 font-mono">
                          {file.width}×{file.height}px
                        </span>
                      </>
                    )}
                    <span className="text-white/20">•</span>
                    <span className="uppercase text-[9px] font-bold tracking-wider text-neutral-500">
                      {file.extension}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {onReveal && (
                    <button
                      onClick={() => onReveal(file.path)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Dosya Gezgininde Göster"
                    >
                      <ExternalLink size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(idx)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-white/[0.08] transition-colors"
                    title="Kaldır"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-6 animate-in fade-in zoom-in-95 duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.2] text-white border border-white/[0.2] transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage}
              alt="Önizleme"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/[0.15] shadow-2xl"
            />
            <span className="text-xs text-neutral-400 mt-3 font-medium">
              Kapatmak için herhangi bir yere tıklayın
            </span>
          </div>
        </div>
      )}
    </>
  );
};
