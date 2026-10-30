import React from 'react';
import { motion } from 'framer-motion';
import { AppleNoteCard } from '../AppleNoteCard';
import { FloatingElement } from '../FloatingElement';
import { useLanguage } from '../../i18n/LanguageContext';

export const SectionTwo: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="section-1"
      className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-white snap-start snap-always px-6 md:px-16"
    >
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left / Main Typography */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
            <span>{t.sectionTwo.titlePrefix}</span>
            <span className="highlight-mark font-editorial text-neutral-950 px-4 py-0.5">
              {t.sectionTwo.titleHighlight}
            </span>
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl text-neutral-700 leading-relaxed max-w-xl font-sans font-normal">
            {t.sectionTwo.description}
          </p>

          <div className="pt-2 flex items-center gap-3 text-sm text-neutral-500 font-mono">
            <span className="px-2.5 py-1 bg-neutral-100 rounded-md border border-neutral-200">Alt + Q</span>
            <span>{t.sectionTwo.shortcutHint}</span>
          </div>
        </motion.div>

        {/* Right / Apple Note Card */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.4 }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <FloatingElement delay={0.4} duration={6} yOffset={6}>
            <AppleNoteCard title={t.sectionTwo.noteTitle} className="w-full max-w-md">
              <div className="space-y-4 py-1">
                {/* Highlighted text with selection pins */}
                <div className="flex items-center">
                  <span className="relative inline-flex items-center text-lg md:text-xl font-bold text-neutral-900 px-3 py-0.5 bg-amber-200/50 rounded">
                    {/* Left pin */}
                    <span className="absolute -left-1 -top-1.5 bottom-0 flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E09414]" />
                      <span className="w-0.5 flex-1 bg-[#E09414]" />
                    </span>
                    <span>{t.sectionTwo.notePill}</span>
                    {/* Right pin */}
                    <span className="absolute -right-1 -top-1.5 bottom-0 flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E09414]" />
                      <span className="w-0.5 flex-1 bg-[#E09414]" />
                    </span>
                  </span>
                </div>

                <p className="text-neutral-700 text-sm md:text-base leading-relaxed">
                  {t.sectionTwo.noteBody}
                </p>

                <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs text-neutral-400">
                  <span>{t.sectionTwo.tagOffline}</span>
                  <span>{t.sectionTwo.tagPrivacy}</span>
                </div>
              </div>
            </AppleNoteCard>
          </FloatingElement>
        </motion.div>
      </div>
    </section>
  );
};
