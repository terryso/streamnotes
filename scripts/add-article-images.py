#!/usr/bin/env python3
"""Create optimized images for one article and register them in src/data/images.json.

Usage:
  python3 scripts/add-article-images.py <slug> spec.json
spec.json:
{
  "cover":  {"file": "/path/cover.jpg", "alt": "替代文本", "credit": {"creator": "...", "source": "wikimedia", "source_name": "Wikimedia Commons", "license": "CC0", "license_url": "...", "landing": "https://..."}},
  "inline": [{"file": "/path/a.jpg", "alt": "...", "caption": "图注", "credit": {...}}, {...}]
}
Outputs public/images/<slug>/{cover.webp (1600x900), cover-800.webp, og.jpg (1200x630), inline-N.webp (<=1200w)}.
Only use images you have the rights to (CC0/PD or properly licensed); no real brand logos or identifiable people.
"""
import sys, json, os
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
slug, spec = sys.argv[1], json.load(open(sys.argv[2]))
out = os.path.join(ROOT, 'public', 'images', slug); os.makedirs(out, exist_ok=True)
def crop(im, ratio):
    w, h = im.size
    if w / h > ratio: nw = int(h * ratio); x = (w - nw) // 2; return im.crop((x, 0, x + nw, h))
    nh = int(w / ratio); y = (h - nh) // 2; return im.crop((0, y, w, y + nh))
im = ImageOps.exif_transpose(Image.open(spec['cover']['file'])).convert('RGB')
c = crop(im, 16 / 9); w = min(1600, c.width); h = round(w * 9 / 16)
c.resize((w, h), Image.LANCZOS).save(f'{out}/cover.webp', 'WEBP', quality=78, method=6)
c.resize((800, 450), Image.LANCZOS).save(f'{out}/cover-800.webp', 'WEBP', quality=76, method=6)
crop(im, 1200 / 630).resize((1200, 630), Image.LANCZOS).save(f'{out}/og.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
rec = {'cover': {'w': w, 'h': h, 'alt': spec['cover']['alt'], 'credit': spec['cover']['credit'], 'src': f'/images/{slug}/cover.webp', 'src800': f'/images/{slug}/cover-800.webp'},
       'og': f'/images/{slug}/og.jpg', 'inline': []}
for i, x in enumerate(spec.get('inline', []), 1):
    im = ImageOps.exif_transpose(Image.open(x['file'])).convert('RGB'); w = min(1200, im.width); h = round(im.height * w / im.width)
    im.resize((w, h), Image.LANCZOS).save(f'{out}/inline-{i}.webp', 'WEBP', quality=78, method=6)
    rec['inline'].append({'src': f'/images/{slug}/inline-{i}.webp', 'w': w, 'h': h, 'alt': x['alt'], 'caption': x.get('caption', ''), 'credit': x['credit']})
p = os.path.join(ROOT, 'src', 'data', 'images.json'); data = json.load(open(p))
data['articles'][slug] = rec; json.dump(data, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', slug, out)
