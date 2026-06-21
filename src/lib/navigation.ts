import { useAppStore, type AppView } from '@/lib/store'

/**
 * Maps an AppView to its URL path.
 */
const VIEW_TO_PATH: Partial<Record<AppView, string>> = {
  landing: '/',
  about: '/about',
  pricing: '/pricing',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  admin: '/admin',
  reseller: '/reseller',
  onboarding: '/onboarding',
}

/**
 * Custom event name dispatched after a pushState navigation.
 * The `useClientPathname` hook in page.tsx listens for this to re-read
 * `window.location.pathname` and update the view.
 */
export const NAVIGATE_EVENT = 'app:navigate'

/**
 * Navigate to another view without a full page reload.
 *
 * Uses `pushState` so the URL bar updates, then dispatches a custom
 * event that `useClientPathname` (in page.tsx) picks up. The store
 * view is set directly via `setState` to avoid action side-effects.
 *
 * For auth views (login, register, dashboard, admin, reseller, onboarding)
 * we still do a full reload because those views are loaded lazily and
 * may depend on server-side session checks.
 */
export function navigateTo(view: AppView) {
  const path = VIEW_TO_PATH[view]
  if (path) {
    useAppStore.setState({ view })
    window.history.pushState(null, '', path)
    window.dispatchEvent(new Event(NAVIGATE_EVENT))
  } else {
    useAppStore.setState({ view })
  }
}