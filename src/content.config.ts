import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every entry carries `placeholder: true` until the owner's real content replaces it.
const base = {
  placeholder: z.boolean().default(true),
  updated: z.coerce.date(),
  title: z.string(),
  description: z.string().max(160),
};

const qa = z.object({ q: z.string(), a: z.string() });
const answerSection = z.object({ question: z.string(), answer: z.string() });

export const SERVICE_IDS = ['villas', 'chalets', 'commercial', 'interiors', 'supervision'] as const;

const services = defineCollection({
  loader: glob({ pattern: '{en,ar}/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      ...base,
      order: z.number(),
      summary: z.string(),
      forWho: z.string(),
      deliverables: z.array(z.string()).min(1),
      faq: z.array(qa).min(2).max(4),
      image: image(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '{en,ar}/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      ...base,
      type: z.enum(['villa', 'chalet', 'commercial']),
      location: z.string(),
      plotArea: z.number().optional(),
      builtArea: z.number().optional(),
      floors: z.string().optional(),
      year: z.number().optional(),
      status: z.enum(['completed', 'under-construction', 'concept']),
      services: z.array(z.enum(SERVICE_IDS)),
      cover: image(),
      coverAlt: z.string(),
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      quote: z.object({ text: z.string(), by: z.string() }).optional(),
      isRender: z.boolean().default(false),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '{en,ar}/*.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      ...base,
      heading: z.string(),
      intro: z.string().optional(),
      sections: z.array(answerSection).default([]),
      positioning: z.string().optional(),
      principles: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      process: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      knowsAbout: z.array(z.string()).default([]),
      pullQuote: z.string().optional(),
      jobTitle: z.string().optional(),
      personName: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

export const collections = { services, projects, pages };
