/* ============================================================
   Boutiko PWA — Service Worker (production-ready)
   Strategies optimisées pour l'Afrique (3G, low-data)
   ============================================================ */

const CACHE_VERSION = 'boutiko-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;
const OFFLINE_PAGE = '/offline';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png',
  '/pwa-icons/apple-touch-icon.png',
  '/logo.svg',
];

const MAX_AGE_STATIC = 30 * 24 * 60 * 60;       // 30 days
const MAX_AGE_IMAGES = 7 * 24 * 60 * 60;         // 7 days
const MAX_AGE_API = 5 * 60;                       // 5 minutes
const MAX_ENTRIES_IMAGES = 100;
const MAX_ENTRIES_API = 50;

/* ---- Install: Pre-cache shell assets ---- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
    })
  );
});

/* ---- Activate: Clean old caches ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith('boutiko-') && name !== STATIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => {
      return (self as unknown as ServiceWorkerGlobalScope).clients.claim();
    })
  );
});

/* ---- Fetch Router ---- */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Route by pattern
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE, MAX_AGE_API, MAX_ENTRIES_API));
  } else if (isImageRequest(request, url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, MAX_AGE_IMAGES, MAX_AGE_IMAGES));
  } else if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, MAX_AGE_STATIC));
  } else {
    // HTML pages: network-first with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

/* ---- Strategy: Cache First (static assets) ---- */
async function cacheFirst(request: Request, cacheName: string, maxAge: number): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    const age = getCachedAge(cached);
    if (age < maxAge) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/* ---- Strategy: Network First (API calls) ---- */
async function networkFirst(request: Request, cacheName: string, maxAge: number, maxEntries: number): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      trimCache(cacheName, maxEntries);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      const age = getCachedAge(cached);
      if (age < maxAge) {
        return cached;
      }
    }
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Vous êtes hors ligne. Les données affichées peuvent ne pas être à jour.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* ---- Strategy: Stale While Revalidate (images) ---- */
async function staleWhileRevalidate(request: Request, cacheName: string, maxEntries: number, maxTotal: number): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Background revalidation
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trimCache(cacheName, maxTotal);
      }
      return response;
    })
    .catch(() => cached as Response);

  return cached || fetchPromise;
}

/* ---- Strategy: Network First with Offline Page Fallback ---- */
async function networkFirstWithOfflineFallback(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Serve offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) return offlinePage;
    }

    return new Response('Hors ligne', { status: 503, statusText: 'Offline' });
  }
}

/* ---- Background Sync for offline actions ---- */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    (event as unknown as SyncEvent).waitUntil(syncOfflineOrders());
  }
  if (event.tag === 'sync-products') {
    (event as unknown as SyncEvent).waitUntil(syncOfflineProducts());
  }
});

async function syncOfflineOrders() {
  const db = await openSyncDB();
  const tx = db.transaction('pending-actions', 'readwrite');
  const store = tx.objectStore('pending-actions');
  const actions = await store.getAll();

  for (const action of actions) {
    if (action.type === 'order') {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });
        await store.delete(action.id);
      } catch {
        // Will retry on next sync
      }
    }
  }
  await tx.done;
}

async function syncOfflineProducts() {
  const db = await openSyncDB();
  const tx = db.transaction('pending-actions', 'readwrite');
  const store = tx.objectStore('pending-actions');
  const actions = await store.getAll();

  for (const action of actions) {
    if (action.type === 'product-update' || action.type === 'product-create') {
      try {
        const method = action.type === 'product-create' ? 'POST' : 'PUT';
        await fetch('/api/products', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });
        await store.delete(action.id);
      } catch {
        // Will retry on next sync
      }
    }
  }
  await tx.done;
}

/* ---- Push Notifications ---- */
self.addEventListener('push', (event) => {
  let data: { title?: string; body?: string; icon?: string; badge?: string; url?: string; tag?: string } = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Boutiko', body: event.data.text() };
    }
  }

  const title = data.title || 'Boutiko';
  const options: NotificationOptions = {
    body: data.body || 'Vous avez une nouvelle notification',
    icon: data.icon || '/pwa-icons/icon-192x192.png',
    badge: data.badge || '/pwa-icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard' },
    tag: data.tag || 'boutiko-notification',
    renotify: true,
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
  };

  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if possible
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return (self as unknown as ServiceWorkerGlobalScope).clients.openWindow(urlToOpen);
    })
  );
});

/* ---- Helpers ---- */
function isApiRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/');
}

function isImageRequest(request: Request, url: URL): boolean {
  const imageTypes = ['image/', 'avif', 'webp', 'png', 'jpg', 'jpeg', 'gif', 'svg+xml'];
  const contentType = request.headers.get('Accept') || '';
  const isImageAccept = imageTypes.some((t) => contentType.includes(t));
  const isImagePath = /\.(png|jpg|jpeg|gif|webp|avif|svg|ico)(\?.*)?$/i.test(url.pathname);
  return isImageAccept || isImagePath;
}

function isStaticAsset(request: Request, url: URL): boolean {
  const staticExtensions = /\.(js|css|woff2?|ttf|eot|otf)(\?.*)?$/i;
  const nextStatic = url.pathname.startsWith('/_next/static/');
  return staticExtensions.test(url.pathname) || nextStatic;
}

function getCachedAge(response: Response): number {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return 0;
  const cachedTime = new Date(dateHeader).getTime();
  return Math.floor((Date.now() - cachedTime) / 1000);
}

function trimCache(cacheName: string, maxEntries: number): void {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxEntries) {
        const deleteCount = keys.length - maxEntries;
        const deletePromises = keys
          .sort((a, b) => {
            const aDate = a.headers.get('date') || '';
            const bDate = b.headers.get('date') || '';
            return aDate.localeCompare(bDate);
          })
          .slice(0, deleteCount)
          .map((key) => cache.delete(key));
        Promise.all(deletePromises);
      }
    });
  });
}

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('boutiko-sync', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* Type declarations for Service Worker globals */
declare global {
  interface WindowEventMap {
    sync: SyncEvent;
  }
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
  waitUntil(promise: Promise<unknown>): void;
}

type ExtendableEvent = Event & { waitUntil(promise: Promise<unknown>): void };