'use client'

import { useAppStore, type AdminTab } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  BarChart3,
  Users,
  Store,
  ShoppingCart,
  LogOut,
  Menu,
  Shield,
  TrendingUp,
  Package,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Power,
  Trash2,
  Plus,
  UserPlus,
  Sun,
  Moon,
  CreditCard,
  Globe,
  Settings,
  LifeBuoy,
  Flag,
  Megaphone,
  Download,
  Edit,
  Save,
  Check,
  MessageSquare,
  ExternalLink,
  Mail,
  Bell,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useThemeMode } from '@/lib/use-theme'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers: number
  totalShops: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalVisits: number
  shopsByPlan: Record<string, number>
  ordersByStatus: Record<string, number>
  recentUsers: { id: string; name: string; email: string; shop: { name: string; plan: string } | null; createdAt: string }[]
  recentOrders: { id: string; shopName: string; customerName: string; total: number; status: string; createdAt: string }[]
}

interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
  shop: { id: string; name: string; plan: string; isActive: boolean; productCount: number; orderCount: number } | null
  orderCount: number
}

interface AdminShop {
  id: string
  name: string
  slug: string
  plan: string
  isActive: boolean
  createdAt: string
  owner: { id: string; name: string; email: string }
  productCount: number
  orderCount: number
  visitCount: number
}

interface AdminOrder {
  id: string
  total: number
  status: string
  customerName: string | null
  customerPhone: string | null
  items: string
  createdAt: string
  shop: { id: string; name: string }
}

interface AdminSubscription {
  id: string
  shopId: string
  shopName: string
  shopSlug: string
  ownerName: string
  ownerEmail: string
  plan: string
  status: string
  endDate: string
}

interface AdminDomain {
  id: string
  shopName: string
  domain: string
  status: string
  createdAt: string
}

interface PromoCode {
  id: string
  code: string
  discountPercent: number
  currentUses: number
  maxUses: number
  expiresAt: string
  active: boolean
}

interface SupportTicket {
  id: string
  shopName: string
  ownerEmail: string
  message: string
  status: string
  createdAt: string
}

interface FlaggedShop {
  id: string
  shopId: string
  shopName: string
  ownerName: string
  reason: string
  flaggedAt: string
}

interface Referral {
  id: string
  referrerName: string
  referredName: string
  status: string
  createdAt: string
}

