import React, { useState, useEffect } from "react";
import {
  Shield,
  FileDiff,
  Layers,
  Check,
  Compass,
  FolderDown,
  Monitor,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { setWindowVibrancy, getAppSettings, saveAppSettings } from "../services/api";
import { useTranslation } from "../i18n/useTranslation";
import { AppTheme, SupportedLanguage } from "../types";

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();

  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem("fig_theme") as AppTheme) || "system";
  });

  const [wheelDisplayMode, setWheelDisplayMode] = useState<"center" | "cursor">(() => {
    return (localStorage.getItem("fig_wheel_display_mode") as "center" | "cursor") || "center";
  });

  const [outputDestination, setOutputDestination] = useState<"source" | "desktop" | "downloads">(() => {
    return (localStorage.getItem("fig_output_destination") as "source" | "desktop" | "downloads") || "source";
  });

  const [saveAsSeparate, setSaveAsSeparate] = useState<boolean>(() => {
    return localStorage.getItem("fig_save_separate") !== "false";
  });

  const [vibrancyEffect, setVibrancyEffect] = useState<string>(() => {
    return localStorage.getItem("fig_vibrancy") || "mica";
  });

  // Sync settings from backend
  useEffect(() => {
    getAppSettings()
      .then((s) => {
        setWheelDisplayMode(s.wheel_display_mode as "center" | "cursor");
        setOutputDestination(s.output_destination as "source" | "desktop" | "downloads");
        setSaveAsSeparate(s.save_as_separate);
        setVibrancyEffect(s.vibrancy_effect);
      })
      .catch(() => {});
  }, []);

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem("fig_theme", newTheme);
    window.dispatchEvent(new Event("storage"));

    const isDark =
      newTheme === "dark" ||
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("theme-dark", isDark);
    document.documentElement.classList.toggle("theme-light", !isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  const handleSelectWheelMode = async (mode: "center" | "cursor") => {
    setWheelDisplayMode(mode);
    localStorage.setItem("fig_wheel_display_mode", mode);
    window.dispatchEvent(new Event("storage"));
    await saveAppSettings({
      wheel_display_mode: mode,
      save_as_separate: saveAsSeparate,
      output_destination: outputDestination,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleSelectDestination = async (dest: "source" | "desktop" | "downloads") => {
    setOutputDestination(dest);
    localStorage.setItem("fig_output_destination", dest);
    await saveAppSettings({
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: saveAsSeparate,
      output_destination: dest,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleToggleSaveSeparate = async (enabled: boolean) => {
    setSaveAsSeparate(enabled);
    localStorage.setItem("fig_save_separate", enabled ? "true" : "false");
    await saveAppSettings({
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: enabled,
      output_destination: outputDestination,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleSelectVibrancy = async (effect: string) => {
    setVibrancyEffect(effect);
    localStorage.setItem("fig_vibrancy", effect);
    try {
      await setWindowVibrancy(effect);
    } catch (err) {
      console.error("Failed to set window vibrancy:", err);
    }
    await saveAppSettings({
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: saveAsSeparate,
      output_destination: outputDestination,
      vibrancy_effect: effect,
    }).catch(() => {});
  };

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-5 text-[var(--apple-text-primary)] font-sans animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="p-5 rounded-2xl apple-card flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-sm">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--apple-text-primary)]">Fig</h2>
              <span className="text-[10px] font-semibold text-[var(--apple-accent)] bg-[var(--apple-accent-light)] border border-[var(--apple-accent)]/20 px-2 py-0.5 rounded-full">
                v0.3.0 · Apple Minimal
              </span>
            </div>
            <p className="text-xs text-[var(--apple-text-secondary)] mt-0.5">
              {t("brandTagline")}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Theme & Appearance (Light / Dark / Auto) */}
      <div className="p-5 rounded-2xl apple-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-text-primary)]">
            <Monitor size={16} className="text-[var(--apple-accent)]" />
            <span>{t("themeLabel")}</span>
          </div>
          <span className="text-[11px] text-[var(--apple-text-tertiary)]">
            macOS Sequoia & Windows 11
          </span>
        </div>

        {/* Apple Segmented Control */}
        <div className="apple-segmented">
          <button
            type="button"
            onClick={() => handleSelectTheme("system")}
            className={`apple-segmented-item ${theme === "system" ? "active" : ""}`}
          >
            <Monitor size={13} />
            <span>{t("themeAuto")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTheme("dark")}
            className={`apple-segmented-item ${theme === "dark" ? "active" : ""}`}
          >
            <Moon size={13} />
            <span>{t("themeDark")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTheme("light")}
            className={`apple-segmented-item ${theme === "light" ? "active" : ""}`}
          >
            <Sun size={13} />
            <span>{t("themeLight")}</span>
          </button>
        </div>
      </div>

      {/* 2. Language Selection (5 Languages) */}
      <div className="p-5 rounded-2xl apple-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-text-primary)]">
            <Globe size={16} className="text-[var(--apple-accent)]" />
            <span>{t("languageLabel")}</span>
          </div>
          <span className="text-[11px] text-[var(--apple-text-tertiary)]">
            5 {t("tabDocuments").toLowerCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {languages.map((l) => {
            const isSelected = language === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => handleSelectLanguage(l.code)}
                className={`px-3 py-2.5 rounded-xl text-center text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                  isSelected
                    ? "bg-[var(--apple-accent)] text-white border-[var(--apple-accent)] shadow-sm"
                    : "bg-[var(--apple-bg-control)] text-[var(--apple-text-primary)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span className="text-[11px]">{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Wheel Display Mode */}
      <div className="p-5 rounded-2xl apple-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-text-primary)]">
          <Compass size={16} className="text-[var(--apple-accent)]" />
          <span>{t("displayModeLabel")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectWheelMode("center")}
            className={`p-3.5 rounded-xl text-left border transition-all relative ${
              wheelDisplayMode === "center"
                ? "bg-[var(--apple-accent-light)] border-[var(--apple-accent)]"
                : "bg-[var(--apple-bg-control)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-[var(--apple-text-primary)]">
                {t("displayCenter")}
              </span>
              {wheelDisplayMode === "center" && (
                <span className="w-4 h-4 rounded-full bg-[var(--apple-accent)] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--apple-text-secondary)]">
              {language === "tr"
                ? "Ekranın tam ortasında zarif arka plan ile açılır."
                : "Opens centered with a subtle frosted background."}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectWheelMode("cursor")}
            className={`p-3.5 rounded-xl text-left border transition-all relative ${
              wheelDisplayMode === "cursor"
                ? "bg-[var(--apple-accent-light)] border-[var(--apple-accent)]"
                : "bg-[var(--apple-bg-control)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-[var(--apple-text-primary)]">
                {t("displayCursor")}
              </span>
              {wheelDisplayMode === "cursor" && (
                <span className="w-4 h-4 rounded-full bg-[var(--apple-accent)] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--apple-text-secondary)]">
              {language === "tr"
                ? "Farenin olduğu noktada doğrudan imleç ucunda belirir."
                : "Spawns immediately around your mouse cursor position."}
            </p>
          </button>
        </div>
      </div>

      {/* 4. Output Destination */}
      <div className="p-5 rounded-2xl apple-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-text-primary)]">
          <FolderDown size={16} className="text-[var(--apple-accent)]" />
          <span>{t("outputDestLabel")}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "source" as const, label: t("outputSource") },
            { id: "desktop" as const, label: t("outputDesktop") },
            { id: "downloads" as const, label: t("outputDownloads") },
          ].map((item) => {
            const isSelected = outputDestination === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectDestination(item.id)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between h-20 ${
                  isSelected
                    ? "bg-[var(--apple-accent-light)] border-[var(--apple-accent)]"
                    : "bg-[var(--apple-bg-control)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--apple-text-secondary)]">
                    {item.id.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[var(--apple-accent)] flex items-center justify-center text-white">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span className="font-semibold text-xs text-[var(--apple-text-primary)] leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Save Preference (Separate vs Overwrite) */}
      <div className="p-5 rounded-2xl apple-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-text-primary)]">
            <FileDiff size={16} className="text-[var(--apple-accent)]" />
            <span>{t("savePrefLabel")}</span>
          </div>
          <span className="text-[11px] text-[var(--apple-text-tertiary)]">
            (1 of N)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleToggleSaveSeparate(true)}
            className={`p-3.5 rounded-xl text-left border transition-all relative ${
              saveAsSeparate
                ? "bg-[var(--apple-accent-light)] border-[var(--apple-accent)]"
                : "bg-[var(--apple-bg-control)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-[var(--apple-text-primary)]">
                {t("saveSeparate")}
              </span>
              {saveAsSeparate && (
                <span className="w-4 h-4 rounded-full bg-[var(--apple-accent)] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--apple-text-secondary)]">
              {t("saveSeparateHint")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleToggleSaveSeparate(false)}
            className={`p-3.5 rounded-xl text-left border transition-all relative ${
              !saveAsSeparate
                ? "bg-[var(--apple-accent-light)] border-[var(--apple-accent)]"
                : "bg-[var(--apple-bg-control)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-[var(--apple-text-primary)]">
                {t("saveOverwrite")}
              </span>
              {!saveAsSeparate && (
                <span className="w-4 h-4 rounded-full bg-[var(--apple-accent)] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--apple-text-secondary)]">
              {t("saveOverwriteHint")}
            </p>
          </button>
        </div>
      </div>

      {/* Windows 11 Window Vibrancy */}
      <div className="p-5 rounded-2xl apple-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-text-primary)]">
          <Layers size={16} className="text-[var(--apple-accent)]" />
          <span>Windows 11 Mica & Acrylic</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: "mica", name: "Mica", desc: "Native W11", badge: "Default" },
            { id: "acrylic", name: "Acrylic", desc: "Frosted Glass", badge: "Acrylic" },
            { id: "tabbed", name: "Tabbed", desc: "Mica Tabbed", badge: "W11" },
            { id: "solid", name: "Solid", desc: "Standard", badge: "Opaque" },
          ].map((item) => {
            const isSelected = vibrancyEffect === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectVibrancy(item.id)}
                className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between h-20 ${
                  isSelected
                    ? "bg-[var(--apple-accent-light)] border-[var(--apple-accent)]"
                    : "bg-[var(--apple-bg-control)] border-[var(--apple-border)] hover:bg-[var(--apple-bg-control-hover)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)]">
                    {item.badge}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[var(--apple-accent)] flex items-center justify-center text-white">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--apple-text-primary)] block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[var(--apple-text-secondary)] block">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Privacy & System Storage */}
      <div className="p-5 rounded-2xl apple-card space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--apple-success)]">
          <Shield size={16} />
          <span>{t("privacyTitle")}</span>
        </div>
        <p className="text-xs text-[var(--apple-text-secondary)] leading-relaxed">
          {t("privacyDesc")}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-3 text-xs text-[var(--apple-text-tertiary)] flex items-center justify-center gap-1.5">
        <span>{t("madeWith")}</span>
      </div>
    </div>
  );
};
