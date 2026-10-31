import React, { useState, useEffect } from "react";
import { SupportedLanguage } from "../types";
import { useTranslation } from "../i18n/useTranslation";
import { FigLogo } from "./FigLogo";
import {
  Globe,
  Layers,
  FolderDown,
  FileDiff,
  Shield,
  Check,
  Moon,
  Compass,
} from "lucide-react";
import {
  getAppSettings,
  saveAppSettings,
  setWindowVibrancy,
} from "../services/api";

export type VibrancyEffect = "mica" | "acrylic" | "tabbed" | "solid";

export const SettingsView: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const [vibrancyEffect, setVibrancyEffect] = useState<VibrancyEffect>("mica");
  const [wheelDisplayMode, setWheelDisplayMode] = useState<"center" | "cursor">("center");
  const [saveAsSeparate, setSaveAsSeparate] = useState<boolean>(true);
  const [outputDestination, setOutputDestination] = useState<"source" | "desktop" | "downloads">("source");

  useEffect(() => {
    getAppSettings()
      .then((settings) => {
        setVibrancyEffect((settings.vibrancy_effect as VibrancyEffect) || "mica");
        setWheelDisplayMode(settings.wheel_display_mode);
        setSaveAsSeparate(settings.save_as_separate);
        setOutputDestination(settings.output_destination);
      })
      .catch(() => {});
  }, []);

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    saveAppSettings({
      language: lang,
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: saveAsSeparate,
      output_destination: outputDestination,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleSelectWheelMode = (mode: "center" | "cursor") => {
    setWheelDisplayMode(mode);
    saveAppSettings({
      language,
      wheel_display_mode: mode,
      save_as_separate: saveAsSeparate,
      output_destination: outputDestination,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleToggleSaveSeparate = (val: boolean) => {
    setSaveAsSeparate(val);
    saveAppSettings({
      language,
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: val,
      output_destination: outputDestination,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleSelectDestination = (dest: "source" | "desktop" | "downloads") => {
    setOutputDestination(dest);
    saveAppSettings({
      language,
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: saveAsSeparate,
      output_destination: dest,
      vibrancy_effect: vibrancyEffect,
    }).catch(() => {});
  };

  const handleSelectVibrancy = async (effect: VibrancyEffect) => {
    setVibrancyEffect(effect);
    try {
      await setWindowVibrancy(effect);
    } catch {}
    saveAppSettings({
      language,
      wheel_display_mode: wheelDisplayMode,
      save_as_separate: saveAsSeparate,
      output_destination: outputDestination,
      vibrancy_effect: effect,
    }).catch(() => {});
  };

  const languages: { code: SupportedLanguage; label: string; codeBadge: string }[] = [
    { code: "en", label: "English", codeBadge: "EN" },
    { code: "tr", label: "Türkçe", codeBadge: "TR" },
    { code: "es", label: "Español", codeBadge: "ES" },
    { code: "de", label: "Deutsch", codeBadge: "DE" },
    { code: "fr", label: "Français", codeBadge: "FR" },
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
              <span className="text-[10px] font-semibold text-zinc-300 bg-white/[0.06] border border-white/10 px-2.5 py-0.5 rounded-full font-mono">
                v0.4.0 · Frosted Obsidian
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t("brandTagline") || "Your files, simply effortless."}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Moon size={16} className="text-zinc-300" />
            <span>Theme &amp; Appearance</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Frosted Obsidian
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 flex items-center justify-center text-white">
              <Moon size={16} />
            </div>
            <div>
              <strong className="text-xs font-semibold text-white block">Frosted Glass &amp; Obsidian</strong>
              <span className="text-[11px] text-zinc-400">Deep neutral smoke with specular glass highlights</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>
      </div>

      {/* 2. Language Selector */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Globe size={16} className="text-zinc-300" />
            <span>{t("languageLabel") || "Language"}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
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
                className={`px-3 py-2.5 rounded-xl text-center text-xs font-semibold transition-all flex flex-col items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.12] text-white border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-md"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-zinc-200 border border-white/10">
                  {l.codeBadge}
                </span>
                <span className="text-[11px]">{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Wheel Display Mode */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Compass size={16} className="text-zinc-300" />
          <span>{t("displayModeLabel") || "Wheel Display Mode"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectWheelMode("center")}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              wheelDisplayMode === "center"
                ? "bg-white/[0.1] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("displayCenter") || "Center of Screen"}
              </span>
              {wheelDisplayMode === "center" && (
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-black">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {language === "tr"
                ? "Ekranın tam ortasında zarif cam arka plan ile açılır."
                : "Opens centered with a subtle frosted background."}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectWheelMode("cursor")}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              wheelDisplayMode === "cursor"
                ? "bg-white/[0.1] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("displayCursor") || "At Mouse Cursor"}
              </span>
              {wheelDisplayMode === "cursor" && (
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-black">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
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
          <FolderDown size={16} className="text-zinc-300" />
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
                    ? "bg-white/[0.1] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 font-mono">
                    {item.id.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-black">
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
            <FileDiff size={16} className="text-zinc-300" />
            <span>{t("savePrefLabel") || "File Conflict Behavior"}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            (1 of N)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleToggleSaveSeparate(true)}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              saveAsSeparate
                ? "bg-white/[0.1] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("saveSeparate") || "Save as Separate Copy"}
              </span>
              {saveAsSeparate && (
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-black">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {t("saveSeparateHint") || "Adds a numbered suffix (e.g. photo (1).webp)"}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleToggleSaveSeparate(false)}
            className={`p-3.5 rounded-xl text-left border transition-all relative cursor-pointer ${
              !saveAsSeparate
                ? "bg-white/[0.1] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">
                {t("saveOverwrite") || "Overwrite Original File"}
              </span>
              {!saveAsSeparate && (
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-black">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {t("saveOverwriteHint") || "Replaces original file with converted version"}
            </p>
          </button>
        </div>
      </div>

      {/* 6. Windows 11 Vibrancy */}
      <div className="p-5 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Layers size={16} className="text-zinc-300" />
          <span>Windows 11 Mica &amp; Acrylic</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: "mica" as VibrancyEffect, name: "Mica", desc: "Native W11", badge: "Default" },
            { id: "acrylic" as VibrancyEffect, name: "Acrylic", desc: "Frosted Glass", badge: "Acrylic" },
            { id: "tabbed" as VibrancyEffect, name: "Tabbed", desc: "Mica Tabbed", badge: "W11" },
            { id: "solid" as VibrancyEffect, name: "Solid", desc: "Standard", badge: "Opaque" },
          ].map((item) => {
            const isSelected = vibrancyEffect === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectVibrancy(item.id)}
                className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between h-20 cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.1] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 font-mono">
                    {item.badge}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-black">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
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
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Shield size={16} />
          <span>{t("privacyTitle") || "Your files never leave your device"}</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {t("privacyDesc") || "Fig operates 100% offline with zero cloud telemetry and memory-safe Rust execution."}
        </p>
      </div>
    </div>
  );
};
