import { getArticles, getArticlesEn, imagesFor } from '../lib/articles';
import { CATEGORIES } from '../consts';
import { CATEGORIES_EN } from '../lib/i18n';

export async function GET() {
  const zh = await getArticles();
  const en = await getArticlesEn();
  const data = [
    ...zh.map((p) => ({
      t: p.data.title,
      d: p.data.description,
      u: `/articles/${p.id}/`,
      c: CATEGORIES[p.data.category].name,
      g: p.data.tags,
      lang: 'zh',
      i: imagesFor(p.id)?.cover.src800 || '',
      k: (p.body || '').replace(/[#>*`|\-\[\]()]/g, ' ').replace(/\s+/g, ' ').slice(0, 1500),
    })),
    ...en.map((p) => ({
      t: p.data.title,
      d: p.data.description,
      u: `/en/articles/${p.id}/`,
      c: CATEGORIES_EN[p.data.category].name,
      g: p.data.tags,
      lang: 'en',
      i: imagesFor(p.id)?.cover.src800 || '',
      k: (p.body || '').replace(/[#>*`|\-\[\]()]/g, ' ').replace(/\s+/g, ' ').slice(0, 1500),
    })),
  ];
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
