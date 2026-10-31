import { useState, useEffect, useCallback } from "react";
import { SupportedLanguage } from "../types";
import { translations, TranslationDictionary } from "./translations";

const STORAGE_KEY = "fig_language";

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "de", label: "Deutsch", flag: "DE" },
  { code: "fr", label: "Français", flag: "FR" },
];

function detectInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (saved && translations[saved]) {
    return saved;
  }
  const browserLang = (navigator.language || "").toLowerCase().slice(0, 2);
  if (browserLang === "tr") return "tr";
  if (browserLang === "es") return "es";
  if (browserLang === "de") return "de";
  if (browserLang === "fr") return "fr";
  return "en";
}

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(detectInitialLanguage);

  useEffect(() => {
    const handleStorage = () => {
      const updated = detectInitialLanguage();
      setCurrentLang(updated);
    };

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguage>;
      if (customEvent.detail && translations[customEvent.detail]) {
        setCurrentLang(customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("fig_language_changed", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("fig_language_changed", handleCustom);
    };
  }, []);

  const changeLanguage = useCallback((newLang: SupportedLanguage) => {
    if (translations[newLang]) {
      localStorage.setItem(STORAGE_KEY, newLang);
      setCurrentLang(newLang);
      window.dispatchEvent(
        new CustomEvent("fig_language_changed", { detail: newLang })
      );
    }
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary): string => {
      const dict = translations[currentLang] || translations.en;
      return dict[key] || translations.en[key] || (key as string);
    },
    [currentLang]
  );

  return {
    t,
    language: currentLang,
    setLanguage: changeLanguage,
    languages: SUPPORTED_LANGUAGES,
    dict: translations[currentLang] || translations.en,
  };
}
