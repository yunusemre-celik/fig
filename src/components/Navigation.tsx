import React from "react";
import { TabType } from "../types";
import { Home, FileText, Sliders, Library, Settings, Sparkles } from "lucide-react";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenWheel: () => void;
  libraryCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenWheel,
  libraryCount,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-6 py-2.5 glass-panel border-x-0 border-t-0 select-none z-20">
      {/* Tabs */}
      <div className="flex items-center gap-1.5">
        {/* Ana Sayfa */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("home")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "home"
                ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Home size={15} className={activeTab === "home" ? "text-amber-400" : ""} />
            <span>Ana Sayfa</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#141A24]/95 border border-white/[0.12] text-[11px] text-neutral-300 shadow-xl backdrop-blur-xl flex items-center gap-1.5 pointer-events-none">
            <span>Ana Sayfa</span>
            <kbd className="px-1.5 py-0.2 rounded bg-white/[0.08] text-amber-300 font-mono text-[9px] border border-white/[0.1]">
              Ctrl+1
            </kbd>
          </div>
        </div>

        {/* Belgeler */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("documents")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "documents"
                ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <FileText size={15} className={activeTab === "documents" ? "text-blue-400" : ""} />
            <span>Belgeler</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#141A24]/95 border border-white/[0.12] text-[11px] text-neutral-300 shadow-xl backdrop-blur-xl flex items-center gap-1.5 pointer-events-none">
            <span>Word, PPT, Excel'i PDF Yap</span>
            <kbd className="px-1.5 py-0.2 rounded bg-white/[0.08] text-amber-300 font-mono text-[9px] border border-white/[0.1]">
              Ctrl+2
            </kbd>
          </div>
        </div>

        {/* Çark Stüdyosu */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("studio")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "studio"
                ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Sliders size={15} className={activeTab === "studio" ? "text-amber-400" : ""} />
            <span>Çark Stüdyosu</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#141A24]/95 border border-white/[0.12] text-[11px] text-neutral-300 shadow-xl backdrop-blur-xl flex items-center gap-1.5 pointer-events-none">
            <span>Çark Dilimlerini Özelleştir</span>
            <kbd className="px-1.5 py-0.2 rounded bg-white/[0.08] text-amber-300 font-mono text-[9px] border border-white/[0.1]">
              Ctrl+3
            </kbd>
          </div>
        </div>

        {/* Kütüphane */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("library")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "library"
                ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Library size={15} className={activeTab === "library" ? "text-emerald-400" : ""} />
            <span>Kütüphane</span>
            {libraryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {libraryCount}
              </span>
            )}
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#141A24]/95 border border-white/[0.12] text-[11px] text-neutral-300 shadow-xl backdrop-blur-xl flex items-center gap-1.5 pointer-events-none">
            <span>İşlem Geçmişi</span>
            <kbd className="px-1.5 py-0.2 rounded bg-white/[0.08] text-amber-300 font-mono text-[9px] border border-white/[0.1]">
              Ctrl+4
            </kbd>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("settings")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Settings size={15} className={activeTab === "settings" ? "text-purple-400" : ""} />
            <span>Ayarlar</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#141A24]/95 border border-white/[0.12] text-[11px] text-neutral-300 shadow-xl backdrop-blur-xl flex items-center gap-1.5 pointer-events-none">
            <span>Uygulama Ayarları</span>
            <kbd className="px-1.5 py-0.2 rounded bg-white/[0.08] text-amber-300 font-mono text-[9px] border border-white/[0.1]">
              Ctrl+,
            </kbd>
          </div>
        </div>
      </div>

      {/* Floating Wheel Action Button */}
      <div className="has-tooltip">
        <button
          onClick={onOpenWheel}
          className="glass-btn-accent flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs shadow-lg transition-all"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          <span>Hızlı Çark</span>
        </button>
        <div className="tooltip top-full mt-2 right-0 px-3 py-1.5 rounded-lg bg-[#141A24]/95 border border-amber-400/30 text-[11px] text-amber-200 shadow-xl backdrop-blur-xl flex items-center gap-2 pointer-events-none">
          <span>Fare İmlecinde Aç</span>
          <kbd className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] border border-amber-400/40">
            Ctrl + Space
          </kbd>
        </div>
      </div>
    </div>
  );
};
