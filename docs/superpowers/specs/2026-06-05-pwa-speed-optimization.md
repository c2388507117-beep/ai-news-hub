# PWA + Service Worker Speed Optimization

> **Goal:** Turn AI News Hub into a Progressive Web App with intelligent caching to achieve near-instant load times on repeat visits and offline capability.

## Architecture

Add a PWA layer on top of the existing static Astro site: `manifest.json` declares the app shell, a Service Worker (`sw.js`) intercepts fetch requests with cache-first / stale-while-revalidate strategies, and a registration script bootstraps everything from the layout. The auth middleware is updated to allow these new files without credentials (Service Workers require this).

```
public/
  manifest.json          ← PWA manifest (icons, theme, display)
  sw.js                  ← Service Worker (cache strategies)
  pwa-icons/             ← Generated PNG icons (192, 512)
functions/
  _middleware.js         ← Modified: bypass auth for PWA files
src/layouts/
  BaseLayout.astro       ← Modified: add SW registration + manifest link
scripts/
  generate-icons.mjs     ← NEW: SVG → PNG icon generator
```

## File Details

### `public/manifest.json`
- `name`: "AI News Hub"
- `short_name`: "AI News"
- `start_url`: `/`
- `display`: `standalone` (opens like a native app, no browser chrome)
- `theme_color`: `#2563eb` (blue-600, matches header gradient)
- `background_color`: `#f9fafb` (gray-50, matches site bg)
- `icons`: 192x192 and 512x512 PNGs, generated from existing `/favicon.svg`

### `public/sw.js` — Cache Strategies

Four named caches with distinct strategies:

| Cache Name | Strategy | What It Caches | Why |
|---|---|---|---|
| `static-v1` | **Cache First** | CSS, JS from Astro build + cdnjs Leaflet/MarkerCluster files | Content-hashed files never change; CDN resources are slow to fetch |
| `tiles-v1` | **Stale-While-Revalidate** | `tile.openstreetmap.org` tiles | Tiles rarely change; show cached immediately, update in background |
| `api-v1` | **Network First** | `GET /api/*` responses | Fresh data preferred; cache is fallback when offline |
| `images-v1` | **Cache First** | Bing/picsum wallpaper images | Wallpapers are large; serve from cache instantly on repeat |

**Install event:** Precache nothing on install (avoids delaying activation). All caching happens on-demand via fetch handlers.

**Activate event:** Delete any caches not in the known list (clean up old versions on deploy).

**Scope:** Root (`/`). Registered with `{ scope: '/' }`.

### `functions/_middleware.js` — Auth Bypass

Before the current auth check, add:

```js
const PUBLIC_PATHS = ['/sw.js', '/manifest.json', '/pwa-icons/'];
if (PUBLIC_PATHS.some(p => url.pathname.startsWith(p))) {
  return context.next();
}
```

This is required because Service Worker registration would fail with a 401 response. The manifest and icons are also needed before authentication for the PWA install prompt.

### SW Registration (`BaseLayout.astro`)

Add a `<script>` block (or inline in the existing script section):

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
```

### Icon Generation (`scripts/generate-icons.mjs`)

- Input: `public/favicon.svg`
- Output: `public/pwa-icons/icon-192.png`, `public/pwa-icons/icon-512.png`
- Tool: `sharp` npm package
- Run: `node scripts/generate-icons.mjs` (manual; committed to repo)

## Offline Behavior

With the SW active:
- **Static assets** (JS, CSS, fonts): served from cache instantly
- **Map tiles** (OpenStreetMap): cached tiles show; uncached tiles show grey
- **API data**: shows data from last online visit (stale)
- **Wallpapers**: previously seen wallpapers display; new ones show fallback
- **Navigation**: all pages render because it's a static site (full HTML in `dist/`)

## Update Flow

1. Each deploy produces a slightly different `sw.js` (byte-level change from build metadata)
2. Browser detects the difference, installs the new SW in the background
3. New SW waits in `waiting` state until all tabs close
4. On next page load, new SW takes over (`skipWaiting` is NOT used — avoids mid-session reload)
5. On activate, old caches (e.g. `static-v2`) are deleted, new caches populated on-demand

No update notification for v1 (keeping it simple). The user gets the new version naturally on their next visit.

## Files NOT Changed

- `src/components/*.astro` — No component changes needed
- `src/pages/*.astro` — No page changes (manifest/SW are in public/)
- `functions/api/*` — No API changes
- `wrangler.toml` — No config changes
- `package.json` — Only add `sharp` dev dependency
- `.github/workflows/*` — No CI changes

## Self-Review

- No placeholders: every strategy, path, and behavior is specified
- Internal consistency: middleware path checks match the exact file paths; cache names match fetch handler logic
- Scope appropriate: this is one focused sub-project (PWA + SW caching), not multi-system
- Ambiguity: none — cache strategies are explicit, activation flow is clear
