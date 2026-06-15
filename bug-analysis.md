# Boutiko Bug Analysis Report

---

## Bug 1: Homepage flashes before redirecting to client shop

### Files involved
- `src/proxy.ts` (lines 1–142) — **dead code, never executed**
- `src/app/page.tsx` (lines 56–138) — client-side routing logic
- `next.config.ts` (lines 1–71) — no shop-slug rewrite configured
- No `middleware.ts` file exists anywhere in the project

### Root cause
**`proxy.ts` is dead code.** It was written as a Next.js middleware (note the standard `export const config = { matcher: ... }` at line 140–142), but the file is named `proxy.ts` instead of `middleware.ts`. Next.js only loads middleware from a file named `middleware.ts` at the project root or in `src/`. There is no `middleware.ts` anywhere in the project, and `proxy.ts` is never imported by any other file (confirmed via grep).

This means:
1. The rewrite `/{shop-slug}` → `/?shop={shop-slug}` **never executes**.
2. There is no `[slug]/page.tsx` or catch-all `[[...slug]]/page.tsx` route, so navigating to `/{shop-slug}` returns a **Next.js 404 page** — it never reaches `page.tsx` at all.
3. The `resolveViewFromPath()` function in `page.tsx` (lines 74–138) has correct client-side logic to handle shop slugs (line 133), including skeleton loading to prevent flash (lines 149–179), but this code is unreachable because the request never hits `page.tsx`.

Additionally, the PWA service worker (configured in `next.config.ts` via `@ducanh2912/next-pwa`) may serve a **cached copy of the homepage** for any navigation, which could explain the "few seconds" flash the user sees before the 404 appears.

### Fix
Rename `src/proxy.ts` to `src/middleware.ts` (or create `src/middleware.ts` that re-exports the `proxy` function as the default middleware export). Next.js will then execute the rewrite on every matching request, routing `/{shop-slug}` to `/?shop={shop-slug}` so that `page.tsx` handles it.

---

## Bug 2: Analytics tab shows "Impossible de charger les analytics"

### Files involved
- `src/components/dashboard/dashboard-analytics.tsx` (lines 92–117) — fetch + error handling
- `src/app/api/shops/my-analytics/route.ts` (lines 1–158) — API endpoint
- `src/components/dashboard/seller-dashboard.tsx` (lines 528–544) — global 401 interceptor
- `src/lib/auth.ts` (lines 235–263) — `getAuthUser` / `requireAuth`

### Root cause
The exact error text **"Impossible de charger les analytics" does not exist anywhere in the codebase**. The user is likely paraphrasing what they see. The `DashboardAnalytics` component shows:
- "Données non disponibles" (line 127) as the main heading when data is null
- The specific API error message as a sub-text (line 129)

There are two likely failure modes:

**A) Global 401 interceptor hijacks the view.** The `SellerDashboard` component (lines 529–544) monkey-patches `window.fetch` to intercept ALL 401 responses. When the analytics API returns 401, the interceptor sets `sessionExpired = true`, which replaces the **entire dashboard** with a "Session expirée" screen (lines 634–653). The user may interpret this full-screen takeover as "analytics can't load."

**B) Server-side 500 error.** The `/api/shops/my-analytics` endpoint (line 155–156) catches all exceptions and returns `{ error: 'Erreur serveur' }` with status 500. This could happen if:
- The `db.order` or `db.visit` tables have schema mismatches
- The `JSON.parse(order.items)` call at line 92 encounters malformed data (though this is individually caught at line 93)
- A database connection issue occurs

The component's error handling at lines 104–111 doesn't clearly distinguish between auth failures and server errors for the user — both result in the same generic "Données non disponibles" card.

### Fix
1. **Investigate server logs** for the actual error behind the 500 response from `/api/shops/my-analytics`.
2. **Improve error messaging** in `dashboard-analytics.tsx` to show a more descriptive error (e.g., "Erreur serveur — réessayez plus tard" vs. "Session expirée").
3. **Add `credentials: 'include'`** to the fetch call (line 101) as an explicit safeguard, though same-origin requests should include cookies by default.

---

## Bug 3: Services visible on client site but not in dashboard services tab

### Files involved
- `src/components/templates/cosmika/services-grid.tsx` (lines 1–119) — renders products as "services"
- `src/components/templates/cosmika/index.tsx` (line 317) — `isServiceMode = config.businessType === 'SERVICE'`
- `src/components/dashboard/seller-dashboard.tsx` (lines 105–121) — nav items (no "services" tab)
- `src/lib/sector-config.ts` (lines 704–719) — `GENERIC_SERVICE_LABELS` renames "Products" → "Services"
- `src/components/dashboard/dashboard-products.tsx` (lines 165–185) — fetches products via `/api/products?shopId=${shop.id}`

