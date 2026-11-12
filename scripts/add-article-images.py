#!/usr/bin/env python3
"""Create optimized images for one article and register them in src/data/images.json.

Usage:
  python3 scripts/add-article-images.py <slug> spec.json
  python3 scripts/add-article-images.py --variants

spec.json:
{
  "cover":  {"file": "/path/cover.jpg", "alt": "替代文本", "credit": {"creator": "...", "source": "wikimedia", "source_name": "Wikimedia Commons", "license": "CC0", "license_url": "...", "landing": "https://..."}},
  "inline": [{"file": "/path/a.jpg", "alt": "...", "caption": "图注", "credit": {...}}, {...}]
}
Outputs public/images/<slug>/{cover.webp (1600x900), cover-800.webp, cover-720.webp, cover-400.webp, og.jpg (1200x630), inline-N.webp (<=1200w)}.
--variants rebuilds cover-400.webp and cover-720.webp from each existing cover.webp (and recompresses
multicam-live-production/cover-800.webp). It does not touch the homepage hero pipeline.
Cards use 400w below ~230 CSS px and 720w through a phone-width slot at 1.75x; 400w alone is never
selected for a ~280–380px slot. Only use images you have the rights to (CC0/PD or properly licensed);
no real brand logos or identifiable people.
"""
import sys, json, os
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# Default matches the historical cover-800 encode. This one source is a dense concert-hall photo and
# stays ~106KB at quality 76, which is too heavy for an 800x450 card.
HEAVY_QUALITY = {'multicam-live-production': 55}
VARIANTS = ((800, 'cover-800.webp', 'src800'), (720, 'cover-720.webp', 'src720'), (400, 'cover-400.webp', 'src400'))

def crop(im, ratio):
    w, h = im.size
    if w / h > ratio: nw = int(h * ratio); x = (w - nw) // 2; return im.crop((x, 0, x + nw, h))
    nh = int(w / ratio); y = (h - nh) // 2; return im.crop((0, y, w, y + nh))

def save_width(im, dest, width, quality):
    w = min(width, im.width); h = max(1, round(im.height * w / im.width))
    im.resize((w, h), Image.LANCZOS).save(dest, 'WEBP', quality=quality, method=6)
    return w

def write_cover_variants(im, out, slug, rewrite_800=True):
    q = HEAVY_QUALITY.get(slug, 76)
    urls = {}
    for width, name, key in VARIANTS:
        dest = os.path.join(out, name)
        if key == 'src800' and not rewrite_800 and os.path.exists(dest):
            urls[key] = f'/images/{slug}/{name}'
            continue
        save_width(im, dest, width, q)
        urls[key] = f'/images/{slug}/{name}'
        print(f'  {name} {os.path.getsize(dest)} q={q}')
    return urls

def put_variant_urls(cover, urls):
    ordered = {}
    for k, v in cover.items():
        if k in ('src400', 'src720'): continue
        ordered[k] = v
        if k == 'src800':
            ordered['src720'] = urls['src720']
            ordered['src400'] = urls['src400']
    if 'src800' not in ordered:
        ordered.update(urls)
    cover.clear(); cover.update(ordered)

def backfill():
    p = os.path.join(ROOT, 'src', 'data', 'images.json')
    data = json.load(open(p))
    for slug, rec in data['articles'].items():
        cover = rec.get('cover') or {}
        src = cover.get('src')
        if not src: continue
        path = os.path.join(ROOT, 'public', src.lstrip('/'))
        if not os.path.exists(path):
            print('skip', slug); continue
        print(slug)
        im = Image.open(path).convert('RGB')
        urls = write_cover_variants(im, os.path.dirname(path), slug, rewrite_800=slug in HEAVY_QUALITY)
        put_variant_urls(cover, urls)
    with open(p, 'w') as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print('variants ok', len(data['articles']))

if len(sys.argv) == 2 and sys.argv[1] == '--variants':
    backfill(); raise SystemExit(0)
if len(sys.argv) != 3:
    raise SystemExit('usage: python3 scripts/add-article-images.py <slug> spec.json | --variants')
slug, spec = sys.argv[1], json.load(open(sys.argv[2]))
out = os.path.join(ROOT, 'public', 'images', slug); os.makedirs(out, exist_ok=True)
im = ImageOps.exif_transpose(Image.open(spec['cover']['file'])).convert('RGB')
c = crop(im, 16 / 9); w = min(1600, c.width); h = round(w * 9 / 16)
master = c.resize((w, h), Image.LANCZOS)
master.save(f'{out}/cover.webp', 'WEBP', quality=78, method=6)
urls = write_cover_variants(master, out, slug, rewrite_800=True)
crop(im, 1200 / 630).resize((1200, 630), Image.LANCZOS).save(f'{out}/og.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
rec = {'cover': {'w': w, 'h': h, 'alt': spec['cover']['alt'], 'credit': spec['cover']['credit'], 'src': f'/images/{slug}/cover.webp', 'src800': urls['src800'], 'src720': urls['src720'], 'src400': urls['src400']},
       'og': f'/images/{slug}/og.jpg', 'inline': []}
for i, x in enumerate(spec.get('inline', []), 1):
    im = ImageOps.exif_transpose(Image.open(x['file'])).convert('RGB'); w = min(1200, im.width); h = round(im.height * w / im.width)
    im.resize((w, h), Image.LANCZOS).save(f'{out}/inline-{i}.webp', 'WEBP', quality=78, method=6)
    rec['inline'].append({'src': f'/images/{slug}/inline-{i}.webp', 'w': w, 'h': h, 'alt': x['alt'], 'caption': x.get('caption', ''), 'credit': x['credit']})
p = os.path.join(ROOT, 'src', 'data', 'images.json'); data = json.load(open(p))
data['articles'][slug] = rec
with open(p, 'w') as f:
    f.write(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
print('ok', slug, out)
