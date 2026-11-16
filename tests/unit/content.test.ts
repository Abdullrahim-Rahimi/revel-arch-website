import { describe, it, expect } from 'vitest';
import { assertParity, slugOf, langOf } from '../../src/lib/content-core';

describe('assertParity', () => {
  it('accepts content present in both languages', () => {
    expect(() => assertParity(['en/a', 'ar/a'])).not.toThrow();
  });
  it('rejects content missing its Arabic version', () => {
    expect(() => assertParity(['en/a', 'ar/a', 'en/b'])).toThrow(/Missing ar version: b/);
  });
  it('rejects content missing its English version', () => {
    expect(() => assertParity(['ar/c'])).toThrow(/Missing en version: c/);
  });
});

describe('id helpers', () => {
  it('splits ids into language and slug', () => {
    expect(slugOf('ar/sea-chalet')).toBe('sea-chalet');
    expect(langOf('ar/sea-chalet')).toBe('ar');
  });
});
