import React, { useState, useEffect } from "react";
import { Shield, Keyboard, Heart, FileDiff, Layers, Check, Compass, FolderDown, Monitor } from "lucide-react";
import { setWindowVibrancy, getAppSettings, saveAppSettings } from "../services/api";

export const SettingsView: React.FC = () => {
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

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-6 text-neutral-100 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="p-5 rounded-3xl glass-panel flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-black font-black text-xl">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Fig for Windows 11</h2>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                v0.3.0 • Fluent Edition
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Windows 11 Fluent Design & Akıllı Çark Mimarisi
            </p>
          </div>
        </div>
      </div>

      {/* 1. Wheel Display Mode (Screen Center with Flu Backdrop vs Cursor Position) */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Compass size={17} className="text-amber-400" />
          <span>İşlem Çarkı Görünüm & Konum Modu</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          `Ctrl + Space` tuşuna bastığınızda çarkın ekranda nasıl görüneceğini seçin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectWheelMode("center")}
            className={`p-4 rounded-2xl text-left border transition-all relative flex flex-col justify-between h-32 ${
              wheelDisplayMode === "center"
                ? "bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/15 scale-[1.02]"
                : "glass-card hover:border-white/[0.18]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor size={17} className="text-amber-400" />
                <span className="font-bold text-xs text-white">Ekran Ortası & Flu Arka Plan</span>
              </div>
              {wheelDisplayMode === "center" && (
                <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 inline-block mb-1">
                Varsayılan & Önerilen
              </span>
              <span className="text-[11px] text-neutral-400 block leading-snug">
                Çark ekranın tam ortasında açılır, arkasındaki pencereler derin flu buzlu camla kararır (Spotlight/HUD stili).
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectWheelMode("cursor")}
            className={`p-4 rounded-2xl text-left border transition-all relative flex flex-col justify-between h-32 ${
              wheelDisplayMode === "cursor"
                ? "bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/15 scale-[1.02]"
                : "glass-card hover:border-white/[0.18]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={17} className="text-sky-400" />
                <span className="font-bold text-xs text-white">İmleç Konumu (Serbest Çark)</span>
              </div>
              {wheelDisplayMode === "cursor" && (
                <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.08] text-neutral-300 inline-block mb-1">
                Kompakt Widget
              </span>
              <span className="text-[11px] text-neutral-400 block leading-snug">
                Çark doğrudan farenizin o an bulunduğu koordinatların ucunda yüzen serbest widget olarak belirir.
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Output Destination Folder */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <FolderDown size={17} className="text-emerald-400" />
          <span>Dönüştürülen Dosyaların Kayıt Konumu</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Oluşturulan veya dönüştürülen dosyaların kaydedileceği hedef klasör.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "source", title: "Kaynak ile Aynı", desc: "Orijinal dosyanın bulunduğu klasör", badge: "Varsayılan" },
            { id: "desktop", title: "Masaüstü (Desktop)", desc: "Doğrudan masaüstüne kaydeder", badge: "Hızlı Erişim" },
            { id: "downloads", title: "İndirilenler", desc: "İndirilenler klasörüne kaydeder", badge: "Downloads" },
          ].map((dest) => {
            const isSelected = outputDestination === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => handleSelectDestination(dest.id as "source" | "desktop" | "downloads")}
                className={`p-3 rounded-2xl text-left border transition-all relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]"
                    : "glass-card hover:border-white/[0.18]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.08] text-neutral-300">
                    {dest.badge}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">{dest.title}</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">{dest.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Output Naming & "Farklı Dosya Olarak Kaydet (1 of N)" */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <FileDiff size={17} className="text-amber-400" />
            <span>Farklı Dosya Şeklinde Kaydet (Numaralandırma)</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsSeparate}
              onChange={(e) => handleToggleSaveSeparate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Etkinleştirildiğinde orijinal dosya korunur ve çıktı adının sonuna <code className="text-amber-300 font-mono text-[11px]">(1 of 3)</code> gibi kaçıncı dosya olduğu ve toplam adet eklenir.
        </p>

        <div className="p-3.5 rounded-2xl glass-card flex items-center justify-between text-xs">
          <span className="text-neutral-400">Çıktı Örneği:</span>
          <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.1]">
            {saveAsSeparate ? "belge_(1 of 3).pdf" : "belge.pdf"}
          </span>
        </div>
      </div>

      {/* 4. Windows 11 Native Window Vibrancy Selector */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Layers size={17} className="text-blue-400" />
          <span>Windows 11 Cam Malzemesi (Window Vibrancy)</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Masaüstü duvar kağıdınız ve açık pencereler uygulamanın arkasından doğal Windows 11 DWM bulanıklığıyla süzülür.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: "mica", name: "Mica", desc: "Doğal W11 Teması", badge: "Önerilen" },
            { id: "acrylic", name: "Acrylic", desc: "Derin Buzlu Cam", badge: "Akrilik" },
            { id: "tabbed", name: "Tabbed", desc: "Mica Alt Sekmeli", badge: "W11" },
            { id: "solid", name: "Solid", desc: "Klasik Koyu Mod", badge: "Opak" },
          ].map((item) => {
            const isSelected = vibrancyEffect === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectVibrancy(item.id)}
                className={`p-3 rounded-2xl text-left border transition-all relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]"
                    : "glass-card hover:border-white/[0.18]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.08] text-neutral-300">
                    {item.badge}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">{item.name}</span>
                  <span className="text-[10px] text-neutral-400 block">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Shortcuts Card */}
      <div className="p-5 rounded-3xl glass-panel space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Keyboard size={16} className="text-amber-400" />
          <span>Kısayol Tuşları Haritası</span>
        </div>

        <div className="space-y-2 text-xs divide-y divide-white/[0.06]">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-300 font-medium">Hızlı Çarkı Aç (Global)</span>
            <kbd>Ctrl + Space</kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Çark Dilimlerini Döndür / Geç</span>
            <span className="text-amber-300 font-mono text-[11px]">← / → veya Fare Tekerleği</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Profilleri Değiştir</span>
            <kbd>Tab veya 1-5</kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Panodan Görsel / Dosya Yapıştır</span>
            <kbd>Ctrl + V</kbd>
          </div>
        </div>
      </div>

      {/* Privacy & System Storage */}
      <div className="p-5 rounded-3xl glass-panel space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Shield size={16} className="text-emerald-400" />
          <span>%100 Yerel, Güvenli ve Özel</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Fig, tüm dönüşüm işlemlerini bilgisayarınızdaki yerel Rust, FFmpeg ve Python motorları ile gerçekleştirir.
          Hiçbir dosya veya veri buluta aktarılmaz.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-neutral-500 flex items-center justify-center gap-1.5">
        <span>Geliştirildi</span>
        <Heart size={13} className="text-rose-500 fill-rose-500" />
        <span>Açık Kaynak • Windows 11</span>
      </div>
    </div>
  );
};
