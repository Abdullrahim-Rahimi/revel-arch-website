import { ui, type UiKey } from './ui';

export const LANGS = ['en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(x: string): x is Lang {
  return (LANGS as readonly string[]).includes(x);
}

type Dict = Record<Lang, Partial<Record<UiKey, string>>>;

/** Build a translator over a dictionary. Never falls back to another language. */
export function makeT(dict: Dict) {
  return function t(lang: Lang, key: UiKey): string {
    const v = dict[lang]?.[key];
    if (!v || !v.trim()) throw new Error(`Missing ${lang} translation: ${key}`);
    return v;
  };
}

export const t = makeT(ui as Dict);

/** '/about/' → '/ar/about/'. `path` is language-less and starts with '/'. */
export function localizedPath(lang: Lang, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${p}`;
}

/** '/en/about/' → '/about/' */
export function stripLang(pathname: string): string {
  const m = pathname.match(/^\/(en|ar)(\/.*)?$/);
  if (!m) return pathname;
  return m[2] ? m[2] : '/';
}

/** Swap the language prefix of a full pathname. */
export function altPath(pathname: string, to: Lang): string {
  return localizedPath(to, stripLang(pathname));
}

export function dirOf(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'ar' : 'en';
}
