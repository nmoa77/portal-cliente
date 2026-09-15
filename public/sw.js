/* DUIT Portal — Service Worker */
const VERSION = 'duit-v8';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const PRECACHE_URLS = [
  '/', '/index.html', '/cliente.html', '/admin.html', '/reset.html', '/quote.html',
  '/css/styles.css', '/js/common.js', '/js/cliente.js', '/js/admin.js',
  '/js/prospects-crm.js', '/js/prospects-actions.js', '/js/prospects-legacy-bridge.js',
  '/js/prospects-ui-fix.js', '/js/prospects-pagination.js', '/js/prospects-sector-chart.js',
  '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon.svg'
];

const ADMIN_SCRIPTS = [
  '/js/prospects-crm.js',
  '/js/prospects-actions.js',
  '/js/prospects-legacy-bridge.js',
  '/js/prospects-ui-fix.js',
  '/js/prospects-pagination.js',
  '/js/prospects-sector-chart.js'
];

function injectAdminScripts(html) {
  const missing = ADMIN_SCRIPTS.filter(src => !html.includes(`src="${src}"`));
  if (!missing.length) return html;
  const tags = missing.map(src => `<script src="${src}"></script>`).join('\n');
  return html.replace('</body>', `${tags}\n</body>`);
}

async function networkHtml(req) {
  const res = await fetch(req);
  if (!res.ok) return res;
  const url = new URL(req.url);
  let body = await res.text();
  if (url.pathname === '/admin.html') body = injectAdminScripts(body);
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  const out = new Response(body, { status: res.status, statusText: res.statusText, headers });
  caches.open(RUNTIME_CACHE).then(c => c.put(req, out.clone())).catch(() => null);
  return out;
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS).catch(() => null)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  const isHtml = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
  if (isHtml) {
    event.respondWith(networkHtml(req).catch(() => caches.match(req).then(async cached => {
      if (!cached) return caches.match('/index.html');
      if (url.pathname !== '/admin.html') return cached;
      const body = injectAdminScripts(await cached.text());
      const headers = new Headers(cached.headers);
      headers.delete('content-length');
      return new Response(body, { status: cached.status, statusText: cached.statusText, headers });
    })));
    return;
  }

  if (/\.(css|js)$/i.test(url.pathname)) {
    event.respondWith(fetch(req).then(res => {
      if (res.ok && (res.type === 'basic' || res.type === 'default')) {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, copy)).catch(() => null);
      }
      return res;
    }).catch(() => caches.match(req)));
    return;
  }

  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    if (res.ok && (res.type === 'basic' || res.type === 'default')) {
      const copy = res.clone();
      caches.open(RUNTIME_CACHE).then(c => c.put(req, copy)).catch(() => null);
    }
    return res;
  }).catch(() => cached)));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});