import React from "react";
import { Shield, Keyboard, Heart } from "lucide-react";

export const SettingsView: React.FC = () => {
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
                v0.2.0 • Glass Edition
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tangerine & Nashi ilhamıyla geliştirilen modern, açık kaynak dosya ve ofis araç kiti.
            </p>
          </div>
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
