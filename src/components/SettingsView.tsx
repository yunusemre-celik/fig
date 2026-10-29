import React, { useState, useEffect } from "react";
import {
  Shield,
  FileDiff,
  Layers,
  Check,
  Compass,
  FolderDown,
  Moon,
  Globe,
} from "lucide-react";
import { getAppSettings, saveAppSettings } from "../services/api";
import { useTranslation } from "../i18n/useTranslation";
import { SupportedLanguage } from "../types";
import { FigLogo } from "./FigLogo";

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();

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
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-5 text-white font-sans animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <FigLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Fig</h2>
              <span className="text-[10px] font-semibold text-[#8493FF] bg-[#8493FF]/15 border border-[#8493FF]/20 px-2 py-0.5 rounded-full font-mono">
                v0.3.1 · Obsidian Core
              </span>
            </div>
            <p className="text-xs text-[#8E95A8] mt-0.5">
              {t("brandTagline") || "Your files, simply effortless."}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Moon size={16} className="text-[#8493FF]" />
            <span>Theme &amp; Appearance</span>
          </div>
          <span className="text-[11px] text-[#646C7E] font-mono">
            Obsidian Dark
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0E18] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#202548] border border-[#8493FF]/30 flex items-center justify-center text-[#8493FF]">
              <Moon size={16} />
            </div>
            <div>
              <strong className="text-xs font-semibold text-white block">Raycast / Linear Obsidian</strong>
              <span className="text-[11px] text-[#8E95A8]">High-contrast deep space dark theme with frosted glass</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#6EE7A8]/10 text-[#6EE7A8] border border-[#6EE7A8]/20">
            Active
          </span>
        </div>
      </div>

      {/* 2. Language Selector */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Globe size={16} className="text-[#8493FF]" />
            <span>{t("languageLabel") || "Language"}</span>
          </div>
          <span className="text-[11px] text-[#646C7E] font-mono">
            5 Languages (i18n)
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
                className={`px-3 py-2.5 rounded-xl text-center text-xs font-semibold transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                  isSelected
                    ? "bg-[#6366F1] text-white border-[#8493FF] shadow-sm"
                    : "bg-[#0B0E18] text-[#8E95A8] border-white/[0.06] hover:bg-[#15192C] hover:text-white"
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
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Compass size={16} className="text-[#8493FF]" />
          <span>{t("displayModeLabel") || "Wheel Display Mode"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectWheelMode("center")}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              wheelDisplayMode === "center"
                ? "bg-[#252A51] border-[#8493FF]"
                : "bg-[#0B0E18] border-white/[0.06] hover:bg-[#15192C]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("displayCenter") || "Center of Screen"}
              </span>
              {wheelDisplayMode === "center" && (
                <span className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8E95A8]">
              {language === "tr"
                ? "Ekranın tam ortasında zarif arka plan ile açılır."
                : "Opens centered with a subtle frosted background."}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectWheelMode("cursor")}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              wheelDisplayMode === "cursor"
                ? "bg-[#252A51] border-[#8493FF]"
                : "bg-[#0B0E18] border-white/[0.06] hover:bg-[#15192C]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("displayCursor") || "At Mouse Cursor"}
              </span>
              {wheelDisplayMode === "cursor" && (
                <span className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8E95A8]">
              {language === "tr"
                ? "Farenin olduğu noktada doğrudan imleç ucunda belirir."
                : "Spawns immediately around your mouse cursor position."}
            </p>
          </button>
        </div>
      </div>

      {/* 4. Output Destination */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <FolderDown size={16} className="text-[#8493FF]" />
          <span>{t("outputDestLabel") || "Output Destination"}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "source" as const, label: t("outputSource") || "Same Folder" },
            { id: "desktop" as const, label: t("outputDesktop") || "Desktop" },
            { id: "downloads" as const, label: t("outputDownloads") || "Downloads" },
          ].map((item) => {
            const isSelected = outputDestination === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectDestination(item.id)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between h-20 cursor-pointer ${
                  isSelected
                    ? "bg-[#252A51] border-[#8493FF]"
                    : "bg-[#0B0E18] border-white/[0.06] hover:bg-[#15192C]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8E95A8] font-mono">
                    {item.id.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span className="font-semibold text-xs text-white leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Save Preference */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <FileDiff size={16} className="text-[#8493FF]" />
            <span>{t("savePrefLabel") || "File Conflict Behavior"}</span>
          </div>
          <span className="text-[11px] text-[#646C7E] font-mono">
            (1 of N)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleToggleSaveSeparate(true)}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              saveAsSeparate
                ? "bg-[#252A51] border-[#8493FF]"
                : "bg-[#0B0E18] border-white/[0.06] hover:bg-[#15192C]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("saveSeparate") || "Save as Separate Copy"}
              </span>
              {saveAsSeparate && (
                <span className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8E95A8]">
              {t("saveSeparateHint") || "Adds a numbered suffix (e.g. photo (1).webp)"}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleToggleSaveSeparate(false)}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              !saveAsSeparate
                ? "bg-[#252A51] border-[#8493FF]"
                : "bg-[#0B0E18] border-white/[0.06] hover:bg-[#15192C]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("saveOverwrite") || "Overwrite Original File"}
              </span>
              {!saveAsSeparate && (
                <span className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8E95A8]">
              {t("saveOverwriteHint") || "Replaces original file with converted version"}
            </p>
          </button>
        </div>
      </div>

      {/* 6. Windows 11 Vibrancy */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Layers size={16} className="text-[#8493FF]" />
          <span>Windows 11 Mica &amp; Acrylic</span>
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
                className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between h-20 cursor-pointer ${
                  isSelected
                    ? "bg-[#252A51] border-[#8493FF]"
                    : "bg-[#0B0E18] border-white/[0.06] hover:bg-[#15192C]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8E95A8] font-mono">
                    {item.badge}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#8E95A8] block">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Privacy & Local Storage */}
      <div className="p-5 rounded-2xl glass-card space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6EE7A8]">
          <Shield size={16} />
          <span>{t("privacyTitle") || "Your files never leave your device"}</span>
        </div>
        <p className="text-xs text-[#8E95A8] leading-relaxed">
          {t("privacyDesc") || "Fig operates 100% offline with zero cloud telemetry and memory-safe Rust execution."}
        </p>
      </div>
    </div>
  );
};
