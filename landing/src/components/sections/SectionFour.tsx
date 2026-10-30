import React from 'react';
import { motion } from 'framer-motion';
import { AppleNoteCard } from '../AppleNoteCard';
import { FloatingElement } from '../FloatingElement';
import { useLanguage } from '../../i18n/LanguageContext';

export const SectionFour: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="section-3"
      className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden snap-start snap-always px-6 md:px-16"
    >
      {/* Background: Ivy wall + Sidewalk road */}
      <div className="absolute inset-0 z-0">
        {/* Top Ivy Leaves Wall */}
        <div className="h-[62%] w-full relative overflow-hidden bg-emerald-950">
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1600&auto=format&fit=crop"
            alt="Ivy leaves wall"
            className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
        </div>
        {/* Bottom Pavement / Street */}
        <div className="h-[38%] w-full bg-stone-700 relative border-t-4 border-stone-800">
          <div className="absolute top-0 inset-x-0 h-4 bg-stone-500/80 shadow-md" />
          <div className="absolute bottom-6 inset-x-0 h-2 bg-white/40 border-dashed border-t border-b border-white/20" />
        </div>
      </div>

      {/* Foreground Container */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Scattered Desktop Files / Retro Icons */}
        <div className="lg:col-span-6 relative h-[380px] sm:h-[420px] select-none">
          {/* 1. Retro Internet Explorer 'Explore' */}
          <FloatingElement delay={0.1} duration={4.5} yOffset={7} className="absolute left-4 top-8">
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                🌐
              </div>
              <span className="text-white text-xs font-medium px-2 py-0.5 rounded bg-black/60 shadow">
                {t.sectionFour.desktopFiles.explore}
              </span>
            </div>
          </FloatingElement>

          {/* 2. Photo: Culture.jpg */}
          <FloatingElement delay={0.5} duration={5.5} yOffset={8} rotate={-3} className="absolute left-28 top-2">
            <div className="bg-white p-1 pb-2 rounded-lg shadow-xl border border-black/10 w-24">
              <div className="aspect-[4/3] overflow-hidden rounded bg-neutral-200">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                  alt="Culture"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[9px] font-mono text-neutral-600 mt-1 text-center truncate">
                {t.sectionFour.desktopFiles.culture}
              </div>
            </div>
          </FloatingElement>

          {/* 3. PDF: exam.pdf */}
          <FloatingElement delay={0.9} duration={4.8} yOffset={6} className="absolute left-64 top-6">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-14 bg-white rounded-md border-2 border-red-500 shadow-lg flex flex-col justify-between p-1 group-hover:scale-105 transition-transform">
                <div className="text-[9px] font-bold text-red-600 bg-red-100 rounded px-1">PDF</div>
                <div className="text-center text-[10px] text-red-500 font-bold">📄</div>
              </div>
              <span className="text-white text-[11px] font-mono mt-1 px-1.5 py-0.5 rounded bg-black/50">
                {t.sectionFour.desktopFiles.exam}
              </span>
            </div>
          </FloatingElement>

          {/* 4. Video: city.mp4 */}
          <FloatingElement delay={1.1} duration={5.2} yOffset={8} rotate={2} className="absolute left-36 top-44">
            <div className="bg-white p-1 pb-1.5 rounded-lg shadow-xl border border-black/10 w-32">
              <div className="aspect-video overflow-hidden rounded bg-amber-900">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop"
                  alt="City sunset"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[10px] font-mono text-neutral-700 mt-1 text-center">
                {t.sectionFour.desktopFiles.city}
              </div>
            </div>
          </FloatingElement>

          {/* 5. Folder: coffee dump */}
          <FloatingElement delay={0.7} duration={4} yOffset={5} className="absolute left-6 bottom-4">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="text-4xl filter drop-shadow group-hover:scale-110 transition-transform">
                📁
              </div>
              <span className="text-white text-[11px] font-mono mt-0.5 px-2 py-0.5 rounded bg-black/60">
                {t.sectionFour.desktopFiles.coffee}
              </span>
            </div>
          </FloatingElement>

          {/* 6. Word doc: assignment.docx */}
          <FloatingElement delay={1.3} duration={6} yOffset={7} className="absolute left-40 bottom-2">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-14 bg-blue-600 text-white rounded-md shadow-lg flex flex-col justify-between p-1 border border-white/20 group-hover:scale-105 transition-transform">
                <div className="text-[8px] font-black bg-blue-800 rounded px-1">DOCX</div>
                <div className="text-center text-sm font-serif">W</div>
              </div>
              <span className="text-white text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded bg-black/50 truncate max-w-[80px]">
                {t.sectionFour.desktopFiles.assignment}
              </span>
            </div>
          </FloatingElement>

          {/* 7. PDF: project.pdf */}
          <FloatingElement delay={0.4} duration={5} yOffset={6} className="absolute left-72 bottom-6">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-11 h-13 bg-white rounded-md border-2 border-red-600 shadow-lg flex flex-col justify-between p-1 group-hover:scale-105 transition-transform">
                <div className="text-[8px] font-bold text-red-600 bg-red-100 rounded px-1">PDF</div>
                <div className="text-center text-xs">📑</div>
              </div>
              <span className="text-white text-[11px] font-mono mt-1 px-1.5 py-0.5 rounded bg-black/50">
                project.pdf
              </span>
            </div>
          </FloatingElement>
        </div>

        {/* Right: Apple Note Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-6 flex justify-center lg:justify-end"
        >
          <AppleNoteCard title={t.sectionFour.noteTitle} className="w-full max-w-lg">
            <div className="space-y-5 py-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                <span>{t.sectionFour.pillBatch} </span>
                <span className="highlight-mark font-editorial text-neutral-950 px-3 py-0.5">
                  {t.sectionTwo.titleHighlight}
                </span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-neutral-700 leading-relaxed font-sans">
                {t.sectionFour.noteDescription}
              </p>

              <div className="pt-4 border-t border-[#F0EBE1] flex flex-wrap gap-2 text-xs font-medium text-neutral-600">
                <span className="px-2.5 py-1 rounded bg-neutral-200/60">{t.sectionFour.pillBatch}</span>
                <span className="px-2.5 py-1 rounded bg-neutral-200/60">100+ Files</span>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {t.sectionFour.pillOffline}
                </span>
              </div>
            </div>
          </AppleNoteCard>
        </motion.div>
      </div>
    </section>
  );
};
