import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_DESCRIPTION, CATEGORIES } from '../consts';
import { CATEGORIES_EN, SITE_EN } from '../lib/i18n';

export async function GET({ site }) {
  const posts = (await getCollection('articles', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  const postsEn = (await getCollection('articlesEn', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  let out = `# ${SITE_NAME} 全文\n\n> ${SITE_DESCRIPTION}\n\n`;
  for (const p of posts) {
    const d = p.data;
    out += `---\n\n# ${d.title}\n\nURL: ${new URL(`/articles/${p.id}/`, site).href}\nLanguage: zh-CN\n栏目: ${CATEGORIES[d.category].name}\n发布: ${d.pubDate.toISOString().slice(0, 10)}\n\n摘要: ${d.description}\n\n## TL;DR\n\n${d.tldr.map((t) => `- ${t}`).join('\n')}\n\n${(p.body || '').trim()}\n\n`;
    if (d.faq.length) out += `## FAQ\n\n${d.faq.map((f) => `**问：${f.q}**\n\n答：${f.a}`).join('\n\n')}\n\n`;
    if (d.sources.length) out += `## 参考资料\n\n${d.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n')}\n\n`;
  }
  if (postsEn.length) {
    out += `\n\n# ${SITE_EN.name} — English editions\n\n> ${SITE_EN.description}\n\n`;
    for (const p of postsEn) {
      const d = p.data;
      out += `---\n\n# ${d.title}\n\nURL: ${new URL(`/en/articles/${p.id}/`, site).href}\nLanguage: en\nTopic: ${CATEGORIES_EN[d.category].name}\nPublished: ${d.pubDate.toISOString().slice(0, 10)}\n\nSummary: ${d.description}\n\n## TL;DR\n\n${d.tldr.map((t) => `- ${t}`).join('\n')}\n\n${(p.body || '').trim()}\n\n`;
      if (d.faq.length) out += `## FAQ\n\n${d.faq.map((f) => `**Q: ${f.q}**\n\nA: ${f.a}`).join('\n\n')}\n\n`;
      if (d.sources.length) out += `## Sources\n\n${d.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n')}\n\n`;
    }
  }
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
