export const LANGS = ['en', 'th'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';
export const LANG_STORAGE_KEY = 'lore_lang';

export const LANG_LABEL: Record<Lang, string> = {
  en: 'EN',
  th: 'ไทย',
};

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}
