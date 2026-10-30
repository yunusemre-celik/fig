import React, { useState, useRef, useEffect } from 'react';
import { Home, Globe, ChevronDown } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface NavigationProps {
  onHomeClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onHomeClick }) => {
  const { language, setLanguage, t, languages } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsLangOpen(false);
  };

  const currentOption = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="flex items-center gap-2 pointer-events-auto bg-white/70 backdrop-blur-md p-1.5 rounded-full border border-neutral-800/20 shadow-md">
        {/* GitHub Button */}
        <a
          href={siteConfig.githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-900 bg-white/80 hover:bg-neutral-900 hover:text-white transition-all duration-200 text-xs md:text-sm font-medium tracking-tight text-neutral-900 shadow-sm active:scale-95"
          title="GitHub"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>{t.nav.github}</span>
        </a>

        {/* Home Button */}
        <button
          onClick={onHomeClick}
          className="flex items-center justify-center p-2 rounded-full border border-neutral-900 bg-white/80 hover:bg-neutral-900 hover:text-white transition-all duration-200 text-neutral-900 shadow-sm active:scale-95"
          title={t.nav.home}
          type="button"
        >
          <Home className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Contact Button */}
        <a
          href={siteConfig.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3.5 py-1.5 rounded-full border border-neutral-900 bg-white/80 hover:bg-neutral-900 hover:text-white transition-all duration-200 text-xs md:text-sm font-medium tracking-tight text-neutral-900 shadow-sm active:scale-95"
        >
          <span>{t.nav.contact}</span>
        </a>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-900 bg-white/80 hover:bg-neutral-900 hover:text-white transition-all duration-200 text-xs md:text-sm font-medium tracking-tight text-neutral-900 shadow-sm active:scale-95"
            title={t.nav.language}
            type="button"
            aria-expanded={isLangOpen}
          >
            <Globe className="w-3.5 h-3.5 stroke-[2]" />
            <span className="uppercase text-[11px] md:text-xs font-semibold">{currentOption.code}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-900/15 shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {languages.map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`flex items-center justify-between w-full px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    language === item.code
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[10px] uppercase opacity-60 font-mono">{item.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
