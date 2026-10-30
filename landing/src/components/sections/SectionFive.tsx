import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Folder } from 'lucide-react';
import { AppleNoteCard } from '../AppleNoteCard';
import { FloatingElement } from '../FloatingElement';
import { useLanguage } from '../../i18n/LanguageContext';

export const SectionFive: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="section-4"
      className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#e4eff8] via-[#eef6fc] to-[#dfeaf5] snap-start snap-always px-6 md:px-16"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Typography */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-4 space-y-5"
        >
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-[1.1]">
              {t.sectionFive.titleLine1}
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900">
              {t.sectionFive.titleLine2}
            </h2>
            <div>
              <span className="highlight-mark font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-neutral-950 px-3.5 py-0.5">
                {t.sectionFive.titleHighlight}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-neutral-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-sm font-sans">
            <p>{t.sectionFive.description1}</p>
            <p className="font-semibold text-neutral-900">{t.sectionFive.description2}</p>
          </div>
        </motion.div>

        {/* Center: Image Card `view.png` */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-4 flex justify-center"
        >
          <FloatingElement delay={0.3} duration={5.5} yOffset={8}>
            <div className="bg-[#FAF8F2] p-2.5 pb-3.5 rounded-2xl shadow-2xl border border-black/10 w-64 sm:w-72 md:w-80 transition-transform duration-300 hover:scale-105">
              <div className="text-[11px] font-mono text-neutral-500 mb-1.5 px-1 flex items-center justify-between">
                <span>{t.sectionFive.viewCardTag}</span>
                <span className="text-[10px] text-neutral-400">Photo Studio</span>
              </div>
              <div className="overflow-hidden rounded-xl aspect-[4/5] bg-neutral-900">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop"
                  alt="Night sea and mountain view"
                  className="w-full h-full object-cover filter contrast-[1.05]"
                  loading="lazy"
                />
              </div>
            </div>
          </FloatingElement>
        </motion.div>

        {/* Right: macOS Folders + Apple Note Checklist */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-4 flex flex-col items-center lg:items-end gap-5"
        >
          {/* macOS Blue Folders */}
          <div className="flex gap-4 self-center lg:self-end pr-2">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-14 h-12 bg-blue-400/90 rounded-t-sm rounded-b-md shadow-md flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform">
                <Folder className="w-7 h-7 fill-blue-300 stroke-blue-600 stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium text-neutral-700 mt-1">project</span>
            </div>

            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-14 h-12 bg-blue-400/90 rounded-t-sm rounded-b-md shadow-md flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform">
                <Folder className="w-7 h-7 fill-blue-300 stroke-blue-600 stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium text-neutral-700 mt-1">work</span>
            </div>
          </div>

          {/* Apple Note Card: `daily life problem` */}
          <AppleNoteCard title="Notes" className="w-full max-w-sm">
            <div className="space-y-3.5 py-1">
              <div className="flex items-center gap-1 font-bold text-neutral-900 text-base md:text-lg">
                <span>{t.sectionFive.checklistTitle}</span>
                <span className="w-1.5 h-4 bg-[#E09414] rounded-full inline-block animate-pulse" />
              </div>

              <ul className="space-y-2.5 pt-1">
                {t.sectionFive.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-[#E09414] fill-amber-100 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AppleNoteCard>
        </motion.div>
      </div>
    </section>
  );
};
