const CACHE_NAME = 'maites-pizza-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon.svg'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients so the SW takes control immediately
  event.waitUntil(self.clients.claim());
  
  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Force network-first for HTML pages (so we always get the latest version when entering the URL)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version of the HTML
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match('/');
        })
    );
    return;
  }

  // For other requests (images, JS, CSS), use Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful HTTP/HTTPS responses
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && event.request.url.startsWith('http')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => null);
      
      return cachedResponse || fetchPromise;
    })
  );
});
