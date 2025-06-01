// Service Worker for Baby Song Player
const CACHE_NAME = 'baby-song-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/images/cover.jpeg',
  '/songs/amma1.mp3',
  '/songs/thaththa1.m4a'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients so the SW is in control immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Special handling for audio files to ensure they're cached
  if (event.request.url.match(/\.(mp3|m4a|wav|ogg|opus)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Return cached response if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(event.request).then((networkResponse) => {
            // Clone the response as it can only be consumed once
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Standard cache-first strategy for other assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});
