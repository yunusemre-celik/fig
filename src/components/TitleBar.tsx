import React, { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, Copy, X } from "lucide-react";

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch {
        // Fallback for non-tauri dev browser mode
      }
    };
    checkMaximized();
  }, [appWindow]);

  const handleMinimize = () => {
    try {
      appWindow.minimize();
    } catch {
      // In browser preview
    }
  };

  const handleMaximize = async () => {
    try {
      if (await appWindow.isMaximized()) {
        await appWindow.unmaximize();
        setIsMaximized(false);
      } else {
        await appWindow.maximize();
        setIsMaximized(true);
      }
    } catch {
      // In browser preview
    }
  };

  const handleClose = () => {
    try {
      appWindow.close();
    } catch {
      // In browser preview
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 w-full flex items-center justify-between px-3 select-none bg-[#111620]/90 backdrop-blur-xl border-b border-white/[0.06] z-50 text-xs"
    >
      {/* Brand & Title */}
      <div className="flex items-center gap-2 pointer-events-none" data-tauri-drag-region>
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
          <span className="text-black font-black text-[11px] leading-none">F</span>
        </div>
        <span className="font-semibold text-neutral-200 tracking-wide text-xs">Fig</span>
        <span className="text-[10px] text-amber-400/80 font-medium px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
          Windows 11
        </span>
      </div>

      {/* Windows 11 Native-Style Window Control Buttons */}
      <div className="flex items-center h-full -mr-3">
        <button
          onClick={handleMinimize}
          className="h-full px-3.5 flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors text-neutral-400 hover:text-white"
          title="Simge Durumuna Küçült"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full px-3.5 flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors text-neutral-400 hover:text-white"
          title={isMaximized ? "Geri Yükle" : "Ekranı Kapla"}
        >
          {isMaximized ? <Copy size={12} className="rotate-180" /> : <Square size={11} />}
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 flex items-center justify-center hover:bg-rose-600 active:bg-rose-700 transition-colors text-neutral-400 hover:text-white"
          title="Kapat"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
