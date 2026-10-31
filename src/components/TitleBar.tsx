import React, { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Minus,
  Square,
  Copy,
  X,
  ChevronDown,
  Sparkles,
  FolderOpen,
  Folder,
  Sliders,
  FileText,
  Image as ImageIcon,
  Settings,
  LogOut,
  AppWindow,
} from "lucide-react";
import { FigLogo } from "./FigLogo";
import { TabType } from "../types";
import {
  windowMinimize,
  windowToggleMaximize,
  windowClose,
  appExit,
} from "../services/api";

interface TitleBarProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onOpenWheel?: () => void;
  onPickFiles?: () => void;
  onOpenImageStudio?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  activeTab = "home",
  onTabChange,
  onOpenWheel,
  onPickFiles,
  onOpenImageStudio,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Safely obtain Tauri appWindow only when running in Tauri environment
  const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  const appWindow = isTauri ? getCurrentWindow() : null;

  // Listen to window maximize state
  useEffect(() => {
    if (!appWindow) return;
    let isMounted = true;
    let unlisten: (() => void) | undefined;

    const checkMaximized = async () => {
      try {
        const max = await appWindow.isMaximized();
        if (isMounted) setIsMaximized(max);
      } catch {
        // Fallback for non-tauri or browser preview
      }
    };

    checkMaximized();

    const setupListener = async () => {
      try {
        unlisten = await appWindow.onResized(async () => {
          checkMaximized();
        });
      } catch {
        // Browser mode
      }
    };
    setupListener();

    return () => {
      isMounted = false;
      if (unlisten) unlisten();
    };
  }, [appWindow]);

  // Click outside listener for menu dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleMinimize = async () => {
    if (appWindow) {
      try {
        await appWindow.minimize();
        return;
      } catch {}
    }
    await windowMinimize();
  };

  const handleMaximize = async () => {
    if (appWindow) {
      try {
        if (await appWindow.isMaximized()) {
          await appWindow.unmaximize();
          setIsMaximized(false);
        } else {
          await appWindow.maximize();
          setIsMaximized(true);
        }
        return;
      } catch {}
    }
    const isNowMax = await windowToggleMaximize();
    setIsMaximized(isNowMax);
  };

  const handleClose = async () => {
    if (appWindow) {
      try {
        await appWindow.close();
        return;
      } catch {}
    }
    await windowClose();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only double click on empty area or titlebar drag region
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".no-drag")) {
      return;
    }
    handleMaximize();
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "home":
        return "Hızlı Dönüştürücü";
      case "studio":
        return "Çark Stüdyosu";
      case "documents":
        return "Belgeler & PDF";
      case "settings":
        return "Ayarlar";
      default:
        return "Dosya Araç Kiti";
    }
  };

  return (
    <header
      data-tauri-drag-region
      onDoubleClick={handleDoubleClick}
      className="h-10 w-full flex items-center justify-between px-3 select-none bg-[#090A0D]/90 backdrop-blur-2xl border-b border-white/[0.08] z-50 text-xs relative"
    >
      {/* Brand & Functional Menu Trigger */}
      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all cursor-pointer no-drag ${
            isMenuOpen
              ? "bg-white/[0.12] text-white shadow-sm ring-1 ring-white/20"
              : "hover:bg-white/[0.08] text-neutral-200"
          }`}
          title="Fig Menüsü (Hızlı Eylemler, Sayfalar & Seçenekler)"
        >
          <FigLogo size={18} glow={false} />
          <span className="font-semibold text-neutral-100 tracking-tight text-xs">Fig</span>
          <span className="text-[9px] font-mono text-zinc-400 px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            v0.4.0
          </span>
          <ChevronDown
            size={12}
            className={`text-zinc-400 transition-transform duration-200 ${
              isMenuOpen ? "rotate-180 text-white" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {isMenuOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-[#0F1117]/95 border border-white/[0.12] shadow-[0_16px_36px_rgba(0,0,0,0.55)] backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header info */}
            <div className="px-2.5 py-1.5 mb-1 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Fig Menüsü
              </span>
              <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                %100 Yerel
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-0.5 mb-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenWheel?.();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-colors text-left"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span className="font-medium">İşlem Çarkını Aç</span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500">Ctrl+Space</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onPickFiles?.();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-colors text-left"
              >
                <FolderOpen size={14} className="text-blue-400" />
                <span>Dosya Seç...</span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500">Ctrl+O</span>
              </button>
            </div>

            {/* Workspace Navigation */}
            <div className="h-px bg-white/[0.06] my-1" />
            <div className="px-2 py-0.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              Çalışma Alanı
            </div>

            <div className="flex flex-col gap-0.5 mt-0.5 mb-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onTabChange?.("home");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === "home"
                    ? "bg-white/[0.1] text-white font-medium"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Folder size={14} className="text-zinc-400" />
                <span>Hızlı Dönüştürücü</span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500">Ctrl+1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onTabChange?.("studio");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === "studio"
                    ? "bg-white/[0.1] text-white font-medium"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Sliders size={14} className="text-zinc-400" />
                <span>Çark Stüdyosu</span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500">Ctrl+2</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onTabChange?.("documents");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === "documents"
                    ? "bg-white/[0.1] text-white font-medium"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <FileText size={14} className="text-zinc-400" />
                <span>Belgeler & PDF</span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500">Ctrl+3</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenImageStudio?.();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
              >
                <ImageIcon size={14} className="text-zinc-400" />
                <span>Image Studio (Kırp & Sansür)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onTabChange?.("settings");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === "settings"
                    ? "bg-white/[0.1] text-white font-medium"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Settings size={14} className="text-zinc-400" />
                <span>Ayarlar</span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500">Ctrl+,</span>
              </button>
            </div>

            {/* Window Management & Exit */}
            <div className="h-px bg-white/[0.06] my-1" />
            <div className="px-2 py-0.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              Pencere & Sistem
            </div>

            <div className="flex flex-col gap-0.5 mt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleMaximize();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
              >
                <AppWindow size={14} className="text-zinc-400" />
                <span>{isMaximized ? "Geri Yükle" : "Ekranı Kapla"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleMinimize();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
              >
                <Minus size={14} className="text-zinc-400" />
                <span>Simge Durumuna Küçült</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleClose();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
              >
                <X size={14} className="text-zinc-400" />
                <span>Tepsiye Küçült (Gizle)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  appExit();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 transition-colors text-left mt-0.5"
              >
                <LogOut size={14} className="text-rose-400" />
                <span className="font-medium">Fig'den Tamamen Çık</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Middle Window Title / Breadcrumb (Draggable) */}
      <div
        data-tauri-drag-region
        className="flex-1 flex items-center justify-center pointer-events-none text-[11px] font-medium text-zinc-400 tracking-wide gap-1.5"
      >
        <span className="text-zinc-500">Fig</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-300">{getTabLabel()}</span>
      </div>

      {/* Native-Style Window Control Buttons */}
      <div className="flex items-center h-full -mr-3 no-drag">
        <button
          type="button"
          onClick={handleMinimize}
          className="h-full px-3.5 flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors text-neutral-400 hover:text-white cursor-pointer"
          title="Simge Durumuna Küçült"
        >
          <Minus size={13} />
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          className="h-full px-3.5 flex items-center justify-center hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors text-neutral-400 hover:text-white cursor-pointer"
          title={isMaximized ? "Geri Yükle" : "Ekranı Kapla"}
        >
          {isMaximized ? <Copy size={12} className="rotate-180" /> : <Square size={11} />}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="h-full px-4 flex items-center justify-center hover:bg-rose-600 active:bg-rose-700 transition-colors text-neutral-400 hover:text-white cursor-pointer"
          title="Kapat"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
};
