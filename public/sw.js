/* DUIT Portal — Service Worker */
const VERSION = 'duit-v47';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const PRECACHE_URLS = [
  '/', '/index.html', '/cliente.html', '/admin.html', '/reset.html', '/quote.html?v=20261106q4',
  '/css/styles.css', '/js/common.js?v=20261104b', '/js/cliente.js?v=20261110calendar2', '/js/admin.js?v=20261112sheets1', '/js/bio-admin.js?v=20261111r', '/js/bio-public.js?v=20261111s', '/js/client-subaccounts-admin.js?v=20261109a',
  '/js/prospects-crm.js', '/js/prospects-actions.js', '/js/prospects-legacy-bridge.js',
  '/js/prospects-ui-fix.js', '/js/prospects-pagination.js', '/js/prospects-sector-chart.js',
  '/js/prospects-table-fit.js',
  '/social-stories.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon.svg'
];

const ADMIN_SCRIPTS = [
  '/js/prospects-crm.js',
  '/js/prospects-actions.js',
  '/js/prospects-legacy-bridge.js',
  '/js/prospects-ui-fix.js',
  '/js/prospects-pagination.js',
  '/js/prospects-sector-chart.js',
  '/js/prospects-table-fit.js'
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

// Notificações DUIT: abrir a Story no portal, sem presumir publicação.
// Confirmações técnicas independentes do HTTP 200 do serviço Push.
// 'shown' confirma apenas que showNotification resolveu, não que a pessoa viu.
async function duitPushReceipt(id,phase) {
 if(!/^[0-9a-f-]{36}$/.test(String(id||'')))return;
 try{
  await fetch('/api/duit-social/push/receipt',{
   method:'POST',credentials:'same-origin',cache:'no-store',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({id,phase})
  });
 }catch(e){ /* A entrega de Push não pode falhar por causa da telemetria. */ }
}
self.addEventListener('push', event => {
 let payload={};
 try{payload=event.data?.json()||{};}catch(_){}
 const title=String(payload.title||'DUIT · Story pronta').slice(0,120);
 const body=String(payload.body||'Tem uma Story para publicar.').slice(0,240);
 const raw=String(payload.url||'/social-stories.html?mode=stories');
 const target=raw.startsWith('/social-stories.html?story=')||raw==='/social-stories.html?mode=stories'
  ?raw:'/social-stories.html?mode=stories';
 const id=String(payload.notification_id||'');
 event.waitUntil((async()=>{
  // Nunca atrasar a notificação à espera da confirmação de rede.
  const receipt=duitPushReceipt(id,'received');
  await self.registration.showNotification(title,{
   body,
   tag:id?'duit-story-'+id:'duit-story-'+target,
   renotify:true,
   icon:'/icons/icon-192.png',
   badge:'/icons/icon-192.png',
   data:{url:target}
  });
  await Promise.all([receipt,duitPushReceipt(id,'shown')]);
 })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const incoming = new URL(event.notification.data?.url || '/social-stories.html?mode=stories', self.location.origin);
  // Evitar o redirecionamento interno da DUIT Media, que perdia o ID da Story.
  const target = new URL('/social-stories.html', self.location.origin);
  target.searchParams.set('mode','stories');
  target.searchParams.set('standalone','1');
  const story = incoming.searchParams.get('story');
  if(story && /^[1-9][0-9]*$/.test(story))target.searchParams.set('story',story);
  event.waitUntil((async () => {
    try {
      const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
      const current = windows.find(client => {
        try { return new URL(client.url).origin===target.origin &&
          new URL(client.url).pathname==='/social-stories.html'; }
        catch(_) {return false;}
      });
      if(current){
        try {
          const navigated = await current.navigate(target.href);
          if(navigated)return await navigated.focus();
        }catch(error){console.warn('[duit-media] notification navigate:',error);}
      }
      const opened = await self.clients.openWindow(target.href);
      if(opened)return await opened.focus();
    }catch(error){console.error('[duit-media] notification click:',error);}
  })());
});
