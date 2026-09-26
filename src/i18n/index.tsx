import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, TranslationSchema, SUPPORTED_LANGUAGES, LanguageMeta } from './types';
import { en } from './en';
import { zh } from './zh';
import { zhTW } from './zh-TW';
import { ja } from './ja';
import { es } from './es';
import { pt } from './pt';
import { id } from './id';
import { de } from './de';
import { fr } from './fr';
import { tr } from './tr';
import { ar } from './ar';
import { ko } from './ko';

export * from './types';

export const DEFAULT_LANGUAGE: Language = 'en';

const LANGUAGE_KEY = 'seenx_language';

const translations: Record<Language, TranslationSchema> = {
  en,
  zh,
  'zh-TW': zhTW,
  ja,
  es,
  pt,
  id,
  de,
  fr,
  tr,
  ar,
  ko,
};

export function isValidLanguage(code: any): code is Language {
  return typeof code === 'string' && code in translations;
}

export function getTranslation(lang: Language): TranslationSchema {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}

export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored && isValidLanguage(stored)) {
        return stored;
      }
    } catch {}
  }
  return DEFAULT_LANGUAGE;
}

const listeners = new Set<(lang: Language) => void>();

export async function setLanguage(lang: Language): Promise<void> {
  const safeLang = isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_KEY, safeLang);
    } catch {}
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [LANGUAGE_KEY]: safeLang });
    }
  } catch (err) {
    console.debug('[SeenX i18n] Failed to store language in chrome.storage:', err);
  }

  try {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = safeLang;
      document.documentElement.dir = safeLang === 'ar' ? 'rtl' : 'ltr';
    }
  } catch {}

  try {
    if (typeof chrome !== 'undefined' && chrome.action && chrome.action.setTitle) {
      chrome.action.setTitle({
        title: safeLang === 'zh' || safeLang === 'zh-TW' ? '打开 SeenX 侧边栏' : 'Open SeenX Side Panel',
      }).catch(() => {});
    }
  } catch {}

  listeners.forEach((fn) => fn(safeLang));
}

export function onLanguageChanged(callback: (lang: Language) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function tStatic(
  path: string,
  params?: Record<string, string | number>,
  lang?: Language
): string {
  const activeLang = lang || getCurrentLanguage();
  const dict = getTranslation(activeLang);

  const parts = path.split('.');
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  if (params) {
    let result = current;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return result;
  }

  return current;
}

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => Promise<void>;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: DEFAULT_LANGUAGE,
  setLang: async () => {},
  t: tStatic,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getCurrentLanguage);

  useEffect(() => {
    // 1. Initial sync with chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(LANGUAGE_KEY, (res) => {
        if (res && isValidLanguage(res[LANGUAGE_KEY])) {
          setLangState(res[LANGUAGE_KEY]);
          try {
            localStorage.setItem(LANGUAGE_KEY, res[LANGUAGE_KEY]);
          } catch {}
        }
      });
    }

    // 2. Listen to chrome.storage.onChanged
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local' && changes[LANGUAGE_KEY]) {
        const next = changes[LANGUAGE_KEY].newValue;
        if (isValidLanguage(next)) {
          setLangState(next);
        }
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(storageListener);
    }

    // 3. Listen to internal listeners
    const unsub = onLanguageChanged((next) => {
      setLangState(next);
    });

    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
      unsub();
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  const handleSetLang = useCallback(async (newLang: Language) => {
    setLangState(newLang);
    await setLanguage(newLang);
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      return tStatic(path, params, lang);
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  return useContext(I18nContext);
}
