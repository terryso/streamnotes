import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_NAME_EN, SITE_DESCRIPTION, CATEGORIES } from '../consts';
import { CATEGORIES_EN, SITE_EN } from '../lib/i18n';

export async function GET({ site }) {
  const posts = (await getCollection('articles', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  const postsEn = (await getCollection('articlesEn', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  let out = `# ${SITE_NAME}（${SITE_NAME_EN}）\n\n> ${SITE_DESCRIPTION}\n\nLanguages: Simplified Chinese (zh-CN, default) and English (en) for selected articles. Chinese URLs: /articles/<slug>/; English twins: /en/articles/<slug>/. Articles include TL;DR, FAQ, and sources. This site is not sponsored or operated by any vendor. Full text: ${new URL('llms-full.txt', site).href}\n\n`;
  for (const [k, c] of Object.entries(CATEGORIES)) {
    const list = posts.filter((p) => p.data.category === k);
    if (!list.length) continue;
    out += `## ${c.name}\n\n`;
    for (const p of list) out += `- [${p.data.title}](${new URL(`/articles/${p.id}/`, site).href}): ${p.data.description}\n`;
    out += '\n';
  }
  if (postsEn.length) {
    out += `## English editions\n\n`;
    for (const p of postsEn) {
      const cat = CATEGORIES_EN[p.data.category]?.name || p.data.category;
      out += `- [${p.data.title}](${new URL(`/en/articles/${p.id}/`, site).href}) (${cat}): ${p.data.description}\n`;
    }
    out += `\nEnglish hub: ${new URL('/en/', site).href}\n\n`;
  }
  out += `## Other\n\n- [About](${new URL('/about/', site).href})\n- [About (EN)](${new URL('/en/about/', site).href})\n- [RSS](${new URL('/rss.xml', site).href})\n- [Sitemap](${new URL('/sitemap-index.xml', site).href})\n`;
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
