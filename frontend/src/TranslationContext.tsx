import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Translations } from './translations';

interface TranslationContextType {
  t: Translations;
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'es' | 'en'>('es');

  useEffect(() => {
    // Load language from settings
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.appLanguage) {
        setLanguageState(settings.appLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: 'es' | 'en') => {
    setLanguageState(lang);
    // Update settings in localStorage
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.appLanguage = lang;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const value = {
    t: translations[language],
    language,
    setLanguage,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
