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
          className={`pointer-events-auto p-4 rounded-2xl glass-panel shadow-2xl border animate-in slide-in-from-bottom-4 fade-in duration-200 text-xs ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-[#0E1B15]/90"
              : toast.type === "error"
              ? "border-rose-500/30 bg-[#241114]/90"
              : "border-blue-500/30 bg-[#101726]/90"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                toast.type === "success"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : toast.type === "error"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
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
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed break-words">
                {toast.text}
              </p>

              {/* Action buttons if output path exists */}
              {toast.outputPath && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.08]">
                  {toast.onReveal && (
                    <button
                      onClick={() => toast.onReveal!(toast.outputPath!)}
                      className="glass-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-neutral-200 hover:text-amber-300 hover:border-amber-400/30 transition-all"
                    >
                      <FolderOpen size={12} />
                      <span>Klasörde Göster</span>
                    </button>
                  )}
                  {toast.onOpen && (
                    <button
                      onClick={() => toast.onOpen!(toast.outputPath!)}
                      className="glass-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-neutral-200 hover:text-white transition-all"
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
