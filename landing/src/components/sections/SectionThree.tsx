import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Music,
  Video,
  FileCode,
  Folder,
  Info,
  Minimize2,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const SectionThree: React.FC = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t.sectionThree.slides.slide1.title,
      sub: t.sectionThree.slides.slide1.sub,
      actionTitle: t.sectionThree.slides.slide1.actionTitle,
      shortcut: 'Alt + Q',
      features: t.sectionThree.slides.slide1.features,
    },
    {
      title: t.sectionThree.slides.slide2.title,
      sub: t.sectionThree.slides.slide2.sub,
      actionTitle: t.sectionThree.slides.slide2.actionTitle,
      shortcut: 'F2',
      features: t.sectionThree.slides.slide2.features,
    },
    {
      title: t.sectionThree.slides.slide3.title,
      sub: t.sectionThree.slides.slide3.sub,
      actionTitle: t.sectionThree.slides.slide3.actionTitle,
      shortcut: 'Ctrl + O',
      features: t.sectionThree.slides.slide3.features,
    },
  ];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      id="section-2"
      className="relative w-full h-screen min-h-[680px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#f0f6fc] to-[#e4eff8] snap-start snap-always px-4 md:px-12"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Typography */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-4 space-y-5"
        >
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-neutral-900 leading-[1.08]">
              {t.sectionThree.titlePart1}
            </h2>
            <div>
              <span className="highlight-mark font-editorial text-4xl sm:text-5xl md:text-6xl text-neutral-950 px-3.5 py-0.5">
                {t.sectionThree.titleHighlight}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 pt-1">
              {t.sectionThree.titlePart2}
            </h2>
          </div>

          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-sm font-sans">
            {t.sectionThree.description}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-semibold">
            <span>🦀 Rust 1.82 Core Engine</span>
            <span>•</span>
            <span>&lt; 15 MB RAM</span>
          </div>
        </motion.div>

        {/* Center: Interactive Desktop UI Window with Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-6 relative flex items-center justify-center"
        >
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute -left-3 md:-left-6 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all"
            aria-label="Previous"
            type="button"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Desktop App Window Mockup */}
          <div className="w-full max-w-lg bg-[#0E121B] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Title Bar */}
            <div className="bg-[#161B26] px-4 py-2.5 flex items-center justify-between border-b border-white/5 text-xs text-neutral-400 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400/80" />
                <span className="font-medium text-white/90">Fig - File Toolkit</span>
                <span className="text-[10px] text-white/40">v0.4.1</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <span>─</span>
                <span>□</span>
                <span className="hover:text-red-400 cursor-pointer">✕</span>
              </div>
            </div>

            {/* Window Content (Animated Slide) */}
            <div className="p-5 md:p-6 min-h-[300px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-white/95">
                      {slides[currentSlide].title}
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-400">
                      {slides[currentSlide].sub}
                    </p>
                  </div>

                  {/* Drop zone / Action button */}
                  <div className="border border-dashed border-purple-500/30 rounded-xl p-6 bg-purple-950/10 text-center hover:border-purple-500/60 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      ☁️
                    </div>
                    <div className="text-xs text-white/80 font-medium">{slides[currentSlide].actionTitle}</div>
                    <div className="text-[10px] text-white/40 mt-1">PDF, DOCX, PNG, MP4, MP3 & more</div>
                  </div>

                  {/* Features Quick Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {slides[currentSlide].features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/5 rounded-lg p-2 text-center text-[10px] text-white/80 hover:bg-white/10 transition-colors"
                      >
                        {feat}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Window Footer Status */}
              <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% Local Execution</span>
                </div>
                <div className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded">
                  {slides[currentSlide].shortcut}
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow Button + Retro Pixel Cursor */}
          <div className="absolute -right-3 md:-right-6 z-30">
            <button
              onClick={handleNext}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all"
              aria-label="Next"
              type="button"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
            <div className="absolute left-6 top-6 pointer-events-none animate-pulse">
              <svg className="w-6 h-6 drop-shadow fill-white stroke-black stroke-[1.5]" viewBox="0 0 24 24">
                <path d="M4 3l15 9-7 1.5 4.5 7.5-2.5 1.5-4.5-7.5L4 18V3z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Right Format Badges Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-2 grid grid-cols-4 lg:grid-cols-2 gap-3"
        >
          {/* MP4 */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Video className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs font-bold text-neutral-800">MP4</span>
          </div>

          {/* MP3 */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Music className="w-5 h-5 text-amber-600 mb-1" />
            <span className="text-xs font-bold text-neutral-800">MP3</span>
          </div>

          {/* PDF */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-red-600 mb-1" />
            <span className="text-xs font-bold text-neutral-800">PDF</span>
          </div>

          {/* DOCX */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <FileCode className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs font-bold text-neutral-800">DOCX</span>
          </div>

          {/* Compress */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Minimize2 className="w-5 h-5 text-cyan-600 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionThree.formats.compress}</span>
          </div>

          {/* CLI */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-neutral-900 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionThree.formats.system}</span>
          </div>

          {/* Folder */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Folder className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionFour.pillBatch}</span>
          </div>

          {/* Info */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Info className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionTwo.tagPrivacy}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
