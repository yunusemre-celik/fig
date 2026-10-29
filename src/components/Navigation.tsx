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
    <div className="w-full flex items-center justify-between px-6 py-2 glass-panel border-x-0 border-t-0 select-none z-20">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {/* Ana Sayfa */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("home")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "home"
                ? "bg-[var(--fluent-bg-control-hover)] text-white border border-[var(--fluent-stroke-subtle)] shadow-sm"
                : "text-[var(--fluent-text-secondary)] hover:text-white hover:bg-[var(--fluent-bg-control)]"
            }`}
          >
            <Home size={15} className={activeTab === "home" ? "text-amber-400" : ""} />
            <span>Ana Sayfa</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 flex items-center gap-2 pointer-events-none">
            <span>Ana Sayfa</span>
            <kbd>Ctrl+1</kbd>
          </div>
        </div>

        {/* Belgeler */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("documents")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "documents"
                ? "bg-[var(--fluent-bg-control-hover)] text-white border border-[var(--fluent-stroke-subtle)] shadow-sm"
                : "text-[var(--fluent-text-secondary)] hover:text-white hover:bg-[var(--fluent-bg-control)]"
            }`}
          >
            <FileText size={15} className={activeTab === "documents" ? "text-blue-400" : ""} />
            <span>Belgeler</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 flex items-center gap-2 pointer-events-none">
            <span>Word, PPT, Excel'i PDF Yap</span>
            <kbd>Ctrl+2</kbd>
          </div>
        </div>

        {/* Çark Stüdyosu */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("studio")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "studio"
                ? "bg-[var(--fluent-bg-control-hover)] text-white border border-[var(--fluent-stroke-subtle)] shadow-sm"
                : "text-[var(--fluent-text-secondary)] hover:text-white hover:bg-[var(--fluent-bg-control)]"
            }`}
          >
            <Sliders size={15} className={activeTab === "studio" ? "text-amber-400" : ""} />
            <span>Çark Stüdyosu</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 flex items-center gap-2 pointer-events-none">
            <span>Çark Dilimlerini Özelleştir</span>
            <kbd>Ctrl+3</kbd>
          </div>
        </div>

        {/* Kütüphane */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("library")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "library"
                ? "bg-[var(--fluent-bg-control-hover)] text-white border border-[var(--fluent-stroke-subtle)] shadow-sm"
                : "text-[var(--fluent-text-secondary)] hover:text-white hover:bg-[var(--fluent-bg-control)]"
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
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 flex items-center gap-2 pointer-events-none">
            <span>İşlem Geçmişi</span>
            <kbd>Ctrl+4</kbd>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="has-tooltip">
          <button
            onClick={() => onTabChange("settings")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "settings"
                ? "bg-[var(--fluent-bg-control-hover)] text-white border border-[var(--fluent-stroke-subtle)] shadow-sm"
                : "text-[var(--fluent-text-secondary)] hover:text-white hover:bg-[var(--fluent-bg-control)]"
            }`}
          >
            <Settings size={15} className={activeTab === "settings" ? "text-purple-400" : ""} />
            <span>Ayarlar</span>
          </button>
          <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 flex items-center gap-2 pointer-events-none">
            <span>Uygulama Ayarları</span>
            <kbd>Ctrl+,</kbd>
          </div>
        </div>
      </div>

      {/* Floating Wheel Action Button */}
      <div className="has-tooltip">
        <button
          onClick={onOpenWheel}
          className="glass-btn-accent flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs shadow-md transition-all"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          <span>Hızlı Çark</span>
        </button>
        <div className="tooltip top-full mt-2 right-0 px-3 py-1.5 flex items-center gap-2 pointer-events-none">
          <span>Fare İmlecinde Aç</span>
          <kbd>Ctrl + Space</kbd>
        </div>
      </div>
    </div>
  );
};
