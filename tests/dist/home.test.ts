import { describe, it, expect } from 'vitest';
import { load } from './helpers';

const SERVICES = ['villas', 'chalets', 'commercial', 'interiors', 'supervision'];

describe.each(['en', 'ar'] as const)('home /%s/', (lang) => {
  const root = load(`/${lang}/`);

  it('leads with the positioning line', () => {
    const h1 = root.querySelector('h1')!.text;
    expect(h1).toContain(lang === 'ar' ? 'عمارة تُصمَّم حول قاطنيها' : 'Architecture, shaped around its inhabitants');
  });

  it('shows at least three featured projects linking to their pages', () => {
    const cards = root.querySelectorAll('[data-project-card] a');
    expect(cards.length).toBeGreaterThanOrEqual(3);
    for (const a of cards) expect(a.getAttribute('href')).toMatch(new RegExp(`^/${lang}/projects/[a-z0-9-]+/$`));
  });

  it('links to each of the five services', () => {
    const hrefs = root.querySelectorAll('[data-services] a').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(SERVICES.map((s) => `/${lang}/services/#${s}`));
  });

  it('introduces the lead architect', () => {
    expect(root.querySelector(`a[href="/${lang}/lead-architect/"][data-architect-teaser]`)).not.toBeNull();
  });

  it('gives every image alt text and dimensions, and lazy-loads all but the hero', () => {
    const imgs = root.querySelectorAll('main img');
    expect(imgs.length).toBeGreaterThan(3);
    for (const img of imgs) {
      expect(img.getAttribute('alt')?.trim()).toBeTruthy();
      expect(img.getAttribute('width')).toBeTruthy();
      expect(img.getAttribute('height')).toBeTruthy();
    }
    expect(imgs[0].getAttribute('loading')).not.toBe('lazy');
    for (const img of imgs.slice(1)) expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('serves modern image formats', () => {
    expect(root.querySelectorAll('main picture source[type="image/avif"]').length).toBeGreaterThan(0);
  });
});
