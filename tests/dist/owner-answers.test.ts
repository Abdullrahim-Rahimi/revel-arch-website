import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { load, ldOf, readRaw } from './helpers';

// Facts confirmed by the owner in the questionnaire (round 1, 19 Nov 2026).
const org = (lang: 'en' | 'ar') => ldOf(load(`/${lang}/`)).find((x) => ([] as string[]).concat(x['@type']).includes('Organization'));

describe('confirmed firm facts', () => {
  it('uses the owner-approved Arabic brand name with ڤ', () => {
    expect(org('ar').name).toBe('مكتب رڤيل للتصميم المعماري');
    expect(org('en').alternateName).toBe('مكتب رڤيل للتصميم المعماري');
    expect(readRaw('/ar/')).not.toContain('ريفيل');
  });
  it('records the founding year and does not claim a legal name we have not confirmed', () => {
    expect(org('en').foundingDate).toBe('2020');
    expect(org('en').legalName).toBeUndefined();
  });
  it('publishes the confirmed contact facts', () => {
    const o = org('en');
    expect(o.telephone).toBe('+965 9970 5773');
    expect(o.email).toBe('hello@rvl.design');
    expect(o.address.streetAddress).toMatch(/Omar Ibn Al-Khattab/);
    expect(o.address.postalCode).toBe('15000');
    expect(o.openingHoursSpecification[0]).toMatchObject({ opens: '08:00', closes: '16:00' });
    expect(o.sameAs).toEqual(expect.arrayContaining([
      'https://www.instagram.com/rvl.arch/',
      'https://www.linkedin.com/company/rev%C4%93l',
      'https://www.tiktok.com/@rvl.arch',
    ]));
  });
  it('never mentions licensing or society membership', () => {
    for (const p of ['/en/about/', '/en/lead-architect/', '/ar/about/', '/ar/lead-architect/']) {
      expect(readRaw(p)).not.toMatch(/licen[cs]e|Society of Engineers|ترخيص|جمعية المهندسين/i);
    }
  });
});

describe.each(['en', 'ar'] as const)('confirmed content in %s', (lang) => {
  it('contact details are no longer marked as placeholders', () => {
    const main = load(`/${lang}/contact/`).querySelector('main')!;
    for (const f of ['whatsapp', 'phone', 'email', 'address', 'hours']) {
      expect(main.querySelector(`[data-placeholder=${f}]`)).toBeNull();
    }
    expect(main.querySelector('a[href="tel:+96599705773"]')).not.toBeNull();
    expect(main.querySelector('a[href="mailto:hello@rvl.design"]')).not.toBeNull();
    expect(main.querySelector('a[href="https://www.tiktok.com/@rvl.arch"]')).not.toBeNull();
    expect(main.querySelector('a[href="https://www.linkedin.com/company/rev%C4%93l"]')).not.toBeNull();
  });
  it('about and lead architect text is confirmed, with no bracketed gaps', () => {
    for (const p of ['/about/', '/lead-architect/']) {
      const main = load(`/${lang}${p}`).querySelector('main')!;
      const own = main.querySelectorAll('[data-placeholder]').filter((e) => e.getAttribute('data-placeholder') !== 'arabic-unreviewed');
      expect(own.map((e) => e.getAttribute('data-placeholder'))).toEqual(p === '/about/' ? ['content'] : []); // about: stock photo only
      expect(main.text).not.toMatch(/\[[^\]]*\]/);
    }
  });
  it('uses the real portrait on the lead architect page', () => {
    const img = load(`/${lang}/lead-architect/`).querySelector('.portrait img');
    expect(img?.getAttribute('alt')).toMatch(/Husain Almousawi|حسين الموسوي/);
    expect(img?.closest('.portrait')?.getAttribute('data-placeholder')).toBeUndefined();
  });
  it('the WhatsApp button sends the owner\'s own message', () => {
    const href = load(`/${lang}/`).querySelector('a[data-whatsapp]')!.getAttribute('href')!;
    expect(href).toContain('wa.me/96599705773');
    expect(decodeURIComponent(href.split('text=')[1])).toBe(
      lang === 'en'
        ? "Hello Revēl Architecture team, I'd like to discuss my project with you."
        : 'مرحباً فريق رڤيل للتصميم المعماري، أودّ مناقشة مشروعي معكم.',
    );
  });
});

describe('lead architect', () => {
  it('goes by Husain, with his own title, LinkedIn and degrees', () => {
    const root = load('/en/lead-architect/');
    expect(root.querySelector('h1')!.text).toBe('Husain Almousawi');
    const person = ldOf(root).find((x) => x['@type'] === 'Person');
    expect(person.jobTitle).toBe('Founder & Principal Architect');
    expect(person.alternateName).toBe('Sayed Husain Almousawi');
    expect(person.sameAs).toContain('https://kw.linkedin.com/in/husain-almousawi-172762289');
    expect(person.alumniOf.name).toBe('Virginia Tech');
    expect(root.querySelector('main')!.text).toContain('Virginia Tech');
  });
});

describe('brand colour', () => {
  it('uses the green from the new logo', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toMatch(/--accent:\s*#006859/i);
    expect(readFileSync('public/favicon.svg', 'utf8')).toMatch(/#006859/i);
  });
});
