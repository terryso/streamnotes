import { getArticles, imagesFor } from '../lib/articles';
import { CATEGORIES } from '../consts';
export async function GET() {
  const posts = await getArticles();
  const data = posts.map((p) => ({
    t: p.data.title, d: p.data.description, u: `/articles/${p.id}/`, c: CATEGORIES[p.data.category].name,
    g: p.data.tags, i: imagesFor(p.id)?.cover.src800 || '', k: (p.body || '').replace(/[#>*`|\-\[\]()]/g, ' ').replace(/\s+/g, ' ').slice(0, 1500),
  }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
