import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LandingTranslations, LanguageOption, SupportedLanguage } from './types';
import { languageOptions, translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: LandingTranslations;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'fig_landing_lang';

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'tr';

  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (saved && ['tr', 'en', 'es', 'de', 'fr'].includes(saved)) {
    return saved;
  }

  const browserLang = navigator.language?.toLowerCase() || '';
  if (browserLang.startsWith('tr')) return 'tr';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('en')) return 'en';

  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage may fail in restricted sandboxes
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language] || translations.en,
      languages: languageOptions,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
