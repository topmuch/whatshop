'use client'

import dynamic from 'next/dynamic'
import { useAppStore, AppView } from '@/lib/store'
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { NAVIGATE_EVENT } from '@/lib/navigation'
import { LandingPage } from '@/components/landing'
import { AuthLogin } from '@/components/auth/auth-login'
import { AuthRegister } from '@/components/auth/auth-register'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { PublicShop } from '@/components/shop/public-shop'
import { PublicLayout } from '@/components/pages/public-layout'
import { WhatsAppFloat } from '@/components/ui/whatsapp-float'
import { CookieConsent } from '@/components/ui/cookie-consent'
import { resetMeta } from '@/lib/seo'

// Heavy dashboards loaded lazily
const SellerDashboard = dynamic(() => import('@/components/dashboard/seller-dashboard').then(m => ({ default: m.SellerDashboard })), {
  ssr: false,
  loading: () => <PageSkeleton />,
})
const ResellerDashboard = dynamic(() => import('@/components/dashboard/dashboard-reseller').then(m => ({ default: m.ResellerDashboard })), {
  ssr: false,
  loading: () => <PageSkeleton />,
})
const AdminDashboard = dynamic(() => import('@/components/admin/admin-dashboard').then(m => ({ default: m.AdminDashboard })), {
  ssr: false,
  loading: () => <PageSkeleton />,
})

// Public pages loaded lazily
const AboutPage = dynamic(() => import('@/components/pages/about-page').then(m => ({ default: m.AboutPage })), { ssr: false })
const PricingPage = dynamic(() => import('@/components/pages/pricing-page').then(m => ({ default: m.PricingPage })), { ssr: false })
const ContactPage = dynamic(() => import('@/components/pages/contact-page').then(m => ({ default: m.ContactPage })), { ssr: false })
const FAQPage = dynamic(() => import('@/components/pages/faq-page').then(m => ({ default: m.FAQPage })), { ssr: false })
const PrivacyPage = dynamic(() => import('@/components/pages/privacy-page').then(m => ({ default: m.PrivacyPage })), { ssr: false })
const TermsPage = dynamic(() => import('@/components/pages/terms-page').then(m => ({ default: m.TermsPage })), { ssr: false })

// Map of page query param values to AppView types
const PAGE_VIEW_MAP: Record<string, AppView> = {
  'about': 'about',
  'a-propos': 'about',
  'pricing': 'pricing',
  'tarifs': 'pricing',
  'contact': 'contact',
  'contactez-nous': 'contact',
  'privacy': 'privacy',
  'confidentialite': 'privacy',
  'terms': 'terms',
  'conditions': 'terms',
  'faq': 'faq',
  'aide': 'faq',
}

/**
 * Read the current pathname via useSyncExternalStore.
 * Returns the real pathname immediately on the client (no effect delay),
 * and '/' on the server (for SSR compatibility).
 */
function useClientPathname() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('popstate', cb)
      window.addEventListener(NAVIGATE_EVENT, cb)
      return () => {
        window.removeEventListener('popstate', cb)
        window.removeEventListener(NAVIGATE_EVENT, cb)
      }
    },
    () => window.location.pathname,
    () => '/' // server snapshot
  )
}

/**
 * Resolve the correct view from the URL pathname.
 * Safe to call with server-provided '/' path.
 */
function resolveViewFromPath(pathname: string): { view: AppView; shopSlug: string; productSlug: string } {
  // Guard: during SSR, pathname is '/' — never use window here
  if (typeof window === 'undefined') {
    return { view: 'landing', shopSlug: '', productSlug: '' }
  }

  const slug = pathname.slice(1).toLowerCase()

  // Dashboard routes
  if (slug.startsWith('dashboard')) {
    return { view: 'dashboard', shopSlug: '', productSlug: '' }
  }

  // Admin routes
  if (slug.startsWith('admin')) {
    return { view: 'admin', shopSlug: '', productSlug: '' }
  }

  // Reseller routes
  if (slug.startsWith('reseller') || slug.startsWith('revendeur')) {
    return { view: 'reseller', shopSlug: '', productSlug: '' }
  }

  // Auth routes
  if (slug === 'login' || slug === 'connexion') {
    return { view: 'login', shopSlug: '', productSlug: '' }
  }
  if (slug === 'register' || slug === 'inscription') {
    return { view: 'register', shopSlug: '', productSlug: '' }
  }
  if (slug === 'onboarding') {
    return { view: 'onboarding', shopSlug: '', productSlug: '' }
  }

  // Known public pages
  if (PAGE_VIEW_MAP[slug]) {
    return { view: PAGE_VIEW_MAP[slug], shopSlug: '', productSlug: '' }
  }

  // Check query params (middleware rewrites)
  const params = new URLSearchParams(window.location.search)
  const pageParam = params.get('page')
  if (pageParam && PAGE_VIEW_MAP[pageParam]) {
    return { view: PAGE_VIEW_MAP[pageParam], shopSlug: '', productSlug: '' }
  }

  const shopParam = params.get('shop')
  const productParam = params.get('product')
  if (shopParam) {
    return { view: 'shop', shopSlug: shopParam, productSlug: productParam || '' }
  }

  // Product URL pattern: /shop-slug/p/product-slug
  const productMatch = slug.match(/^([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/)
  if (productMatch) {
    return { view: 'shop', shopSlug: productMatch[1], productSlug: productMatch[2] }
  }

  // Shop slug (single segment, alphanumeric with hyphens)
  if (slug && /^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug)) {
    return { view: 'shop', shopSlug: slug, productSlug: '' }
  }

  return { view: 'landing', shopSlug: '', productSlug: '' }
}

/** Minimal skeleton for lazy-loaded views */
function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-7 w-7 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
    </div>
  )
}

