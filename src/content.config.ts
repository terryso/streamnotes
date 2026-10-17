import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['tutorial', 'selection', 'industry', 'news']),
    tags: z.array(z.string()).default([]),
    promo: z.boolean().default(false),
    cardTitle: z.string().optional(),       // neutral title for site-wide listings (promo articles)
    cardDescription: z.string().optional(), // neutral summary for site-wide listings
    draft: z.boolean().default(false),
    tldr: z.array(z.string()).min(1),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { articles };
