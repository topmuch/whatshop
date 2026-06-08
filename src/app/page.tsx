'use client'

import { useAppStore, AppView } from '@/lib/store'
import { useEffect } from 'react'
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

export default function Home() {
  const { view, setView, setUser, setShopSlug, shopSlug } = useAppStore()

  useEffect(() => {
    // Handle direct shop URL (middleware rewrites /amina-shop → /)
    const pathname = window.location.pathname
    if (pathname !== '/' && pathname.startsWith('/')) {
      const slug = pathname.slice(1).toLowerCase()

      // Check if this is a known public page
      if (PAGE_VIEW_MAP[slug]) {
        setView(PAGE_VIEW_MAP[slug])
        return
      }

      // Check if it's a shop slug
      if (/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug) && shopSlug !== slug) {
        setShopSlug(slug)
        return
      }
    }

    // Handle page query param from middleware rewrites
    const params = new URLSearchParams(window.location.search)
    const pageParam = params.get('page')
    if (pageParam && PAGE_VIEW_MAP[pageParam]) {
      setView(PAGE_VIEW_MAP[pageParam])
      return
    }

    // Handle shop query param from middleware rewrites
    const shopParam = params.get('shop')
    if (shopParam && shopSlug !== shopParam) {
      setShopSlug(shopParam)
      return
    }

    // Check for existing session on mount
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            if (data.user.role === 'ADMIN') {
              setView('admin')
            } else {
              setView('dashboard')
            }
          }
        }
      } catch {
        // Not authenticated, stay on landing
      }
    }

    if (pathname === '/' && !pageParam && !shopParam) {
      checkSession()
    }
  }, [shopSlug, setShopSlug, setUser, setView])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Landing page has its own header/footer */}
      {view === 'landing' && <LandingPage />}
      {view === 'login' && <AuthLogin />}
      {view === 'register' && <AuthRegister />}
      {view === 'onboarding' && <OnboardingWizard />}
      {view === 'dashboard' && <SellerDashboard />}
      {view === 'admin' && <AdminDashboard />}
      {view === 'shop' && <PublicShop />}

      {/* Public pages with shared layout */}
      {view === 'about' && (
        <PublicLayout currentView="about">
          <AboutPage />
        </PublicLayout>
      )}
      {view === 'pricing' && (
        <PublicLayout currentView="pricing">
          <PricingPage />
        </PublicLayout>
      )}
      {view === 'contact' && (
        <PublicLayout currentView="contact">
          <ContactPage />
        </PublicLayout>
      )}
      {view === 'faq' && (
        <PublicLayout currentView="faq">
          <FAQPage />
        </PublicLayout>
      )}
      {view === 'privacy' && (
        <PublicLayout currentView="privacy">
          <PrivacyPage />
        </PublicLayout>
      )}
      {view === 'terms' && (
        <PublicLayout currentView="terms">
          <TermsPage />
        </PublicLayout>
      )}

      {/* Floating WhatsApp button - show on public pages and landing */}
      {(view === 'landing' || view === 'about' || view === 'pricing' || view === 'contact' || view === 'faq' || view === 'privacy' || view === 'terms') && (
        <WhatsAppFloat />
      )}
    </div>
  )
}
