import React, { useState } from "react";
import { FileInfo } from "../types";
import { X, Sparkles, Trash2, Eye, FileText, ExternalLink, Zap, RefreshCw } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useTranslation } from "../i18n/useTranslation";

interface FileChipsProps {
  files: FileInfo[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onOpenWheel: () => void;
  onReveal?: (path: string) => void;
  onDirectConvert?: (format: string) => void;
  isConverting?: boolean;
}

export const FileChips: React.FC<FileChipsProps> = ({
  files,
  onRemove,
  onClearAll,
  onOpenWheel,
  onReveal,
  onDirectConvert,
  isConverting = false,
}) => {
  const { t, language } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (files.length === 0) return null;

  const isImageFile = (ext: string) => {
    return ["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].includes(ext.toLowerCase());
  };

  const getDocBadge = (ext: string) => {
    const e = ext.toLowerCase();
    if (["docx", "doc", "rtf"].includes(e)) {
      return { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500", label: "WORD" };
    }
    if (["pptx", "ppt"].includes(e)) {
      return { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-500", label: "PPT" };
    }
    if (["xlsx", "xls", "csv"].includes(e)) {
      return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500", label: "EXCEL" };
    }
    if (e === "pdf") {
      return { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-500", label: "PDF" };
    }
    return { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-500", label: ext.toUpperCase() };
  };

  return (
    <>
      <div className="w-full mt-4 p-4 rounded-2xl apple-card animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--apple-border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--apple-text-primary)] tracking-wide">
              {language === "tr" ? "Seçilen Dosyalar" : "Selected Files"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--apple-accent-light)] text-[var(--apple-accent)] border border-[var(--apple-accent)]/20">
              {files.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenWheel}
              className="apple-button-accent flex items-center gap-1.5 px-3 py-1 text-xs shadow-sm"
              title="Ctrl + Space"
            >
              <Sparkles size={13} />
              <span>{t("openWheelBtn")}</span>
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-[var(--apple-text-tertiary)] hover:text-rose-500 transition-colors"
              title={language === "tr" ? "Tümünü Temizle" : "Clear All"}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Direct Action 1-Click Convert Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 p-2.5 rounded-xl bg-[var(--apple-bg-secondary)] border border-[var(--apple-border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-secondary)] font-semibold">
            {isConverting ? (
              <RefreshCw size={13} className="text-[var(--apple-accent)] animate-spin" />
            ) : (
              <Zap size={14} className="text-[var(--apple-accent)]" />
            )}
            <span>
              {isConverting
                ? (language === "tr" ? "Dönüştürülüyor..." : "Converting...")
                : (language === "tr" ? "Hızlı Dönüştür:" : "Quick Convert:")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onDirectConvert?.("webp")}
              disabled={isConverting}
              className="apple-button px-2.5 py-1 text-xs font-semibold text-emerald-500 hover:border-emerald-500/40"
            >
              WebP
            </button>
            <button
              type="button"
              onClick={() => onDirectConvert?.("png")}
              disabled={isConverting}
              className="apple-button px-2.5 py-1 text-xs font-semibold text-blue-500 hover:border-blue-500/40"
            >
              PNG
            </button>
            <button
              type="button"
              onClick={() => onDirectConvert?.("pdf")}
              disabled={isConverting}
              className="apple-button px-2.5 py-1 text-xs font-semibold text-rose-500 hover:border-rose-500/40"
            >
              PDF
            </button>
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {files.map((file, idx) => {
            const isImg = isImageFile(file.extension);
            const docBadge = getDocBadge(file.extension);
            const imgSrc = isImg
              ? file.path.startsWith("http")
                ? file.path
                : convertFileSrc(file.path)
              : null;

            return (
              <div
                key={`${file.path}-${idx}`}
                className="group relative flex items-center gap-3 p-2 rounded-xl apple-card hover:bg-[var(--apple-bg-card-hover)] transition-all"
              >
                {/* Visual Thumbnail or Document Icon */}
                {isImg && imgSrc ? (
                  <div
                    onClick={() => setPreviewImage(imgSrc)}
                    className="relative w-11 h-11 rounded-lg overflow-hidden bg-black/20 border border-[var(--apple-border)] shrink-0 cursor-zoom-in group/thumb"
                  >
                    <img
                      src={imgSrc}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye size={13} className="text-white drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 border ${docBadge.bg} ${docBadge.border} ${docBadge.text}`}
                  >
                    <FileText size={16} />
                    <span className="text-[8px] font-black tracking-tighter mt-0.5">
                      {docBadge.label.substring(0, 4)}
                    </span>
                  </div>
                )}

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--apple-text-primary)] truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[var(--apple-text-tertiary)]">
                    <span className="font-mono">{file.formatted_size}</span>
                    {file.width && file.height && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{file.width}×{file.height}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="uppercase text-[9px] font-bold">
                      {file.extension}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {onReveal && (
                    <button
                      type="button"
                      onClick={() => onReveal(file.path)}
                      className="p-1 rounded-lg text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-bg-control)] transition-colors"
                      title={t("showInFolder")}
                    >
                      <ExternalLink size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1 rounded-lg text-[var(--apple-text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <span className="text-xs text-neutral-400 mt-3 font-medium">
              {language === "tr" ? "Kapatmak için tıklayın" : "Click anywhere to close"}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