interface PlatformConfig {
  saasName: string
  logoUrl: string
  primaryColor: string
  defaultWhatsappMessage: string
  adminWhatsappNumber: string
  standardPrice: number
  proPrice: number
  supportEmail: string
  senderName: string
  autoWelcomeEmail: boolean
  notifyNewSeller: boolean
  notifyNewOrder: boolean
  notifyDomainRequest: boolean
  notifySupportTicket: boolean
  weeklyReport: boolean
  lowStockAlerts: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const planVariant = (plan: string) => {
  switch (plan) {
    case 'FREE': return 'secondary' as const
    case 'STANDARD': return 'default' as const
    case 'PREMIUM': return 'outline' as const
    default: return 'secondary' as const
  }
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline'; className?: string }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmée', variant: 'default' },
  DELIVERED: { label: 'Livrée', variant: 'outline', className: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
  CANCELLED: { label: 'Annulée', variant: 'destructive' },
}

const subscriptionStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">Actif</Badge>
    case 'SUSPENDED':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Suspendu</Badge>
    case 'EXPIRED':
      return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">Expiré</Badge>
    case 'CANCELLED':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">Annulé</Badge>
    case 'TRIAL':
      return <Badge variant="outline" className="border-sky-500 text-sky-700 bg-sky-50">Essai</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const domainStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>
    case 'APPROVED':
      return <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">Validé</Badge>
    case 'REJECTED':
      return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">Rejeté</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

// ─── Navigation Items ───────────────────────────────────────────────────────

const navGroups = [
  {
    label: 'Principal',
    items: [
      { id: 'admin-overview' as AdminTab, label: "Vue d'ensemble", icon: <BarChart3 className="h-5 w-5" /> },
      { id: 'admin-subscriptions' as AdminTab, label: 'Abonnements', icon: <CreditCard className="h-5 w-5" /> },
      { id: 'admin-domains' as AdminTab, label: 'Domaines', icon: <Globe className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { id: 'admin-config' as AdminTab, label: 'Configuration', icon: <Settings className="h-5 w-5" /> },
      { id: 'admin-support' as AdminTab, label: 'Support', icon: <LifeBuoy className="h-5 w-5" /> },
      { id: 'admin-moderation' as AdminTab, label: 'Modération', icon: <Flag className="h-5 w-5" /> },
      { id: 'admin-marketing' as AdminTab, label: 'Marketing', icon: <Megaphone className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Système',
    items: [
      { id: 'admin-users' as AdminTab, label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
      { id: 'admin-shops' as AdminTab, label: 'Boutiques', icon: <Store className="h-5 w-5" /> },
      { id: 'admin-orders' as AdminTab, label: 'Commandes', icon: <ShoppingCart className="h-5 w-5" /> },
    ],
  },
]

// ─── Sidebar Content ─────────────────────────────────────────────────────────

function AdminSidebarContent() {
  const { adminTab, setAdminTab, user, setUser, setShop, setView } = useAppStore()
  const { isDark, toggleTheme } = useThemeMode()

  async function handleLogout() {
    try { await fetch('/api/auth/session', { method: 'DELETE' }) } catch { /* ignore */ }
    setUser(null)
    setShop(null)
    setView('landing')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-white">Boutiko Admin</span>
      </div>

      <Separator className="bg-white/15" />

      {/* Admin info */}
      <div className="px-6 py-3">
        <p className="text-sm font-medium truncate text-white">{user?.name || 'Admin'}</p>
        <Badge className="mt-1 text-[10px] bg-white/20 text-white hover:bg-white/25">
          {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
        </Badge>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-3' : ''}>
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Button
                  key={item.id}
                  variant={adminTab === item.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 h-10 px-3 ${
                    adminTab === item.id
                      ? 'bg-white/20 text-white font-medium hover:bg-white/25'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setAdminTab(item.id)}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/15" />

      {/* Theme Toggle */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 px-3 text-white/70 hover:text-white hover:bg-white/10"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="text-sm">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </Button>
      </div>

      <Separator className="bg-white/15" />

      {/* Logout */}
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 px-3 text-white/70 hover:text-blue-200 hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Déconnexion</span>
        </Button>
      </div>
    </div>
  )
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user, setUser, setView, setShop } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isDark, toggleTheme } = useThemeMode()

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
              setView('dashboard')
              return
            }
          } else {
            setView('landing')
          }
        }
      } catch {
        // Error fetching session
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [setUser, setShop, setView])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-blue-600 to-blue-800 border-r border-blue-500/30 min-h-screen sticky top-0">
        <AdminSidebarContent />
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
            <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-blue-600 to-blue-800 border-r border-blue-500/30">
              <AdminSidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Administration</span>
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
          <AdminContent />
        </main>
      </div>
    </div>
  )
}

// ─── Content Router ─────────────────────────────────────────────────────────

function AdminContent() {
  const { adminTab } = useAppStore()

  switch (adminTab) {
    case 'admin-overview':
      return <AdminOverview />
    case 'admin-subscriptions':
      return <AdminSubscriptions />
    case 'admin-domains':
      return <AdminDomains />
    case 'admin-config':
      return <AdminConfig />
    case 'admin-support':
      return <AdminSupport />
    case 'admin-moderation':
      return <AdminModeration />
    case 'admin-marketing':
      return <AdminMarketing />
    case 'admin-users':
      return <AdminUsers />
    case 'admin-shops':
      return <AdminShops />
    case 'admin-orders':
      return <AdminOrders />
    default:
      return <AdminOverview />
  }
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        toast.error('Erreur lors du chargement des statistiques')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = stats
    ? [
        { label: 'Utilisateurs', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { label: 'Boutiques', value: stats.totalShops, icon: <Store className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
        { label: 'Produits', value: stats.totalProducts, icon: <Package className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-orange-500 to-orange-600' },
        { label: 'Commandes', value: stats.totalOrders, icon: <ShoppingCart className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-purple-500 to-purple-600' },
        { label: 'Revenus', value: formatCurrency(stats.totalRevenue), icon: <TrendingUp className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-rose-500 to-rose-600' },
        { label: 'Visites', value: stats.totalVisits, icon: <Eye className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-amber-500 to-amber-600' },
      ]
    : []

  const planChartData = stats
    ? [
        { plan: 'Gratuit', count: stats.shopsByPlan.FREE, fill: 'var(--color-free)' },
        { plan: 'Standard', count: stats.shopsByPlan.STANDARD, fill: 'var(--color-standard)' },
        { plan: 'Premium', count: stats.shopsByPlan.PREMIUM, fill: 'var(--color-premium)' },
      ]
    : []

  const chartConfig = {
    free: { label: 'Gratuit', color: '#94a3b8' },
    standard: { label: 'Standard', color: '#22c55e' },
    premium: { label: 'Premium', color: '#f59e0b' },
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Vue d&apos;ensemble</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vue d&apos;ensemble de la plateforme</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-4 overflow-hidden ${card.cardBg}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 text-white">
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-white/80 mt-1">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Boutiques par plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={planChartData} layout="vertical">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => String(v)} />
              <YAxis dataKey="plan" type="category" width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Users + Orders */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                      {u.shop && (
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {u.shop.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Commandes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune commande</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentOrders.map((o) => {
                  const cfg = statusConfig[o.status] || statusConfig.PENDING
                  return (
                    <div key={o.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">#{o.id.slice(-6)}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.shopName} {o.customerName ? `· ${o.customerName}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(o.total)}</p>
                        <Badge variant={cfg.variant} className={`text-[10px] mt-1 ${cfg.className || ''}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── SUBSCRIPTIONS TAB ──────────────────────────────────────────────────────

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadSubscriptions = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data.subscriptions)
      }
    } catch {
      toast.error('Erreur lors du chargement des abonnements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSubscriptions(statusFilter)
  }, [statusFilter, loadSubscriptions])

  async function handleAction(shopId: string, action: string) {
    setActionLoading(`${shopId}-${action}`)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, action }),
      })
      if (res.ok) {
        toast.success(`Action "${action}" effectuée avec succès`)
        loadSubscriptions(statusFilter)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de l\'action')
      }
    } catch {
      toast.error('Erreur lors de l\'action')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Abonnements</h2>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="SUSPENDED">Suspendu</SelectItem>
            <SelectItem value="EXPIRED">Expiré</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
            <SelectItem value="TRIAL">Essai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : subscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun abonnement trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.shopName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{sub.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{sub.ownerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={planVariant(sub.plan)}>{sub.plan}</Badge>
                    </TableCell>
                    <TableCell>{subscriptionStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.endDate ? formatDate(sub.endDate) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleAction(sub.shopId, 'activate')}
                          disabled={actionLoading === `${sub.shopId}-activate`}
                        >
                          {actionLoading === `${sub.shopId}-activate` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                          Activer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => handleAction(sub.shopId, 'suspend')}
                          disabled={actionLoading === `${sub.shopId}-suspend`}
                        >
                          {actionLoading === `${sub.shopId}-suspend` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                          Suspendre
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleAction(sub.shopId, 'cancel')}
                          disabled={actionLoading === `${sub.shopId}-cancel`}
                        >
                          {actionLoading === `${sub.shopId}-cancel` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                          Annuler
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                          onClick={() => handleAction(sub.shopId, 'extend')}
                          disabled={actionLoading === `${sub.shopId}-extend`}
                        >
                          {actionLoading === `${sub.shopId}-extend` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
                          +1 mois
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Voir la boutique"
                          onClick={() => window.open(`/${sub.shopSlug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── DOMAINS TAB ─────────────────────────────────────────────────────────────

function AdminDomains() {
  const [domains, setDomains] = useState<AdminDomain[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; domainId: string; domainName: string; reason: string }>({
    open: false, domainId: '', domainName: '', reason: '',
  })

  const loadDomains = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      const res = await fetch(`/api/admin/domains?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setDomains(data.domains)
      }
    } catch {
      toast.error('Erreur lors du chargement des domaines')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDomains(statusFilter)
  }, [statusFilter, loadDomains])

  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })
      if (res.ok) {
        toast.success('Domaine validé')
        loadDomains(statusFilter)
      } else {
        toast.error('Erreur lors de la validation')
      }
    } catch {
      toast.error('Erreur lors de la validation')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject() {
    if (!rejectDialog.reason.trim()) {
      toast.error('Veuillez saisir une raison du rejet')
      return
    }
    setActionLoading(rejectDialog.domainId)
    try {
      const res = await fetch(`/api/admin/domains/${rejectDialog.domainId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', reason: rejectDialog.reason }),
      })
      if (res.ok) {
        toast.success('Domaine rejeté')
        setRejectDialog({ open: false, domainId: '', domainName: '', reason: '' })
        loadDomains(statusFilter)
      } else {
        toast.error('Erreur lors du rejet')
      }
    } catch {
      toast.error('Erreur lors du rejet')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Domaines</h2>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="APPROVED">Validé</SelectItem>
            <SelectItem value="REJECTED">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun domaine trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.shopName}</TableCell>
                    <TableCell className="text-muted-foreground">{d.domain}</TableCell>
                    <TableCell>{domainStatusBadge(d.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                    <TableCell>
                      {d.status === 'PENDING' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleApprove(d.id)}
                            disabled={actionLoading === d.id}
                          >
                            {actionLoading === d.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                            Valider
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setRejectDialog({ open: true, domainId: d.id, domainName: d.domain, reason: '' })}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le domaine</DialogTitle>
            <DialogDescription>
              Rejeter la demande pour le domaine &quot;{rejectDialog.domainName}&quot;. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Raison du rejet</Label>
              <Textarea
                id="reject-reason"
                placeholder="Expliquez pourquoi ce domaine est rejeté..."
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, domainId: '', domainName: '', reason: '' })}>Annuler</Button>
            <Button onClick={handleReject} disabled={actionLoading === rejectDialog.domainId} className="bg-red-600 hover:bg-red-700">
              {actionLoading === rejectDialog.domainId && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── CONFIG TAB ───────────────────────────────────────────────────────────────

function AdminConfig() {
  // Pricing state
  const [standardPrice, setStandardPrice] = useState('')
  const [proPrice, setProPrice] = useState('')
  const [savingPricing, setSavingPricing] = useState(false)

  // Platform config state
  const [config, setConfig] = useState<PlatformConfig>({
    saasName: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    defaultWhatsappMessage: '',
    adminWhatsappNumber: '',
    standardPrice: 0,
    proPrice: 0,
    supportEmail: 'contact@boutiko.com',
    senderName: 'Boutiko',
    autoWelcomeEmail: true,
    notifyNewSeller: true,
    notifyNewOrder: true,
    notifyDomainRequest: true,
    notifySupportTicket: true,
    weeklyReport: false,
    lowStockAlerts: false,
  })
  const [savingConfig, setSavingConfig] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [savingNotif, setSavingNotif] = useState(false)

  // Promo codes state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [showPromoDialog, setShowPromoDialog] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [promoForm, setPromoForm] = useState({ code: '', discountPercent: '', maxUses: '', expiresAt: '' })
  const [savingPromo, setSavingPromo] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/admin/config')
        if (res.ok) {
          const data = await res.json()
          setConfig(prev => ({
            ...prev,
            saasName: data.saasName ?? prev.saasName,
            logoUrl: data.logoUrl ?? prev.logoUrl,
            primaryColor: data.primaryColor ?? prev.primaryColor,
            defaultWhatsappMessage: data.defaultWhatsappMessage ?? prev.defaultWhatsappMessage,
            adminWhatsappNumber: data.adminWhatsappNumber ?? prev.adminWhatsappNumber,
            standardPrice: data.standardPrice ?? prev.standardPrice,
            proPrice: data.proPrice ?? prev.proPrice,
            supportEmail: data.supportEmail ?? prev.supportEmail,
            senderName: data.senderName ?? prev.senderName,
            autoWelcomeEmail: data.autoWelcomeEmail ?? prev.autoWelcomeEmail,
            notifyNewSeller: data.notifyNewSeller ?? prev.notifyNewSeller,
            notifyNewOrder: data.notifyNewOrder ?? prev.notifyNewOrder,
            notifyDomainRequest: data.notifyDomainRequest ?? prev.notifyDomainRequest,
            notifySupportTicket: data.notifySupportTicket ?? prev.notifySupportTicket,
            weeklyReport: data.weeklyReport ?? prev.weeklyReport,
            lowStockAlerts: data.lowStockAlerts ?? prev.lowStockAlerts,
          }))
          setStandardPrice(String(data.standardPrice || ''))
          setProPrice(String(data.proPrice || ''))
        }
      } catch {
        toast.error('Erreur lors du chargement de la configuration')
      } finally {
        setLoadingConfig(false)
      }
    }
    loadConfig()
  }, [])

  const loadPromoCodes = useCallback(async () => {
    setLoadingPromos(true)
    try {
      const res = await fetch('/api/admin/promo-codes')
      if (res.ok) {
        const data = await res.json()
        setPromoCodes(data.promoCodes || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des codes promo')
    } finally {
      setLoadingPromos(false)
    }
  }, [])

  useEffect(() => {
    loadPromoCodes()
  }, [loadPromoCodes])

  async function savePricing() {
    setSavingPricing(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standardPrice: Number(standardPrice), proPrice: Number(proPrice) }),
      })
      if (res.ok) {
        toast.success('Tarifs mis à jour')
      } else {
        toast.error('Erreur lors de la mise à jour des tarifs')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour des tarifs')
    } finally {
      setSavingPricing(false)
    }
  }

  async function savePlatformConfig() {
    setSavingConfig(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saasName: config.saasName,
          logoUrl: config.logoUrl,
          primaryColor: config.primaryColor,
          defaultWhatsappMessage: config.defaultWhatsappMessage,
          adminWhatsappNumber: config.adminWhatsappNumber,
        }),
      })
      if (res.ok) {
        toast.success('Configuration mise à jour')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSavingConfig(false)
    }
  }

  async function saveNotificationSettings() {
    setSavingNotif(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supportEmail: config.supportEmail,
          senderName: config.senderName,
          autoWelcomeEmail: config.autoWelcomeEmail,
          notifyNewSeller: config.notifyNewSeller,
          notifyNewOrder: config.notifyNewOrder,
          notifyDomainRequest: config.notifyDomainRequest,
          notifySupportTicket: config.notifySupportTicket,
          weeklyReport: config.weeklyReport,
          lowStockAlerts: config.lowStockAlerts,
        }),
      })
      if (res.ok) {
        toast.success('Préférences email & notifications enregistrées')
      } else {
        toast.error('Erreur lors de l\'enregistrement des préférences')
      }
    } catch {
      toast.error('Erreur lors de l\'enregistrement des préférences')
    } finally {
      setSavingNotif(false)
    }
  }

  function openPromoDialog(promo?: PromoCode) {
    if (promo) {
      setEditingPromo(promo)
      setPromoForm({
        code: promo.code,
        discountPercent: String(promo.discountPercent),
        maxUses: String(promo.maxUses),
        expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '',
      })
    } else {
      setEditingPromo(null)
      setPromoForm({ code: '', discountPercent: '', maxUses: '', expiresAt: '' })
    }
    setShowPromoDialog(true)
  }

  async function savePromoCode() {
    if (!promoForm.code.trim() || !promoForm.discountPercent.trim()) {
      toast.error('Veuillez remplir au moins le code et le pourcentage de remise')
      return
    }
    setSavingPromo(true)
    try {
      const body = {
        code: promoForm.code,
        discountPercent: Number(promoForm.discountPercent),
        maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : null,
        expiresAt: promoForm.expiresAt ? new Date(promoForm.expiresAt).toISOString() : null,
      }
      const url = editingPromo ? `/api/admin/promo-codes/${editingPromo.id}` : '/api/admin/promo-codes'
      const res = await fetch(url, {
        method: editingPromo ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingPromo ? 'Code promo mis à jour' : 'Code promo créé')
        setShowPromoDialog(false)
        loadPromoCodes()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSavingPromo(false)
    }
  }

  async function deletePromoCode(id: string) {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Code promo supprimé')
        loadPromoCodes()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  async function togglePromoActive(id: string, active: boolean) {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      if (res.ok) {
        loadPromoCodes()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuration</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* A. Gestion des Tarifs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des Tarifs</CardTitle>
            <CardDescription>Définissez les prix des abonnements en FCFA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="standard-price">Prix Standard (FCFA)</Label>
              <Input
                id="standard-price"
                type="number"
                placeholder="0"
                value={standardPrice}
                onChange={(e) => setStandardPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pro-price">Prix Pro (FCFA)</Label>
              <Input
                id="pro-price"
                type="number"
                placeholder="0"
                value={proPrice}
                onChange={(e) => setProPrice(e.target.value)}
              />
            </div>
            <Button onClick={savePricing} disabled={savingPricing} className="bg-blue-600 hover:bg-blue-700">
              {savingPricing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer les tarifs
            </Button>
          </CardContent>
        </Card>

        {/* B. Personnalisation Plateforme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personnalisation Plateforme</CardTitle>
            <CardDescription>Configurez l&apos;apparence et les paramètres par défaut.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingConfig ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="saas-name">Nom de la plateforme</Label>
                  <Input
                    id="saas-name"
                    placeholder="Boutiko"
                    value={config.saasName}
                    onChange={(e) => setConfig(prev => ({ ...prev, saasName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">URL du logo</Label>
                  <Input
                    id="logo-url"
                    placeholder="https://..."
                    value={config.logoUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Couleur principale</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      placeholder="#3b82f6"
                      value={config.primaryColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                    <div
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-message">Message WhatsApp par défaut</Label>
                  <Textarea
                    id="default-message"
                    placeholder="Bonjour, je suis intéressé par..."
                    value={config.defaultWhatsappMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultWhatsappMessage: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-whatsapp">Numéro WhatsApp Admin</Label>
                  <Input
                    id="admin-whatsapp"
                    placeholder="+225 XX XX XX XX"
                    value={config.adminWhatsappNumber}
                    onChange={(e) => setConfig(prev => ({ ...prev, adminWhatsappNumber: e.target.value }))}
                  />
                </div>
                <Button onClick={savePlatformConfig} disabled={savingConfig} className="bg-blue-600 hover:bg-blue-700">
                  {savingConfig ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* C. Paramètres Email & Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Paramètres Email & Notifications
            </CardTitle>
            <CardDescription>Configurez les emails et les notifications de la plateforme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingConfig ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                {/* Email Settings */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Configuration Email
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Email de support</Label>
                      <Input
                        id="support-email"
                        type="email"
                        placeholder="contact@boutiko.com"
                        value={config.supportEmail}
                        onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender-name">Nom de l&apos;expéditeur</Label>
                      <Input
                        id="sender-name"
                        placeholder="Boutiko"
                        value={config.senderName}
                        onChange={(e) => setConfig(prev => ({ ...prev, senderName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-welcome">Réponse automatique aux nouveaux vendeurs</Label>
                      <p className="text-xs text-muted-foreground">Envoyer un email de bienvenue automatique</p>
                    </div>
                    <Switch
                      id="auto-welcome"
                      checked={config.autoWelcomeEmail}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoWelcomeEmail: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                {/* Notification Settings */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-new-seller">Nouvelle inscription vendeur</Label>
                        <p className="text-xs text-muted-foreground">Notifier lorsqu&apos;un nouveau vendeur s&apos;inscrit</p>
                      </div>
                      <Switch
                        id="notify-new-seller"
                        checked={config.notifyNewSeller}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifyNewSeller: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-new-order">Nouvelle commande</Label>
                        <p className="text-xs text-muted-foreground">Notifier pour chaque nouvelle commande sur la plateforme</p>
                      </div>
                      <Switch
                        id="notify-new-order"
                        checked={config.notifyNewOrder}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifyNewOrder: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-domain">Demande de domaine personnalisé</Label>
                        <p className="text-xs text-muted-foreground">Notifier lorsqu&apos;un domaine personnalisé est demandé</p>
                      </div>
                      <Switch
                        id="notify-domain"
                        checked={config.notifyDomainRequest}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifyDomainRequest: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-support">Ticket de support</Label>
                        <p className="text-xs text-muted-foreground">Notifier lorsqu&apos;un ticket de support est ouvert</p>
                      </div>
                      <Switch
                        id="notify-support"
                        checked={config.notifySupportTicket}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifySupportTicket: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-weekly">Rapport hebdomadaire</Label>
                        <p className="text-xs text-muted-foreground">Envoyer un résumé statistique hebdomadaire</p>
                      </div>
                      <Switch
                        id="notify-weekly"
                        checked={config.weeklyReport}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, weeklyReport: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-stock">Alertes de stock faible</Label>
                        <p className="text-xs text-muted-foreground">Notifier lorsque les produits sont en stock faible ou épuisé</p>
                      </div>
                      <Switch
                        id="notify-stock"
                        checked={config.lowStockAlerts}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, lowStockAlerts: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={saveNotificationSettings} disabled={savingNotif} className="bg-blue-600 hover:bg-blue-700">
                    {savingNotif ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Enregistrer les préférences
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* D. Codes Promo */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Codes Promo</CardTitle>
              <CardDescription>Gérez les codes de réduction pour vos abonnements.</CardDescription>
            </div>
            <Button onClick={() => openPromoDialog()} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer un code
            </Button>
          </CardHeader>
          <CardContent>
            {loadingPromos ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucun code promo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-center">Remise</TableHead>
                      <TableHead className="text-center">Utilisations</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead className="text-center">Actif</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                        <TableCell className="text-center">{promo.discountPercent}%</TableCell>
                        <TableCell className="text-center">
                          {promo.currentUses}/{promo.maxUses || '∞'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {promo.expiresAt ? formatDate(promo.expiresAt) : 'Jamais'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={promo.active}
                            onCheckedChange={(checked) => togglePromoActive(promo.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openPromoDialog(promo)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Supprimer">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le code promo</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Le code &quot;{promo.code}&quot; sera définitivement supprimé.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    onClick={() => deletePromoCode(promo.id)}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Modifier le code promo' : 'Créer un code promo'}</DialogTitle>
            <DialogDescription>
              {editingPromo ? 'Modifiez les détails du code promo.' : 'Créez un nouveau code de réduction.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Code</Label>
              <Input
                id="promo-code"
                placeholder="PROMO2024"
                value={promoForm.code}
                onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-discount">Remise (%)</Label>
              <Input
                id="promo-discount"
                type="number"
                placeholder="10"
                value={promoForm.discountPercent}
                onChange={(e) => setPromoForm(prev => ({ ...prev, discountPercent: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-max-uses">Nombre max d&apos;utilisations</Label>
              <Input
                id="promo-max-uses"
                type="number"
                placeholder="Illimité si vide"
                value={promoForm.maxUses}
                onChange={(e) => setPromoForm(prev => ({ ...prev, maxUses: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-expires">Date d&apos;expiration</Label>
              <Input
                id="promo-expires"
                type="date"
                value={promoForm.expiresAt}
                onChange={(e) => setPromoForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoDialog(false)}>Annuler</Button>
            <Button onClick={savePromoCode} disabled={savingPromo} className="bg-blue-600 hover:bg-blue-700">
              {savingPromo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {editingPromo ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── SUPPORT TAB ──────────────────────────────────────────────────────────────

function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminPhone, setAdminPhone] = useState('')

  useEffect(() => {
    async function loadAdminPhone() {
      try {
        const res = await fetch('/api/admin/config')
        if (res.ok) {
          const data = await res.json()
          setAdminPhone(data.adminWhatsappNumber || '')
        }
      } catch { /* ignore */ }
    }
    loadAdminPhone()
  }, [])

  const loadTickets = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      const res = await fetch(`/api/admin/support?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTickets(statusFilter)
  }, [statusFilter, loadTickets])

  async function resolveTicket(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id, status: 'RESOLVED' }),
      })
      if (res.ok) {
        toast.success('Ticket marqué comme résolu')
        loadTickets(statusFilter)
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  function openWhatsApp(shopName: string) {
    const phone = adminPhone.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(`Support pour ${shopName}`)
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Support</h2>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="OPEN">Ouvert</SelectItem>
            <SelectItem value="RESOLVED">Résolu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <LifeBuoy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun ticket de support</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(t.createdAt)}</TableCell>
                    <TableCell className="font-medium">{t.shopName}</TableCell>
                    <TableCell className="text-muted-foreground">{t.ownerEmail}</TableCell>
                    <TableCell>
                      <p className="text-sm max-w-xs truncate">{t.message}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.status === 'OPEN' ? 'secondary' : 'outline'}
                        className={
                          t.status === 'OPEN'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            : 'border-emerald-500 text-emerald-700 bg-emerald-50'
                        }
                      >
                        {t.status === 'OPEN' ? 'Ouvert' : 'Résolu'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => openWhatsApp(t.shopName)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Ouvrir WhatsApp Pro
                        </Button>
                        {t.status === 'OPEN' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => resolveTicket(t.id)}
                            disabled={actionLoading === t.id}
                          >
                            {actionLoading === t.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Marquer résolu
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── MODERATION TAB ───────────────────────────────────────────────────────────

function AdminModeration() {
  const [flaggedShops, setFlaggedShops] = useState<FlaggedShop[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadFlaggedShops = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/moderation')
      if (res.ok) {
        const data = await res.json()
        setFlaggedShops(data.flaggedShops || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des signalements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFlaggedShops()
  }, [loadFlaggedShops])

  async function unflag(shopId: string) {
    setActionLoading(shopId)
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, action: 'unflag' }),
      })
      if (res.ok) {
        toast.success('Boutique dé-signalée')
        loadFlaggedShops()
      } else {
        toast.error('Erreur lors du dé-signalement')
      }
    } catch {
      toast.error('Erreur lors du dé-signalement')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Modération</h2>

      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : flaggedShops.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Flag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucune boutique signalée</p>
            <p className="text-xs text-muted-foreground mt-1">Les boutiques signalées par les utilisateurs apparaîtront ici.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedShops.map((fs) => (
                  <TableRow key={fs.id}>
                    <TableCell className="font-medium">{fs.shopName}</TableCell>
                    <TableCell>{fs.ownerName}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        {fs.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(fs.flaggedAt)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => unflag(fs.shopId)}
                        disabled={actionLoading === fs.shopId}
                      >
                        {actionLoading === fs.shopId ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        Dé-signaler
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── MARKETING TAB ───────────────────────────────────────────────────────────

function AdminMarketing() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loadingReferrals, setLoadingReferrals] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function loadReferrals() {
      setLoadingReferrals(true)
      try {
        const res = await fetch('/api/admin/referrals')
        if (res.ok) {
          const data = await res.json()
          setReferrals(data.referrals || [])
        }
      } catch {
        toast.error('Erreur lors du chargement des parrainages')
      } finally {
        setLoadingReferrals(false)
      }
    }
    loadReferrals()
  }, [])

  async function handleExport() {
    setExporting(true)
    try {
      window.open('/api/admin/export', '_blank')
      toast.success('Export CSV lancé')
    } catch {
      toast.error('Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketing</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* A. Suivi du Parrainage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Suivi du Parrainage</CardTitle>
            <CardDescription>Suivez les parrainages et les inscriptions référencées.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReferrals ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucun parrainage enregistré</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parrain</TableHead>
                      <TableHead>Filleul</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.referrerName}</TableCell>
                        <TableCell>{r.referredName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">
                            {r.status === 'ACTIVE' ? 'Actif' : r.status === 'PENDING' ? 'En attente' : r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* B. Export de Données */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Export de Données</CardTitle>
            <CardDescription>Exportez les données de toutes les boutiques au format CSV.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground flex-1">
                Téléchargez un fichier CSV contenant toutes les données des boutiques : produits, commandes, clients, etc.
              </p>
              <Button onClick={handleExport} disabled={exporting} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Exporter CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)

  const loadUsers = useCallback(async (searchTerm: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers(search)
  }, [search, loadUsers])

  async function handleCreateUser() {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setCreatingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword }),
      })
      if (res.ok) {
        toast.success('Utilisateur créé avec succès')
        setShowCreateUser(false)
        setNewUserName('')
        setNewUserEmail('')
        setNewUserPassword('')
        loadUsers(search)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setCreatingUser(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Utilisateurs</h2>
        <Button onClick={() => setShowCreateUser(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Produits</TableHead>
                  <TableHead className="text-center">Commandes</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.shop?.name || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {u.shop ? (
                        <Badge variant={planVariant(u.shop.plan)}>{u.shop.plan}</Badge>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">{u.shop?.productCount ?? '—'}</TableCell>
                    <TableCell className="text-center">{(u.shop?.orderCount ?? u.orderCount) ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
            <DialogDescription>Créez un nouveau compte vendeur sur la plateforme.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-user-name">Nom</Label>
              <Input
                id="create-user-name"
                placeholder="Nom complet"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-user-email">Email</Label>
              <Input
                id="create-user-email"
                type="email"
                placeholder="email@exemple.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-user-password">Mot de passe</Label>
              <Input
                id="create-user-password"
                type="password"
                placeholder="Mot de passe"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>Annuler</Button>
            <Button onClick={handleCreateUser} disabled={creatingUser} className="bg-blue-600 hover:bg-blue-700">
              {creatingUser && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── SHOPS TAB ────────────────────────────────────────────────────────────────

function AdminShops() {
  const [shops, setShops] = useState<AdminShop[]>([])
  const [planFilter, setPlanFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showCreateShop, setShowCreateShop] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [newShopSlug, setNewShopSlug] = useState('')
  const [newShopWhatsapp, setNewShopWhatsapp] = useState('')
  const [newShopOwnerId, setNewShopOwnerId] = useState('')
  const [creatingShop, setCreatingShop] = useState(false)

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const loadShops = useCallback(async (p: string, s: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (p && p !== 'all') params.set('plan', p)
      if (s) params.set('search', s)
      const res = await fetch(`/api/admin/shops?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setShops(data.shops)
      }
    } catch {
      toast.error('Erreur lors du chargement des boutiques')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShops(planFilter, search)
  }, [planFilter, search, loadShops])

  async function toggleActive(shop: AdminShop) {
    setTogglingId(shop.id)
    try {
      const res = await fetch(`/api/admin/shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !shop.isActive }),
      })
      if (res.ok) {
        toast.success(`Boutique ${shop.isActive ? 'suspendue' : 'activée'}`)
        loadShops(planFilter, search)
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setTogglingId(null)
    }
  }

  async function deleteShop(id: string, name: string) {
    try {
      const res = await fetch(`/api/admin/shops/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Boutique "${name}" supprimée`)
        loadShops(planFilter, search)
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  async function handleCreateShop() {
    if (!newShopName.trim() || !newShopSlug.trim() || !newShopWhatsapp.trim() || !newShopOwnerId.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setCreatingShop(true)
    try {
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShopName, slug: newShopSlug, whatsapp: newShopWhatsapp, ownerId: newShopOwnerId }),
      })
      if (res.ok) {
        toast.success('Boutique créée avec succès')
        setShowCreateShop(false)
        setNewShopName('')
        setNewShopSlug('')
        setNewShopWhatsapp('')
        setNewShopOwnerId('')
        loadShops(planFilter, search)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setCreatingShop(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Boutiques</h2>
        <Button onClick={() => setShowCreateShop(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Créer une boutique
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les plans</SelectItem>
            <SelectItem value="FREE">Gratuit</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : shops.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucune boutique trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Produits</TableHead>
                  <TableHead className="text-center">Commandes</TableHead>
                  <TableHead className="text-center">Visites</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{s.owner.name}</p>
                        <p className="text-xs text-muted-foreground">{s.owner.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={planVariant(s.plan)}>{s.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{s.productCount}</TableCell>
                    <TableCell className="text-center">{s.orderCount}</TableCell>
                    <TableCell className="text-center">{s.visitCount}</TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'outline' : 'destructive'} className={s.isActive ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}>
                        {s.isActive ? 'Active' : 'Suspendue'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleActive(s)}
                          disabled={togglingId === s.id}
                          title={s.isActive ? 'Suspendre' : 'Activer'}
                        >
                          {togglingId === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Power className={`h-4 w-4 ${s.isActive ? 'text-amber-600' : 'text-emerald-600'}`} />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la boutique</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La boutique &quot;{s.name}&quot; et toutes ses données (produits, catégories, commandes, visites) seront définitivement supprimées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => deleteShop(s.id, s.name)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Shop Dialog */}
      <Dialog open={showCreateShop} onOpenChange={setShowCreateShop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une boutique</DialogTitle>
            <DialogDescription>Créez une nouvelle boutique pour un vendeur.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-shop-name">Nom de la boutique</Label>
              <Input
                id="create-shop-name"
                placeholder="Ma boutique"
                value={newShopName}
                onChange={(e) => {
                  setNewShopName(e.target.value)
                  setNewShopSlug(generateSlug(e.target.value))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-shop-slug">Slug</Label>
              <Input
                id="create-shop-slug"
                placeholder="ma-boutique"
                value={newShopSlug}
                onChange={(e) => setNewShopSlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-shop-whatsapp">Numéro WhatsApp</Label>
              <Input
                id="create-shop-whatsapp"
                placeholder="+225 XX XX XX XX"
                value={newShopWhatsapp}
                onChange={(e) => setNewShopWhatsapp(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-shop-owner">ID du propriétaire (userId)</Label>
              <Input
                id="create-shop-owner"
                placeholder="clxxxxxxxxxxxxx"
                value={newShopOwnerId}
                onChange={(e) => setNewShopOwnerId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateShop(false)}>Annuler</Button>
            <Button onClick={handleCreateShop} disabled={creatingShop} className="bg-blue-600 hover:bg-blue-700">
              {creatingShop && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── ORDERS TAB ──────────────────────────────────────────────────────────────

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async (s: string, q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (s && s !== 'all') params.set('status', s)
      if (q) params.set('search', q)
      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch {
      toast.error('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders(statusFilter, search)
  }, [statusFilter, search, loadOrders])

  function getStatusIcon(status: string) {
    switch (status) {
      case 'PENDING': return <Clock className="h-3.5 w-3.5" />
      case 'CONFIRMED': return <Package className="h-3.5 w-3.5" />
      case 'DELIVERED': return <CheckCircle className="h-3.5 w-3.5" />
      case 'CANCELLED': return <XCircle className="h-3.5 w-3.5" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Commandes</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="CONFIRMED">Confirmée</SelectItem>
            <SelectItem value="DELIVERED">Livrée</SelectItem>
            <SelectItem value="CANCELLED">Annulée</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID, client, boutique..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const cfg = statusConfig[o.status] || statusConfig.PENDING
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#{o.id.slice(-8)}</TableCell>
                      <TableCell className="font-medium">{o.shop.name}</TableCell>
                      <TableCell>
                        {o.customerName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {o.customerPhone && (
                          <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(o.total)}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className={`gap-1 ${cfg.className || ''}`}>
                          {getStatusIcon(o.status)}
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
