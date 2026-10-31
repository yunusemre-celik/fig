import React from "react";
import { CheckCircle2, AlertCircle, Info, X, FolderOpen, ExternalLink } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title?: string;
  text: string;
  outputPath?: string;
  onReveal?: (path: string) => void;
  onOpen?: (path: string) => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border animate-in slide-in-from-bottom-4 fade-in duration-200 text-xs backdrop-blur-2xl ${
            toast.type === "success"
              ? "border-emerald-500/25 bg-[#0C120E]/90 text-emerald-300 shadow-[inset_0_1px_0_0_rgba(52,211,153,0.15)]"
              : toast.type === "error"
              ? "border-rose-500/25 bg-[#140A0D]/90 text-rose-300 shadow-[inset_0_1px_0_0_rgba(248,113,113,0.15)]"
              : "border-white/15 bg-[#0A0C10]/90 text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                toast.type === "success"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : toast.type === "error"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : "bg-white/[0.08] text-white border border-white/15"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 size={16} />}
              {toast.type === "error" && <AlertCircle size={16} />}
              {toast.type === "info" && <Info size={16} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-xs">
                  {toast.title || (toast.type === "success" ? "İşlem Tamamlandı" : toast.type === "error" ? "İşlem Başarısız" : "Bilgi")}
                </span>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>

              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed break-words">
                {toast.text}
              </p>

              {/* Action buttons if output path exists */}
              {toast.outputPath && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.08]">
                  {toast.onReveal && (
                    <button
                      onClick={() => toast.onReveal!(toast.outputPath!)}
                      className="glass-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
                    >
                      <FolderOpen size={12} />
                      <span>Klasörde Göster</span>
                    </button>
                  )}
                  {toast.onOpen && (
                    <button
                      onClick={() => toast.onOpen!(toast.outputPath!)}
                      className="glass-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      <span>Dosyayı Aç</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
