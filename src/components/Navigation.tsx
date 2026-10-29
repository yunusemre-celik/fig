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
      <div className="account-block">
        <FigLogo size={28} />
        <div>
          <strong className="text-white text-xs font-semibold">Fig Portable</strong>
          <span className="text-[10px] text-[#8E95A8] font-mono">100% local workspace</span>
        </div>
      </div>

      {/* Workspace Menu */}
      <div className="menu-label text-[9px] font-mono tracking-widest text-[#4E5668] mt-5 mb-2 px-2 uppercase">
        WORKSPACE
      </div>

      <nav className="flex flex-col gap-1">
        {/* Quick Convert */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("home")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTab === "home"
                ? "bg-[#252A51] text-[#C9CCFF] font-semibold border border-[#6F75E8]/30 shadow-sm"
                : "text-[#8E95A8] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Folder size={15} className={activeTab === "home" ? "text-[#8493FF]" : "text-[#646C7E]"} />
            <span>{t("tabHome") || "Quick Convert"}</span>
            {libraryCount > 0 ? (
              <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#8493FF]/20 text-[#8493FF]">
                {libraryCount}
              </span>
            ) : (
              <span className="ml-auto font-mono text-[9px] text-[#5E6678]">⌘</span>
            )}
          </button>
          <div className="tooltip-bubble">Ctrl + 1</div>
        </div>

        {/* Wheel Studio */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("studio")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTab === "studio"
                ? "bg-[#252A51] text-[#C9CCFF] font-semibold border border-[#6F75E8]/30 shadow-sm"
                : "text-[#8E95A8] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Sliders size={15} className={activeTab === "studio" ? "text-[#8493FF]" : "text-[#646C7E]"} />
            <span>{t("tabStudio") || "Wheel Studio"}</span>
          </button>
          <div className="tooltip-bubble">Ctrl + 2</div>
        </div>

        {/* Documents */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("documents")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTab === "documents"
                ? "bg-[#252A51] text-[#C9CCFF] font-semibold border border-[#6F75E8]/30 shadow-sm"
                : "text-[#8E95A8] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <FileText size={15} className={activeTab === "documents" ? "text-[#8493FF]" : "text-[#646C7E]"} />
            <span>{t("tabDocuments") || "Documents & PDF"}</span>
          </button>
          <div className="tooltip-bubble">Ctrl + 3</div>
        </div>

        {/* Image Studio */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={onOpenImageStudio}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#8E95A8] hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <ImageIcon size={15} className="text-[#646C7E]" />
            <span>Image Studio</span>
          </button>
          <div className="tooltip-bubble">Crop & Blur</div>
        </div>
      </nav>

      {/* Preferences Menu */}
      <div className="menu-label text-[9px] font-mono tracking-widest text-[#4E5668] mt-6 mb-2 px-2 uppercase">
        PREFERENCES
      </div>

      <nav className="flex flex-col gap-1">
        {/* Settings */}
        <div className="has-tooltip">
          <button
            type="button"
            onClick={() => onTabChange("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTab === "settings"
                ? "bg-[#252A51] text-[#C9CCFF] font-semibold border border-[#6F75E8]/30 shadow-sm"
                : "text-[#8E95A8] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Settings size={15} className={activeTab === "settings" ? "text-[#8493FF]" : "text-[#646C7E]"} />
            <span>{t("tabSettings") || "Settings"}</span>
          </button>
          <div className="tooltip-bubble">Ctrl + ,</div>
        </div>
      </nav>

      {/* Floating Wheel Launcher Action */}
      <div className="mt-4 has-tooltip">
        <button
          type="button"
          onClick={onOpenWheel}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#2A315C] to-[#1E2344] text-[#C9CCFF] hover:from-[#353D74] hover:to-[#282F5C] border border-[#6F75E8]/25 shadow-sm transition-all"
        >
          <FigLogo size={16} glow={false} />
          <span>{t("openWheelBtn") || "Trigger Wheel"}</span>
        </button>
        <div className="tooltip-bubble">Ctrl + Space</div>
      </div>

      {/* Sidebar Footer Pill */}
      <div className="sidebar-footer mt-auto flex items-center gap-2 text-[10px] text-[#6EE7A8] bg-[#6EE7A8]/[0.05] border border-[#6EE7A8]/15 rounded-lg p-2.5">
        <ShieldCheck size={16} className="text-[#6EE7A8] shrink-0" />
        <div className="flex flex-col">
          <span className="font-medium text-[#A3B899]">All processing is local</span>
          <small className="text-[8px] text-[#4E7058] font-mono">Offline mode active</small>
        </div>
      </div>
    </aside>
  );
};
