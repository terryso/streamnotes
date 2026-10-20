#!/usr/bin/env python3
"""Bilingual crawl check for StreamNotes.

Usage: python3 scripts/crawl-check.py [BASE_URL]   (default https://streamnotes.terryso.dev)

- Fetches every URL in the sitemap (plus search pages, feeds, llms files), expects 200.
- On every HTML page: collects the language-switch links ([data-lang-switch], .subnav__lang)
  and hreflang alternates, checks they resolve 200, and that hreflang pairs are reciprocal.
- On every EN page: reports leftover CJK text outside <script>/<style>, excluding an allowlist
  of intentional proper nouns (brand name and the language-switch label).
- Checks that unknown URLs return 404 (EN 404 page for /en/*).
Exit code 1 if any check fails.
"""
import re, sys, html, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse

LIVE = 'https://streamnotes.terryso.dev'
BASE = (sys.argv[1] if len(sys.argv) > 1 else LIVE).rstrip('/')
ALLOW_CJK = {'流媒笔记', '中文', '阅读本页中文版'}
CJK = re.compile(r'[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]+')

def to_base(u):
    return BASE + urlparse(u).path if u.startswith(LIVE) else (BASE + u if u.startswith('/') else u)

cache = {}
def get(u):
    if u in cache: return cache[u]
    req = urllib.request.Request(u, headers={'User-Agent': 'streamnotes-crawl-check/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            res = (r.status, r.read().decode('utf-8', 'replace'), r.headers.get('content-type', ''))
    except urllib.error.HTTPError as e:
        res = (e.code, e.read().decode('utf-8', 'replace'), e.headers.get('content-type', ''))
    except Exception as e:
        res = (0, str(e), '')
    cache[u] = res
    return res

fails = []
def fail(msg): fails.append(msg)

idx = get(BASE + '/sitemap-index.xml')
if idx[0] != 200: print('sitemap-index missing', idx[0]); sys.exit(1)
urls = []
for sm in re.findall(r'<loc>([^<]+)</loc>', idx[1]):
    st, body, _ = get(to_base(sm))
    urls += re.findall(r'<loc>([^<]+)</loc>', body)
    alt_links = len(re.findall(r'<xhtml:link', body))
paths = sorted({urlparse(u).path for u in urls})
extra = ['/search/', '/en/search/', '/rss.xml', '/en/rss.xml', '/llms.txt', '/llms-full.txt', '/search.json', '/robots.txt']
zh_pages = [p for p in paths if not p.startswith('/en/')]
en_pages = [p for p in paths if p.startswith('/en/')]
print(f'Sitemap: {len(paths)} URLs ({len(zh_pages)} zh, {len(en_pages)} en), {alt_links} xhtml:link alternates')

# every zh sitemap page must have an en twin in the sitemap and vice versa
for p in zh_pages:
    if '/en' + p not in paths: fail(f'sitemap: missing EN twin for {p}')
for p in en_pages:
    if (p[3:] or '/') not in paths: fail(f'sitemap: missing ZH twin for {p}')

all_paths = paths + extra
with ThreadPoolExecutor(8) as ex:
    results = dict(zip(all_paths, ex.map(lambda p: get(BASE + p), all_paths)))
for p, (st, _, _) in results.items():
    if st != 200: fail(f'{p}: HTTP {st}')

switch_targets, hreflang = set(), {}
leftovers = {}
for p, (st, body, ct) in results.items():
    if st != 200 or 'html' not in ct: continue
    sw = re.findall(r'<a[^>]*(?:data-lang-switch|class="subnav__lang")[^>]*>', body)
    if not sw: fail(f'{p}: no language switcher')
    for tag in sw:
        m = re.search(r'href="([^"]+)"', tag)
        if m: switch_targets.add((p, urlparse(urljoin(LIVE + p, html.unescape(m.group(1)))).path))
    alts = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', body))
    if p not in ('/search/', '/en/search/'):
        if not {'zh-CN', 'en', 'x-default'} <= set(alts): fail(f'{p}: hreflang incomplete {sorted(alts)}')
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', body)
        if not canon or urlparse(canon.group(1)).path != p: fail(f'{p}: canonical mismatch {canon and canon.group(1)}')
        lang = re.search(r'<html lang="([^"]+)"', body).group(1)
        want = 'en' if p.startswith('/en/') else 'zh-CN'
        if lang != want: fail(f'{p}: html lang={lang}, expected {want}')
        ogl = re.search(r'og:locale" content="([^"]+)"', body).group(1)
        if ogl != ('en_US' if want == 'en' else 'zh_CN'): fail(f'{p}: og:locale={ogl}')
        hreflang[p] = {k: urlparse(v).path for k, v in alts.items()}
    if p.startswith('/en/'):
        text = re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>', ' ', body, flags=re.S)
        found = {w for w in CJK.findall(html.unescape(text)) if w not in ALLOW_CJK}
        if found: leftovers[p] = sorted(found)

# reciprocity
for p, a in hreflang.items():
    other = a['en'] if not p.startswith('/en/') else a['zh-CN']
    back = hreflang.get(other, {})
    key = 'zh-CN' if not p.startswith('/en/') else 'en'
    if back.get(key) != p: fail(f'{p}: hreflang not reciprocal with {other}')

# switcher targets must resolve 200 and be the twin
targets = sorted({t for _, t in switch_targets})
with ThreadPoolExecutor(8) as ex:
    tres = dict(zip(targets, ex.map(lambda t: get(BASE + t)[0], targets)))
for src, t in sorted(switch_targets):
    if tres[t] != 200: fail(f'{src}: switcher -> {t} HTTP {tres[t]}')
    twin = (src[3:] or '/') if src.startswith('/en/') else '/en' + src
    if t != twin and src not in ('/search/', '/en/search/'): fail(f'{src}: switcher -> {t}, expected twin {twin}')

for p, words in leftovers.items(): fail(f'{p}: leftover CJK on EN page: {words[:12]}')

# 404 behavior
for p, want_lang in (('/no-such-page-xyz/', 'zh-CN'), ('/en/no-such-page-xyz/', 'en')):
    st, body, _ = get(BASE + p)
    lang = (re.search(r'<html lang="([^"]+)"', body) or [None, None])[1]
    print(f'404 check {p}: HTTP {st}, lang={lang}')
    if st != 404: fail(f'{p}: expected 404, got {st}')
    if lang and lang != want_lang: fail(f'{p}: 404 page lang {lang}, expected {want_lang}')

print(f'Checked {len(results)} URLs, {len(switch_targets)} switcher links ({len(targets)} unique targets), {len(hreflang)} hreflang pages')
print(f'EN pages with leftover CJK: {len(leftovers)}')
if fails:
    print(f'\nFAIL ({len(fails)}):'); [print(' -', f) for f in fails]; sys.exit(1)
print('\nALL CHECKS PASSED')
