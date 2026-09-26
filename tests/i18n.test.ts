import { describe, it, expect } from 'vitest';
import { en } from '../src/i18n/en';
import { zh } from '../src/i18n/zh';
import { zhTW } from '../src/i18n/zh-TW';
import { ja } from '../src/i18n/ja';
import { es } from '../src/i18n/es';
import { pt } from '../src/i18n/pt';
import { id } from '../src/i18n/id';
import { de } from '../src/i18n/de';
import { fr } from '../src/i18n/fr';
import { tr } from '../src/i18n/tr';
import { ar } from '../src/i18n/ar';
import { ko } from '../src/i18n/ko';
import {
  tStatic,
  getTranslation,
  getCurrentLanguage,
  isValidLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  Language,
} from '../src/i18n';

describe('i18n module', () => {
  function getKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        keys = keys.concat(getKeys(obj[k], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  const allTranslations: Record<Language, any> = {
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

  it('has default language set to English', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(getCurrentLanguage()).toBe('en');
  });

  it('contains 12 well-defined supported languages in the metadata list', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(12);
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual([
      'en',
      'ja',
      'zh',
      'zh-TW',
      'es',
      'pt',
      'id',
      'de',
      'fr',
      'tr',
      'ar',
      'ko',
    ]);
    for (const item of SUPPORTED_LANGUAGES) {
      expect(item.flag).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.nativeName).toBeTruthy();
      expect(isValidLanguage(item.code)).toBe(true);
    }
  });

  it('has identical key structures across all 12 supported languages', () => {
    const enKeys = getKeys(en);
    expect(enKeys.length).toBeGreaterThan(50);

    for (const [langCode, translationObj] of Object.entries(allTranslations)) {
      const langKeys = getKeys(translationObj);
      expect(langKeys, `Keys for ${langCode} must match en`).toEqual(enKeys);
    }
  });

  it('translates static paths correctly across multiple languages', () => {
    expect(tStatic('settings.title', undefined, 'zh')).toBe('捕获规则与偏好设置');
    expect(tStatic('settings.title', undefined, 'en')).toBe('Capture Rules & Settings');
    expect(tStatic('settings.title', undefined, 'ja')).toBe('収集ルールと設定');
    expect(tStatic('settings.title', undefined, 'es')).toBe('Reglas de captura y ajustes');
    expect(tStatic('settings.title', undefined, 'pt')).toBe('Regras de captura e configurações');
    expect(tStatic('settings.title', undefined, 'id')).toBe('Aturan & Pengaturan Penangkapan');
    expect(tStatic('settings.title', undefined, 'de')).toBe('Erfassungsregeln & Einstellungen');
    expect(tStatic('settings.title', undefined, 'fr')).toBe('Règles de capture et paramètres');
    expect(tStatic('settings.title', undefined, 'tr')).toBe('Yakalama Kuralları ve Ayarlar');
    expect(tStatic('settings.title', undefined, 'ar')).toBe('قواعد الالتقاط والإعدادات');
    expect(tStatic('settings.title', undefined, 'ko')).toBe('수집 규칙 및 설정');

    expect(tStatic('common.appName', undefined, 'en')).toBe('SeenX');
    expect(tStatic('common.appName', undefined, 'ja')).toBe('SeenX');
    expect(tStatic('common.tagline', undefined, 'zh')).toBe('X 浏览历史与全文检索');
    expect(tStatic('common.tagline', undefined, 'en')).toBe('X Browsing History & Search');
    expect(tStatic('common.tagline', undefined, 'ja')).toBe('X 閲覧履歴と全文検索');
  });

  it('interpolates parameters properly', () => {
    expect(tStatic('postCard.threadSeries', { count: 5 }, 'zh')).toBe('串推连载 (5条)');
    expect(tStatic('postCard.threadSeries', { count: 5 }, 'en')).toBe('Thread (5)');
    expect(tStatic('postCard.threadSeries', { count: 5 }, 'ja')).toBe('ツリー (5件)');

    expect(tStatic('main.todayCaptures', { count: 12 }, 'zh')).toBe('今日捕获 12 条');
    expect(tStatic('main.todayCaptures', { count: 12 }, 'en')).toBe('12 captured today');
    expect(tStatic('main.todayCaptures', { count: 12 }, 'ja')).toBe('今日記録したポスト: 12 件');
  });

  it('returns fallback translation on missing or unknown language', () => {
    expect(tStatic('settings.language', undefined, 'nonexistent' as any)).toBe('Language');
  });

  it('returns path if key is not found', () => {
    expect(tStatic('non.existent.key', undefined, 'en')).toBe('non.existent.key');
  });
});
