import { describe, it, expect } from 'vitest';
import { load, readRaw, ldOf } from './helpers';

const PREFILL = {
  en: "Hello Revēl Architecture team, I'd like to discuss my project with you.",
  ar: 'مرحباً فريق رڤيل للتصميم المعماري، أودّ مناقشة مشروعي معكم.',
};

describe.each(['en', 'ar'] as const)('page shell /%s/', (lang) => {
  const root = load(`/${lang}/`);
  const html = root.querySelector('html')!;

  it('sets lang and dir', () => {
    expect(html.getAttribute('lang')).toBe(lang);
    expect(html.getAttribute('dir')).toBe(lang === 'ar' ? 'rtl' : 'ltr');
  });

  it('has exactly one h1', () => {
    expect(root.querySelectorAll('h1')).toHaveLength(1);
  });

  it('has canonical and hreflang alternates', () => {
    expect(root.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(`https://rvl.design/${lang}/`);
    const alt = (h: string) => root.querySelector(`link[rel=alternate][hreflang=${h}]`)?.getAttribute('href');
    expect(alt('en')).toBe('https://rvl.design/en/');
    expect(alt('ar')).toBe('https://rvl.design/ar/');
    expect(alt('x-default')).toBe('https://rvl.design/en/');
  });

  it('has description, Open Graph and Twitter tags', () => {
    expect(root.querySelector('meta[name=description]')?.getAttribute('content')?.length).toBeGreaterThan(20);
    expect(root.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(root.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/^https:\/\/rvl\.design\//);
    expect(root.querySelector('meta[name="twitter:card"]')).not.toBeNull();
  });

  it('links the language switch to the same page in the other language', () => {
    const other = lang === 'en' ? 'ar' : 'en';
    const sw = root.querySelector('a[data-lang-switch]');
    expect(sw?.getAttribute('href')).toBe(`/${other}/`);
    expect(sw?.getAttribute('hreflang')).toBe(other);
  });

  it('has a WhatsApp link with the page-language prefill', () => {
    const a = root.querySelector('a[href^="https://wa.me/"]');
    expect(a).not.toBeNull();
    const url = new URL(a!.getAttribute('href')!);
    expect(url.searchParams.get('text')).toBe(PREFILL[lang]);
  });

  it('is noindex in a preview build', () => {
    expect(root.querySelector('meta[name=robots]')?.getAttribute('content')).toBe('noindex,nofollow');
    expect(html.getAttribute('data-env')).toBe('preview');
  });

  it('has a skip link to main content', () => {
    const skip = root.querySelector('a.skip-link');
    expect(skip?.getAttribute('href')).toBe('#main');
    expect(root.querySelector('main#main')).not.toBeNull();
  });
});

describe('root page /', () => {
  const root = load('/');
  it('links to both languages without JavaScript', () => {
    expect(root.querySelector('a[href="/en/"]')).not.toBeNull();
    expect(root.querySelector('a[href="/ar/"]')).not.toBeNull();
  });
  it('declares language alternates', () => {
    expect(root.querySelector('link[rel=alternate][hreflang=en]')).not.toBeNull();
    expect(root.querySelector('link[rel=alternate][hreflang=ar]')).not.toBeNull();
  });
});

describe('Arabic pages before approval', () => {
  it('mark main as unreviewed Arabic', () => {
    expect(load('/ar/').querySelector('main')?.getAttribute('data-placeholder')).toBe('arabic-unreviewed');
    expect(load('/en/').querySelector('main')?.getAttribute('data-placeholder')).toBeUndefined();
  });
});

describe('404 page', () => {
  it('exists and speaks both languages', () => {
    const raw = readRaw('404.html');
    expect(raw).toContain('Page not found');
    expect(raw).toContain('الصفحة غير موجودة');
  });
});

describe('structured data on every page', () => {
  it.each(['en', 'ar'])('/%s/ has exactly one organization block', (lang) => {
    const orgs = ldOf(load(`/${lang}/`)).filter((x) => String(x['@id'] ?? '').endsWith('#org'));
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toBe(lang === 'ar' ? 'مكتب رڤيل للتصميم المعماري' : 'Revēl Architecture');
  });
});
