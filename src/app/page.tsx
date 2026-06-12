'use client'

import { useAppStore, AppView } from '@/lib/store'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { LandingPage } from '@/components/landing'
import { AuthLogin } from '@/components/auth/auth-login'
import { AuthRegister } from '@/components/auth/auth-register'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { SellerDashboard } from '@/components/dashboard/seller-dashboard'
import { ResellerDashboard } from '@/components/dashboard/dashboard-reseller'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { PublicShop } from '@/components/shop/public-shop'
import { PublicLayout } from '@/components/pages/public-layout'
import { AboutPage } from '@/components/pages/about-page'
import { PricingPage } from '@/components/pages/pricing-page'
import { ContactPage } from '@/components/pages/contact-page'
import { FAQPage } from '@/components/pages/faq-page'
import { PrivacyPage } from '@/components/pages/privacy-page'
import { TermsPage } from '@/components/pages/terms-page'
import { WhatsAppFloat } from '@/components/ui/whatsapp-float'
import { CookieConsent } from '@/components/ui/cookie-consent'

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

// Empty subscribe — value is read once on mount
const emptySubscribe = () => () => {}

/**
 * Read the current pathname synchronously with proper SSR handling.
 * Server snapshot returns '/' (landing), client returns actual path.
 */
function useClientPathname() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.pathname,
    () => '/'
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

/** Minimal loading shell shown during SSR and before hydration */
function LoadingShell() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    </div>
  )
}

export default function Home() {
  const { view, setView, setUser, setShop, setShops, shopSlug, setShopSlug } = useAppStore()
  const pathname = useClientPathname()
  const [hydrated, setHydrated] = useState(false)

  // Synchronously resolve view from the actual URL
  const urlView = resolveViewFromPath(pathname)

  // Use the URL-derived view immediately (no flash)
  // Once mounted + session checked, the store view takes over
  const effectiveView = view !== 'landing' ? view : urlView.view

  // Sync shop slug from URL into store — MUST be a separate effect with
  // urlView.shopSlug as dependency so it works after hydration correction
  // (useSyncExternalStore returns '/' on SSR, then '/shop-slug' on client).
  useEffect(() => {
    if (urlView.shopSlug && shopSlug !== urlView.shopSlug) {
      setShopSlug(urlView.shopSlug)
    }
    }, [urlView.shopSlug, shopSlug])

  // Check for existing session and hydrate
  useEffect(() => {
    const init = async () => {
      // Only check session for non-shop views
      if (urlView.view === 'landing' || urlView.view === 'dashboard' || urlView.view === 'admin' || urlView.view === 'reseller' || urlView.view === 'login' || urlView.view === 'register' || urlView.view === 'onboarding') {
        try {
          const res = await fetch('/api/auth/session')
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              setUser(data.user)
              // Set all shops for multi-shop support
              if (data.shops) setShops(data.shops)
              if (data.shop) setShop(data.shop)

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
                } else {
                  window.history.replaceState(null, '', '/reseller')
                }
              } else if (!data.shop || (data.shops && data.shops.length === 0)) {
                // Seller without shops → onboarding
                setView('onboarding')
                window.history.replaceState(null, '', '/onboarding')
              } else if (urlView.view === 'login' || urlView.view === 'register') {
                // Authenticated user on login/register → redirect to dashboard
                setView('dashboard')
                window.history.replaceState(null, '', '/dashboard')
              } else if (urlView.view === 'onboarding') {
                // User has shops but is on onboarding URL → go to dashboard
                setView('dashboard')
                window.history.replaceState(null, '', '/dashboard')
              } else {
                setView('dashboard')
              }
            }
          }
        } catch {
          // Not authenticated, stay on current view
        }
      }

      // Mark as hydrated — now safe to show content
      setHydrated(true)
    }
    init()
  }, [urlView.view])

  // During SSR: show a neutral loading shell (prevents landing page flash)
  // After hydration: show the correct view immediately
  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <LoadingShell />
      </div>
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
      {effectiveView === 'shop' && <PublicShop initialProductSlug={urlView.productSlug} />}

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
      {(effectiveView === 'landing' || effectiveView === 'about' || effectiveView === 'pricing' || effectiveView === 'contact' || effectiveView === 'faq' || effectiveView === 'privacy' || effectiveView === 'terms') && (
        <WhatsAppFloat />
      )}
    </div>
    </ErrorBoundary>
  )
}