import { describe, it, expect } from 'vitest';
import { localizedPath, altPath, dirOf, t, makeT, isLang } from '../../src/i18n/utils';
import { ui } from '../../src/i18n/ui';

describe('i18n paths', () => {
  it('localizes paths', () => {
    expect(localizedPath('ar', '/about/')).toBe('/ar/about/');
    expect(localizedPath('en', '/')).toBe('/en/');
  });
  it('builds the alternate-language path', () => {
    expect(altPath('/en/projects/villa-one/', 'ar')).toBe('/ar/projects/villa-one/');
    expect(altPath('/ar/', 'en')).toBe('/en/');
  });
  it('maps direction', () => {
    expect(dirOf('ar')).toBe('rtl');
    expect(dirOf('en')).toBe('ltr');
  });
  it('recognises languages', () => {
    expect(isLang('ar')).toBe(true);
    expect(isLang('fr')).toBe(false);
  });
});

describe('ui dictionary', () => {
  it('has every key in both languages, non-empty', () => {
    const en = Object.keys(ui.en).sort();
    const ar = Object.keys(ui.ar).sort();
    expect(ar).toEqual(en);
    for (const k of en) {
      expect((ui.en as Record<string, string>)[k].trim()).not.toBe('');
      expect((ui.ar as Record<string, string>)[k].trim()).not.toBe('');
    }
  });
  it('returns Arabic text for Arabic', () => {
    expect(t('ar', 'nav.home')).toMatch(/[؀-ۿ]/);
  });
  it('throws instead of falling back to English when an Arabic key is missing', () => {
    const broken = { en: { ...ui.en }, ar: { ...ui.ar } } as any;
    delete broken.ar['nav.home'];
    const tb = makeT(broken);
    expect(() => tb('ar', 'nav.home' as any)).toThrow(/Missing ar translation/);
  });
});
