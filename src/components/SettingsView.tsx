import React, { useState } from "react";
import { Shield, Keyboard, Heart, FileDiff, Layers, Check } from "lucide-react";
import { setWindowVibrancy } from "../services/api";

export const SettingsView: React.FC = () => {
  const [saveAsSeparate, setSaveAsSeparate] = useState<boolean>(() => {
    return localStorage.getItem("fig_save_separate") !== "false";
  });

  const [vibrancyEffect, setVibrancyEffect] = useState<string>(() => {
    return localStorage.getItem("fig_vibrancy") || "mica";
  });

  const handleToggleSaveSeparate = (enabled: boolean) => {
    setSaveAsSeparate(enabled);
    localStorage.setItem("fig_save_separate", enabled ? "true" : "false");
  };

  const handleSelectVibrancy = async (effect: string) => {
    setVibrancyEffect(effect);
    localStorage.setItem("fig_vibrancy", effect);
    try {
      await setWindowVibrancy(effect);
    } catch (err) {
      console.error("Failed to set window vibrancy:", err);
    }
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
                v0.2.1 • Vibrancy Edition
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Windows 11 Fluent Design & Native Window Vibrancy mimarisi.
            </p>
          </div>
        </div>
      </div>

      {/* Output Naming & "Farklı Dosya Olarak Kaydet (1 of N)" */}
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
          Etkinleştirildiğinde, seçili dosyalar dönüştürülürken orijinal dosya korunur ve çıktı adının sonuna <code className="text-amber-300 font-mono text-[11px]">(1 of 3)</code> gibi kaçıncı dosya olduğu ve toplam adet eklenir.
        </p>

        {/* Live Preview Box */}
        <div className="p-3.5 rounded-2xl glass-card flex items-center justify-between text-xs">
          <span className="text-neutral-400">Çıktı Örneği:</span>
          <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.1]">
            {saveAsSeparate ? "belge_(1 of 3).pdf" : "belge.pdf"}
          </span>
        </div>
      </div>

      {/* Windows 11 Native Window Vibrancy Material Selector */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Layers size={17} className="text-blue-400" />
          <span>Windows 11 Cam Malzemesi (Window Vibrancy)</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Tauri Window-Vibrancy entegrasyonu sayesinde masaüstü duvar kağıdınız ve açık pencereler uygulamanın arkasından doğal Windows 11 DWM bulanıklığıyla süzülür.
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

      {/* Shortcuts Card */}
      <div className="p-5 rounded-3xl glass-panel space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Keyboard size={16} className="text-amber-400" />
          <span>Kısayol Tuşları Haritası</span>
        </div>

        <div className="space-y-2 text-xs divide-y divide-white/[0.06]">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-300 font-medium">İmleçte Hızlı Çarkı Aç (Global)</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-[11px]">
              Ctrl + Space
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Panodan Ekran Görüntüsü / Dosya Yapıştır</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + V
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Ana Sayfa (Görsel & SS)</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + 1
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Belgeler (Word, PPT, Excel → PDF)</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + 2
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Çark Stüdyosu (Özelleştirme)</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + 3
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-neutral-400">Kütüphane Geçmişi</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + 4
            </kbd>
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
          Fig, tüm görsel ve ofis işlemlerini bilgisayarınızdaki yerel Rust ve Windows COM motoru ile işler.
          Hiçbir dosya, ekran görüntüsü veya veri buluta gönderilmez. Kütüphane veritabanı <code className="text-amber-300 font-mono text-[11px]">%LOCALAPPDATA%/Fig/library.json</code> konumunda saklanır.
        </p>
      </div>

      {/* Open Source Footer */}
      <div className="text-center py-4 text-xs text-neutral-500 flex items-center justify-center gap-1.5">
        <span>Geliştirildi</span>
        <Heart size={13} className="text-rose-500 fill-rose-500" />
        <span>Açık Kaynak • Windows 11</span>
      </div>
    </div>
  );
};
