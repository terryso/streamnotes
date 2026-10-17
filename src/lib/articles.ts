import { getCollection, type CollectionEntry } from 'astro:content';
import images from '../data/images.json';

export type Article = CollectionEntry<'articles'>;
type ImgRec = { cover: { src: string; src800: string; w: number; h: number; alt: string; credit: any }; og: string; inline: any[] };

export async function getArticles(): Promise<Article[]> {
  return (await getCollection('articles', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
}
export function imagesFor(slug: string): ImgRec | undefined {
  return (images as any).articles[slug];
}
export const siteImages = (images as any).site;
export function readingMinutes(body = ''): number {
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (body.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 450 + words / 200));
}
export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
