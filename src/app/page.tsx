'use client'

import dynamic from 'next/dynamic'
import { useAppStore, AppView } from '@/lib/store'
import { useEffect, useSyncExternalStore } from 'react'
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

// Views that are safe to render during SSR/hydration (client-only auth views)
const IMMEDIATE_VIEWS: AppView[] = ['login', 'register', 'dashboard', 'admin', 'reseller', 'onboarding']

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
  const { view, setView, setUser, setShop, setShops, shopSlug, setShopSlug, setPublicShop, setPublicProducts, publicShop } = useAppStore()
  const pathname = useClientPathname()
  const mounted = useIsMounted()

  // Resolve view from the URL (used for shop slugs & initial page load)
  const urlView = resolveViewFromPath(pathname)

  /* ── MOUNT SYNC: URL → store (for direct navigation / refresh) ── */
  useEffect(() => {
    if (!mounted) return

    // Remove the visibility:hidden set by layout.tsx inline script
    // This prevents flash of landing page when visiting /shop-slug directly
    if (document.documentElement.classList.contains('ws-loading-shop')) {
      document.documentElement.style.visibility = ''
      document.documentElement.classList.remove('ws-loading-shop')
    }

    const realUrl = window.location.pathname
    const resolved = resolveViewFromPath(realUrl).view

    // If store view doesn't match the actual URL, sync it.
    // This handles: direct URL entry, browser refresh, back/forward.
    if (view !== resolved) {
      // Don't override auth views that were set by the session check
      const isAuthView = ['dashboard', 'admin', 'reseller'].includes(view)
      if (!isAuthView) {
        if (resolved === 'shop') {
          useAppStore.setState({ view: 'shop', shopSlug: '', publicShop: null, publicProducts: [] })
        } else {
          useAppStore.setState({ view: resolved })
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  /* ── EFFECTIVE VIEW ── */
  // For shop views, ALWAYS trust the URL-derived view to prevent flashing the
  // landing page when the user directly navigates to /shop-slug.
  // For all other views, trust the Zustand store (handles auth redirects, etc.).
  const effectiveView = urlView.view === 'shop'
    ? 'shop'
    : (view === 'shop' ? urlView.view : view)

  // Before mount: only render known auth routes (they're client-only anyway).
  // For everything else (landing, shop, public pages), show a skeleton to
  // prevent the flash of the landing page when the real URL is a shop slug.
  const safeToRender = mounted || IMMEDIATE_VIEWS.includes(effectiveView)

  // Sync shop slug from URL into store
  useEffect(() => {
    if (urlView.shopSlug && shopSlug !== urlView.shopSlug) {
      setShopSlug(urlView.shopSlug)
    }
  }, [urlView.shopSlug, shopSlug])

  // Reset SEO meta tags when navigating away from a shop
  // Shop-specific SEO (JSON-LD, OG, title) is handled by the JsonLd component in public-shop.tsx
  useEffect(() => {
    if (!publicShop) {
      resetMeta()
    }
  }, [publicShop])

  // Check for existing session — NON-BLOCKING
  // Landing page and public pages render immediately
  useEffect(() => {
    // For shop views, skip session check entirely
    if (effectiveView === 'shop') return

    // Pages where we should NOT redirect authenticated users
    const isPublicView = ['landing', 'about', 'pricing', 'contact', 'faq', 'privacy', 'terms'].includes(effectiveView)

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            // Always populate user data regardless of current page
            setUser(data.user)
            if (data.shops) setShops(data.shops)
            if (data.shop) setShop(data.shop)

            // Re-resolve the current view from the REAL URL (not the stale
            // hydration value captured in `urlView`). During hydration the
            // pathname snapshot is "/", so urlView.view is "landing" even when
            // the user actually opened a public shop URL (e.g. via the
            // "Voir ma boutique" link). By the time this async fetch resolves,
            // window.location.pathname is guaranteed to be the real one.
            // If the user is viewing a public shop page, do NOT redirect them.
            const currentView = resolveViewFromPath(window.location.pathname).view
            if (currentView === 'shop') return

            // ── PUBLIC PAGES: only load session, do NOT redirect ──
            if (isPublicView) return

            // ── AUTH & PRIVATE PAGES: redirect based on role ──
            // Route based on role
            if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
              setView('admin')
              if (urlView.view === 'login' || urlView.view === 'register') {
                window.history.replaceState(null, '', '/admin')
              }
            } else if (data.user.role === 'RESELLER') {
              setView('reseller')
              if (urlView.view === 'login' || urlView.view === 'register') {
                window.history.replaceState(null, '', '/reseller')
              }
            } else if (!data.shop || (data.shops && data.shops.length === 0)) {
              setView('onboarding')
              window.history.replaceState(null, '', '/onboarding')
            } else if (urlView.view === 'login' || urlView.view === 'register' || urlView.view === 'onboarding') {
              setView('dashboard')
              window.history.replaceState(null, '', '/dashboard')
            }
            // For dashboard/admin/reseller views, stay — the page handles its own auth
          }
        }
      } catch {
        // Not authenticated, stay on current view
      }
    }

    checkSession()
  }, [urlView.view])

  const showWhatsApp = mounted && ['landing', 'about', 'pricing', 'contact', 'faq', 'privacy', 'terms'].includes(effectiveView)

  // Before mount, show skeleton for non-immediate views (landing, shop, public pages)
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