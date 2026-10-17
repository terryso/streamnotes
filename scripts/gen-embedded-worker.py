#!/usr/bin/env python3
"""Fallback deploy: bundle ./dist into a single Worker module (files embedded as base64)
and emit a JS snippet for the Cloudflare MCP `execute` tool that uploads it.
Usage: python3 scripts/gen-embedded-worker.py > /tmp/deploy.js ; execute code="$file:/tmp/deploy.js"."""
import os, sys, json, base64, mimetypes
ROOT = os.path.join(os.path.dirname(__file__), '..', 'dist')
NAME = os.environ.get('WORKER_NAME', 'streamnotes')
CANONICAL_HOST = os.environ.get('CANONICAL_HOST', 'streamnotes.terryso.dev')
mimetypes.add_type('text/plain', '.txt'); mimetypes.add_type('application/xml', '.xml'); mimetypes.add_type('image/svg+xml', '.svg')
files = {}
for dp, _, fns in os.walk(ROOT):
    for fn in fns:
        full = os.path.join(dp, fn)
        rel = '/' + os.path.relpath(full, ROOT).replace(os.sep, '/')
        if rel == '/_headers': continue
        ct = mimetypes.guess_type(fn)[0] or 'application/octet-stream'
        if ct.startswith('text/') or ct in ('application/xml', 'image/svg+xml'): ct += '; charset=utf-8'
        files[rel] = [ct, base64.b64encode(open(full, 'rb').read()).decode()]
worker = r'''const FILES = %s;
const CANONICAL_HOST = %s;
const cache = new Map();
function body(p) { if (!cache.has(p)) { const bin = atob(FILES[p][1]); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); cache.set(p, u); } return cache.get(p); }
function resp(p, status = 200) {
  const ct = FILES[p][0];
  const h = { 'Content-Type': ct, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
  h['Cache-Control'] = p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : ct.startsWith('image/') ? 'public, max-age=604800' : 'public, max-age=0, must-revalidate';
  return new Response(body(p), { status, headers: h });
}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== CANONICAL_HOST && url.hostname.endsWith('.workers.dev')) return Response.redirect('https://' + CANONICAL_HOST + url.pathname + url.search, 301);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405 });
    let p = decodeURIComponent(url.pathname);
    if (FILES[p]) return resp(p);
    if (p.endsWith('/') && FILES[p + 'index.html']) return resp(p + 'index.html');
    if (!p.endsWith('/') && FILES[p + '/index.html']) return Response.redirect(url.origin + p + '/' + url.search, 301);
    if (p.endsWith('/index.html') && FILES[p]) return Response.redirect(url.origin + p.slice(0, -10), 301);
    return resp('/404.html', 404);
  },
};
''' % (json.dumps(files), json.dumps(CANONICAL_HOST))
js = r'''async () => {
  const NAME = %s;
  const code = %s;
  const metadata = { main_module: 'index.js', compatibility_date: '2026-10-01' };
  const b = `----F${Date.now()}`;
  const body = [`--${b}`, 'Content-Disposition: form-data; name="metadata"', 'Content-Type: application/json', '', JSON.stringify(metadata),
    `--${b}`, 'Content-Disposition: form-data; name="index.js"; filename="index.js"', 'Content-Type: application/javascript+module', '', code, `--${b}--`, ''].join('\r\n');
  const put = await cloudflare.request({ method: 'PUT', path: `/accounts/${accountId}/workers/scripts/${NAME}`, body, contentType: `multipart/form-data; boundary=${b}`, rawBody: true });
  if (!put.success) return { step: 'script', errors: put.errors };
  const sub = await cloudflare.request({ method: 'POST', path: `/accounts/${accountId}/workers/scripts/${NAME}/subdomain`, body: { enabled: true, previews_enabled: false } });
  return { ok: true, id: put.result && put.result.id, size: code.length, subdomain: sub.success ? sub.result : sub.errors };
}''' % (json.dumps(NAME), json.dumps(worker))
sys.stdout.write(js)
