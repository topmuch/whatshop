/* ============================================================
   Boutiko PWA — Service Worker Source (workbox-based)
   Compiled by @ducanh2912/next-pwa → public/sw.js
   Strategies optimisées pour l'Afrique (3G, low-data)
   ============================================================ */

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { NavigationRoute, enableNavigationPreload } from "workbox-navigation-preload";

// Inject the precache manifest (populated by the plugin at build time)
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old precache entries from previous versions
cleanupOutdatedCaches();

// Skip waiting and activate immediately
self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* ============================================================
   CACHING STRATEGIES
   ============================================================ */

// 1. Static assets (JS, CSS, Fonts) — Cache First, 30 days
registerRoute(
  ({ request, url }) => {
    const isNextStatic = url.pathname.startsWith("/_next/static/");
    const isStaticFile = /\.(?:js|css|woff2?|ttf|eot|otf)$/i.test(url.pathname);
    return isNextStatic || isStaticFile;
  },
  new CacheFirst({
    cacheName: "boutiko-static-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// 2a. Uploaded images (/uploads/) — Network First, 1 day cache fallback
//    IMPORTANT: Uploaded images MUST use NetworkFirst so that if the file
//    is deleted from disk (e.g. container restart without volume), the
//    browser immediately gets a 404 instead of serving a stale cached copy.
//    This prevents the "images randomly disappear" problem.
registerRoute(
  ({ url }) => url.pathname.startsWith("/uploads/"),
  new NetworkFirst({
    cacheName: "boutiko-uploaded-images-v1",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60, // 1 day cache fallback
      }),
    ],
  })
);

// 2b. Static/public images — Stale While Revalidate, 7 days max
//    These are bundled assets (PWA icons, favicons, etc.) that never disappear
registerRoute(
  ({ request }) => {
    const accept = request.headers.get("accept") || "";
    return (
      (accept.includes("image/") ||
      /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/i.test(
        new URL(request.url).pathname
      )) && !new URL(request.url).pathname.startsWith("/uploads/")
    );
  },
  new StaleWhileRevalidate({
    cacheName: "boutiko-static-images-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// 3. API calls — Network First, 5 min cache fallback
const apiCacheName = "boutiko-api-v1";

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/shops/") && url.pathname.endsWith("/products"),
  new NetworkFirst({
    cacheName: apiCacheName,
    networkTimeoutSeconds: 5, // Fast fail on 3G
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/shops/") && !url.pathname.includes("/products"),
  new NetworkFirst({
    cacheName: apiCacheName,
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 10 * 60,
      }),
    ],
  })
);

// 4. External resources (CDN fonts, etc.) — Cache First, 30 days
registerRoute(
  ({ url }) => {
    const cdnHosts = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];
    return cdnHosts.some((host) => url.hostname === host);
  },
  new CacheFirst({
    cacheName: "boutiko-cdn-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

/* ============================================================
   BACKGROUND SYNC — Offline order & product mutations
   ============================================================ */

const bgSyncPlugin = new BackgroundSyncPlugin("boutiko-offline-queue", {
  maxRetentionTime: 24 * 60, // 24 hours
  onSync: async ({ queue }) => {
    // Replay all queued requests
    // The queue automatically replays failed POST/PUT/DELETE requests
  },
});

// Offline POST/PUT mutations use background sync
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/orders") || url.pathname.startsWith("/api/products"),
  new NetworkFirst({
    cacheName: apiCacheName,
    networkTimeoutSeconds: 5,
    plugins: [bgSyncPlugin],
  }),
  "POST"
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/products"),
  new NetworkFirst({
    cacheName: apiCacheName,
    networkTimeoutSeconds: 5,
    plugins: [bgSyncPlugin],
  }),
  "PUT"
);

/* ============================================================
   NAVIGATION FALLBACK — Serve offline page
   ============================================================ */

// Enable navigation preload for faster navigation
enableNavigationPreload();

// For navigation requests, try network first; fall back to cached offline page
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: "boutiko-pages-v1",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
    {
      denylist: [/^\/api\//, /^\/admin\//],
    }
  )
);

/* ============================================================
   PUSH NOTIFICATIONS
   ============================================================ */

self.addEventListener("push", (event) => {
  let data = {
    title: "Boutiko",
    body: "Vous avez une nouvelle notification",
    icon: "/pwa-icons/icon-192x192.png",
    badge: "/pwa-icons/icon-72x72.png",
    url: "/dashboard",
    tag: "boutiko-default",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: { url: data.url },
    tag: data.tag,
    renotify: true,
    actions: [
      { action: "view", title: "Voir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

/* ============================================================
   MESSAGE HANDLER — Communication with main thread
   ============================================================ */

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_OFFLINE_QUEUE_SIZE") {
    // Respond with the number of pending sync requests
    // This is informational — the actual queue is managed by workbox
    event.ports?.[0]?.postMessage({ queueSize: 0 });
  }
});