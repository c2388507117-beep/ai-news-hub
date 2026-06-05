// AI News Hub — Service Worker
// Cache strategies: static (cache-first), tiles (stale-while-revalidate),
// API (network-first), images (cache-first)

var CACHE_NAMES = {
  static: 'static-v1',
  tiles: 'tiles-v1',
  api: 'api-v1',
  images: 'images-v1',
};
var ALL_CACHES = [
  CACHE_NAMES.static,
  CACHE_NAMES.tiles,
  CACHE_NAMES.api,
  CACHE_NAMES.images,
];

// Activate immediately — don't wait for page reload
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

// Clean up old cache versions on activate
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) {
            return ALL_CACHES.indexOf(k) === -1;
          })
          .map(function (k) {
            return caches.delete(k);
          })
      );
    })
  );
});

// Fetch handler — route to appropriate cache strategy
self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url = new URL(req.url);

  // Only cache GET requests
  if (req.method !== 'GET') return;

  // Skip chrome-extension:, blob:, etc.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 1. Same-origin static assets (Astro built JS/CSS)
  if (
    url.origin === location.origin &&
    /\.(js|css|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req, CACHE_NAMES.static));
    return;
  }

  // 2. CDN static assets (Leaflet, MarkerCluster from cdnjs)
  if (
    /cdnjs\.cloudflare\.com/.test(url.origin) &&
    /\.(js|css)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req, CACHE_NAMES.static));
    return;
  }

  // 3. Map tiles — stale-while-revalidate
  if (/tile\.openstreetmap\.org/.test(url.origin)) {
    event.respondWith(staleWhileRevalidate(req, CACHE_NAMES.tiles));
    return;
  }

  // 4. API endpoints — network first, cache fallback for offline
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req, CACHE_NAMES.api));
    return;
  }

  // 5. Wallpaper images — cache first (skip our own PWA icons)
  if (
    /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url.pathname) &&
    url.pathname.indexOf('/pwa-icons/') === -1
  ) {
    event.respondWith(cacheFirst(req, CACHE_NAMES.images));
    return;
  }
});

// --- Strategies ---

// Cache First: serve from cache if available, fetch+store otherwise
function cacheFirst(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) {
          // Only cache same-origin or CORS responses
          try {
            cache.put(req, res.clone());
          } catch (e) {
            // Opaque responses may throw; ignore
          }
        }
        return res;
      });
    });
  });
}

// Network First: try network, fall back to cache on failure
function networkFirst(req, cacheName) {
  return fetch(req)
    .then(function (res) {
      if (res.ok) {
        caches.open(cacheName).then(function (cache) {
          try {
            cache.put(req, res.clone());
          } catch (e) {
            // ignore
          }
        });
      }
      return res;
    })
    .catch(function () {
      return caches.match(req);
    });
}

// Stale-While-Revalidate: serve cached immediately, update in background
function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var fetchPromise = fetch(req)
        .then(function (res) {
          if (res.ok) {
            try {
              cache.put(req, res.clone());
            } catch (e) {
              // ignore
            }
          }
          return res;
        })
        .catch(function () {
          // Network failed — that's okay, we have the cached version
        });
      return hit || fetchPromise;
    });
  });
}
