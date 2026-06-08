'use client'

import { useAppStore, type AdminTab } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

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

// ─── Navigation Items ───────────────────────────────────────────────────────

const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'admin-overview', label: "Vue d'ensemble", icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'admin-users', label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
  { id: 'admin-shops', label: 'Boutiques', icon: <Store className="h-5 w-5" /> },
  { id: 'admin-orders', label: 'Commandes', icon: <ShoppingCart className="h-5 w-5" /> },
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
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-destructive-foreground">
          <Shield className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-foreground">WhatsShop Admin</span>
      </div>

      <Separator />

      {/* Admin info */}
      <div className="px-6 py-3">
        <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
        <Badge className="mt-1 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">
          ADMIN
        </Badge>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={adminTab === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 h-11 px-3 ${
                adminTab === item.id
                  ? 'bg-blue-500/10 text-blue-600 font-medium hover:bg-blue-500/15'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setAdminTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Theme Toggle */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 px-3 text-muted-foreground hover:text-purple-600"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </Button>
      </div>

      <Separator />

      {/* Logout */}
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 px-3 text-muted-foreground hover:text-blue-600"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
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
            if (data.user.role !== 'ADMIN') {
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
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-card border-r min-h-screen sticky top-0">
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
            <SheetContent side="left" className="w-64 p-0">
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
        { label: 'Utilisateurs', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Boutiques', value: stats.totalShops, icon: <Store className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Produits', value: stats.totalProducts, icon: <Package className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Commandes', value: stats.totalOrders, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Revenus', value: formatCurrency(stats.totalRevenue), icon: <TrendingUp className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Visites', value: stats.totalVisits, icon: <Eye className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
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
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${card.bg} ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
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
          <CardContent className="p-0">
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
          <CardContent className="p-0">
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
          <CardContent className="p-0">
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
