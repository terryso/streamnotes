import rss from '@astrojs/rss';
import { getArticlesEn } from '../../lib/articles';
import { CATEGORIES_EN, ui } from '../../lib/i18n';
export async function GET(context) {
  const t = ui('en');
  const posts = await getArticlesEn();
  return rss({
    title: t.siteName,
    description: t.description,
    site: context.site,
    customData: '<language>en</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/en/articles/${p.id}/`,
      categories: [CATEGORIES_EN[p.data.category].name, ...p.data.tags],
    })),
  });
}
