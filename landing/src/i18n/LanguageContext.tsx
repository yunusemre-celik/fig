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
const SUPPORTED_LANGS: SupportedLanguage[] = ['tr', 'en', 'es', 'de', 'fr'];

const metaInfo: Record<SupportedLanguage, { title: string; desc: string }> = {
  tr: {
    title: 'Fig - Bu Çark Zaman Kazandırıyor | Dosya Araç Kiti',
    desc: 'Hayır, saat çarkı değil; işlem çarkı. Rust ile geliştirilmiş yerel, %100 çevrimdışı ve ultra hızlı dosya dönüştürme aracı.',
  },
  en: {
    title: 'Fig - This Wheel Saves Your Time | File Toolkit',
    desc: 'No, not a clock gear; an action wheel. Ultra-fast, 100% offline local file converter and desktop toolkit powered by Rust.',
  },
  es: {
    title: 'Fig - Esta Rueda Te Ahorra Tiempo | Kit de Herramientas de Archivos',
    desc: 'No, no es un reloj; es una rueda de acciones. Conversor de archivos local, 100% offline y ultrarrápido creado con Rust.',
  },
  de: {
    title: 'Fig - Dieses Rad Spart Dir Zeit | Datei-Toolkit',
    desc: 'Nein, kein Uhrwerk; ein Aktionsrad. Ultraschneller, 100% offline lokaler Dateikonverter und Desktop-Toolkit mit Rust.',
  },
  fr: {
    title: 'Fig - Cette Roue Vous Fait Gagner du Temps | Boîte à Outils Fichiers',
    desc: "Non, pas une horloge ; une roue d'actions. Convertisseur de fichiers local, 100% hors ligne et ultra rapide propulsé par Rust.",
  },
};

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';

  // 1. Check URL path: e.g. /fig/en/ or /en/ or /fig/tr/
  const pathParts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
  const foundInPath = pathParts.find((p) => SUPPORTED_LANGS.includes(p as SupportedLanguage)) as
    | SupportedLanguage
    | undefined;
  if (foundInPath) return foundInPath;

  // 2. Check query parameter: e.g. ?lang=tr
  try {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang')?.toLowerCase() as SupportedLanguage | null;
    if (paramLang && SUPPORTED_LANGS.includes(paramLang)) {
      return paramLang;
    }
  } catch {
    // Ignore URLSearchParams error in restricted sandboxes
  }

  // 3. Check saved language in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch {
    // Ignore localStorage error
  }

  // 4. Browser language
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

    if (typeof window !== 'undefined' && window.history?.pushState) {
      try {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const existingLangIndex = pathParts.findIndex((p) =>
          SUPPORTED_LANGS.includes(p.toLowerCase() as SupportedLanguage)
        );

        if (existingLangIndex !== -1) {
          pathParts[existingLangIndex] = lang;
          url.pathname = '/' + pathParts.join('/') + '/';
        } else {
          const currentPath = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
          url.pathname = currentPath + lang + '/';
        }
        window.history.pushState({ lang }, '', url.pathname + url.search + url.hash);
      } catch {
        // Fallback silently if URL manipulation is restricted
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
      const foundInPath = pathParts.find((p) => SUPPORTED_LANGS.includes(p as SupportedLanguage)) as
        | SupportedLanguage
        | undefined;
      if (foundInPath && foundInPath !== language) {
        setLanguageState(foundInPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    const currentMeta = metaInfo[language] || metaInfo.en;
    document.title = currentMeta.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentMeta.desc);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', currentMeta.title);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', currentMeta.desc);
    }
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
