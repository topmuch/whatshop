'use client'

import { useAppStore, type DashboardTab } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  Store,
  Sun,
  Moon,
  Radio,
  Palette,
  Megaphone,
  TrendingUp,
  Mail,
  Plug,
  Target,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { useThemeMode } from '@/lib/use-theme'
import { isSimplifiedPlan } from '@/lib/permissions'
import { getBusinessLabels } from '@/lib/business-labels'
import { DashboardOverview } from './dashboard-overview'
import { DashboardAnalytics } from './dashboard-analytics'
import { DashboardStats } from './dashboard-stats'
import { DashboardMessages } from './dashboard-messages'
import { DashboardProducts } from './dashboard-products'
import { DashboardCategories } from './dashboard-categories'
import { DashboardOrders } from './dashboard-orders'
import { DashboardSettings } from './dashboard-settings'
import { DashboardLive } from './dashboard-live'
import { DashboardTemplates } from './dashboard-templates'
import { SingleProductManager } from './single-product-manager'
import { MarketingKit } from './marketing-kit'
import { DashboardIntegrations } from './dashboard-integrations'
import { NotificationBell } from './notification-bell'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MyShop {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  banner?: string
  whatsapp: string
  plan: string
  businessType?: string
  template: string
  isActive: boolean
  sector?: string
  subscriptionStatus?: string | null
  trialEndDate?: string | null
  createdAt: string
  primaryColor?: string
  secondaryColor?: string
  _count: { products: number; orders: number; visits: number }
}

interface ConsolidatedStats {
  shopCount: number
  totalProducts: number
  totalOrders: number
  totalVisits: number
  pendingOrders: number
  shops: { id: string }[]
  subscription: {
    planType: string
    planLabel: string
    status: string
    maxShops: number
  }
}

/* ------------------------------------------------------------------ */
/*  Nav items (unchanged)                                              */
/* ------------------------------------------------------------------ */

