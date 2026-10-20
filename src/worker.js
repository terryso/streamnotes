export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== 'streamnotes.terryso.dev' && url.hostname.endsWith('.workers.dev')) {
      return Response.redirect('https://streamnotes.terryso.dev' + url.pathname + url.search, 301);
    }
    const last = url.pathname.split('/').pop();
    if (last && !last.includes('.')) {
      return Response.redirect(url.origin + url.pathname + '/' + url.search, 301);
    }
    let res = await env.ASSETS.fetch(request);
    // English 404 page for missing /en/* URLs (root 404.html stays Chinese)
    if (res.status === 404 && url.pathname.startsWith('/en/')) {
      const nf = await env.ASSETS.fetch(new Request(new URL('/en/404/', url.origin), request));
      if (nf.ok) {
        const h = new Headers(nf.headers);
        h.set('Cache-Control', 'no-store');
        return new Response(nf.body, { status: 404, headers: h });
      }
    }
    if (url.pathname.endsWith('.txt') && res.ok) {
      const h = new Headers(res.headers);
      h.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }
    return res;
  },
};
