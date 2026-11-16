import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';
import { assertParity, langOf, slugOf } from './content-core';

export { slugOf, langOf };

type Name = 'projects' | 'services' | 'pages';
const checked = new Set<Name>();

async function all<C extends Name>(name: C): Promise<CollectionEntry<C>[]> {
  const entries = (await getCollection(name)) as CollectionEntry<C>[];
  if (!checked.has(name)) {
    assertParity(entries.map((e) => e.id));
    checked.add(name);
  }
  return entries;
}

export async function getProjects(lang: Lang): Promise<CollectionEntry<'projects'>[]> {
  return (await all('projects'))
    .filter((e) => langOf(e.id) === lang)
    .sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || (b.data.year ?? 0) - (a.data.year ?? 0) || a.data.order - b.data.order);
}

export async function getServices(lang: Lang): Promise<CollectionEntry<'services'>[]> {
  return (await all('services')).filter((e) => langOf(e.id) === lang).sort((a, b) => a.data.order - b.data.order);
}

export async function getPage(lang: Lang, slug: string): Promise<CollectionEntry<'pages'>> {
  await all('pages');
  const e = await getEntry('pages', `${lang}/${slug}`);
  if (!e) throw new Error(`Missing page content: ${lang}/${slug}`);
  return e;
}

export async function getProject(lang: Lang, slug: string): Promise<CollectionEntry<'projects'>> {
  await all('projects');
  const e = await getEntry('projects', `${lang}/${slug}`);
  if (!e) throw new Error(`Missing project: ${lang}/${slug}`);
  return e;
}
