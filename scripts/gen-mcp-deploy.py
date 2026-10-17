#!/usr/bin/env python3
"""Generate a JS snippet for the Cloudflare MCP `execute` tool that deploys ./dist
as a Workers Static Assets site (direct-upload API). Usage:
  python3 scripts/gen-mcp-deploy.py > /tmp/deploy.js
then call execute with code="$file:/tmp/deploy.js"."""
import os, sys, json, base64, hashlib, mimetypes
ROOT = os.path.join(os.path.dirname(__file__), '..', 'dist')
NAME = os.environ.get('WORKER_NAME', 'streamnotes')
mimetypes.add_type('text/plain', '.txt'); mimetypes.add_type('application/xml', '.xml')
mimetypes.add_type('image/svg+xml', '.svg')
files = {}
headers = ''
for dp, _, fns in os.walk(ROOT):
    for fn in fns:
        full = os.path.join(dp, fn)
        rel = '/' + os.path.relpath(full, ROOT).replace(os.sep, '/')
        data = open(full, 'rb').read()
        if rel == '/_headers':
            headers = data.decode(); continue
        ext = os.path.splitext(fn)[1]
        b64 = base64.b64encode(data).decode()
        h = hashlib.sha256(b64.encode() + ext.encode()).hexdigest()[:32]
        ct = mimetypes.guess_type(fn)[0] or 'application/octet-stream'
        if ct.startswith('text/') or ct in ('application/xml', 'image/svg+xml', 'application/javascript'):
            ct += '; charset=utf-8'
        files[rel] = {'hash': h, 'size': len(data), 'ct': ct, 'b64': b64}
js = r'''async () => {
  const NAME = %s;
  const FILES = %s;
  const HEADERS = %s;
  const manifest = {};
  const byHash = {};
  for (const [p, f] of Object.entries(FILES)) { manifest[p] = { hash: f.hash, size: f.size }; byHash[f.hash] = f; }
  const s = await cloudflare.request({ method: 'POST', path: `/accounts/${accountId}/workers/scripts/${NAME}/assets-upload-session`, body: { manifest } });
  if (!s.success) return { step: 'session', errors: s.errors };
  let token = s.result.jwt;
  const buckets = s.result.buckets || [];
  const log = { buckets: buckets.length };
  for (const bucket of buckets) {
    const fd = new FormData();
    for (const h of bucket) { const f = byHash[h]; fd.append(h, new Blob([f.b64], { type: f.ct }), h); }
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/assets/upload?base64=true`, { method: 'POST', headers: { Authorization: `Bearer ${s.result.jwt}` }, body: fd });
    const j = await r.json();
    if (!j.success) return { step: 'upload', status: r.status, errors: j.errors };
    if (j.result && j.result.jwt) token = j.result.jwt;
  }
  const code = "export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };";
  const metadata = {
    main_module: 'index.js',
    compatibility_date: '2026-10-01',
    assets: { jwt: token, config: { not_found_handling: '404-page', html_handling: 'auto-trailing-slash', _headers: HEADERS } },
    bindings: [{ type: 'assets', name: 'ASSETS' }],
  };
  const b = `----F${Date.now()}`;
  const body = [`--${b}`, 'Content-Disposition: form-data; name="metadata"', 'Content-Type: application/json', '', JSON.stringify(metadata),
    `--${b}`, 'Content-Disposition: form-data; name="index.js"; filename="index.js"', 'Content-Type: application/javascript+module', '', code, `--${b}--`, ''].join('\r\n');
  const put = await cloudflare.request({ method: 'PUT', path: `/accounts/${accountId}/workers/scripts/${NAME}`, body, contentType: `multipart/form-data; boundary=${b}`, rawBody: true });
  if (!put.success) return { step: 'script', errors: put.errors, log };
  const sub = await cloudflare.request({ method: 'POST', path: `/accounts/${accountId}/workers/scripts/${NAME}/subdomain`, body: { enabled: true, previews_enabled: false } });
  return { ok: true, log, script: put.result && put.result.id, subdomain: sub.success ? sub.result : sub.errors };
}''' % (json.dumps(NAME), json.dumps(files), json.dumps(headers))
sys.stdout.write(js)
