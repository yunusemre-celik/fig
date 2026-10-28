import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium ${
            toast.type === "success"
              ? "bg-[#10221A]/90 border-emerald-500/30 text-emerald-200"
              : toast.type === "error"
              ? "bg-[#2A1215]/90 border-rose-500/30 text-rose-200"
              : "bg-[#131B2E]/90 border-blue-500/30 text-blue-200"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === "info" && <Info size={16} className="text-blue-400 shrink-0" />}

          <span>{toast.text}</span>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors ml-2"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};
