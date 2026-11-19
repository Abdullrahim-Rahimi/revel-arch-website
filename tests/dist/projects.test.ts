import { describe, it, expect } from 'vitest';
import { load, ldOf } from './helpers';

const SLUGS = ['courtyard-villa', 'family-villa', 'sea-chalet', 'mixed-use-building'];

describe.each(['en', 'ar'] as const)('projects index /%s/projects/', (lang) => {
  const root = load(`/${lang}/projects/`);
  it('lists every project, all visible without JavaScript', () => {
    const cards = root.querySelectorAll('[data-project-card]');
    expect(cards).toHaveLength(4);
    for (const c of cards) expect(c.getAttribute('hidden')).toBeUndefined();
  });
  it('offers type filters', () => {
    const filters = root.querySelectorAll('[data-filter]').map((b) => b.getAttribute('data-filter'));
    expect(filters).toEqual(['all', 'villa', 'chalet', 'commercial']);
  });
});

describe.each(['en', 'ar'] as const)('project pages in %s', (lang) => {
  it.each(SLUGS)('%s has heading, facts, gallery, data and breadcrumbs', (slug) => {
    const root = load(`/${lang}/projects/${slug}/`);
    const h1 = root.querySelectorAll('h1');
    expect(h1).toHaveLength(1);
    const facts = root.querySelector('dl.facts');
    expect(facts).not.toBeNull();
    const location = facts!.querySelector('[data-fact=location]')!.text.trim();
    expect(h1[0].text).toContain(location);
    expect(facts!.querySelector('[data-fact=type]')).not.toBeNull();
    expect(facts!.querySelector('[data-fact=status]')).not.toBeNull();
    expect(root.querySelectorAll('.gallery picture').length).toBeGreaterThan(0);
    expect(root.querySelector('main time[datetime]')).not.toBeNull();

    const canonical = root.querySelector('link[rel=canonical]')!.getAttribute('href');
    const work = ldOf(root).find((x) => x['@type'] === 'CreativeWork');
    expect(work.url).toBe(canonical);
    expect(work.image.length).toBeGreaterThan(0);

    const bc = ldOf(root).find((x) => x['@type'] === 'BreadcrumbList');
    expect(bc.itemListElement.map((i: any) => i.item)).toEqual([
      `https://rvl.design/${lang}/`,
      `https://rvl.design/${lang}/projects/`,
      canonical,
    ]);
  });
});

describe('project language switch', () => {
  it('points to the same project in the other language', () => {
    expect(load('/en/projects/sea-chalet/').querySelector('a[data-lang-switch]')?.getAttribute('href')).toBe('/ar/projects/sea-chalet/');
  });
});

describe('render labelling', () => {
  it('tells visitors when images are renders', () => {
    expect(load('/en/projects/mixed-use-building/').querySelector('[data-render-note]')).not.toBeNull();
    expect(load('/en/projects/sea-chalet/').querySelector('[data-render-note]')).toBeNull();
  });
});
