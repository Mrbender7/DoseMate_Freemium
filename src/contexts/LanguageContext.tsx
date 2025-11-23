import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSecureItem, setSecureItem } from "../utils/secureStorage";
import { translations } from "../locales";

export type Language = "fr" | "en";

type TranslationType = typeof translations.fr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "glucoflow-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = getSecureItem(LANGUAGE_STORAGE_KEY) as Language;
      return stored || "fr";
    } catch {
      return "fr";
    }
  });

  useEffect(() => {
    try {
      setSecureItem(LANGUAGE_STORAGE_KEY, language);
    } catch (e) {
      console.warn("Failed to save language preference", e);
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage: setLanguageState,
    t: translations[language] as TranslationType,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
