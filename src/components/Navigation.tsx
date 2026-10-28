import React from "react";
import { TabType } from "../types";
import { Home, Library, Settings, Sparkles } from "lucide-react";

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
    <div className="w-full flex items-center justify-between px-6 py-3 bg-[#0F141D]/80 border-b border-white/[0.06] backdrop-blur-md">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onTabChange("home")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "home"
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
          }`}
        >
          <Home size={15} className={activeTab === "home" ? "text-amber-400" : ""} />
          <span>Ana Sayfa</span>
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">Ctrl+1</span>
        </button>

        <button
          onClick={() => onTabChange("library")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "library"
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
          }`}
        >
          <Library size={15} className={activeTab === "library" ? "text-amber-400" : ""} />
          <span>Kütüphane</span>
          {libraryCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400">
              {libraryCount}
            </span>
          )}
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">Ctrl+2</span>
        </button>

        <button
          onClick={() => onTabChange("settings")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "settings"
              ? "bg-white/[0.08] text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
          }`}
        >
          <Settings size={15} className={activeTab === "settings" ? "text-amber-400" : ""} />
          <span>Ayarlar</span>
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">Ctrl+,</span>
        </button>
      </div>

      {/* Floating Wheel Shortcut Action */}
      <button
        onClick={onOpenWheel}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles size={14} />
        <span>Hızlı Çark</span>
        <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-black font-mono text-[9px]">Ctrl+Space</kbd>
      </button>
    </div>
  );
};
