import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: z.enum(['tutorial', 'selection', 'industry', 'news']),
  tags: z.array(z.string()).default([]),
  promo: z.boolean().default(false),
  cardTitle: z.string().optional(),
  cardDescription: z.string().optional(),
  draft: z.boolean().default(false),
  tldr: z.array(z.string()).min(1),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  related: z.array(z.string()).default([]),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: articleSchema,
});

// English twins: same slug as CN when both exist. URLs: /en/articles/<slug>/
const articlesEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles-en' }),
  schema: articleSchema,
});

export const collections = { articles, articlesEn };
