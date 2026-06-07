'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { LandingPage } from '@/components/landing'
import { AuthLogin } from '@/components/auth/auth-login'
import { AuthRegister } from '@/components/auth/auth-register'
import { SellerDashboard } from '@/components/dashboard/seller-dashboard'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { PublicShop } from '@/components/shop/public-shop'

export default function Home() {
  const { view, setView, setUser, setShopSlug, shopSlug } = useAppStore()

  useEffect(() => {
    // Handle direct shop URL (middleware rewrites /amina-shop → /)
    // Check the browser's actual pathname for a shop slug
    const pathname = window.location.pathname
    if (pathname !== '/' && pathname.startsWith('/')) {
      const slug = pathname.slice(1)
      // Validate slug format (alphanumeric + hyphens, not a known route)
      if (/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug) && shopSlug !== slug) {
        setShopSlug(slug)
        return // Don't run session check when loading a shop
      }
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

    if (pathname === '/') {
      checkSession()
    }
  }, [shopSlug, setShopSlug, setUser, setView])

  return (
    <div className="min-h-screen flex flex-col">
      {view === 'landing' && <LandingPage />}
      {view === 'login' && <AuthLogin />}
      {view === 'register' && <AuthRegister />}
      {view === 'dashboard' && <SellerDashboard />}
      {view === 'admin' && <AdminDashboard />}
      {view === 'shop' && <PublicShop />}
    </div>
  )
}
