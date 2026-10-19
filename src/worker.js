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
    const res = await env.ASSETS.fetch(request);
    if (url.pathname.endsWith('.txt') && res.ok) {
      const h = new Headers(res.headers);
      h.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }
    return res;
  },
};
