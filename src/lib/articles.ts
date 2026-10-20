import { getCollection, type CollectionEntry } from 'astro:content';
import images from '../data/images.json';
import type { Locale } from './i18n';

export type Article = CollectionEntry<'articles'>;
export type ArticleEn = CollectionEntry<'articlesEn'>;
export type AnyArticle = Article | ArticleEn;

type ImgRec = {
  cover: { src: string; src800: string; w: number; h: number; alt: string; altEn?: string; credit: any };
  og: string;
  inline: any[];
};

export async function getArticles(): Promise<Article[]> {
  return (await getCollection('articles', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
}

export async function getArticlesEn(): Promise<ArticleEn[]> {
  return (await getCollection('articlesEn', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
}

export async function hasEnTwin(slug: string): Promise<boolean> {
  const all = await getCollection('articlesEn', (e) => !e.data.draft && e.id === slug);
  return all.length > 0;
}

export async function hasZhTwin(slug: string): Promise<boolean> {
  const all = await getCollection('articles', (e) => !e.data.draft && e.id === slug);
  return all.length > 0;
}

export function imagesFor(slug: string): ImgRec | undefined {
  return (images as any).articles[slug];
}

/** Prefer English alt/caption when locale is en and fields exist. */
export function coverAlt(slug: string, locale: Locale = 'zh'): string {
  const img = imagesFor(slug);
  if (!img) return '';
  return locale === 'en' && img.cover.altEn ? img.cover.altEn : img.cover.alt;
}

export const siteImages = (images as any).site;

export function readingMinutes(body = ''): number {
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (body.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 450 + words / 200));
}

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
