import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Language, TranslationsDictionary } from './types';
import { enTranslations } from './locales/en';
import { esTranslations } from './locales/es';
import { ptTranslations } from './locales/pt';
import { getLocalizedCase } from './casesI18n';
import { getLocalizedCharacters, getLocalizedStageCutscenes } from './charactersI18n';
import { ForensicCase } from '../data/cases';
import { CharacterId, CharacterProfile, StageCutsceneScript } from '../data/characters';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationsDictionary) => string;
  getCase: (caseId: string) => ForensicCase;
  characters: Record<CharacterId, CharacterProfile>;
  stageCutscenes: Record<number, StageCutsceneScript>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('query_noir_lang');
    if (saved === 'en' || saved === 'es' || saved === 'pt') {
      return saved;
    }
    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('es')) return 'es';
    if (navLang.startsWith('pt')) return 'pt';
  } catch {
    // Ignore storage errors
  }
  return 'en';
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('query_noir_lang', lang);
    } catch {
      // Ignore storage errors
    }
  };

  const dictionary = useMemo<TranslationsDictionary>(() => {
    switch (language) {
      case 'es':
        return esTranslations;
      case 'pt':
        return ptTranslations;
      default:
        return enTranslations;
    }
  }, [language]);

  const t = (key: keyof TranslationsDictionary): string => {
    return dictionary[key] || enTranslations[key] || String(key);
  };

  const getCase = (caseId: string): ForensicCase => {
    return getLocalizedCase(caseId, language);
  };

  const characters = useMemo(() => {
    return getLocalizedCharacters(language);
  }, [language]);

  const stageCutscenes = useMemo(() => {
    return getLocalizedStageCutscenes(language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getCase,
        characters,
        stageCutscenes
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
