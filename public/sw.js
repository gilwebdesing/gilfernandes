/* eslint-disable no-restricted-globals */

// Task 4: Comprehensive Service Worker Strategy
const CACHE_VERSION = 'v2';
const CACHE_NAME = `imoveis-sp-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `imoveis-sp-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `imoveis-sp-api-${CACHE_VERSION}`;

// Assets to precache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Helper to clean old caches
const cleanOldCaches = async () => {
  const keys = await caches.keys();
  return Promise.all(
    keys.map(key => {
      if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME && key !== API_CACHE_NAME) {
        return caches.delete(key);
      }
    })
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanOldCaches());
  return self.clients.claim();
});

// Helper functions for URL classification
const isApiUrl = (url) => url.includes('supabase.co') || url.includes('/api/');
const isImageUrl = (url) => url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || url.includes('images.unsplash.com');
const isFontUrl = (url) => url.match(/\.(woff|woff2|ttf|eot)$/i);
const isStaticAsset = (url) => url.match(/\.(js|css)$/i);

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy 1: Network First for API calls (Freshness priority) with fallback to cache
  if (isApiUrl(url.href)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              // 5 minute TTL logic could be implemented here by storing timestamp in metadata
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(response => {
             // Fallback to offline json if not in cache
             return response || new Response(JSON.stringify({ error: 'Offline', data: [] }), { 
               headers: { 'Content-Type': 'application/json' } 
             });
          });
        })
    );
    return;
  }

  // Strategy 2: Cache First for Static Assets (Performance priority)
  // Images, Fonts, JS, CSS
  if (isImageUrl(url.href) || isFontUrl(url.href) || isStaticAsset(url.href)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response immediately
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request).then((response) => {
          // Check for valid response
          if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
            return response;
          }

          // Cache the new resource
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
           // Return placeholder for images if offline and not cached
           if (isImageUrl(url.href)) {
             return new Response('<svg>...</svg>', { headers: { 'Content-Type': 'image/svg+xml' }});
           }
        });
      })
    );
    return;
  }

  // Strategy 3: Stale-While-Revalidate for HTML (Navigation)
  // Serves cached version immediately while updating in background
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => {
           // Fallback page if network fails and no cache (offline.html logic)
           // For SPA, we often fall back to index.html from cache
           return caches.match('/index.html');
        });
        
        return cachedResponse || fetchPromise;
      })
    );
  }
});