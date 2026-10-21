// Safe baseline security headers. No CSP (would need care with GA4) and no HSTS
// (needs the owner's approval at the zone level).
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

function finalize(res, { pathname, extra } = {}) {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  // Search result pages are client-rendered variants of /search/: keep them out of the index.
  if (pathname === '/search/' || pathname === '/en/search/') h.set('X-Robots-Tag', 'noindex, follow');
  if (extra) for (const [k, v] of Object.entries(extra)) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

function redirect(location) {
  return finalize(new Response(null, { status: 301, headers: { Location: location } }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== 'streamnotes.terryso.dev' && url.hostname.endsWith('.workers.dev')) {
      return redirect('https://streamnotes.terryso.dev' + url.pathname + url.search);
    }
    const last = url.pathname.split('/').pop();
    if (last && !last.includes('.')) {
      return redirect(url.origin + url.pathname + '/' + url.search);
    }
    const res = await env.ASSETS.fetch(request);
    // English 404 page for missing /en/* URLs (root 404.html stays Chinese)
    if (res.status === 404 && url.pathname.startsWith('/en/')) {
      const nf = await env.ASSETS.fetch(new Request(new URL('/en/404/', url.origin), request));
      if (nf.ok) {
        return finalize(new Response(nf.body, { status: 404, headers: nf.headers }), { extra: { 'Cache-Control': 'no-store' } });
      }
    }
    if (url.pathname.endsWith('.txt') && res.ok) {
      return finalize(res, { extra: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    return finalize(res, { pathname: url.pathname });
  },
};
