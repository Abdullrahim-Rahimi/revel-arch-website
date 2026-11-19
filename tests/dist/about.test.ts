import { describe, it, expect } from 'vitest';
import { load, ldOf } from './helpers';

const PAGES = ['/about/', '/lead-architect/'];

describe.each(['en', 'ar'] as const)('answer-first pages in %s', (lang) => {
  it.each(PAGES)('%s has one h1, question headings with direct answers, and a last-updated date', (p) => {
    const root = load(`/${lang}${p}`);
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    const qs = root.querySelectorAll('main h2').filter((h) => /[?؟]\s*$/.test(h.text.trim()));
    expect(qs.length).toBeGreaterThanOrEqual(3);
    for (const h of qs) {
      const answer = h.nextElementSibling;
      expect(answer?.classList.contains('answer')).toBe(true);
      expect(answer!.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(20);
    }
    expect(root.querySelector('main time[datetime]')?.getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it.each(PAGES)('%s has breadcrumbs, visible and structured', (p) => {
    const root = load(`/${lang}${p}`);
    expect(root.querySelector('nav.breadcrumbs a')?.getAttribute('href')).toBe(`/${lang}/`);
    const bc = ldOf(root).find((x) => x['@type'] === 'BreadcrumbList');
    expect(bc.itemListElement).toHaveLength(2);
    expect(bc.itemListElement[1].item).toBe(`https://rvl.design/${lang}${p}`);
  });
});

describe('lead architect structured data', () => {
  it('describes the person and links them to the firm', () => {
    const person = ldOf(load('/en/lead-architect/')).find((x) => x['@type'] === 'Person');
    expect(person['@id']).toBe('https://rvl.design/#lead-architect');
    expect(person.honorificPrefix).toBe('Sayed');
    expect(person.worksFor['@id']).toBe('https://rvl.design/#org');
    expect(person.knowsAbout.length).toBeGreaterThanOrEqual(3);
    expect(person.image).toMatch(/^https:\/\/rvl\.design\//);
  });
  it('uses the Arabic name on the Arabic page', () => {
    const person = ldOf(load('/ar/lead-architect/')).find((x) => x['@type'] === 'Person');
    expect(person.name).toBe('حسين الموسوي');
  });
});
