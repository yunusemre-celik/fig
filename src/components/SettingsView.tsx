import React from "react";
import { Shield, Keyboard, Heart } from "lucide-react";

export const SettingsView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-6 text-neutral-100">
      {/* Brand Header */}
      <div className="p-5 rounded-2xl bg-[#141A24] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black text-xl">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Fig for Windows 11</h2>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                v0.1.0 (MVP)
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tangerine & Nashi ilhamıyla geliştirilen modern, açık kaynak dosya araç kiti.
            </p>
          </div>
        </div>
      </div>

      {/* Shortcuts Card */}
      <div className="p-5 rounded-2xl bg-[#141A24] border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Keyboard size={16} className="text-amber-400" />
          <span>Kısayol Tuşları</span>
        </div>

        <div className="space-y-2 text-xs divide-y divide-white/[0.05]">
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">İşlem Çarkını Aç</span>
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-amber-300 font-mono text-[11px]">
              Ctrl + Space
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Dosya Seç (Göz At)</span>
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + O
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Panodan Dosya/Görsel Yapıştır</span>
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + V
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Ana Sayfa / Kütüphane Geçişi</span>
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + 1 / Ctrl + 2
            </kbd>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Kütüphanede Arama</span>
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[11px]">
              Ctrl + F
            </kbd>
          </div>
        </div>
      </div>

      {/* Privacy & System Storage */}
      <div className="p-5 rounded-2xl bg-[#141A24] border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Shield size={16} className="text-emerald-400" />
          <span>Gizlilik & Depolama</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Fig, tüm dönüştürme ve düzenleme işlemlerini yerel makinenizde (Rust motoru ile) gerçekleştirir.
          Hiçbir dosya, görsel veya veri buluta aktarılmaz ya da izlenmez.
          Kütüphane geçmişi güvenle <code className="text-amber-400 font-mono text-[11px]">%LOCALAPPDATA%/Fig</code> dizininde saklanır.
        </p>
      </div>

      {/* Open Source Footer */}
      <div className="text-center py-4 text-xs text-neutral-500 flex items-center justify-center gap-1.5">
        <span>Geliştirildi</span>
        <Heart size={13} className="text-rose-500 fill-rose-500" />
        <span>Açık Kaynak • MIT Lisansı</span>
      </div>
    </div>
  );
};
