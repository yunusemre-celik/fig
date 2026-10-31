import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Linkedin, Instagram } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { FloatingElement } from '../FloatingElement';
import { useLanguage } from '../../i18n/LanguageContext';

export const SectionSix: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="section-5"
      className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#dfeaf5] via-[#eaf2f9] to-[#d6e7f7] snap-start snap-always px-6 select-none"
    >
      {/* Background Scattered Desktop Files (Parallax / Floating) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <FloatingElement delay={0.2} duration={5} yOffset={8} className="absolute left-8 top-16 hidden sm:block">
          <div className="text-4xl">🌐</div>
          <div className="text-[10px] font-mono text-neutral-600 bg-white/70 px-1 rounded">
            {t.sectionFour.desktopFiles.explore}
          </div>
        </FloatingElement>

        <FloatingElement delay={0.8} duration={6} yOffset={7} rotate={2} className="absolute left-28 top-28 hidden md:block">
          <div className="w-16 h-12 bg-white rounded shadow p-1">
            <div className="w-full h-full bg-amber-200/50 rounded" />
          </div>
          <div className="text-[9px] font-mono text-neutral-600">{t.sectionFour.desktopFiles.culture}</div>
        </FloatingElement>

        <FloatingElement delay={1.2} duration={5.5} yOffset={9} className="absolute right-14 top-20 hidden sm:block">
          <div className="text-3xl">📄</div>
          <div className="text-[10px] font-mono text-neutral-600 bg-white/70 px-1 rounded">
            {t.sectionFour.desktopFiles.exam}
          </div>
        </FloatingElement>

        <FloatingElement delay={0.6} duration={4.8} yOffset={6} className="absolute left-16 bottom-16 hidden md:block">
          <div className="text-3xl">📁</div>
          <div className="text-[10px] font-mono text-neutral-600">{t.sectionFour.desktopFiles.coffee}</div>
        </FloatingElement>

        <FloatingElement delay={1.4} duration={6.2} yOffset={8} className="absolute right-24 bottom-20 hidden md:block">
          <div className="text-3xl">📑</div>
          <div className="text-[10px] font-mono text-neutral-600">project.pdf</div>
        </FloatingElement>
      </div>

      {/* Center CTA and Social Channels */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-10">
        {/* Main Neon Green CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.4 }}
          className="flex flex-col items-center"
        >
          <a
            href={siteConfig.downloadUrl}
            download="Fig-Windows-x64.zip"
            className="inline-flex items-center justify-center px-10 sm:px-14 py-4 sm:py-5 bg-[#61FF37] hover:bg-[#52e829] active:scale-95 text-neutral-950 rounded-full font-editorial text-3xl sm:text-4xl tracking-tight transition-all duration-300 shadow-2xl hover:shadow-[0_0_35px_rgba(97,255,55,0.6)] border border-black/10 hover:-translate-y-1"
          >
            <span>{t.sectionSix.ctaDownload}</span>
          </a>

          {/* Security & Portable Info Pill */}
          <div className="flex flex-col items-center gap-1.5 mt-5 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-md rounded-full border border-black/5 text-[11px] md:text-xs font-mono text-neutral-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.sectionSix.portableTag}</span>
            </div>
            <div className="text-[11px] md:text-xs text-neutral-600/90 font-sans px-2">
              🛡️ {t.sectionSix.smartScreenTip}
            </div>
          </div>
        </motion.div>

        {/* Social Media Channels Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.4 }}
          className="flex items-center justify-center gap-6 sm:gap-8 pt-4"
        >
          {/* 1. X (Twitter) -> hirtzirt */}
          <a
            href={siteConfig.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.sectionSix.socialTitles.twitter}
            className="p-3 rounded-full bg-white/70 hover:bg-neutral-900 text-neutral-800 hover:text-white transition-all duration-200 shadow-md hover:scale-110 active:scale-95 border border-white/60"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* 2. LinkedIn -> yunusemrecelik00 */}
          <a
            href={siteConfig.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.sectionSix.socialTitles.linkedin}
            className="p-3 rounded-full bg-white/70 hover:bg-[#0077b5] text-neutral-800 hover:text-white transition-all duration-200 shadow-md hover:scale-110 active:scale-95 border border-white/60"
          >
            <Linkedin className="w-5 h-5 fill-current" />
          </a>

          {/* 3. GitHub -> yunusemre-celik */}
          <a
            href={siteConfig.githubProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.sectionSix.socialTitles.github}
            className="p-3 rounded-full bg-white/70 hover:bg-neutral-900 text-neutral-800 hover:text-white transition-all duration-200 shadow-md hover:scale-110 active:scale-95 border border-white/60"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* 4. Instagram -> yunusemrecelik.dev */}
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.sectionSix.socialTitles.instagram}
            className="p-3 rounded-full bg-white/70 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-neutral-800 hover:text-white transition-all duration-200 shadow-md hover:scale-110 active:scale-95 border border-white/60"
          >
            <Instagram className="w-5 h-5 stroke-[2]" />
          </a>

          {/* 5. Website -> yunusemrecelik.dev */}
          <a
            href={siteConfig.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.sectionSix.socialTitles.website}
            className="p-3 rounded-full bg-white/70 hover:bg-emerald-600 text-neutral-800 hover:text-white transition-all duration-200 shadow-md hover:scale-110 active:scale-95 border border-white/60"
          >
            <Globe className="w-5 h-5 stroke-[2]" />
          </a>
        </motion.div>

        {/* Footer note */}
        <p className="text-xs text-neutral-500 font-sans tracking-wide pt-6">
          {t.sectionSix.footerNote}
        </p>
      </div>
    </section>
  );
};
