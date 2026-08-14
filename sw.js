// Service worker partagé — active l'installation PWA (icône + écran de démarrage)
// pour l'app admin ET la boutique publique, et permet un fonctionnement hors-ligne
// basique une fois chaque page ouverte une première fois.
const CACHE_NAME = 'usante-pro-v11-cache-2';
const APP_SHELL = ['./U-Sante-Nature-Pro-V11.html', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cache-first pour les pages de l'app, réseau pour tout le reste (API GitHub, etc.)
  if (event.request.method !== 'GET') return;
  const isAppPage = event.request.url.includes('U-Sante-Nature-Pro-V11.html') || event.request.url.endsWith('/') || event.request.url.includes('index.html');
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && isAppPage) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