function getNavItems(businessType?: string | null, sector?: string | null, planType?: string | null): { id: DashboardTab; label: string; icon: React.ReactNode }[] {
  const labels = getBusinessLabels(businessType, sector)
  const simplified = planType ? isSimplifiedPlan(planType) : false

  const allItems: { id: DashboardTab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { id: 'overview', label: "Vue d'ensemble", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" />, hidden: simplified },
    { id: 'stats', label: 'Statistiques', icon: <TrendingUp className="h-5 w-5" />, hidden: simplified },
    { id: 'messages', label: 'Messages', icon: <Mail className="h-5 w-5" /> },
    { id: 'products', label: labels.navProducts, icon: <Package className="h-5 w-5" /> },
    { id: 'categories', label: labels.navCategories, icon: <Tags className="h-5 w-5" /> },
    { id: 'orders', label: labels.navOrders, icon: <ShoppingCart className="h-5 w-5" /> },
    { id: 'live', label: 'Live TikTok', icon: <Radio className="h-5 w-5" /> },
    { id: 'marketing-kit', label: 'Kit Marketing', icon: <Megaphone className="h-5 w-5" />, hidden: simplified },
    { id: 'integrations', label: 'Intégrations', icon: <Plug className="h-5 w-5" />, hidden: simplified },
    { id: 'templates', label: 'Templates', icon: <Palette className="h-5 w-5" />, hidden: simplified },
    { id: 'single-product', label: 'Single Produit', icon: <Target className="h-5 w-5" />, hidden: simplified },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" /> },
  ]

  return allItems.filter(item => !item.hidden).map(({ hidden, ...rest }) => rest)
}

/* ------------------------------------------------------------------ */
/*  Consolidated stats bar (shown at top of main content on overview)   */
/* ------------------------------------------------------------------ */

function ConsolidatedStatsBar({ stats, sector }: { stats: ConsolidatedStats | null; sector?: string | null }) {
  if (!stats) return null

  const labels = getBusinessLabels(undefined, sector)

  const cards = [
    {
      label: 'Boutiques',
      value: `${stats.shopCount} / ${stats.subscription.maxShops}`,
      icon: <Store className="h-5 w-5" />,
      accent: 'text-pink-600 dark:text-pink-400',
    },
    {
      label: labels.statProducts,
      value: stats.totalProducts.toLocaleString('fr-FR'),
      icon: <Package className="h-5 w-5" />,
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: labels.statOrders,
      value: stats.totalOrders.toLocaleString('fr-FR'),
      icon: <ShoppingCart className="h-5 w-5" />,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Visites',
      value: stats.totalVisits.toLocaleString('fr-FR'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      accent: 'text-sky-600 dark:text-sky-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border bg-card p-4 flex items-center gap-3 shadow-sm"
        >
          <div className={`${c.accent}`}>{c.icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-lg font-semibold truncate">{c.value}</p>
          </div>
        </div>
      ))}
      {stats.pendingOrders > 0 && (
        <Badge variant="secondary" className="col-span-2 lg:col-span-4 w-fit text-xs">
          {stats.pendingOrders} commande(s) en attente
        </Badge>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Create Shop Dialog                                                  */
/* ------------------------------------------------------------------ */

function CreateShopDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (shop: MyShop) => void
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setSlug('')
      setWhatsapp('')
    }
  }, [open])

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    setName(value)
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ\s-]/g, '')
        .replace(/\s+/g, '-')
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim() || !whatsapp.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), whatsapp: whatsapp.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.message || 'Erreur lors de la création')
      }

      const newShop = await res.json()
      toast.success(`Boutique "${newShop.name}" créée avec succès !`)
      onOpenChange(false)
      onCreated(newShop)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une boutique</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="shop-name">Nom de la boutique</Label>
            <Input
              id="shop-name"
              placeholder="Ex: Ma Belle Boutique"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="shop-slug">Identifiant (slug)</Label>
            <Input
              id="shop-slug"
              placeholder="ma-belle-boutique"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Utilisé dans l&apos;URL de votre boutique. Lettres minuscules, chiffres et tirets uniquement.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="shop-whatsapp">Numéro WhatsApp</Label>
            <Input
              id="shop-whatsapp"
              type="tel"
              placeholder="+225 07 XX XX XX XX"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !name.trim() || !slug.trim() || !whatsapp.trim()}>
              {submitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Sidebar Content (shared between desktop sidebar & mobile sheet)   */
/* ------------------------------------------------------------------ */

function SidebarContent({
  myShops,
  consolidatedStats,
}: {
  myShops: MyShop[]
  consolidatedStats: ConsolidatedStats | null
}) {
  const { dashboardTab, setDashboardTab, setUser, setShop, setShops, setView, shop } = useAppStore()
  const { isDark, toggleTheme } = useThemeMode()

  const navItems = getNavItems(shop?.businessType, shop?.sector, shop?.plan)

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        setUser(null)
        setShop(null)
        setShops([])
        setView('login')
        window.location.replace('/login')
        return
      }
    } catch { /* ignore */ }
    // Fallback: redirect to /login (server-side session clearing will happen on next request)
    setUser(null)
    setShop(null)
    setShops([])
    setView('login')
    window.location.replace('/login')
  }

  function handleShopChange(shopId: string) {
    const selected = myShops.find((s) => s.id === shopId)
    if (selected) {
      setShop({
        id: selected.id,
        name: selected.name,
        slug: selected.slug,
        description: selected.description,
        logo: selected.logo,
        banner: selected.banner,
        whatsapp: selected.whatsapp,
        plan: selected.plan,
        businessType: selected.businessType,
        template: selected.template,
        isActive: selected.isActive,
        sector: selected.sector,
        primaryColor: selected.primaryColor,
        secondaryColor: selected.secondaryColor,
        subscriptionStatus: selected.subscriptionStatus,
        trialEndDate: selected.trialEndDate,
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Notification bell */}
      <div className="flex items-center justify-end px-6 py-5">
        <NotificationBell />
      </div>

      <Separator className="bg-white/15" />

      {/* Shop Selector */}
      {myShops.length > 0 && (
        <div className="px-3 py-3">
          <Select value={shop?.id ?? ''} onValueChange={handleShopChange}>
            <SelectTrigger className="w-full bg-white/15 border-white/20 text-white hover:bg-white/20 data-[placeholder]:text-white/60 [&_svg]:text-white/70 focus-visible:ring-white/30">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {myShops.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[160px]">{s.name}</span>
                    {s.isActive ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        Inactif
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator className="bg-white/15" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems
            .map((item) => (
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
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'live' && shop?.isLiveMode && (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  <span className="text-[10px] font-bold text-red-300 leading-none">LIVE</span>
                </span>
              )}
            </Button>
          ))}

          {/* Dark mode + Logout below Paramètres */}
          <Separator className="bg-white/15 my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-3 text-white/70 hover:text-white hover:bg-white/10"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-3 text-white/70 hover:text-red-200 hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </Button>
        </nav>
      </ScrollArea>

      <Separator className="bg-white/15" />


    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Trial Warning Banner (shows when ≤ 2 days remain in trial)        */
/* ------------------------------------------------------------------ */

function TrialWarningBanner({ trialEndDate }: { trialEndDate: string }) {
  const end = new Date(trialEndDate)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // Show banner when there are 2 or fewer days left (i.e., day 5+ after signup)
  if (diffDays > 2 || diffDays < 0) return null

  const isUrgent = diffDays <= 0
  const remainingText = diffDays <= 0 ? 'Votre période d\'essai est terminée' : `Il reste ${diffDays} jour${diffDays > 1 ? 's' : ''} avant la désactivation`

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 mb-6 ${
      isUrgent
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="shrink-0 mt-0.5">
        {isUrgent ? (
          <AlertTriangle className="h-5 w-5 text-red-600" />
        ) : (
          <Clock className="h-5 w-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isUrgent ? 'text-red-900' : 'text-amber-900'}`}>
          {isUrgent ? '⚠️ Période d\'essai expirée' : '⏰ Période d\'essai bientôt terminée'}
        </p>
        <p className={`text-sm mt-1 ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
          {remainingText}. Contactez le support pour valider votre abonnement et continuer à utiliser votre boutique.
        </p>
      </div>
      <div className="shrink-0">
        <Badge variant={isUrgent ? 'destructive' : 'secondary'} className="text-xs whitespace-nowrap">
          {isUrgent ? 'Expiré' : `${diffDays}j restant${diffDays > 1 ? 's' : ''}`}
        </Badge>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Dashboard Content (tab rendering)                                   */
/* ------------------------------------------------------------------ */

function DashboardContent({ consolidatedStats }: { consolidatedStats: ConsolidatedStats | null }) {
  const { dashboardTab, shop } = useAppStore()

  if (!shop) {
    return null
  }

  // Trial warning: show banner if in TRIAL status and trialEndDate is within 2 days
  const showTrialBanner = shop.subscriptionStatus === 'TRIAL' && shop.trialEndDate

  return (
    <>
      {showTrialBanner && <TrialWarningBanner trialEndDate={shop.trialEndDate} />}
      {renderTabContent(dashboardTab, shop, consolidatedStats)}
    </>
  )
}

function renderTabContent(dashboardTab: DashboardTab, shop: { sector?: string | null }, consolidatedStats: ConsolidatedStats | null) {
  switch (dashboardTab) {
    case 'overview':
      return (
        <>
          <ConsolidatedStatsBar stats={consolidatedStats} sector={shop?.sector} />
          <DashboardOverview />
        </>
      )
    case 'analytics':
      return <DashboardAnalytics />
    case 'stats':
      return <DashboardStats />
    case 'messages':
      return <DashboardMessages />
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
    case 'marketing-kit':
      return <MarketingKit />
    case 'integrations':
      return <DashboardIntegrations />
    case 'templates':
      return <DashboardTemplates />
    case 'single-product':
      return <SingleProductManager />
    default:
      return (
        <>
          <ConsolidatedStatsBar stats={consolidatedStats} sector={shop?.sector} />
          <DashboardOverview />
        </>
      )
  }
}

/* ------------------------------------------------------------------ */
/*  Main Exported Component                                            */
/* ------------------------------------------------------------------ */

export function SellerDashboard() {
  const { user, shop, setUser, setView, setShop, setShops } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [myShops, setMyShops] = useState<MyShop[]>([])
  const [consolidatedStats, setConsolidatedStats] = useState<ConsolidatedStats | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Global 401 interceptor: detect expired sessions across all dashboard API calls
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (input, init) => {
      const res = await originalFetch(input, init)
      if (res.status === 401) {
        // Only redirect if we're in the dashboard (not on login/register)
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url || ''
        const isApiCall = url.includes('/api/')
        if (isApiCall && !sessionExpired) {
          setSessionExpired(true)
        }
      }
      return res
    }
    return () => { window.fetch = originalFetch }
  }, [sessionExpired])

  const fetchMyShops = useCallback(async () => {
    try {
      const res = await fetch('/api/shops/my-shops')
      if (res.ok) {
        const data = await res.json()
        setMyShops(Array.isArray(data) ? data : data.shops ?? [])
      }
    } catch {
      // Silently fail — shops list is non-critical
    }
  }, [])

  const fetchMyStats = useCallback(async () => {
    try {
      const res = await fetch('/api/shops/my-stats')
      if (res.ok) {
        const data = await res.json()
        setConsolidatedStats(data)
      }
    } catch {
      // Silently fail
    }
  }, [])

  // Initial session load
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
    if (user && shop) {
      setLoading(false)
    } else {
      loadSession()
    }
    return () => { cancelled = true }
  }, [])

  // Fetch shops & stats once session is ready
  useEffect(() => {
    if (!loading && user && !sessionExpired) {
      fetchMyShops()
      fetchMyStats()
    }
  }, [loading, user, sessionExpired, fetchMyShops, fetchMyStats])

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        setUser(null)
        setShop(null)
        setShops([])
        setView('login')
        window.location.replace('/login')
        return
      }
    } catch { /* ignore */ }
    setUser(null)
    setShop(null)
    setShops([])
    setView('login')
    window.location.replace('/login')
  }

  // If user has no shop after session fetch, onboarding redirect should have kicked in
  // Session expired banner
  if (sessionExpired) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold">Session expirée</h3>
            <p className="text-sm text-muted-foreground text-center">
              Votre session a expiré. Veuillez vous reconnecter pour continuer.
            </p>
            <Button onClick={handleLogout} className="mt-2">
              Se reconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user && !shop) {
    setView('onboarding')
    window.history.replaceState(null, '', '/onboarding')
    return null
  }

  // Handle new shop created
  async function handleShopCreated(newShop: MyShop) {
    // Refresh both lists
    await Promise.all([fetchMyShops(), fetchMyStats()])
    // Switch to the newly created shop
    setShop({
      id: newShop.id,
      name: newShop.name,
      slug: newShop.slug,
      description: newShop.description,
      logo: newShop.logo,
      banner: newShop.banner,
      whatsapp: newShop.whatsapp,
      plan: newShop.plan,
      businessType: newShop.businessType,
      template: newShop.template,
      isActive: newShop.isActive,
      sector: newShop.sector,
      primaryColor: newShop.primaryColor,
      secondaryColor: newShop.secondaryColor,
      subscriptionStatus: newShop.subscriptionStatus,
      trialEndDate: newShop.trialEndDate,
    })
  }

  // Build sidebar props
  const sidebarProps = {
    myShops,
    consolidatedStats,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Boutiko</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex bg-muted/30">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-pink-500 to-pink-700 border-r border-pink-400/30 min-h-screen sticky top-0">
          <SidebarContent {...sidebarProps} />
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
                <SidebarContent {...sidebarProps} />
              </SheetContent>
            </Sheet>

            {/* Mobile shop selector dropdown */}
            {myShops.length > 1 ? (
              <Select
                value={shop?.id ?? ''}
                onValueChange={(shopId) => {
                  const selected = myShops.find((s) => s.id === shopId)
                  if (selected) {
                    setShop({
                      id: selected.id,
                      name: selected.name,
                      slug: selected.slug,
                      description: selected.description,
                      logo: selected.logo,
                      banner: selected.banner,
                      whatsapp: selected.whatsapp,
                      plan: selected.plan,
                      businessType: selected.businessType,
                      template: selected.template,
                      isActive: selected.isActive,
                      sector: selected.sector,
                      primaryColor: selected.primaryColor,
                      secondaryColor: selected.secondaryColor,
                      subscriptionStatus: selected.subscriptionStatus,
                      trialEndDate: selected.trialEndDate,
                    })
                  }
                }}
              >
                <SelectTrigger size="sm" className="flex-1 max-w-[200px]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Store className="h-4 w-4 shrink-0 text-pink-500" />
                    <SelectValue placeholder="Boutique" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {myShops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="truncate max-w-[160px]">{s.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-pink-500 text-primary-foreground shrink-0">
                  <Store className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm truncate">{shop?.name || 'Boutiko'}</span>
              </div>
            )}

            {/* Notification bell + Plan badge on mobile */}
            <div className="ml-auto flex items-center gap-1">
              <NotificationBell dark={false} />
              {consolidatedStats && (
                <Badge variant="outline" className="text-[10px] h-5 hidden sm:flex">
                  {consolidatedStats.subscription.planLabel}
                </Badge>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <DashboardContent consolidatedStats={consolidatedStats} />
          </main>
        </div>
      </div>

      {/* Create Shop Dialog */}
      <CreateShopDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleShopCreated}
      />
    </>
  )
}
