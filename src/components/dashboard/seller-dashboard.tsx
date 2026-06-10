'use client'

import { useAppStore, type DashboardTab } from '@/lib/store'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  Store,
  Sparkles,
  Sun,
  Moon,
  Radio,
} from 'lucide-react'
import { useThemeMode } from '@/lib/use-theme'
import { DashboardOverview } from './dashboard-overview'
import { DashboardProducts } from './dashboard-products'
import { DashboardCategories } from './dashboard-categories'
import { DashboardOrders } from './dashboard-orders'
import { DashboardSettings } from './dashboard-settings'
import { DashboardAiTools } from './dashboard-ai-tools'
import { DashboardLive } from './dashboard-live'

const navItems: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'products', label: 'Produits', icon: <Package className="h-5 w-5" /> },
  { id: 'categories', label: 'Catégories', icon: <Tags className="h-5 w-5" /> },
  { id: 'orders', label: 'Commandes', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'live', label: 'Live TikTok', icon: <Radio className="h-5 w-5" /> },
  { id: 'ai-tools', label: 'Outils IA', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" /> },
]

function SidebarContent() {
  const { dashboardTab, setDashboardTab, setUser, setShop, setView, shop } = useAppStore()
  const { isDark, toggleTheme } = useThemeMode()

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/session', { method: 'DELETE' })
      if (res.ok) {
        setUser(null)
        setShop(null)
        setView('landing')
        window.history.replaceState(null, '', '/')
        window.location.replace('/')
        return
      }
    } catch { /* ignore */ }
    // Fallback: clear cookie client-side and redirect anyway
    document.cookie = 'whatsshop-user=; path=/; max-age=0'
    setUser(null)
    setShop(null)
    setView('landing')
    window.history.replaceState(null, '', '/')
    window.location.replace('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white">
          <Store className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-white">Boutiko</span>
      </div>

      <Separator className="bg-white/15" />

      {/* Shop name */}
      {shop && (
        <div className="px-6 py-3">
          <p className="text-sm text-white/80 truncate">{shop.name}</p>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={dashboardTab === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 h-11 px-3 ${
                dashboardTab === item.id
                  ? 'bg-white/20 text-white font-medium hover:bg-white/25'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setDashboardTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/15" />

      {/* Theme Toggle */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 px-3 text-white/70 hover:text-white hover:bg-white/10"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </Button>
      </div>

      <Separator className="bg-white/15" />

      {/* Logout */}
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 px-3 text-white/70 hover:text-red-200 hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  )
}

export function SellerDashboard() {
  const { user, shop, setUser, setView, setShop } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isDark, toggleTheme } = useThemeMode()

  useEffect(() => {
    let cancelled = false
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok && !cancelled) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            if (data.shop) {
              setShop(data.shop)
            } else {
              // Seller without a shop → redirect to onboarding wizard
              setView('onboarding')
              window.history.replaceState(null, '', '/onboarding')
            }
          } else {
            setView('landing')
          }
        }
      } catch {
        // Error fetching session
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    // Always fetch session to ensure shop data is up-to-date
    // Skip only if both user AND shop are already set (e.g. just logged in)
    if (user && shop) {
      setLoading(false)
    } else {
      loadSession()
    }
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // If user has no shop after session fetch, onboarding redirect should have kicked in
  // Safety net: redirect to onboarding instead of showing CreateShopWizard
  if (user && !shop) {
    setView('onboarding')
    window.history.replaceState(null, '', '/onboarding')
    return null
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-pink-500 to-pink-700 border-r border-pink-400/30 min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile + Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden h-14 bg-card border-b flex items-center gap-3 px-4 sticky top-0 z-40">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-pink-500 to-pink-700 border-r border-pink-400/30">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-pink-500 text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">{shop?.name || 'Boutiko'}</span>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-purple-600"
                onClick={toggleTheme}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { dashboardTab, shop } = useAppStore()

  // Safety: if shop is somehow null, parent will redirect to onboarding
  if (!shop) {
    return null
  }

  switch (dashboardTab) {
    case 'overview':
      return <DashboardOverview />
    case 'products':
      return <DashboardProducts />
    case 'categories':
      return <DashboardCategories />
    case 'orders':
      return <DashboardOrders />
    case 'live':
      return <DashboardLive />
    case 'settings':
      return <DashboardSettings />
    case 'ai-tools':
      return <DashboardAiTools />
    default:
      return <DashboardOverview />
  }
}
