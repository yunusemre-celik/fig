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
      <div className="relative w-[520px] max-w-[92vw] bg-[#0A0C10]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
              <Minimize2 size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-100">Görseli Sıkıştır</h3>
              <p className="text-[11px] text-zinc-400">{file.name} ({file.formatted_size})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quality Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-200">Görsel Kalitesi</label>
              <span className="text-xs font-mono font-bold text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded">
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
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>Düşük Boyut (20%)</span>
              <span>Dengeli (80%)</span>
              <span>Yüksek Kalite (95%)</span>
            </div>
          </div>

          {/* Scale Resolution Presets */}
          <div>
            <label className="text-xs font-semibold text-zinc-200 block mb-2">Çözünürlük Ölçeği</label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 75, 50, 25].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    scale === s
                      ? "bg-white/[0.12] border-white/30 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                      : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white"
                  }`}
                >
                  {s === 100 ? "Orijinal" : `%${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Savings Card */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap size={18} />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-emerald-300 block">Tahmini Tasarruf: ~%{Math.max(10, estimatedSavings)}</span>
              <span className="text-[11px] text-zinc-400">
                Gözle fark edilmeyecek kalite kaybıyla dosya boyutu ciddi oranda küçültülür.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-white/[0.08] bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check size={14} />
            Sıkıştır & Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
