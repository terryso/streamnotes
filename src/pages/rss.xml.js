import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_DESCRIPTION, CATEGORIES } from '../consts';
export async function GET(context) {
  const posts = (await getCollection('articles', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: '<language>zh-cn</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/articles/${p.id}/`,
      categories: [CATEGORIES[p.data.category].name, ...p.data.tags],
    })),
  });
}
