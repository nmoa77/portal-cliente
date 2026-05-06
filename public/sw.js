/* DUIT Portal — Service Worker
   Estratégia "network-first" para HTML (sempre conteúdo fresco quando há rede)
   e "cache-first" para assets estáticos (CSS, JS, fontes, ícones). Permite que
   o portal abra mesmo sem ligação, com a versão mais recente que ficou em cache.
*/

const VERSION = 'duit-v3';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// Recursos essenciais para o portal arrancar offline.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/cliente.html',
  '/admin.html',
  '/reset.html',
  '/quote.html',
  '/css/styles.css',
  '/js/common.js',
  '/js/cliente.js',
  '/js/admin.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => null)
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Chamadas API: sempre da rede — não devem ficar em cache.
  if (url.pathname.startsWith('/api/')) return;

  // HTML: network-first (frescura) com fallback para cache.
  const isHtml =
    req.mode === 'navigate' ||
    req.headers.get('accept')?.includes('text/html');
  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => null);
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('/index.html'))
        )
    );
    return;
  }

  // CSS e JS — stale-while-revalidate: serve a cache imediatamente para
  // velocidade, mas vai buscar a versão nova em background para a próxima visita.
  // Isto garante que mudanças de design chegam ao utilizador sem esperar
  // por um reset manual da app.
  if (/\.(css|js)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok && (res.type === 'basic' || res.type === 'default')) {
              cache.put(req, res.clone()).catch(() => null);
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Outros assets estáticos (imagens, fonts, etc.): cache-first com fallback de rede.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && (res.type === 'basic' || res.type === 'default')) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => null);
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

// Permite ao cliente (frontend) forçar um SKIP_WAITING via postMessage —
// usado pelo botão "Atualizar" que pode ser exposto na UI.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
