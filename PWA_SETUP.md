# PWA Setup — Boutiko

## Architecture Overview

Boutiko uses a workbox-based Progressive Web App setup powered by `@ducanh2912/next-pwa`.

### File Structure

```
├── next.config.ts              # PWA plugin configuration
├── public/
│   ├── manifest.json           # Web App Manifest
│   ├── sw.js                   # Compiled service worker (generated at build)
│   ├── pwa-icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── apple-touch-icon.png
│   │   └── favicon-32x32.png
├── worker/
│   └── sw.js                   # Service Worker source (workbox)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # PWA meta tags, install/offline components
│   │   ├── loading.tsx         # Global loading skeleton
│   │   ├── offline/page.tsx    # Offline fallback page
│   │   └── api/notifications/
│   │       ├── subscribe/route.ts   # Push subscription endpoint
│   │       └── send/route.ts        # Push notification sender (admin)
│   ├── components/pwa/
│   │   ├── install-prompt.tsx       # "Install Boutiko" banner
│   │   ├── offline-indicator.tsx    # Connection status bar
│   │   ├── bottom-navigation.tsx    # Native-like bottom nav bar
│   │   └── pull-to-refresh.tsx      # Pull-to-refresh gesture
│   └── lib/
│       ├── pwa-utils.ts             # PWA helper functions
│       └── idb.ts                   # IndexedDB offline cache wrapper
└── prisma/schema.prisma        # PushSubscription model
```

## Installation

### 1. Generate VAPID Keys (for Push Notifications)

Push notifications require VAPID keys. Generate them once and add to your `.env`:

```bash
npx web-push generate-vapid-keys
```

This outputs:
- `Public Key` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in `.env`
- `Private Key` → `VAPID_PRIVATE_KEY` in `.env`

### 2. Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
```

### 3. Database

The `PushSubscription` model was added to the Prisma schema. Run:

```bash
bun run db:push
```

### 4. Build

The PWA plugin is **disabled in development** for HMR support. It only activates during `next build`:

```bash
bun run build
```

The compiled service worker will be in `public/sw.js` with the workbox precache manifest injected.

### 5. Deploy

Boutiko uses Docker with `output: "standalone"`. The build script copies `public/` (including the compiled SW and manifest) to the standalone output:

```bash
docker build -t boutiko .
docker run -p 3000:3000 boutiko
```

## Caching Strategies

| Resource Type         | Strategy                | Max Age    | Max Entries | Timeout   |
|-----------------------|-------------------------|------------|-------------|-----------|
| Static assets (JS/CSS) | Cache First             | 30 days    | 80          | —         |
| Images                | Stale While Revalidate  | 7 days     | 100         | —         |
| API (shops/products)  | Network First           | 5 minutes  | 50          | 5 sec     |
| API (other shops)     | Network First           | 10 minutes | 30          | 5 sec     |
| CDN (fonts)           | Cache First             | 365 days   | 20          | —         |
| Navigation pages      | Network First           | 24 hours   | 20          | 5 sec     |
| POST/PUT mutations    | Background Sync         | 24 hours   | —           | —         |

## Push Notification Types

| Type              | Urgency | Trigger                             |
|-------------------|---------|-------------------------------------|
| NEW_ORDER         | normal  | New customer order received          |
| WHATSAPP_MESSAGE  | normal  | WhatsApp message notification        |
| LIVE_REMINDER     | high    | Upcoming or active TikTok Live       |
| GENERAL           | normal  | Platform announcements, updates      |

## Components

### InstallPrompt
Shows a non-intrusive "Install Boutiko" banner after 30 seconds. Respects user preference (7-day cooldown on dismiss). Handles both Android (native prompt) and iOS (manual instructions).

### OfflineIndicator
Real-time connection status bar. Measures latency against `/api/route` every 30 seconds. Three states: online (hidden), slow (amber, >3s latency), offline (dark gray).

### BottomNavigation
Native-like bottom tab bar visible only on mobile dashboard. Tabs: Home, Products, Orders, Live. Includes active indicator, badges, and haptic feedback.

### PullToRefresh
Touch gesture component with resistance physics. Wraps any content area. Shows a spinner that transitions to continuous rotation during refresh.

## Offline Data (IndexedDB)

The `idb.ts` wrapper manages three stores:
1. **cached-products** — Product listings per shop (24h TTL)
2. **cached-dashboard** — Dashboard stats per user (1h TTL)
3. **cached-shop-config** — Shop configuration (7d TTL)

## Generating New Icons

Icons are generated from `public/logo.svg` using sharp:

```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/logo.svg', 'utf-8');
[72,96,128,192,512].forEach(async size => {
  const padded = '<svg width=\"'+size+'\" height=\"'+size+'\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"'+size+'\" height=\"'+size+'\" rx=\"'+Math.round(size*0.2)+'\" fill=\"#000\"/><g transform=\"translate('+Math.round(size*0.15)+','+Math.round(size*0.15)+') scale('+((size-2*Math.round(size*0.15))/30)+')\">'+svg.replace(/<\?xml[^?]*\?>/g,'').replace(/<svg[^>]*>/g,'').replace(/<\/svg>/g,'')+'</g></svg>';
  await sharp(Buffer.from(padded)).resize(size,size).png().toFile('public/pwa-icons/icon-'+size+'x'+size+'.png');
  console.log('icon-'+size+'x'+size+'.png');
});
"
```