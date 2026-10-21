// Inserts inline figures (from src/data/images.json) and a mid-article CTA
// into article Markdown at build time, so the Markdown files stay clean.
import fs from 'node:fs';
import path from 'node:path';

const POLYV_TRIAL = 'https://my.polyv.net/v3/register/';
const POLYV_CONTACT = 'https://www.polyv.net/company/';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const utm = (base, slug, medium, hash = '') => {
  const u = new URL(base);
  u.searchParams.set('utm_source', 'contentsite');
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', slug);
  return u.toString() + hash;
};

let IMAGES;
function images() {
  if (!IMAGES) IMAGES = JSON.parse(fs.readFileSync(path.resolve('src/data/images.json'), 'utf8'));
  return IMAGES;
}

function isEnArticle(fp) {
  return fp.includes(`${path.sep}articles-en${path.sep}`);
}

function isArticle(fp) {
  return fp.includes(`${path.sep}articles${path.sep}`) || isEnArticle(fp);
}

function figure(img, en) {
  const c = img.credit || {};
  const creditLabel = en ? 'Image: ' : '图片：';
  const loc = (s) => (en ? String(s || '').replace('rawpixel 公共领域图库', 'rawpixel Public Domain') : s);
  const credit = c.landing
    ? `${creditLabel}<a href="${esc(c.landing)}" target="_blank" rel="noopener nofollow">${esc(loc(c.creator))}</a> · ${esc(loc(c.source_name || c.source))} · ${esc(c.license)}`
    : `${creditLabel}${esc(loc(c.creator))} · ${esc(c.license)}`;
  const caption = en && img.captionEn ? img.captionEn : (img.caption || '');
  const alt = en && img.altEn ? img.altEn : (img.alt || '');
  return `<figure class="figure"><img src="${img.src}" alt="${esc(alt)}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async" /><figcaption>${esc(caption)}<span class="credit">${credit}</span></figcaption></figure>`;
}

function midCta(slug, en) {
  if (en) {
    return `<aside class="cta-inline" aria-label="Next steps"><div class="cta-inline__text"><span class="eyebrow">Enterprise video</span><strong>Want to test this in your own scenario?</strong><p>You can open a free POLYV account and try live streaming, VOD, interaction, and video encryption hands-on.</p></div><div class="cta-inline__actions"><a class="btn btn-primary" href="${utm(POLYV_TRIAL, 'en-' + slug, 'article_mid')}" target="_blank" rel="noopener sponsored">Start a free trial</a><a class="btn btn-ghost" href="${utm(POLYV_CONTACT, 'en-' + slug, 'article_mid', '#contact-us')}" target="_blank" rel="noopener sponsored">Talk to an advisor</a></div></aside>`;
  }
  return `<aside class="cta-inline" aria-label="方案咨询"><div class="cta-inline__text"><span class="eyebrow">企业视频方案</span><strong>想在自己的业务场景里实测一下？</strong><p>保利威（POLYV）可免费开通账号，可直接体验直播、点播、互动与视频加密等功能。</p></div><div class="cta-inline__actions"><a class="btn btn-primary" href="${utm(POLYV_TRIAL, slug, 'article_mid')}" target="_blank" rel="noopener sponsored">免费开通试用</a><a class="btn btn-ghost" href="${utm(POLYV_CONTACT, slug, 'article_mid', '#contact-us')}" target="_blank" rel="noopener sponsored">联系方案顾问</a></div></aside>`;
}

export default function remarkEnhance() {
  return (tree, file) => {
    const fp = file.path || (file.history && file.history[0]) || '';
    if (!isArticle(fp)) return;
    const en = isEnArticle(fp);
    const slug = path.basename(fp, '.md');
    const rec = images().articles[slug];
    const h2 = tree.children.map((n, i) => (n.type === 'heading' && n.depth === 2 ? i : -1)).filter((i) => i >= 0);
    if (h2.length < 2) return;
    const inserts = [];
    const hidePromo = !!file.data?.astro?.frontmatter?.hidePromo;
    const inl = rec?.inline || [];
    if (inl[0]) inserts.push([h2[1], figure(inl[0], en)]);
    const midIdx = h2[Math.max(2, Math.floor(h2.length / 2))] ?? h2[h2.length - 1];
    if (!hidePromo) inserts.push([midIdx, midCta(slug, en)]);
    if (inl[1]) {
      const pos = h2[Math.min(h2.length - 1, Math.max(3, Math.floor(h2.length * 0.75)))];
      inserts.push([pos, figure(inl[1], en)]);
    }
    inserts.sort((a, b) => b[0] - a[0]);
    for (const [idx, value] of inserts) tree.children.splice(idx, 0, { type: 'html', value });
  };
}
