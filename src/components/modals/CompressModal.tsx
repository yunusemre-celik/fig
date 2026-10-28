import React, { useState } from "react";
import { X, Minimize2, Check, Zap } from "lucide-react";
import { FileInfo } from "../../types";

interface CompressModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo | null;
  onConfirmCompress: (quality: number, maxWidth?: number) => void;
}

export const CompressModal: React.FC<CompressModalProps> = ({
  isOpen,
  onClose,
  file,
  onConfirmCompress,
}) => {
  const [quality, setQuality] = useState<number>(80);
  const [scale, setScale] = useState<number>(100);

  if (!isOpen || !file) return null;

  // Estimate new file size
  const estimatedSavings = Math.round((1 - (quality / 100) * (scale / 100)) * 70);

  const handleSave = () => {
    let maxWidth: number | undefined;
    if (file.width && scale < 100) {
      maxWidth = Math.round(file.width * (scale / 100));
    }
    onConfirmCompress(quality, maxWidth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-[520px] max-w-[92vw] bg-[#141A24] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Minimize2 size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-100">Görseli Sıkıştır</h3>
              <p className="text-[11px] text-neutral-400">{file.name} ({file.formatted_size})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[#0F141D]">
          {/* Quality Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-200">Görsel Kalitesi</label>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                %{quality}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>Düşük Boyut (20%)</span>
              <span>Dengeli (80%)</span>
              <span>Yüksek Kalite (95%)</span>
            </div>
          </div>

          {/* Scale Resolution Presets */}
          <div>
            <label className="text-xs font-semibold text-neutral-200 block mb-2">Çözünürlük Ölçeği</label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 75, 50, 25].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    scale === s
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white"
                  }`}
                >
                  {s === 100 ? "Orijinal" : `%${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Savings Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap size={18} />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-emerald-300 block">Tahmini Tasarruf: ~%{Math.max(10, estimatedSavings)}</span>
              <span className="text-[11px] text-neutral-400">
                Gözle fark edilmeyecek kalite kaybıyla dosya boyutu ciddi oranda küçültülür.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-white/[0.08] bg-[#141A24]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Check size={14} />
            Sıkıştır & Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
