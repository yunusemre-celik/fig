import React from "react";
import { TabType } from "../types";
import { Home, FileText, Sliders, Library, Settings, Sparkles } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";

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
  const { t } = useTranslation();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: "home", label: t("tabHome"), icon: <Home size={15} />, shortcut: "Ctrl+1" },
    { id: "documents", label: t("tabDocuments"), icon: <FileText size={15} />, shortcut: "Ctrl+2" },
    { id: "studio", label: t("tabStudio"), icon: <Sliders size={15} />, shortcut: "Ctrl+3" },
    { id: "library", label: t("tabLibrary"), icon: <Library size={15} />, shortcut: "Ctrl+4" },
    { id: "settings", label: t("tabSettings"), icon: <Settings size={15} />, shortcut: "Ctrl+," },
  ];

  return (
    <div className="w-full flex items-center justify-between px-6 py-2 apple-header border-x-0 border-t-0 select-none z-20">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div key={tab.id} className="has-tooltip">
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--apple-bg-control-hover)] text-[var(--apple-text-primary)] font-semibold shadow-sm border border-[var(--apple-border)]"
                    : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-bg-control)]"
                }`}
              >
                <span className={isActive ? "text-[var(--apple-accent)]" : ""}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.id === "library" && libraryCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[var(--apple-accent-light)] text-[var(--apple-accent)] border border-[var(--apple-accent)]/20">
                    {libraryCount}
                  </span>
                )}
              </button>
              <div className="tooltip top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 flex items-center gap-2 pointer-events-none">
                <span>{tab.label}</span>
                <kbd>{tab.shortcut}</kbd>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Wheel Action Button */}
      <div className="has-tooltip">
        <button
          type="button"
          onClick={onOpenWheel}
          className="apple-button-accent flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs shadow-sm transition-all"
        >
          <Sparkles size={14} />
          <span>{t("openWheelBtn")}</span>
        </button>
        <div className="tooltip top-full mt-2 right-0 px-3 py-1.5 flex items-center gap-2 pointer-events-none">
          <span>{t("quickWheelHint")}</span>
          <kbd>Ctrl + Space</kbd>
        </div>
      </div>
    </div>
  );
};