### Root cause
**There is no dedicated "Services" tab or "Services" management component in the dashboard.** The Cosmika template (used for consulting/beauty/restaurant businesses) labels products as "services" when `businessType === 'SERVICE'`:
- `services-grid.tsx` line 39: `"X services disponibles"`
- `cosmika/index.tsx` line 673: `"Aucun service disponible"`
- WhatsApp CTA (line 805): `"Je suis intéressé(e) par vos services"`

In the dashboard, the nav item at `seller-dashboard.tsx` line 112 is:
```tsx
{ id: 'products', label: labels.navProducts, icon: <Package /> }
```
For SERVICE businesses, `getBusinessLabels()` (delegating to `sector-config.ts`) renames this tab to "Services" (line 705: `navProducts: 'Services'`). The underlying component is still `DashboardProducts`, which fetches from `/api/products?shopId=${shop.id}`.

If services (products) appear on the client site but not in the dashboard's "Services" tab, the most likely cause is:
1. **Shop ID mismatch** — the dashboard may be set to a different shop than the one displayed on the client site (multi-shop setup). The `DashboardProducts` uses `shop.id` from the store (line 168), which depends on which shop is selected in the sidebar.
2. **The `/api/products` endpoint filters differently** than the public shop API, or returns an empty array due to a permissions issue.

### Fix
1. **Verify the shop selector** in the dashboard sidebar matches the shop being viewed on the client site.
2. **Add debugging** to `DashboardProducts` to log the `shopId` being used and the API response.
3. Consider adding a **dedicated service management view** for SERVICE business types (e.g., service-specific fields like duration, deliverables) to reduce user confusion between "products" and "services."

---

## Bug 4: Settings shows "Non authentifié. Erreur lors du chargement des zones de livraison"

### Files involved
- `src/app/api/settings/route.ts` (lines 7, 41) — **uses LEGACY `boutiko-user` cookie**
- `src/lib/auth.ts` (lines 24–34) — iron-session uses `boutiko-session` cookie
- `src/components/dashboard/shipping-zones-manager.tsx` (lines 177–193) — fetches shipping zones
- `src/app/api/shops/[slug]/shipping-zones/route.ts` (lines 45–47) — uses `requireShopOwner`
- `src/components/dashboard/settings/notification-tab.tsx` (lines 22–38) — fetches `/api/settings`
- `src/components/dashboard/seller-dashboard.tsx` (lines 528–544) — global 401 interceptor

### Root cause
**The `/api/settings` route uses a deprecated cookie for authentication.** At line 7:
```typescript
const userEmail = request.cookies.get('boutiko-user')?.value
```
This reads from a cookie named `boutiko-user`, but the current auth system (migrated to iron-session) uses a cookie named **`boutiko-session`** (defined in `auth.ts` line 27). The `boutiko-user` cookie is no longer set anywhere in the codebase, so `request.cookies.get('boutiko-user')` always returns `undefined`, and the endpoint **always returns 401** with `{ error: 'Non authentifié' }`.

This affects the **Notification tab** in Settings (which fetches from `/api/settings` at `notification-tab.tsx` line 24), though the error is silently swallowed at line 38: `.catch(() => {})`.

For the **shipping zones** error specifically: the `ShippingZonesManager` (line 180) fetches from `/api/shops/${shopSlug}/shipping-zones`, which correctly uses `requireShopOwner` with iron-session. If this returns 401 "Non authentifié", it means the session has genuinely expired. The global 401 interceptor (seller-dashboard.tsx lines 529–544) then sets `sessionExpired = true`, replacing the entire dashboard with the "Session expirée" screen. The ShippingZonesManager's toast error (line 189) races with this screen takeover, causing the user to briefly see "Non authentifié" before the session expired screen appears.

The compound error message "Non authentifié. Erreur lors du chargement des zones de livraison" likely comes from:
1. The shipping zones toast showing "Non authentifié" (from the 401 response body)
2. A subsequent retry or the fallback message "Erreur lors du chargement des zones de livraison" (line 189) appearing if a non-Error exception occurs

### Fix
**Critical:** Update `src/app/api/settings/route.ts` to use `requireAuth()` or `requireShopOwner()` from `@/lib/auth` instead of reading the legacy `boutiko-user` cookie. Both the GET handler (line 7) and PUT handler (line 41) need to be updated.

Example fix for the GET handler:
```typescript
import { requireShopOwner } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { user, response: errorResponse } = await requireShopOwner(request)
  if (errorResponse) return errorResponse
  if (!user?.shop) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
  // ... rest of handler using user.shop
}
```