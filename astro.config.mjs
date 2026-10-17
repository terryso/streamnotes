import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkEnhance from './src/plugins/remark-enhance.mjs';

export default defineConfig({
  site: 'https://streamnotes.terryso.dev',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/search/') })],
  markdown: { remarkPlugins: [remarkEnhance] },
  build: { format: 'directory', inlineStylesheets: 'always' },
});
