const CACHE_NAME = 'geocopy-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/geocopy_logo.jpg',
  '/icon-192.jpg',
  '/icon-512.jpg'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch/intercept requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local/standard protocols
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude nominatim API queries from being cached long-term / static-cached, 
  // but we can let them run normally.
  if (url.origin.includes('nominatim.openstreetmap.org')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but fetch update in background (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore network failures in background */});
        
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Check if valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache the newly requested asset for future offline use
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        // For navigation requests, fallback to index.html offline
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        throw err;
      });
    })
  );
});
