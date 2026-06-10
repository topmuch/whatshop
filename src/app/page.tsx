'use client'

import { useAppStore, AppView } from '@/lib/store'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { LandingPage } from '@/components/landing'
import { AuthLogin } from '@/components/auth/auth-login'
import { AuthRegister } from '@/components/auth/auth-register'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { SellerDashboard } from '@/components/dashboard/seller-dashboard'
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
function resolveViewFromPath(pathname: string): { view: AppView; shopSlug: string } {
  // Guard: during SSR, pathname is '/' — never use window here
  if (typeof window === 'undefined') {
    return { view: 'landing', shopSlug: '' }
  }

  const slug = pathname.slice(1).toLowerCase()

  // Dashboard routes
  if (slug.startsWith('dashboard')) {
    return { view: 'dashboard', shopSlug: '' }
  }

  // Admin routes
  if (slug.startsWith('admin')) {
    return { view: 'admin', shopSlug: '' }
  }

  // Auth routes
  if (slug === 'login' || slug === 'connexion') {
    return { view: 'login', shopSlug: '' }
  }
  if (slug === 'register' || slug === 'inscription') {
    return { view: 'register', shopSlug: '' }
  }
  if (slug === 'onboarding') {
    return { view: 'onboarding', shopSlug: '' }
  }

  // Known public pages
  if (PAGE_VIEW_MAP[slug]) {
    return { view: PAGE_VIEW_MAP[slug], shopSlug: '' }
  }

  // Check query params (middleware rewrites)
  const params = new URLSearchParams(window.location.search)
  const pageParam = params.get('page')
  if (pageParam && PAGE_VIEW_MAP[pageParam]) {
    return { view: PAGE_VIEW_MAP[pageParam], shopSlug: '' }
  }

  const shopParam = params.get('shop')
  if (shopParam) {
    return { view: 'shop', shopSlug: shopParam }
  }

  // Shop slug (single segment, alphanumeric with hyphens)
  if (slug && /^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug)) {
    return { view: 'shop', shopSlug: slug }
  }

  return { view: 'landing', shopSlug: '' }
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
  const { view, setView, setUser, setShopSlug, shopSlug } = useAppStore()
  const pathname = useClientPathname()
  const [hydrated, setHydrated] = useState(false)

  // Synchronously resolve view from the actual URL
  const urlView = resolveViewFromPath(pathname)

  // Use the URL-derived view immediately (no flash)
  // Once mounted + session checked, the store view takes over
  const effectiveView = view !== 'landing' ? view : urlView.view

  // Check for existing session and sync store state
  useEffect(() => {
    const init = async () => {
      // Sync shop slug from URL into store
      if (urlView.shopSlug && shopSlug !== urlView.shopSlug) {
        setShopSlug(urlView.shopSlug)
      }

      // Always check session (including login/register views)
      // This ensures that after login + HMR reload, the session is restored
      if (urlView.view === 'landing' || urlView.view === 'dashboard' || urlView.view === 'admin' || urlView.view === 'login' || urlView.view === 'register' || urlView.view === 'onboarding') {
        try {
          const res = await fetch('/api/auth/session')
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              setUser(data.user)
              if (data.shop) setShop(data.shop)
              // Only redirect from landing/register/login; keep onboarding as-is so the wizard can complete
              if (urlView.view !== 'onboarding') {
                if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
                  setView('admin')
                } else if (!data.shop) {
                  // Seller without a shop → onboarding
                  setView('onboarding')
                  window.history.replaceState(null, '', '/onboarding')
                } else {
                  setView('dashboard')
                }
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
  }, [])

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
      {effectiveView === 'admin' && <AdminDashboard />}
      {effectiveView === 'shop' && <PublicShop />}

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
