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

// Tie-break same-day posts by slug so order is deterministic across builds.
const byDate = (a: AnyArticle, b: AnyArticle) => +b.data.pubDate - +a.data.pubDate || a.id.localeCompare(b.id);

export async function getArticles(): Promise<Article[]> {
  return (await getCollection('articles', (e) => !e.data.draft)).sort(byDate) as Article[];
}
export async function getArticlesEn(): Promise<ArticleEn[]> {
  return (await getCollection('articlesEn', (e) => !e.data.draft)).sort(byDate) as ArticleEn[];
}
export async function getArticlesFor(locale: Locale): Promise<AnyArticle[]> {
  return locale === 'en' ? getArticlesEn() : getArticles();
}

export function imagesFor(slug: string): ImgRec | undefined {
  return (images as any).articles[slug];
}
export function coverAlt(slug: string, locale: Locale = 'zh'): string {
  const img = imagesFor(slug);
  if (!img) return '';
  return locale === 'en' && img.cover.altEn ? img.cover.altEn : img.cover.alt;
}
export const siteImages = (images as any).site;
export const imgAlt = (rec: any, locale: Locale) => (locale === 'en' && rec?.altEn ? rec.altEn : rec?.alt ?? '');

export function readingMinutes(body = ''): number {
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (body.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 450 + words / 200));
}
export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
