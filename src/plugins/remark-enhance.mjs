// Inserts inline figures (from src/data/images.json) and a neutral mid-article CTA
// into article Markdown at build time, so the Markdown files stay clean.
import fs from 'node:fs';
import path from 'node:path';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let IMAGES;
function images() {
  if (!IMAGES) IMAGES = JSON.parse(fs.readFileSync(path.resolve('src/data/images.json'), 'utf8'));
  return IMAGES;
}

function figure(img) {
  const c = img.credit || {};
  const credit = c.landing
    ? `图片：<a href="${esc(c.landing)}" target="_blank" rel="noopener nofollow">${esc(c.creator)}</a> · ${esc(c.source_name || c.source)} · ${esc(c.license)}`
    : `图片：${esc(c.creator)} · ${esc(c.license)}`;
  return `<figure class="figure"><img src="${img.src}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async" /><figcaption>${esc(img.caption)}<span class="credit">${credit}</span></figcaption></figure>`;
}

function midCta(slug) {
  return `<aside class="cta-inline" aria-label="选型参考"><div class="cta-inline__text"><span class="eyebrow">选型参考</span><strong>想系统评估企业视频平台？</strong><p>对照中立的选型清单梳理需求，再在自己的业务场景里实测多家方案。</p></div><div class="cta-inline__actions"><a class="btn btn-primary" href="/articles/enterprise-live-platform-selection/">查看选型清单</a><a class="btn btn-ghost" href="/category/selection/">浏览方案选型</a></div></aside>`;
}

export default function remarkEnhance() {
  return (tree, file) => {
    const fp = file.path || (file.history && file.history[0]) || '';
    if (!fp.includes(`${path.sep}articles${path.sep}`)) return;
    const slug = path.basename(fp, '.md');
    const rec = images().articles[slug];
    const h2 = tree.children.map((n, i) => (n.type === 'heading' && n.depth === 2 ? i : -1)).filter((i) => i >= 0);
    if (h2.length < 2) return;
    const inserts = []; // [index, htmlValue]
    const inl = rec?.inline || [];
    if (inl[0]) inserts.push([h2[1], figure(inl[0])]);
    const midIdx = h2[Math.max(2, Math.floor(h2.length / 2))] ?? h2[h2.length - 1];
    inserts.push([midIdx, midCta(slug)]);
    if (inl[1]) {
      const pos = h2[Math.min(h2.length - 1, Math.max(3, Math.floor(h2.length * 0.75)))];
      inserts.push([pos === midIdx ? pos : pos, figure(inl[1])]);
    }
    // insert from the end so indices stay valid; stable order for equal indices
    inserts.sort((a, b) => b[0] - a[0]);
    for (const [idx, value] of inserts) tree.children.splice(idx, 0, { type: 'html', value });
  };
}
