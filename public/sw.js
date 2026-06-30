const CACHE = 'boutiko-cache-v3';
const PRECACHE = [
  '/offline.html', '/logo-boutiko.png',
  '/pwa-icons/icon-16x16.png', '/pwa-icons/icon-32x32.png',
  '/pwa-icons/icon-48x48.png', '/pwa-icons/icon-72x72.png',
  '/pwa-icons/icon-96x96.png', '/pwa-icons/icon-128x128.png',
  '/pwa-icons/icon-144x144.png', '/pwa-icons/icon-150x150.png',
  '/pwa-icons/icon-192x192.png', '/pwa-icons/icon-512x512.png',
  '/pwa-icons/apple-touch-icon.png', '/pwa-icons/favicon-32x32.png'
];

const isStatic = u =>
  /_next\/static\/|pwa-icons\/|logo-boutiko\.png$|offline\.html$/.test(u);

const isExternalImg = u =>
  /^https?:\/\//.test(u) && /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i.test(u);

const isNetworkOnly = u => /dashboard|api\/admin|api\/auth/.test(u);

// Cache First — used for static assets and manifest API
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch { return null; }
}

// Network First — used for pages and navigation
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return cache.match(req);
  }
}

// Stale While Revalidate — used for external images
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fetched = fetch(req).then(res => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || fetched;
}

// Install: pre-cache critical assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches and claim clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('boutiko-cache-') && k !== CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: route to appropriate strategy
self.addEventListener('fetch', e => {
  const { request: req } = e;
  const url = req.url;

  // Non-GET or dashboard/auth routes: Network Only
  if (req.method !== 'GET' || isNetworkOnly(url)) return;

  // Static assets & manifest API: Cache First
  if (isStatic(url) || /api\/manifest\//.test(url)) {
    e.respondWith(cacheFirst(req));
    return;
  }

  // External images: Stale While Revalidate
  if (isExternalImg(url)) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Navigation requests: Network First → offline fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      networkFirst(req).then(res => res || caches.match('/offline.html'))
    );
    return;
  }

  // Default: Network First
  e.respondWith(networkFirst(req));
});