import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component that should wrap the application
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language | null;
    return saved ?? 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => (prev === 'en' ? 'ko' : 'en'));

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, toggleLanguage } },
    children
  );
};

// Hook to consume the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};