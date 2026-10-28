import React from "react";
import { FileInfo } from "../types";
import { X, FileImage, Sparkles, Trash2 } from "lucide-react";

interface FileChipsProps {
  files: FileInfo[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onOpenWheel: () => void;
}

export const FileChips: React.FC<FileChipsProps> = ({
  files,
  onRemove,
  onClearAll,
  onOpenWheel,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full mt-4 p-4 rounded-2xl bg-[#121722]/60 border border-white/[0.08] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-200">
            Seçilen Dosyalar ({files.length})
          </span>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWheel}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-sm shadow-amber-500/20"
          >
            <Sparkles size={13} />
            <span>İşlem Çarkı</span>
          </button>
          <button
            onClick={onClearAll}
            className="p-1 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-rose-400 transition-colors"
            title="Listeyi Temizle"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
        {files.map((file, idx) => (
          <div
            key={`${file.path}-${idx}`}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <FileImage size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-200 truncate">{file.name}</p>
                <p className="text-[10px] text-neutral-500">
                  {file.formatted_size} {file.width && file.height ? `• ${file.width}×${file.height}px` : ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => onRemove(idx)}
              className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.1] transition-colors shrink-0"
              title="Kaldır"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
