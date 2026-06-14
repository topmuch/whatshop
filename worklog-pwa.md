---
Task ID: 1
Agent: Main Agent
Task: Transform Boutiko into a Progressive Web App (PWA)

Work Log:
- Installed @ducanh2912/next-pwa, idb, web-push, @types/web-push
- Generated PWA icons (72x72, 96x96, 128x128, 192x192, 512x512) from logo.svg using sharp
- Created public/manifest.json with full manifest config (icons, shortcuts, share_target)
- Created worker/sw.js — workbox-based service worker source with:
  - CacheFirst for static assets (30d), StaleWhileRevalidate for images (7d)
  - NetworkFirst for API calls (5-10min cache, 5s timeout)
  - BackgroundSyncPlugin for offline mutations
  - NavigationRoute with offline fallback
  - Push notification handler with actions
- Updated next.config.ts with @ducanh2912/next-pwa integration (disabled in dev, swSrc for workbox)
- Created src/components/pwa/install-prompt.tsx — Smart install banner (30s delay, 7d cooldown, iOS/Android)
- Created src/components/pwa/offline-indicator.tsx — Connection status bar (useSyncExternalStore + useReducer)
- Created src/components/pwa/bottom-navigation.tsx — Native-like mobile bottom nav (haptic feedback)
- Created src/components/pwa/pull-to-refresh.tsx — Touch gesture with resistance physics
- Updated src/app/layout.tsx with PWA meta tags (viewport-fit, theme-color, manifest, apple-touch-icon, preconnect, touch-action)
- Created src/app/offline/page.tsx — Custom offline fallback page
- Created src/app/loading.tsx — Global loading skeleton
- Added PushSubscription model to Prisma schema (with User relation)
- Created src/app/api/notifications/subscribe/route.ts — POST subscribe, DELETE unsubscribe
- Created src/app/api/notifications/send/route.ts — Admin push notification sender with VAPID
- Created src/lib/pwa-utils.ts — isStandaloneMode, connection quality, notification permission, haptic feedback
- Created src/lib/idb.ts — IndexedDB wrapper (cached-products, cached-dashboard, cached-shop-config)
- Created PWA_SETUP.md — Architecture docs, caching strategies, component docs
- Created PWA_TESTING.md — Complete testing checklist (8 sections, 50+ test cases)
- Fixed dev script to use --turbopack flag (Next.js 16 default)
- All lint errors fixed (React 19 strict rules, useReducer instead of useState for effects)

Stage Summary:
- PWA fully configured and production-ready
- Verified: manifest.json serves, icons accessible, offline page works, meta tags present
- Lint passes with 0 errors
- Service worker compiles via @ducanh2912/next-pwa in production build
