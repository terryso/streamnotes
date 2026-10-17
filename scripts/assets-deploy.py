#!/usr/bin/env python3
"""Deploy ./dist as Cloudflare Workers Static Assets using the documented direct-upload flow
(https://developers.cloudflare.com/workers/static-assets/direct-upload/), driven by the
Cloudflare MCP connector for authenticated account API calls.

  1) python3 scripts/assets-deploy.py session  > /workspace/agent-tools/assets-session.js
     -> run with MCP execute (code="$file:..."), save the JSON result to /workspace/agent-tools/assets-session.json
  2) python3 scripts/assets-deploy.py upload   # uploads missing files with the session's upload JWT, writes completion token
  3) python3 scripts/assets-deploy.py finalize > /workspace/agent-tools/assets-finalize.js
     -> run with MCP execute: publishes the Worker (assets + small router script) and keeps workers.dev on.
"""
import os, sys, json, base64, hashlib, mimetypes, urllib.request, uuid
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
TOOLS = '/workspace/agent-tools'
NAME = os.environ.get('WORKER_NAME', 'streamnotes')
ACCOUNT = os.environ.get('CF_ACCOUNT_ID', 'e81e236cdb3646d4fe1cf15bcd834cff')
CANONICAL_HOST = os.environ.get('CANONICAL_HOST', 'streamnotes.terryso.dev')
mimetypes.add_type('text/plain', '.txt'); mimetypes.add_type('application/xml', '.xml'); mimetypes.add_type('image/svg+xml', '.svg'); mimetypes.add_type('image/webp', '.webp'); mimetypes.add_type('application/json', '.json')

def files():
    out = {}
    for dp, _, fns in os.walk(ROOT):
        for fn in fns:
            full = os.path.join(dp, fn); rel = '/' + os.path.relpath(full, ROOT).replace(os.sep, '/')
            if rel in ('/_headers', '/_redirects'): continue
            data = open(full, 'rb').read(); b64 = base64.b64encode(data).decode()
            ext = os.path.splitext(fn)[1].lstrip('.')
            h = hashlib.sha256((b64 + ext).encode()).hexdigest()[:32]
            ct = mimetypes.guess_type(fn)[0] or 'application/octet-stream'
            out[rel] = {'hash': h, 'size': len(data), 'ct': ct, 'b64': b64}
    return out

mode = sys.argv[1]
F = files()
if mode == 'session':
    manifest = {p: {'hash': f['hash'], 'size': f['size']} for p, f in F.items()}
    sys.stdout.write("async () => { const r = await cloudflare.request({ method: 'POST', path: `/accounts/${accountId}/workers/scripts/%s/assets-upload-session`, body: { manifest: %s } }); return r.success ? r.result : { errors: r.errors }; }" % (NAME, json.dumps(manifest)))
elif mode == 'upload':
    sess = json.load(open(f'{TOOLS}/assets-session.json'))
    jwt = sess['jwt']; buckets = sess.get('buckets') or []
    by = {f['hash']: f for f in F.values()}
    token = jwt
    for i, bucket in enumerate(buckets):
        b = 'b' + uuid.uuid4().hex; parts = []
        for h in bucket:
            f = by[h]
            parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{h}"; filename="{h}"\r\nContent-Type: {f["ct"]}\r\n\r\n{f["b64"]}\r\n')
        body = (''.join(parts) + f'--{b}--\r\n').encode()
        req = urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/workers/assets/upload?base64=true', data=body, method='POST',
                                     headers={'Authorization': f'Bearer {jwt}', 'Content-Type': f'multipart/form-data; boundary={b}'})
        res = json.load(urllib.request.urlopen(req, timeout=120))
        if not res.get('success'): sys.exit(f'upload failed: {res.get("errors")}')
        if res.get('result', {}).get('jwt'): token = res['result']['jwt']
        print(f'bucket {i+1}/{len(buckets)}: {len(bucket)} files ok', file=sys.stderr)
    json.dump({'completion_jwt': token}, open(f'{TOOLS}/assets-complete.json', 'w'))
    print(f'uploaded {sum(len(b) for b in buckets)} files; completion token saved', file=sys.stderr)
elif mode == 'finalize':
    token = json.load(open(f'{TOOLS}/assets-complete.json'))['completion_jwt']
    headers = open(os.path.join(ROOT, '_headers')).read() if os.path.exists(os.path.join(ROOT, '_headers')) else ''
    code = ("export default { async fetch(request, env) { const url = new URL(request.url);"
            " if (url.hostname !== %s && url.hostname.endsWith('.workers.dev')) { return Response.redirect('https://' + %s + url.pathname + url.search, 301); }"
            " const last = url.pathname.split('/').pop(); if (last && !last.includes('.')) { return Response.redirect(url.origin + url.pathname + '/' + url.search, 301); }"
            " const res = await env.ASSETS.fetch(request); if (url.pathname.endsWith('.txt') && res.ok) { const h = new Headers(res.headers); h.set('Content-Type', 'text/plain; charset=utf-8'); return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h }); }"
            " return res; } };") % (json.dumps(CANONICAL_HOST), json.dumps(CANONICAL_HOST))
    metadata = {'main_module': 'index.js', 'compatibility_date': '2026-10-01',
                'assets': {'jwt': token, 'config': {'html_handling': 'auto-trailing-slash', 'not_found_handling': '404-page', 'run_worker_first': True, '_headers': headers}},
                'bindings': [{'type': 'assets', 'name': 'ASSETS'}]}
    js = r'''async () => {
  const code = %s; const metadata = %s;
  const b = `----F${Date.now()}`;
  const body = [`--${b}`, 'Content-Disposition: form-data; name="metadata"', 'Content-Type: application/json', '', JSON.stringify(metadata),
    `--${b}`, 'Content-Disposition: form-data; name="index.js"; filename="index.js"', 'Content-Type: application/javascript+module', '', code, `--${b}--`, ''].join('\r\n');
  const put = await cloudflare.request({ method: 'PUT', path: `/accounts/${accountId}/workers/scripts/%s`, body, contentType: `multipart/form-data; boundary=${b}`, rawBody: true });
  if (!put.success) return { step: 'script', errors: put.errors };
  const sub = await cloudflare.request({ method: 'POST', path: `/accounts/${accountId}/workers/scripts/%s/subdomain`, body: { enabled: true, previews_enabled: false } });
  return { ok: true, id: put.result && put.result.id, has_assets: !!(put.result && put.result.has_assets), subdomain: sub.success ? sub.result : sub.errors };
}''' % (json.dumps(code), json.dumps(metadata), NAME, NAME)
    sys.stdout.write(js)
