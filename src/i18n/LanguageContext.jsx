import React, { createContext, useState, useEffect } from 'react';
import { translations, defaultLanguage, languageNames } from './translations';

// Create Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('kuntartib-language');
    return saved || defaultLanguage;
  });

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('kuntartib-language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Get translation function
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to default language
        value = translations[defaultLanguage];
        for (const fallbackKey of keys) {
          if (value && value[fallbackKey] !== undefined) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  // Change language
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  // Get all available languages
  const getLanguages = () => {
    return Object.keys(translations).map(code => ({
      code,
      name: languageNames[code] || code
    }));
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      getLanguages,
      translations: translations[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
