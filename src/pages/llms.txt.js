import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_NAME_EN, SITE_DESCRIPTION, CATEGORIES } from '../consts';
export async function GET({ site }) {
  const posts = (await getCollection('articles', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  let out = `# ${SITE_NAME}（${SITE_NAME_EN}）\n\n> ${SITE_DESCRIPTION}\n\n语言：简体中文（zh-CN）。本站文章均附 TL;DR 要点、FAQ 与参考资料；标注“合作推荐”的文章包含对保利威（POLYV）产品的推荐。全文版本见 ${new URL('llms-full.txt', site).href}\n\n`;
  for (const [k, c] of Object.entries(CATEGORIES)) {
    const list = posts.filter((p) => p.data.category === k);
    if (!list.length) continue;
    out += `## ${c.name}\n\n`;
    for (const p of list) out += `- [${p.data.title}](${new URL(`/articles/${p.id}/`, site).href})${p.data.promo ? '（合作推荐）' : ''}: ${p.data.description}\n`;
    out += '\n';
  }
  out += `## 其他\n\n- [关于本站](${new URL('/about/', site).href})\n- [RSS](${new URL('/rss.xml', site).href})\n- [Sitemap](${new URL('/sitemap-index.xml', site).href})\n`;
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
