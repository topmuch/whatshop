'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { LandingPage } from '@/components/landing'
import { AuthLogin } from '@/components/auth/auth-login'
import { AuthRegister } from '@/components/auth/auth-register'
import { SellerDashboard } from '@/components/dashboard/seller-dashboard'
import { PublicShop } from '@/components/shop/public-shop'

export default function Home() {
  const { view, setView, isAuthenticated, setUser } = useAppStore()

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            if (!data.shop) {
              // New user needs to create a shop
              setView('dashboard')
            } else {
              setView('dashboard')
            }
          }
        }
      } catch {
        // Not authenticated, stay on landing
      }
    }
    checkSession()
  }, [setUser, setView])

  return (
    <div className="min-h-screen flex flex-col">
      {view === 'landing' && <LandingPage />}
      {view === 'login' && <AuthLogin />}
      {view === 'register' && <AuthRegister />}
      {view === 'dashboard' && <SellerDashboard />}
      {view === 'shop' && <PublicShop />}
    </div>
  )
}
