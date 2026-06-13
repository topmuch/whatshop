# PWA Testing Checklist — Boutiko

## Prerequisites

- HTTPS enabled (required for service workers and push notifications)
- Chrome DevTools open (F12) → Application tab
- A test device or Chrome mobile emulation

---

## 1. Installation

### Chrome Android
- [ ] Open boutiko.pro in Chrome
- [ ] Wait 30 seconds → "Installer Boutiko" banner appears
- [ ] Click "Installer" → native install dialog appears
- [ ] App appears on home screen
- [ ] App opens in standalone mode (no browser bar)
- [ ] After install, banner no longer shows

### Safari iOS
- [ ] Open boutiko.pro in Safari
- [ ] Wait 30 seconds → iOS instruction banner appears
- [ ] Tap Share button → "Sur l'écran d'accueil" option available
- [ ] Add to home screen → app icon appears
- [ ] App opens in fullscreen standalone mode
- [ ] Status bar is black-translucent

### Desktop Chrome
- [ ] Click install icon in address bar
- [ ] Install dialog appears
- [ ] App opens as standalone window
- [ ] No browser navigation bar

---

## 2. Offline Functionality

### Basic Offline
- [ ] Open app while online, navigate through dashboard
- [ ] Enable Airplane Mode
- [ ] "Vous êtes hors ligne" indicator appears at top
- [ ] Previously visited pages load from cache
- [ ] Navigate to /offline → custom offline page shows
- [ ] Click "Réessayer" → page reloads

### Data Offline
- [ ] While online, visit dashboard and products
- [ ] Go offline
- [ ] Dashboard stats still show (from IndexedDB cache)
- [ ] Product list still visible (from cache)
- [ ] Data shows "may not be up to date" warning

### Background Sync
- [ ] While online, open the app
- [ ] Go offline
- [ ] Create an order (or modify a product)
- [ ] Action is queued locally
- [ ] Go back online
- [ ] Queued actions are automatically sent
- [ ] Data is consistent with server

---

## 3. Push Notifications

### Subscription
- [ ] Log in as a seller
- [ ] Notification permission prompt appears (or is requested)
- [ ] Permission is granted
- [ ] PushSubscription is saved in database
- [ ] No duplicate subscriptions for same endpoint

### Receiving
- [ ] Admin sends a test notification via `/api/notifications/send`
- [ ] Notification appears on device
- [ ] Clicking "Voir" navigates to correct page
- [ ] Clicking "Ignorer" dismisses the notification
- [ ] Multiple notifications stack correctly

### Unsubscribe
- [ ] User can revoke notification permission in browser settings
- [ ] DELETE `/api/notifications/subscribe?endpoint=...` removes subscription
- [ ] Disabled subscriptions are not sent to

---

## 4. Performance

### Lighthouse PWA Score
- [ ] Open Chrome DevTools → Lighthouse tab
- [ ] Select "Progressive Web App" category
- [ ] Run on Mobile simulation
- [ ] PWA score > 90
- [ ] Performance score > 90

### Loading Speed (3G Throttling)
- [ ] DevTools → Network tab → Throttling → Fast 3G
- [ ] Clear site data (Application → Storage → Clear site data)
- [ ] Reload page
- [ ] First meaningful paint < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] Service worker installs within 2 seconds

### Cache Verification
- [ ] Open DevTools → Application → Cache Storage
- [ ] Verify these caches exist:
  - `boutiko-static-v1` (JS, CSS)
  - `boutiko-images-v1` (product images)
  - `boutiko-api-v1` (API responses)
  - `boutiko-pages-v1` (HTML pages)
  - `workbox-precache-v2-...` (app shell)
- [ ] Static assets served from cache (disk cache indicator in Network tab)

---

## 5. UI Components

### Install Prompt
- [ ] Banner appears after 30 seconds (not immediately)
- [ ] Banner is mobile-optimized (max-width, rounded, shadow)
- [ ] Dismiss button works and remembers preference
- [ ] Reappears after 7 days if previously dismissed
- [ ] Does not show when app is already installed
- [ ] Android: shows "Installer" button
- [ ] iOS: shows instruction text with share icon

### Offline Indicator
- [ ] Hidden when online and fast connection
- [ ] Amber bar appears when latency > 3 seconds
- [ ] Dark gray bar appears when offline
- [ ] Shows latency value on slow connection (desktop)
- [ ] Dismiss button works
- [ ] Auto-hides when connection is restored

### Bottom Navigation
- [ ] Only visible on mobile (< 768px)
- [ ] Only visible on /dashboard routes
- [ ] 4 tabs: Accueil, Produits, Commandes, Live
- [ ] Active tab has black indicator bar at top
- [ ] Badge counter shows on tabs with pending items
- [ ] Respects safe-area-inset-bottom (notch devices)
- [ ] Haptic feedback on tab tap (Android)

### Pull to Refresh
- [ ] Pull down gesture shows spinner
- [ ] Spinner rotates proportionally to pull distance
- [ ] Release triggers refresh callback
- [ ] During refresh, spinner animates continuously
- [ ] Content updates after refresh completes
- [ ] Only triggers when scrolled to top

---

## 6. Security

### Service Worker
- [ ] `sw.js` is served with `Cache-Control: no-cache`
- [ ] Service worker scope is `/` (root)
- [ ] Service worker updates automatically on new deployments

### Manifest
- [ ] `manifest.json` is served with correct content-type
- [ ] Icons are accessible and load correctly
- [ ] `start_url` resolves correctly
- [ ] `display: standalone` is set

### HTTPS
- [ ] All resources loaded over HTTPS
- [ ] No mixed content warnings in console
- [ ] HSTS header is set (max-age=31536000)

---

## 7. Cross-Browser

### Chrome 80+ (Android & Desktop)
- [ ] Service worker registers successfully
- [ ] All caching strategies work
- [ ] Push notifications work
- [ ] Install prompt works

### Safari 16+ (iOS)
- [ ] Service worker registers (iOS 16.4+)
- [ ] Basic caching works
- [ ] Push notifications work (iOS 16.4+)
- [ ] Add to Home Screen works

### Firefox (Android)
- [ ] Service worker registers
- [ ] Caching works
- [ ] Push notifications work
- [ ] Install prompt (if supported)

---

## 8. Edge Cases

- [ ] Clear all site data → app recovers on next load
- [ ] Switch between Wi-Fi and mobile data → offline indicator updates
- [ ] Force-kill app → reopens correctly in standalone mode
- [ ] Multiple tabs open → service worker coordinates correctly
- [ ] Push notification while app is closed → notification shows
- [ ] Push notification while app is in foreground → handled gracefully
- [ ] Very slow 2G connection → app still loads cached content
- [ ] Save Data mode enabled → connection quality shows "slow"