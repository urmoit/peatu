import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type LanguageCode, type TranslationKey } from "./translations";

const LANGUAGE_KEY = "peatu:language";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.keys(params).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(params[key])),
    template
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (stored === "en" || stored === "et") {
          setLanguageState(stored);
        }
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});
  };

  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>) =>
      interpolate(translations[language][key] ?? translations.en[key] ?? key, params);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, isLoaded }),
    [language, t, isLoaded]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
