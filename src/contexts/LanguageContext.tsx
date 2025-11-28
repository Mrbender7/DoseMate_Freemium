import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getNativeItem, setNativeItem } from "../utils/nativeStorage";
import { translations } from "../locales";

export type Language = "fr" | "en";

type TranslationType = typeof translations.fr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "glucoflow-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger la langue au montage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await getNativeItem(LANGUAGE_STORAGE_KEY);
        if (stored) {
          setLanguageState(stored as Language);
        }
      } catch (error) {
        console.error("Failed to load language", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  // Sauvegarder la langue à chaque changement
  useEffect(() => {
    if (!isLoading) {
      const saveLanguage = async () => {
        try {
          await setNativeItem(LANGUAGE_STORAGE_KEY, language);
        } catch (e) {
          console.warn("Failed to save language preference", e);
        }
      };
      saveLanguage();
    }
  }, [language, isLoading]);

  const value: LanguageContextType = {
    language,
    setLanguage: setLanguageState,
    t: translations[language] as TranslationType,
    isLoading,
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
