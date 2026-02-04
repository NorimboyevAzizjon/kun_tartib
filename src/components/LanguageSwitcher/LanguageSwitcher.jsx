import React from 'react';
import { useLanguage } from '../../i18n';
import './LanguageSwitcher.css';

// Language flags/icons
const languageFlags = {
  uz: '🇺🇿',
  ru: '🇷🇺',
  en: '🇬🇧'
};

const LanguageSwitcher = ({ variant = 'dropdown' }) => {
  const { language, setLanguage, getLanguages } = useLanguage();
  const languages = getLanguages();

  if (variant === 'buttons') {
    return (
      <div className="language-switcher buttons">
        {languages.map(lang => (
          <button
            key={lang.code}
            className={`lang-btn ${language === lang.code ? 'active' : ''}`}
            onClick={() => setLanguage(lang.code)}
            title={lang.name}
            aria-label={`Tilni ${lang.name} ga o'zgartirish`}
          >
            <span className="lang-flag">{languageFlags[lang.code]}</span>
            <span className="lang-code">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="language-switcher dropdown">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="lang-select"
        aria-label="Tilni tanlash"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {languageFlags[lang.code]} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
