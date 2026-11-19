import { describe, it, expect } from 'vitest';
import { load } from './helpers';

describe.each(['en', 'ar'] as const)('contact /%s/contact/', (lang) => {
  const root = load(`/${lang}/contact/`);
  const main = root.querySelector('main')!;

  it('offers WhatsApp as the primary action, plus phone and email', () => {
    expect(main.querySelectorAll('a[data-whatsapp="inline"]')).toHaveLength(1);
    expect(main.querySelector('a[href^="tel:"]')).not.toBeNull();
    expect(main.querySelector('a[href^="mailto:"]')).not.toBeNull();
  });

  it('shows the office address, hours and a directions link', () => {
    expect(main.querySelector('address')).not.toBeNull();
    expect(main.querySelector('[data-hours]')).not.toBeNull();
    expect(main.querySelector('a[href^="https://www.google.com/maps/"]')).not.toBeNull();
  });

  it('links to Instagram', () => {
    expect(main.querySelector('a[href="https://www.instagram.com/rvl.arch/"]')).not.toBeNull();
  });

  it('embeds no third-party frames', () => {
    expect(root.querySelectorAll('iframe')).toHaveLength(0);
  });

  it('answers what happens after you message us', () => {
    const h2 = main.querySelectorAll('h2').find((h) => /[?؟]\s*$/.test(h.text.trim()));
    expect(h2?.nextElementSibling?.classList.contains('answer')).toBe(true);
  });
});

describe('Arabic contact details keep left-to-right order', () => {
  it('isolates phone, email and WhatsApp number', () => {
    const main = load('/ar/contact/').querySelector('main')!;
    for (const sel of ['a[href^="tel:"]', 'a[href^="mailto:"]', '[data-whatsapp-number]']) {
      const el = main.querySelector(sel)!;
      expect(el.querySelector('bdi[dir=ltr]') ?? (el.tagName === 'BDI' && el.getAttribute('dir') === 'ltr' ? el : null)).not.toBeNull();
    }
  });
});