// Views that are safe to render during SSR/hydration.
// Only pure client-only views with no dependency on persisted store state.
const IMMEDIATE_VIEWS: AppView[] = ['login', 'register', 'onboarding']

/**
 * Returns true only on the client after hydration.
 * Uses useSyncExternalStore to avoid the setState-in-effect lint rule.
 */
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function Home() {
  const view = useAppStore(s => s.view)
  const shopSlug = useAppStore(s => s.shopSlug)
  const publicShop = useAppStore(s => s.publicShop)
  const setUser = useAppStore(s => s.setUser)
  const setShop = useAppStore(s => s.setShop)
  const setShops = useAppStore(s => s.setShops)
  const setView = useAppStore(s => s.setView)
  const setShopSlug = useAppStore(s => s.setShopSlug)
  const setPublicShop = useAppStore(s => s.setPublicShop)
  const setPublicProducts = useAppStore(s => s.setPublicProducts)

  const pathname = useClientPathname()
  const mounted = useIsMounted()

  // Resolve view from the URL (used for shop slugs & initial page load)
  const urlView = resolveViewFromPath(pathname)

  // ── LAYOUT EFFECT: Sync URL → store BEFORE browser paints ──
  // useLayoutEffect runs synchronously after render but before paint,
  // so the store is updated before the user sees anything.
  // This is the ONLY effect that modifies view/shopSlug based on the URL.
  useLayoutEffect(() => {
    if (!mounted) return

    // Remove the visibility:hidden set by layout.tsx inline script
    if (document.documentElement.classList.contains('ws-loading-shop')) {
      document.documentElement.style.visibility = ''
      document.documentElement.classList.remove('ws-loading-shop')
    }

    const realPath = window.location.pathname
    const resolved = resolveViewFromPath(realPath)

    // Always sync the URL-derived view into the store.
    // For shop URLs, this ensures the store matches the URL immediately.
    if (resolved.view === 'shop') {
      // For shops, always set both view and slug together.
      // Only clear shop data if navigating to a DIFFERENT shop.
      const slugChanged = resolved.shopSlug !== shopSlug
      useAppStore.setState({
        view: 'shop',
        shopSlug: resolved.shopSlug,
        ...(slugChanged ? { publicShop: null, publicProducts: [] } : {}),
      })
    } else if (view !== resolved.view) {
      // For non-shop views, only update if store doesn't match.
      // Don't override auth views (dashboard/admin/reseller) that were set
      // by the session check effect.
      const isAuthView = ['dashboard', 'admin', 'reseller'].includes(view)
      if (!isAuthView) {
        useAppStore.setState({ view: resolved.view })
      }
    }
  }, [mounted, pathname, view, shopSlug])

  /* ── EFFECTIVE VIEW ── */
  // The URL is ALWAYS the primary source of truth.
  // 1. If the URL resolves to 'shop', the shop view wins unconditionally.
  //    This prevents ANY store state (stale persisted view, auth redirect, etc.)
  //    from hijacking a shop URL.
  // 2. If the store says 'shop' but the URL disagrees, trust the URL
  //    (handles browser back from a shop to another page).
  // 3. If the store is still 'landing' (initial default), trust the URL
  //    so that /dashboard, /pricing etc. render immediately.
  // 4. Otherwise trust the store (handles SPA nav & auth redirects).
  const effectiveView: AppView = urlView.view === 'shop'
    ? 'shop'
    : (view === 'shop' ? urlView.view : (view === 'landing' ? urlView.view : view))

  // Before mount: only render known auth routes (they're client-only anyway).
  // For everything else, show a skeleton to prevent flash.
  const safeToRender = mounted || IMMEDIATE_VIEWS.includes(effectiveView)

  // Reset SEO meta tags when navigating away from a shop
  useEffect(() => {
    if (!publicShop) {
      resetMeta()
    }
  }, [publicShop])

  // ── SESSION CHECK ──
  // Uses a ref to completely prevent this effect from interfering with shop views.
  // Even if the async fetch completes after a URL change, the guard ensures
  // we never redirect away from a shop.
  const sessionCheckedRef = useRef(false)
  useEffect(() => {
    // ABSOLUTE GUARD: if the current URL is a shop, NEVER run session check
    const realView = resolveViewFromPath(window.location.pathname).view
    if (realView === 'shop') return

    // If we already checked and the URL hasn't changed, skip
    if (effectiveView === 'shop') return

    const isPublicView = ['landing', 'about', 'pricing', 'contact', 'faq', 'privacy', 'terms'].includes(effectiveView)

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (!res.ok) return
        const data = await res.json()
        if (!data.user) return

        // Populate user data
        setUser(data.user)
        if (data.shops) setShops(data.shops)
        if (data.shop) setShop(data.shop)

        // RE-CHECK the URL after async fetch completes.
        // The URL might have changed while we were fetching.
        const currentView = resolveViewFromPath(window.location.pathname).view
        if (currentView === 'shop') return  // NEVER redirect from a shop

        // Public pages: just load session data, don't redirect
        if (isPublicView) return

        // Auth & private pages: redirect based on role
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          setView('admin')
          if (effectiveView === 'login' || effectiveView === 'register') {
            window.history.replaceState(null, '', '/admin')
          }
        } else if (data.user.role === 'RESELLER') {
          setView('reseller')
          if (effectiveView === 'login' || effectiveView === 'register') {
            window.history.replaceState(null, '', '/reseller')
          }
        } else if (!data.shop || (data.shops && data.shops.length === 0)) {
          setView('onboarding')
          window.history.replaceState(null, '', '/onboarding')
        } else if (effectiveView === 'login' || effectiveView === 'register' || effectiveView === 'onboarding') {
          setView('dashboard')
          window.history.replaceState(null, '', '/dashboard')
        }
      } catch {
        // Not authenticated, stay on current view
      }
    }

    checkSession()
  }, [effectiveView])

  const showWhatsApp = mounted && ['landing', 'about', 'pricing', 'contact', 'faq', 'privacy', 'terms'].includes(effectiveView)

  // Before mount, show skeleton for non-immediate views
  if (!safeToRender) {
    return (
      <ErrorBoundary>
        <PageSkeleton />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen flex flex-col">
      {/* Landing page has its own header/footer */}
      {effectiveView === 'landing' && <LandingPage />}
      {effectiveView === 'login' && <AuthLogin />}
      {effectiveView === 'register' && <AuthRegister />}
      {effectiveView === 'onboarding' && <OnboardingWizard />}
      {effectiveView === 'dashboard' && <SellerDashboard />}
      {effectiveView === 'reseller' && <ResellerDashboard />}
      {effectiveView === 'admin' && <AdminDashboard />}
      {effectiveView === 'shop' && <PublicShop initialShopSlug={urlView.shopSlug} initialProductSlug={urlView.productSlug} />}

      {/* Public pages with shared layout */}
      {effectiveView === 'about' && (
        <PublicLayout currentView="about">
          <AboutPage />
        </PublicLayout>
      )}
      {effectiveView === 'pricing' && (
        <PublicLayout currentView="pricing">
          <PricingPage />
        </PublicLayout>
      )}
      {effectiveView === 'contact' && (
        <PublicLayout currentView="contact">
          <ContactPage />
        </PublicLayout>
      )}
      {effectiveView === 'faq' && (
        <PublicLayout currentView="faq">
          <FAQPage />
        </PublicLayout>
      )}
      {effectiveView === 'privacy' && (
        <PublicLayout currentView="privacy">
          <PrivacyPage />
        </PublicLayout>
      )}
      {effectiveView === 'terms' && (
        <PublicLayout currentView="terms">
          <TermsPage />
        </PublicLayout>
      )}

      {/* GDPR / Cookie Consent Banner */}
      <CookieConsent />

      {/* Floating WhatsApp button - show on public pages and landing */}
      {showWhatsApp && (
        <WhatsAppFloat />
      )}
    </div>
    </ErrorBoundary>
  )
}