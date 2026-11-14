// Pure helpers over collection ids of the form '<lang>/<slug>'. No astro:content import,
// so they can be unit-tested directly.
import { LANGS, type Lang } from '../i18n/utils';

export const slugOf = (id: string): string => id.split('/').slice(1).join('/');
export const langOf = (id: string): Lang => id.split('/')[0] as Lang;

/** Throws if any slug exists in one language but not the other. */
export function assertParity(ids: string[]): void {
  const by: Record<Lang, Set<string>> = { en: new Set(), ar: new Set() };
  for (const id of ids) by[langOf(id)]?.add(slugOf(id));
  const all = new Set([...by.en, ...by.ar]);
  const missing: string[] = [];
  for (const slug of [...all].sort())
    for (const l of LANGS) if (!by[l].has(slug)) missing.push(`Missing ${l} version: ${slug}`);
  if (missing.length) throw new Error(missing.join('; '));
}
