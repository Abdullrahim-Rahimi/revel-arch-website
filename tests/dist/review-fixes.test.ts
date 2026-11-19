import { describe, it, expect } from 'vitest';
import { load } from './helpers';
import { formatHours } from '../../src/lib/hours';
import { siteConfig } from '../../src/site.config';

describe.each(['en', 'ar'] as const)('review fixes (%s)', (lang) => {
  it('marks the services page intro and process as placeholder while the page entry is', () => {
    const root = load(`/${lang}/services/`);
    expect(root.querySelector('.page-head .lead')?.getAttribute('data-placeholder')).toBeDefined();
    expect(root.querySelector('.process-block')?.closest('[data-placeholder]') ?? root.querySelector('.process-block[data-placeholder], .process-block [data-placeholder]')).not.toBeNull();
  });

  it('shows opening hours generated from the same config as the structured data', () => {
    expect(load(`/${lang}/contact/`).querySelector('[data-hours]')!.text.trim()).toBe(formatHours(lang, siteConfig.hours));
  });

  it('marks the map link and coordinates as placeholders', () => {
    const root = load(`/${lang}/contact/`);
    expect(root.querySelector('[data-placeholder=map] a[href^="https://www.google.com/maps/"], a[data-placeholder=map]')).not.toBeNull();
    expect(root.querySelector('[data-placeholder=geo]')).not.toBeNull();
  });

  it('gives the language switch an accessible name that matches its visible text', () => {
    const sw = load(`/${lang}/`).querySelector('a[data-lang-switch]')!;
    expect(sw.getAttribute('aria-label')).toBeUndefined();
  });
});

describe('Arabic project headings use Arabic punctuation', () => {
  it('joins title and location with an Arabic comma', () => {
    const root = load('/ar/projects/sea-chalet/');
    expect(root.querySelector('h1')!.text).toContain('، ');
    expect(root.querySelector('h1')!.text).not.toContain(', ');
    expect(root.querySelector('title')!.text).not.toContain(', ');
  });
});
