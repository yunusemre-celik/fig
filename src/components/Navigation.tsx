import React from "react";
import { TabType } from "../types";
import { Folder, Sliders, FileText, Image as ImageIcon, Settings, ShieldCheck } from "lucide-react";
import { FigLogo } from "./FigLogo";
import { useTranslation } from "../i18n/useTranslation";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenWheel: () => void;
  onOpenImageStudio: () => void;
  libraryCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenWheel,
  onOpenImageStudio,
  libraryCount,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="settings-sidebar select-none">
      {/* Account / Workspace Brand Header */}
      <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <FigLogo size={26} glow={false} />
        <div>
          <strong className="text-white text-xs font-semibold block leading-tight">Fig Portable</strong>
          <span className="text-[9px] text-zinc-400 font-mono">100% local workspace</span>
        </div>
      </div>

      {/* Workspace Menu */}
      <div className="menu-label text-[9px] font-mono tracking-widest text-zinc-500 mt-4 mb-2 px-2 uppercase">
        WORKSPACE
      </div>

      <nav className="flex flex-col gap-1">
        {/* Quick Convert */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("home")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "home"
                ? "bg-white/[0.1] text-white font-medium border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-md"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Folder size={15} className={activeTab === "home" ? "text-white" : "text-zinc-500"} />
            <span>{t("tabHome") || "Quick Convert"}</span>
            {libraryCount > 0 ? (
              <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-white/10 text-zinc-200 border border-white/10">
                {libraryCount}
              </span>
            ) : (
              <span className="ml-auto font-mono text-[9px] text-zinc-600">⌘1</span>
            )}
          </button>
          <div className="tooltip-bubble">Ctrl + 1</div>
        </div>

        {/* Wheel Studio */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("studio")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "studio"
                ? "bg-white/[0.1] text-white font-medium border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-md"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Sliders size={15} className={activeTab === "studio" ? "text-white" : "text-zinc-500"} />
            <span>{t("tabStudio") || "Wheel Studio"}</span>
            <span className="ml-auto font-mono text-[9px] text-zinc-600">⌘2</span>
          </button>
          <div className="tooltip-bubble">Ctrl + 2</div>
        </div>

        {/* Documents */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("documents")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "documents"
                ? "bg-white/[0.1] text-white font-medium border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-md"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <FileText size={15} className={activeTab === "documents" ? "text-white" : "text-zinc-500"} />
            <span>{t("tabDocuments") || "Documents & PDF"}</span>
            <span className="ml-auto font-mono text-[9px] text-zinc-600">⌘3</span>
          </button>
          <div className="tooltip-bubble">Ctrl + 3</div>
        </div>

        {/* Image Studio */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={onOpenImageStudio}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <ImageIcon size={15} className="text-zinc-500" />
            <span>Image Studio</span>
          </button>
          <div className="tooltip-bubble">Crop & Blur</div>
        </div>
      </nav>

      {/* Preferences Menu */}
      <div className="menu-label text-[9px] font-mono tracking-widest text-zinc-500 mt-5 mb-2 px-2 uppercase">
        PREFERENCES
      </div>

      <nav className="flex flex-col gap-1">
        {/* Settings */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-white/[0.1] text-white font-medium border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-md"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Settings size={15} className={activeTab === "settings" ? "text-white" : "text-zinc-500"} />
            <span>{t("tabSettings") || "Settings"}</span>
            <span className="ml-auto font-mono text-[9px] text-zinc-600">⌘,</span>
          </button>
          <div className="tooltip-bubble">Ctrl + ,</div>
        </div>
      </nav>

      {/* Floating Wheel Launcher Action */}
      <div className="mt-4 has-tooltip">
        <button
          type="button"
          onClick={onOpenWheel}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/15 hover:border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-all cursor-pointer"
        >
          <FigLogo size={16} glow={false} />
          <span>{t("openWheelBtn") || "Trigger Wheel"}</span>
        </button>
        <div className="tooltip-bubble">Ctrl + Space</div>
      </div>

      {/* Sidebar Footer Pill */}
      <div className="sidebar-footer mt-auto flex items-center gap-2 text-[10px] text-zinc-300 bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5">
        <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
        <div className="flex flex-col">
          <span className="font-medium text-zinc-300">All processing is local</span>
          <small className="text-[8px] text-zinc-500 font-mono">Offline mode active</small>
        </div>
      </div>
    </aside>
  );
};
