# PWA + Service Worker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn AI News Hub into a PWA with intelligent caching for near-instant repeat visits and offline capability.

**Architecture:** Add manifest.json + sw.js + icon generation + middleware auth bypass layer on top of the existing Astro 5 static site. Service Worker uses four targeted cache strategies (static cache-first, tiles stale-while-revalidate, API network-first, images cache-first) to optimize loading.

**Tech Stack:** Astro 5, Cloudflare Pages, sharp (icon generation)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/generate-icons.mjs` | Create | Convert favicon.svg → PNG 192×192 and 512×512 via sharp |
| `public/manifest.json` | Create | PWA manifest (name, icons, theme_color, display: standalone) |
| `public/sw.js` | Create | Service Worker with 4 caches + install/activate/fetch handlers |
| `functions/_middleware.js:6-14` | Modify | Bypass Basic Auth for `/sw.js`, `/manifest.json`, `/pwa-icons/*` |
| `src/layouts/BaseLayout.astro` | Modify | Add `<link rel="manifest">` and SW registration script |

### Task 1: Install sharp and generate icons

**Files:**
- Create: `scripts/generate-icons.mjs`
- Output: `public/pwa-icons/icon-192.png`, `public/pwa-icons/icon-512.png`

- [ ] **Step 1: Install sharp**

```bash
npm install --save-dev sharp
```

- [ ] **Step 2: Create icon generation script**

`scripts/generate-icons.mjs`:
```js
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, '../public/favicon.svg'));

const sizes = [192, 512];
const outDir = resolve(__dirname, '../public/pwa-icons');
mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, `icon-${size}.png`));
  console.log(`Generated ${size}x${size}`);
}
```

- [ ] **Step 3: Run it**

```bash
node scripts/generate-icons.mjs
```

Expected output: `Generated 192x192`, `Generated 512x512`

### Task 2: Create manifest.json

**Files:**
- Create: `public/manifest.json`

- [ ] **Step 1: Write manifest.json**

```json
{
  "name": "AI News Hub",
  "short_name": "AI News",
  "description": "个人仪表盘 - AI 新闻、地图、豆瓣、工具箱",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/pwa-icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/pwa-icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Task 3: Create Service Worker

**Files:**
- Create: `public/sw.js`

- [ ] **Step 1: Write sw.js**

```js
const CACHE_NAMES = {
  static: 'static-v1',
  tiles: 'tiles-v1',
  api: 'api-v1',
  images: 'images-v1',
};
const ALL_CACHES = Object.values(CACHE_NAMES);

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return !ALL_CACHES.includes(k); })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url = new URL(req.url);

  // POST etc — don't cache
  if (req.method !== 'GET') return;

  // Same-origin static assets (Astro built JS/CSS)
  if (url.origin === location.origin && /\.(js|css|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, CACHE_NAMES.static));
    return;
  }

  // CDN static assets (Leaflet, MarkerCluster from cdnjs)
  if (/cdnjs\.cloudflare\.com/.test(url.origin) && /\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, CACHE_NAMES.static));
    return;
  }

  // Map tiles — stale-while-revalidate
  if (/tile\.openstreetmap\.org/.test(url.origin)) {
    event.respondWith(staleWhileRevalidate(req, CACHE_NAMES.tiles));
    return;
  }

  // API endpoints — network first, cache fallback
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req, CACHE_NAMES.api));
    return;
  }

  // Wallpaper images — cache first
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url.pathname) &&
      !url.pathname.startsWith('/pwa-icons/')) {
    event.respondWith(cacheFirst(req, CACHE_NAMES.images));
    return;
  }
});

function cacheFirst(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
    });
  });
}

function networkFirst(req, cacheName) {
  return fetch(req).then(function (res) {
    if (res.ok) {
      caches.open(cacheName).then(function (cache) { cache.put(req, res.clone()); });
    }
    return res;
  }).catch(function () {
    return caches.match(req);
  });
}

function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var fetchPromise = fetch(req).then(function (res) {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      return hit || fetchPromise;
    });
  });
}
```

### Task 4: Update middleware to bypass auth for PWA files

**Files:**
- Modify: `functions/_middleware.js`

- [ ] **Step 1: Edit _middleware.js**

Current file starts with:
```js
const SITE_USERNAME = 'tian';
export async function onRequest(context) {
  const { request, env } = context;
```

Insert after the opening of `onRequest`:
```js
  const url = new URL(request.url);
  const PUBLIC_PATHS = ['/sw.js', '/manifest.json', '/pwa-icons/'];
  if (PUBLIC_PATHS.some(function (p) { return url.pathname.startsWith(p); })) {
    return context.next();
  }
```

The modified file should be:
```js
const SITE_USERNAME = 'tian';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const PUBLIC_PATHS = ['/sw.js', '/manifest.json', '/pwa-icons/'];
  if (PUBLIC_PATHS.some(function (p) { return url.pathname.startsWith(p); })) {
    return context.next();
  }

  const SITE_PASSWORD = env.SITE_PASSWORD || '111';
  // ... rest unchanged
```

### Task 5: Add manifest link and SW registration to layout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add manifest link in `<head>`**

After the preconnect links (line 19), add:
```html
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#2563eb" />
```

- [ ] **Step 2: Add SW registration in the existing `<script>` block**

At the end of the `document.addEventListener('click', ...)` script (before `</script>`), add:
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
```

### Task 6: Build and verify

- [ ] **Step 1: Generate fresh icons (if not done)**

```bash
node scripts/generate-icons.mjs
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: No errors. Check `dist/manifest.json` and `dist/sw.js` and `dist/pwa-icons/` exist.

- [ ] **Step 3: Verify middleware bypass logic**

```bash
grep -n 'PUBLIC_PATHS\|context.next' functions/_middleware.js
```

Expected: Shows the bypass block before the auth check.

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json public/sw.js public/pwa-icons/ scripts/generate-icons.mjs functions/_middleware.js src/layouts/BaseLayout.astro package.json package-lock.json
git commit -m "feat: PWA + Service Worker with intelligent caching"
```

---

## Self-Review

- **Spec coverage:** All spec requirements covered — manifest (Task 2), SW with 4 caches (Task 3), auth bypass (Task 4), registration (Task 5), icon generation (Task 1)
- **Placeholder check:** No TBD/TODO — every code block has complete implementation
- **Consistency:** Cache names in fetch handler (static-v1, tiles-v1, api-v1, images-v1) match activate cleanup; middleware path checks match manifest location; serviceWorker scope '/' consistent throughout
- **Scope check:** Single well-bounded subsystem. No expansion into image optimization or Islands audit.
