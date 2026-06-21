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
 * Navigate to another view.
 *
 * Sets the store view for the next page load, then does a full navigation
 * to the target URL. This is the most reliable approach for a single-route
 * SPA that uses the URL as the source of truth.
 */
export function navigateTo(view: AppView) {
  const path = VIEW_TO_PATH[view]
  if (path) {
    useAppStore.setState({ view })
    window.location.href = path
  } else {
    useAppStore.setState({ view })
  }
}