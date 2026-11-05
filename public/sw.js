// Service worker do CS2 Hub. Guarda só arquivos estáticos (código, fontes, imagens)
// para o app instalado abrir rápido, e mostra /offline sem conexão. Nunca guarda
// /api nem páginas com dados de alguém.
const VERSION = 'v1';
const STATIC = `cs2hub-static-${VERSION}`;
const PAGES = `cs2hub-pages-${VERSION}`;
const OFFLINE = '/offline';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(PAGES).then(cache => cache.addAll([OFFLINE, '/icons/icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('cs2hub-') && ![STATIC, PAGES].includes(key)).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

const isStatic = url => url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/images/');

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE)));
    return;
  }
  if (isStatic(url)) {
    event.respondWith(caches.open(STATIC).then(async cache => {
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }));
  }
});
