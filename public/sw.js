const CACHE_NAME = 'rim-shadowing-v1';
 
// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];
 
// Install: pre-cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});
 
// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// Fetch: cache-first for same-origin + Google Fonts, network-first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
 
  // Cache-first strategy: app pages, fonts, static assets
  const cacheFirst =
    url.origin === self.location.origin ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';
 
  if (cacheFirst) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => cached); // If offline and not cached, return whatever we have
      })
    );
  }
  // For everything else, just use the network normally
});
