import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../config/siteConfig';
import { FloatingElement } from '../FloatingElement';
import { useLanguage } from '../../i18n/LanguageContext';

export const SectionHome: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="section-0"
      className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#d7ebf8] via-[#e8f2fa] to-[#d8ecf9] snap-start snap-always px-4 md:px-12 select-none"
    >
      {/* Background Soft Cloud Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent" />

      {/* Floating Graphic Elements (Left Side) */}
      {/* 1. Fig photo card */}
      <FloatingElement
        delay={0.2}
        duration={5.5}
        yOffset={10}
        rotate={-2}
        className="absolute left-6 md:left-14 top-24 md:top-28 z-10 hidden sm:block"
      >
        <div className="bg-[#FAF8F2] p-2 pb-3 rounded-2xl shadow-xl border border-black/5 w-44 md:w-56 transition-transform hover:scale-105 duration-300">
          <div className="text-[11px] font-mono text-neutral-500 mb-1 px-1">{t.sectionHome.cardFig}</div>
          <div className="overflow-hidden rounded-xl aspect-square bg-purple-950/10">
            <img
              src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=600&auto=format&fit=crop"
              alt="Fresh Figs"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </FloatingElement>

      {/* 2. Menu.png App UI card */}
      <FloatingElement
        delay={1.2}
        duration={6}
        yOffset={7}
        rotate={1}
        className="absolute left-20 md:left-40 bottom-16 md:bottom-28 z-10 hidden sm:block"
      >
        <div className="bg-[#121620] text-white p-3 rounded-xl shadow-2xl border border-white/10 w-36 md:w-44">
          <div className="text-[10px] font-mono text-neutral-400 mb-1.5 flex items-center justify-between">
            <span>{t.sectionHome.cardMenu.title}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="bg-white/10 rounded-md h-5 px-2 flex items-center justify-between text-[10px]">
              <span>{t.sectionHome.cardMenu.item1}</span>
              <span className="text-white/40">Ctrl+1</span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 rounded-md h-5 px-2 flex items-center justify-between text-[10px] font-medium">
              <span>{t.sectionHome.cardMenu.item2}</span>
              <span>Alt+Q</span>
            </div>
            <div className="bg-white/5 rounded-md h-5 px-2 flex items-center justify-between text-[10px] text-white/60">
              <span>{t.sectionHome.cardMenu.item3}</span>
              <span className="text-white/40">F2</span>
            </div>
          </div>
        </div>
      </FloatingElement>

      {/* 3. Details.jpg (Fig vector icon & blur) */}
      <FloatingElement
        delay={0.6}
        duration={4.8}
        yOffset={8}
        rotate={-3}
        className="absolute left-4 md:left-12 bottom-6 md:bottom-12 z-20 hidden md:block"
      >
        <div className="relative">
          <div className="bg-white p-2.5 pb-3 rounded-xl shadow-lg border border-black/5 w-28">
            <div className="text-[10px] font-mono text-neutral-400 mb-1">{t.sectionHome.cardDetails}</div>
            <div className="aspect-square bg-gradient-to-tr from-amber-100 to-amber-50 rounded-lg flex items-center justify-center text-3xl">
              🌿
            </div>
          </div>
        </div>
      </FloatingElement>

      {/* Center Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto mt-6">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-neutral-900 leading-[1.05]">
            {t.sectionHome.titlePart1}
          </h1>
          <div className="flex justify-center">
            <span className="highlight-mark font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-neutral-950 px-5 py-1 -rotate-1 shadow-sm">
              {t.sectionHome.titlePart2}
            </span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="relative mt-8 mb-3"
        >
          <a
            href={siteConfig.downloadUrl}
            download="Fig-Windows-x64.zip"
            className="group inline-flex items-center gap-3 px-8 md:px-11 py-3.5 md:py-4 bg-[#61FF37] hover:bg-[#52e829] active:scale-95 text-neutral-950 rounded-full font-editorial text-2xl md:text-3xl tracking-tight transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 border border-black/10"
          >
            <span>{t.sectionHome.ctaDownload}</span>
          </a>

          {/* Retro Pixel Mouse Cursor */}
          <div className="absolute -right-8 -bottom-4 md:-right-10 md:-bottom-5 pointer-events-none animate-bounce">
            <svg className="w-8 h-8 md:w-9 md:h-9 drop-shadow-md fill-white stroke-neutral-900 stroke-[1.5]" viewBox="0 0 24 24">
              <path d="M4 3l15 9-7 1.5 4.5 7.5-2.5 1.5-4.5-7.5L4 18V3z" />
            </svg>
          </div>
        </motion.div>

        {/* Security & Portable Info Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col items-center gap-1.5 mb-5 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-md rounded-full border border-black/5 text-[11px] md:text-xs font-mono text-neutral-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.sectionHome.portableTag}</span>
          </div>
          <div className="text-[11px] md:text-xs text-neutral-600/90 font-sans px-2">
            🛡️ {t.sectionHome.smartScreenTip}
          </div>
        </motion.div>

        {/* Subtext with playful spellcheck & selection effects */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-neutral-800 font-sans font-normal"
        >
          {t.sectionHome.subtextPrefix}
          <span className="spellcheck-wavy font-medium">{t.sectionHome.subtextWavy}</span>{' '}
          <span className="selection-pill font-medium">{t.sectionHome.subtextPill}</span>
        </motion.p>
      </div>

      {/* Floating Graphic Elements (Right Side) */}
      {/* 4. Watch.png (Mechanical watch gears) */}
      <FloatingElement
        delay={0.8}
        duration={5}
        yOffset={9}
        rotate={3}
        className="absolute right-6 md:right-16 top-24 md:top-32 z-10 hidden sm:block"
      >
        <div className="bg-[#FAF8F2] p-2 pb-3 rounded-2xl shadow-xl border border-black/5 w-44 md:w-56 transition-transform hover:scale-105 duration-300">
          <div className="text-[11px] font-mono text-neutral-500 mb-1 px-1">{t.sectionHome.cardWatch}</div>
          <div className="overflow-hidden rounded-xl aspect-square bg-amber-950/10">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop"
              alt="Watch Movement Gears"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </FloatingElement>

      {/* 5. w11.png (Windows 11 Mockup Card) */}
      <FloatingElement
        delay={1.5}
        duration={6.5}
        yOffset={7}
        rotate={-1}
        className="absolute right-8 md:right-24 bottom-14 md:bottom-20 z-10 hidden md:block"
      >
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/60 w-52 md:w-64">
          <div className="text-[10px] font-mono text-neutral-500 mb-2 flex items-center justify-between">
            <span>w11.png</span>
            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-sans">
              {t.sectionHome.cardW11.badge}
            </span>
          </div>
          <div className="rounded-xl aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200/80 p-3 flex flex-col justify-between border border-neutral-200/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-center py-2">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs font-semibold text-neutral-700">{t.sectionHome.cardW11.title}</div>
              <div className="text-[10px] text-neutral-500">{t.sectionHome.cardW11.subtitle}</div>
            </div>
            <div className="w-full bg-neutral-300 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
            </div>
          </div>
        </div>
      </FloatingElement>
    </section>
  );
};
