'use client'

import { useAppStore, type AdminTab } from '@/lib/store'
import { useEffect, useState, useCallback, useRef } from 'react'
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
import { generateSlug } from '@/lib/utils'
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
  ShieldCheck,
  Crown,
  MessageCircle,
  Building2,
  Ban,
  DollarSign,
  ArrowUpRight,
  X,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  ArrowUpCircle,
  ShieldAlert,
  CheckCheck,
  Server,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
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

interface EnhancedAdminStats extends AdminStats {
  mrr: number
  activeSubscriptions: number
  trialSubscriptions: number
  expiredSubscriptions: number
  churnRate: number
  suspendedUsers: number
  totalResellers: number
  activeResellers: number
  pendingDomains: number
  flaggedShops: number
  subscriptionGrowth: { month: string; newSubscriptions: number }[]
  revenueByPlan: { STARTER: number; PRO: number; BUSINESS: number }
}

interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
  shop: { id: string; name: string; plan: string; isActive: boolean; productCount: number; orderCount: number } | null
  orderCount: number
  isSuspended: boolean
  suspendedReason?: string
  role: string
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
  customerAddress?: string | null
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
  adminWhatsAppNumber: string
  standardPrice: number
  proPrice: number
  starterPrice: number
  businessPrice: number
  supportEmail: string
  senderName: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  emailFrom: string
  emailFromName: string
  smtpConfigured: boolean
  autoWelcomeEmail: boolean
  notifyNewSeller: boolean
  notifyNewOrder: boolean
  notifyDomainRequest: boolean
  notifySupportTicket: boolean
  weeklyReport: boolean
  lowStockAlerts: boolean
  forbiddenKeywords?: string
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
    case 'STARTER': return 'default' as const
    case 'PRO': return 'outline' as const
    case 'BUSINESS': return 'outline' as const
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

// ─── Notification Types ─────────────────────────────────────────────────────

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata: string
  createdAt: string
}

const notificationIconMap: Record<string, React.ReactNode> = {
  NEW_SHOP: <Store className="h-4 w-4" />,
  NEW_ORDER: <ShoppingCart className="h-4 w-4" />,
  NEW_SELLER: <UserPlus className="h-4 w-4" />,
  DOMAIN_REQUEST: <Globe className="h-4 w-4" />,
  SUPPORT_TICKET: <MessageSquare className="h-4 w-4" />,
  LOW_STOCK: <AlertTriangle className="h-4 w-4" />,
  UPGRADE_REQUEST: <ArrowUpCircle className="h-4 w-4" />,
  SUSPENDED_USER: <ShieldAlert className="h-4 w-4" />,
}

function getNotificationIcon(type: string) {
  return notificationIconMap[type] || <Bell className="h-4 w-4" />
}

const notificationTypeColors: Record<string, string> = {
  NEW_SHOP: 'text-emerald-600 bg-emerald-100',
  NEW_ORDER: 'text-purple-600 bg-purple-100',
  NEW_SELLER: 'text-blue-600 bg-blue-100',
  DOMAIN_REQUEST: 'text-orange-600 bg-orange-100',
  SUPPORT_TICKET: 'text-pink-600 bg-pink-100',
  LOW_STOCK: 'text-amber-600 bg-amber-100',
  UPGRADE_REQUEST: 'text-sky-600 bg-sky-100',
  SUSPENDED_USER: 'text-red-600 bg-red-100',
}

// ─── Navigation Items ───────────────────────────────────────────────────────

const navGroups = [
  {
    label: 'Principal',
    items: [
      { id: 'admin-overview' as AdminTab, label: "Vue d'ensemble", icon: <BarChart3 className="h-5 w-5" /> },
      { id: 'admin-notifications' as AdminTab, label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
      { id: 'admin-subscriptions' as AdminTab, label: 'Abonnements', icon: <CreditCard className="h-5 w-5" /> },
      { id: 'admin-domains' as AdminTab, label: 'Domaines', icon: <Globe className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { id: 'admin-upgrades' as AdminTab, label: 'Demandes', icon: <ArrowUpRight className="h-5 w-5" /> },
      { id: 'admin-config' as AdminTab, label: 'Configuration', icon: <Settings className="h-5 w-5" /> },
      { id: 'admin-admins' as AdminTab, label: 'Super Admins', icon: <ShieldCheck className="h-5 w-5" /> },
      { id: 'admin-support' as AdminTab, label: 'Support', icon: <LifeBuoy className="h-5 w-5" /> },
      { id: 'admin-moderation' as AdminTab, label: 'Modération', icon: <Flag className="h-5 w-5" /> },
      { id: 'admin-marketing' as AdminTab, label: 'Marketing', icon: <Megaphone className="h-5 w-5" /> },
      { id: 'admin-resellers' as AdminTab, label: 'Revendeurs', icon: <Building2 className="h-5 w-5" /> },
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
  const [pendingUpgrades, setPendingUpgrades] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/admin/upgrade-requests?status=PENDING')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPendingUpgrades(data.pendingCount) })
      .catch(() => {})
    fetch('/api/admin/notifications?limit=1')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUnreadCount(data.unreadCount || 0) })
      .catch(() => {})
  }, [adminTab])

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        setUser(null)
        setShop(null)
        setView('login')
        window.location.replace('/login')
        return
      }
    } catch { /* ignore */ }
    // Fallback: redirect to /login (server-side session clearing will happen on next request)
    setUser(null)
    setShop(null)
    setView('login')
    window.location.replace('/login')
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
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  {item.id === 'admin-upgrades' && pendingUpgrades > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {pendingUpgrades}
                    </span>
                  )}
                  {item.id === 'admin-notifications' && unreadCount > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
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

// ─── UPGRADE REQUESTS TAB ────────────────────────────────────────────────────

interface UpgradeRequest {
  id: string
  userId: string
  requestedPlan: string
  status: string
  reviewedBy: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  reviewer: { id: string; name: string; email: string } | null
  currentPlan: string
  currentPlanLabel: string
  requestedPlanLabel: string
  requestedPlanPrice: number
  shopCount: number
}

const upgradeStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>
    case 'APPROVED':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approuvée</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Refusée</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function AdminUpgradeRequests() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({})

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/upgrade-requests?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des demandes')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function handleAction(requestId: string, action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && !rejectReasons[requestId]?.trim()) {
      toast.error('Veuillez saisir une raison du refus')
      return
    }
    setActionLoading(requestId)
    try {
      const body: { requestId: string; action: string; reason?: string } = { requestId, action }
      if (action === 'REJECT') body.reason = rejectReasons[requestId]
      const res = await fetch('/api/admin/upgrade-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(action === 'APPROVE' ? 'Demande approuvée avec succès' : 'Demande refusée')
        setRejectReasons(prev => { const n = { ...prev }; delete n[requestId]; return n })
        setShowRejectInput(prev => { const n = { ...prev }; delete n[requestId]; return n })
        loadRequests()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors du traitement')
      }
    } catch {
      toast.error('Erreur lors du traitement')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

  const formatUpgradeDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatUpgradePrice = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA/mois'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowUpRight className="h-6 w-6" />
            Demandes d&apos;upgrade
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les demandes de changement de plan des vendeurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-sm px-3 py-1">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {pendingCount} en attente
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadRequests}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="APPROVED">Approuvées</SelectItem>
            <SelectItem value="REJECTED">Refusées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucune demande trouvée</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {statusFilter !== 'all'
                ? 'Aucune demande ne correspond à ce filtre.'
                : 'Les demandes d\'upgrade des vendeurs apparaîtront ici.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan actuel → Demandé</TableHead>
                  <TableHead className="text-center">Boutiques</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatUpgradeDate(req.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{req.user?.name || 'Inconnu'}</p>
                        <p className="text-xs text-muted-foreground">{req.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {req.currentPlanLabel || req.currentPlan}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-xs border-blue-500 text-blue-700 bg-blue-50">
                          {req.requestedPlanLabel || req.requestedPlan}
                        </Badge>
                        {req.requestedPlanPrice > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({formatUpgradePrice(req.requestedPlanPrice)})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{req.shopCount || 0}</span>
                    </TableCell>
                    <TableCell>
                      {upgradeStatusBadge(req.status)}
                      {req.status === 'REJECTED' && req.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={req.rejectionReason}>
                          {req.rejectionReason}
                        </p>
                      )}
                      {req.reviewer && req.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          par {req.reviewer.name} · {formatDate(req.reviewedAt)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5 justify-end flex-wrap">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            onClick={() => handleAction(req.id, 'APPROVE')}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Approuver
                          </Button>
                          {!showRejectInput[req.id] ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 gap-1"
                              onClick={() => setShowRejectInput(prev => ({ ...prev, [req.id]: true }))}
                              disabled={actionLoading === req.id}
                            >
                              <X className="h-3 w-3" />
                              Refuser
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="text"
                                placeholder="Raison du refus..."
                                className="h-8 text-xs w-40"
                                value={rejectReasons[req.id] || ''}
                                onChange={e => setRejectReasons(prev => ({ ...prev, [req.id]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleAction(req.id, 'REJECT')
                                  if (e.key === 'Escape') setShowRejectInput(prev => ({ ...prev, [req.id]: false }))
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleAction(req.id, 'REJECT')}
                                disabled={actionLoading === req.id || !rejectReasons[req.id]?.trim()}
                              >
                                {actionLoading === req.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setShowRejectInput(prev => ({ ...prev, [req.id]: false }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
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
    </div>
  )
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user, setUser, setView, setShop } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [godModeUser, setGodModeUser] = useState<string | null>(null)
  const { isDark, toggleTheme } = useThemeMode()
  const sessionChecked = useRef(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const [notifDropdown, setNotifDropdown] = useState<AdminNotification[]>([])
  const [notifUnread, setNotifUnread] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notifDropdownOpen && notifDropdown.length === 0) {
      setNotifLoading(true)
      fetch('/api/admin/notifications?limit=20')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setNotifDropdown(data.notifications || [])
            setNotifUnread(data.unreadCount || 0)
          }
        })
        .catch(() => {})
        .finally(() => setNotifLoading(false))
    }
  }, [notifDropdownOpen, notifDropdown.length])

  // Poll unread count every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/admin/notifications?limit=1')
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setNotifUnread(data.unreadCount || 0) })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined' && document.cookie.includes('boutiko-session')) {
      // God mode is now stored in the iron-session, checked via session API
      // The session API returns godModeOriginalUserId when in god mode
    }
  }, [])

  async function exitGodMode() {
    try {
      await fetch('/api/admin/god-mode', { method: 'DELETE' })
      setGodModeUser(null)
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  useEffect(() => {
    // Prevent re-running on re-hydration or re-render
    if (sessionChecked.current) return
    sessionChecked.current = true

    // If user data is already set (e.g. from Zustand persist rehydration), skip session fetch
    if (user) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok && !cancelled) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            // Detect god mode from session API
            if (data.godModeOriginalUserId) {
              setGodModeUser('Utilisateur impersonné')
            }
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
        if (!cancelled) setLoading(false)
      }
    }
    loadSession()
    return () => { cancelled = true }
  }, [])

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
      {/* God Mode Banner */}
      {godModeUser && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <span>🔴 MODE DIEU — Vous êtes connecté en tant que {godModeUser}.</span>
          <button
            onClick={exitGodMode}
            className="underline font-medium hover:no-underline"
          >
            Quitter le mode Dieu
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-blue-600 to-blue-800 border-r border-blue-500/30 min-h-screen sticky top-0">
        <AdminSidebarContent />
      </aside>

      {/* Mobile + Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar (desktop + mobile) */}
        <header className="h-14 bg-card border-b flex items-center gap-3 px-4 sticky top-0 z-40">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-blue-600 to-blue-800 border-r border-blue-500/30">
              <AdminSidebarContent />
            </SheetContent>
          </Sheet>

          {/* Logo (mobile only) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Administration</span>
          </div>

          {/* Admin name (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Tableau de bord
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-blue-600"
              onClick={() => {
                if (!notifDropdownOpen) setNotifDropdown([])
                setNotifDropdownOpen(!notifDropdownOpen)
              }}
            >
              <Bell className="h-5 w-5" />
              {notifUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {notifUnread > 99 ? '99+' : notifUnread}
                </span>
              )}
            </Button>

            {/* Dropdown */}
            <AnimatePresence>
              {notifDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-xl border shadow-lg z-50 overflow-hidden"
                >
                  {/* Dropdown header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Notifications</span>
                      {notifUnread > 0 && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                          {notifUnread}
                        </Badge>
                      )}
                    </div>
                    {notifUnread > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={async () => {
                          await fetch('/api/admin/notifications', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ markAllRead: true }),
                          })
                          setNotifDropdown(prev => prev.map(n => ({ ...n, isRead: true })))
                          setNotifUnread(0)
                          toast.success('Toutes les notifications marquées comme lues')
                        }}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Tout marquer comme lu
                      </Button>
                    )}
                  </div>

                  {/* Notification list */}
                  <ScrollArea className="max-h-96">
                    {notifLoading ? (
                      <div className="p-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex gap-3">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-3.5 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifDropdown.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">Aucune notification</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifDropdown.map((notif) => (
                          <button
                            key={notif.id}
                            className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors ${
                              !notif.isRead ? 'border-l-[3px] border-l-blue-500 bg-blue-50/30' : ''
                            }`}
                            onClick={async () => {
                              if (!notif.isRead) {
                                await fetch('/api/admin/notifications', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: notif.id }),
                                })
                                setNotifDropdown(prev =>
                                  prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                                )
                                setNotifUnread(prev => Math.max(0, prev - 1))
                              }
                            }}
                          >
                            <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                              notificationTypeColors[notif.type] || 'text-gray-600 bg-gray-100'
                            }`}>
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                                  {notif.title}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[11px] text-muted-foreground/60 mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Footer */}
                  {notifDropdown.length > 0 && (
                    <div className="border-t px-4 py-2.5 bg-muted/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setNotifDropdownOpen(false)
                          const { setAdminTab } = useAppStore.getState()
                          setAdminTab('admin-notifications')
                        }}
                      >
                        Voir toutes les notifications
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-purple-600"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
    case 'admin-admins':
      return <AdminAdmins />
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
    case 'admin-resellers':
      return <AdminResellers />
    case 'admin-upgrades':
      return <AdminUpgradeRequests />
    case 'admin-notifications':
      return <AdminNotifications />
    default:
      return <AdminOverview />
  }
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function AdminOverview() {
  const [stats, setStats] = useState<EnhancedAdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data as EnhancedAdminStats)
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

  const enhancedCards = stats
    ? [
        { label: 'MRR', value: formatCurrency(stats.mrr || 0), icon: <DollarSign className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-rose-600 to-pink-700' },
        { label: 'Abonnements actifs', value: stats.activeSubscriptions || 0, icon: <CheckCircle className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-green-500 to-green-600' },
        { label: 'Taux de churn', value: `${stats.churnRate || 0}%`, icon: <TrendingUp className="h-5 w-5" />, cardBg: stats.churnRate > 10 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600' },
        { label: 'Revendeurs actifs', value: stats.activeResellers || 0, icon: <Building2 className="h-5 w-5" />, cardBg: 'bg-gradient-to-br from-purple-500 to-purple-700' },
      ]
    : []

  const planChartData = stats
    ? [
        { plan: 'Starter', count: stats.revenueByPlan?.STARTER || stats.shopsByPlan?.STARTER || 0, fill: 'var(--color-starter)' },
        { plan: 'Pro', count: stats.revenueByPlan?.PRO || stats.shopsByPlan?.PRO || 0, fill: 'var(--color-pro)' },
        { plan: 'Business', count: stats.revenueByPlan?.BUSINESS || stats.shopsByPlan?.BUSINESS || 0, fill: 'var(--color-business)' },
      ]
    : []

  const chartConfig = {
    starter: { label: 'Starter', color: '#22c55e' },
    pro: { label: 'Pro', color: '#3b82f6' },
    business: { label: 'Business', color: '#f59e0b' },
  }

  const growthChartData = stats?.subscriptionGrowth || []

  const growthChartConfig = {
    newSubscriptions: { label: 'Nouveaux', color: '#22c55e' },
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

      {/* Enhanced Stat Cards */}
      {enhancedCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enhancedCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
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
      )}

      {/* Subscription Growth Chart */}
      {growthChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Croissance des abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthChartConfig} className="h-[200px] w-full">
              <BarChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(v) => String(v)} />
                <YAxis tickFormatter={(v) => String(v)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newSubscriptions" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenus par plan</CardTitle>
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
  const [upgradeDialog, setUpgradeDialog] = useState<{ open: boolean; shopId: string; shopName: string; currentPlan: string }>({ open: false, shopId: '', shopName: '', currentPlan: '' })

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

  async function handleUpgradePlan(shopId: string, newPlan: string) {
    setActionLoading(`${shopId}-upgrade`)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, action: 'upgrade', newPlan }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message || 'Forfait mis à jour !')
        setUpgradeDialog({ open: false, shopId: '', shopName: '', currentPlan: '' })
        loadSubscriptions(statusFilter)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la mise à niveau')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setActionLoading(null)
    }
  }

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
                          size="sm"
                          className="h-8 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1"
                          onClick={() => setUpgradeDialog({ open: true, shopId: sub.shopId, shopName: sub.shopName, currentPlan: sub.plan })}
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          Upgrade
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

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialog.open} onOpenChange={(open) => !open && setUpgradeDialog({ open: false, shopId: '', shopName: '', currentPlan: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-purple-600" />
              Changer le forfait
            </DialogTitle>
            <DialogDescription>
              Boutique : <strong>{upgradeDialog.shopName}</strong> — Actuel : <Badge variant="secondary">{upgradeDialog.currentPlan}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(['STARTER', 'PRO', 'BUSINESS'] as const).map((plan) => {
              const info: Record<string, { label: string; price: string; shops: string; color: string }> = {
                STARTER: { label: 'Starter', price: '5 000', shops: '1 boutique', color: 'border-gray-300 hover:border-gray-400' },
                PRO: { label: 'Pro', price: '8 000', shops: '3 boutiques', color: 'border-cyan-400 hover:border-cyan-500' },
                BUSINESS: { label: 'Business', price: '20 000', shops: '10 boutiques', color: 'border-amber-400 hover:border-amber-500' },
              }
              const p = info[plan]
              const isCurrent = upgradeDialog.currentPlan === plan
              return (
                <button
                  key={plan}
                  disabled={isCurrent || actionLoading !== null}
                  onClick={() => handleUpgradePlan(upgradeDialog.shopId, plan)}
                  className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all text-left ${isCurrent ? 'border-primary bg-primary/5 opacity-60 cursor-not-allowed' : p.color + ' hover:shadow-md cursor-pointer'}`}
                >
                  <div>
                    <p className="font-bold text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.shops}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{p.price} FCFA</p>
                    <p className="text-[10px] text-muted-foreground">/mois</p>
                  </div>
                  {isCurrent && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">Actuel</Badge>
                  )}
                  {!isCurrent && actionLoading === `${upgradeDialog.shopId}-upgrade` && (
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600 ml-2" />
                  )}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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

// ─── NOTIFICATIONS TAB ──────────────────────────────────────────────────────────

function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const typeFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'NEW_SHOP', label: 'Boutiques' },
    { value: 'NEW_ORDER', label: 'Commandes' },
    { value: 'NEW_SELLER', label: 'Vendeurs' },
    { value: 'DOMAIN_REQUEST', label: 'Domaines' },
    { value: 'SUPPORT_TICKET', label: 'Support' },
  ]

  const loadNotifications = useCallback(async (offset = 0) => {
    if (offset === 0) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const params = new URLSearchParams()
      params.set('limit', '20')
      params.set('offset', String(offset))
      if (typeFilter !== 'all') params.set('type', typeFilter)
      const res = await fetch(`/api/admin/notifications?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (offset === 0) {
          setNotifications(data.notifications || [])
        } else {
          setNotifications(prev => [...prev, ...(data.notifications || [])])
        }
        setTotal(data.total || 0)
        setUnreadCount(data.unreadCount || 0)
        setHasMore((offset + 20) < (data.total || 0))
      }
    } catch {
      toast.error('Erreur lors du chargement des notifications')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [typeFilter])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  async function markAsRead(id: string) {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('Toutes les notifications marquées comme lues')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function deleteNotification(id: string) {
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        const notif = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        setTotal(prev => prev - 1)
        if (notif && !notif.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
        toast.success('Notification supprimée')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Centre de Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez et gérez toutes les notifications de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => loadNotifications()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={typeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            className={
              typeFilter === filter.value
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : ''
            }
            onClick={() => setTypeFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucune notification</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {typeFilter !== 'all'
                ? 'Aucune notification ne correspond à ce filtre.'
                : 'Les notifications de la plateforme apparaîtront ici.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className={`flex items-start gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors ${
                      !notif.isRead ? 'border-l-[3px] border-l-blue-500 bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 mt-0.5 ${
                      notificationTypeColors[notif.type] || 'text-gray-600 bg-gray-100'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !notif.isRead && markAsRead(notif.id)}>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="flex items-center justify-center w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDate(notif.createdAt)} · {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => markAsRead(notif.id)}
                          title="Marquer comme lu"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                        onClick={() => deleteNotification(notif.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => loadNotifications(notifications.length)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Charger plus de notifications
              </Button>
            </div>
          )}

          {/* Summary */}
          <p className="text-xs text-muted-foreground text-center">
            {total} notification{total > 1 ? 's' : ''} au total · {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  )
}

// ─── CONFIG TAB ───────────────────────────────────────────────────────────────

function AdminConfig() {
  // Pricing state
  const [starterPrice, setStarterPrice] = useState('')
  const [proPrice, setProPrice] = useState('')
  const [businessPrice, setBusinessPrice] = useState('')
  const [savingPricing, setSavingPricing] = useState(false)

  // Platform config state
  const [config, setConfig] = useState<PlatformConfig>({
    saasName: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    defaultWhatsappMessage: '',
    adminWhatsAppNumber: '',
    standardPrice: 0,
    proPrice: 0,
    starterPrice: 0,
    businessPrice: 0,
    supportEmail: 'contact@boutiko.pro',
    senderName: 'Boutiko',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    emailFrom: '',
    emailFromName: 'Boutiko',
    smtpConfigured: false,
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
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState('')
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null)

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
            adminWhatsAppNumber: data.adminWhatsAppNumber ?? prev.adminWhatsAppNumber,
            standardPrice: data.standardPrice ?? prev.standardPrice,
            proPrice: data.proPrice ?? prev.proPrice,
            starterPrice: data.starterPrice ?? prev.starterPrice,
            businessPrice: data.businessPrice ?? prev.businessPrice,
            supportEmail: data.supportEmail ?? prev.supportEmail,
            senderName: data.senderName ?? prev.senderName,
            smtpHost: data.smtpHost ?? prev.smtpHost,
            smtpPort: data.smtpPort ?? prev.smtpPort,
            smtpUser: data.smtpUser ?? prev.smtpUser,
            smtpPass: data.smtpPass ?? prev.smtpPass,
            emailFrom: data.emailFrom ?? prev.emailFrom,
            emailFromName: data.emailFromName ?? prev.emailFromName,
            smtpConfigured: data.smtpConfigured ?? prev.smtpConfigured,
            autoWelcomeEmail: data.autoWelcomeEmail ?? prev.autoWelcomeEmail,
            notifyNewSeller: data.notifyNewSeller ?? prev.notifyNewSeller,
            notifyNewOrder: data.notifyNewOrder ?? prev.notifyNewOrder,
            notifyDomainRequest: data.notifyDomainRequest ?? prev.notifyDomainRequest,
            notifySupportTicket: data.notifySupportTicket ?? prev.notifySupportTicket,
            weeklyReport: data.weeklyReport ?? prev.weeklyReport,
            lowStockAlerts: data.lowStockAlerts ?? prev.lowStockAlerts,
          }))
          setStarterPrice(String(data.starterPrice || ''))
          setProPrice(String(data.proPrice || ''))
          setBusinessPrice(String(data.businessPrice || ''))
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
        body: JSON.stringify({ starterPrice: Number(starterPrice), proPrice: Number(proPrice), businessPrice: Number(businessPrice) }),
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
          adminWhatsAppNumber: config.adminWhatsAppNumber,
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
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpUser: config.smtpUser,
          smtpPass: config.smtpPass,
          emailFrom: config.emailFrom,
          emailFromName: config.emailFromName,
          smtpConfigured: config.smtpConfigured,
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
              <Label htmlFor="starter-price">Prix Starter (FCFA)</Label>
              <Input
                id="starter-price"
                type="number"
                placeholder="0"
                value={starterPrice}
                onChange={(e) => setStarterPrice(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="business-price">Prix Business (FCFA)</Label>
              <Input
                id="business-price"
                type="number"
                placeholder="0"
                value={businessPrice}
                onChange={(e) => setBusinessPrice(e.target.value)}
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
                    value={config.adminWhatsAppNumber}
                    onChange={(e) => setConfig(prev => ({ ...prev, adminWhatsAppNumber: e.target.value }))}
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
                        placeholder="contact@boutiko.pro"
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

                  {/* SMTP Configuration */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        Configuration SMTP
                      </h4>
                      <Switch
                        checked={config.smtpConfigured}
                        onCheckedChange={(checked) => {
                          setConfig(prev => ({ ...prev, smtpConfigured: checked }))
                          setSmtpTestResult(null)
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Activez le toggle puis remplissez les champs ci-dessous. Si désactivé, les variables d&apos;environnement seront utilisées.
                    </p>

                    <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="smtp-host" className="text-xs">Hôte SMTP</Label>
                            <Input
                              id="smtp-host"
                              placeholder="smtp.example.com"
                              value={config.smtpHost}
                              onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="smtp-port" className="text-xs">Port</Label>
                            <Input
                              id="smtp-port"
                              type="number"
                              value={config.smtpPort}
                              onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="smtp-user" className="text-xs">Utilisateur SMTP</Label>
                            <Input
                              id="smtp-user"
                              placeholder="user@example.com"
                              value={config.smtpUser}
                              onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="smtp-pass" className="text-xs">Mot de passe SMTP</Label>
                            <Input
                              id="smtp-pass"
                              type="password"
                              placeholder="••••••••"
                              value={config.smtpPass}
                              onChange={(e) => setConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email-from" className="text-xs">Email d&apos;expédition</Label>
                            <Input
                              id="email-from"
                              type="email"
                              placeholder="no-reply@boutiko.pro"
                              value={config.emailFrom}
                              onChange={(e) => setConfig(prev => ({ ...prev, emailFrom: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email-from-name" className="text-xs">Nom de l&apos;expéditeur</Label>
                            <Input
                              id="email-from-name"
                              placeholder="Boutiko"
                              value={config.emailFromName}
                              onChange={(e) => setConfig(prev => ({ ...prev, emailFromName: e.target.value }))}
                            />
                          </div>
                        </div>

                        {/* SMTP Test */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setTestingSmtp(true)
                                setSmtpTestResult(null)
                                try {
                                  const res = await fetch('/api/admin/config/test-smtp', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      smtpHost: config.smtpHost,
                                      smtpPort: config.smtpPort,
                                      smtpUser: config.smtpUser,
                                      smtpPass: config.smtpPass,
                                      emailFrom: config.emailFrom,
                                      emailFromName: config.emailFromName,
                                    }),
                                  })
                                  const data = await res.json()
                                  setSmtpTestResult({ success: data.success, message: data.message })
                                } catch {
                                  setSmtpTestResult({ success: false, message: 'Erreur de connexion' })
                                } finally {
                                  setTestingSmtp(false)
                                }
                              }}
                              disabled={testingSmtp || !config.smtpHost || !config.smtpUser || !config.smtpPass}
                              className="gap-2"
                            >
                              {testingSmtp ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Server className="h-4 w-4" />
                              )}
                              Tester la connexion
                            </Button>
                          </div>

                          {/* Send test email */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              value={testEmailTo}
                              onChange={(e) => setTestEmailTo(e.target.value)}
                              className="h-9 max-w-[240px]"
                            />
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                if (!testEmailTo) return
                                setSendingTestEmail(true)
                                setSmtpTestResult(null)
                                try {
                                  const res = await fetch('/api/admin/config/test-smtp', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      mode: 'send',
                                      testEmailTo,
                                      smtpHost: config.smtpHost,
                                      smtpPort: config.smtpPort,
                                      smtpUser: config.smtpUser,
                                      smtpPass: config.smtpPass,
                                      emailFrom: config.emailFrom,
                                      emailFromName: config.emailFromName,
                                    }),
                                  })
                                  const data = await res.json()
                                  setSmtpTestResult({ success: data.success, message: data.message })
                                } catch {
                                  setSmtpTestResult({ success: false, message: 'Erreur de connexion' })
                                } finally {
                                  setSendingTestEmail(false)
                                }
                              }}
                              disabled={sendingTestEmail || !testEmailTo || !config.smtpHost || !config.smtpUser || !config.smtpPass}
                              className="gap-2"
                            >
                              {sendingTestEmail ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                              Envoyer un email de test
                            </Button>
                          </div>

                          {smtpTestResult && (
                            <span className={`text-xs font-medium ${smtpTestResult.success ? 'text-green-600' : 'text-red-600'}`}>
                              {smtpTestResult.success ? '✓' : '✗'} {smtpTestResult.message}
                            </span>
                          )}
                        </div>
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
          setAdminPhone(data.adminWhatsAppNumber || '')
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
  const [forbiddenKeywords, setForbiddenKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [savingKeyword, setSavingKeyword] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/admin/config')
        if (res.ok) {
          const data = await res.json()
          if (data.forbiddenKeywords) {
            try {
              const parsed = JSON.parse(data.forbiddenKeywords)
              setForbiddenKeywords(Array.isArray(parsed) ? parsed : [])
            } catch {
              setForbiddenKeywords([])
            }
          }
        }
      } catch { /* ignore */ }
    }
    loadConfig()
  }, [])

  async function saveKeywords(keywords: string[]) {
    setSavingKeyword(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forbiddenKeywords: JSON.stringify(keywords) }),
      })
      if (res.ok) {
        toast.success('Mots-clés interdits mis à jour')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSavingKeyword(false)
    }
  }

  function addKeyword() {
    const kw = newKeyword.trim().toLowerCase()
    if (!kw) return
    if (forbiddenKeywords.includes(kw)) {
      toast.error('Ce mot-clé existe déjà')
      return
    }
    const updated = [...forbiddenKeywords, kw]
    setForbiddenKeywords(updated)
    setNewKeyword('')
    saveKeywords(updated)
  }

  function removeKeyword(kw: string) {
    const updated = forbiddenKeywords.filter(k => k !== kw)
    setForbiddenKeywords(updated)
    saveKeywords(updated)
  }

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

      {/* Forbidden Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mots-clés interdits</CardTitle>
          <CardDescription>Gérez les mots-clés interdits dans les noms de boutiques et produits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un mot-clé..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
              disabled={savingKeyword}
            />
            <Button onClick={addKeyword} disabled={savingKeyword || !newKeyword.trim()} className="bg-blue-600 hover:bg-blue-700 shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
          {forbiddenKeywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun mot-clé interdit défini.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {forbiddenKeywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    disabled={savingKeyword}
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; user: AdminUser | null; reason: string }>({ open: false, user: null, reason: '' })

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

  async function handleGodMode(u: AdminUser) {
    if (!confirm(`Vous allez prendre le contrôle du compte de ${u.name}. Continuez ?`)) return
    setActionLoading(`god-${u.id}`)
    try {
      const res = await fetch('/api/admin/god-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id }),
      })
      if (res.ok) {
        toast.success(`Mode Dieu activé pour ${u.name}`)
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de l\'activation du mode Dieu')
      }
    } catch {
      toast.error('Erreur lors de l\'activation du mode Dieu')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSuspend() {
    if (!suspendDialog.user || !suspendDialog.reason.trim()) {
      toast.error('Veuillez saisir une raison de suspension')
      return
    }
    setActionLoading(`suspend-${suspendDialog.user.id}`)
    try {
      const res = await fetch(`/api/admin/users/${suspendDialog.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend', reason: suspendDialog.reason }),
      })
      if (res.ok) {
        toast.success(`Utilisateur ${suspendDialog.user.name} suspendu`)
        setSuspendDialog({ open: false, user: null, reason: '' })
        loadUsers(search)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la suspension')
      }
    } catch {
      toast.error('Erreur lors de la suspension')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUnsuspend(u: AdminUser) {
    setActionLoading(`unsuspend-${u.id}`)
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsuspend' }),
      })
      if (res.ok) {
        toast.success(`Utilisateur ${u.name} réactivé`)
        loadUsers(search)
      } else {
        toast.error('Erreur lors de la réactivation')
      }
    } catch {
      toast.error('Erreur lors de la réactivation')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteUser(u: AdminUser) {
    if (!confirm(`Supprimer l'utilisateur "${u.name}" ? Cette action est irréversible.`)) return
    setActionLoading(`delete-${u.id}`)
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Utilisateur "${u.name}" supprimé`)
        loadUsers(search)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setActionLoading(null)
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
                  <TableHead>Rôle</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Produits</TableHead>
                  <TableHead className="text-center">Commandes</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{u.name}</span>
                        {u.isSuspended && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px]">Suspendu</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.shop?.name || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {u.shop ? (
                        <Badge variant={planVariant(u.shop.plan)}>{u.shop.plan}</Badge>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">{u.shop?.productCount ?? '—'}</TableCell>
                    <TableCell className="text-center">{(u.shop?.orderCount ?? u.orderCount) ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Mode Dieu"
                          onClick={() => handleGodMode(u)}
                          disabled={actionLoading === `god-${u.id}`}
                        >
                          {actionLoading === `god-${u.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 text-purple-600" />}
                        </Button>
                        {u.isSuspended ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Réactiver"
                            onClick={() => handleUnsuspend(u)}
                            disabled={actionLoading === `unsuspend-${u.id}`}
                          >
                            {actionLoading === `unsuspend-${u.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-emerald-600" />}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Suspendre"
                            onClick={() => setSuspendDialog({ open: true, user: u, reason: '' })}
                          >
                            <Ban className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Supprimer"
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading === `delete-${u.id}`}
                        >
                          {actionLoading === `delete-${u.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              Suspendre le compte de &quot;{suspendDialog.user?.name}&quot;. L&apos;utilisateur ne pourra plus se connecter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Raison de la suspension</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Expliquez pourquoi cet utilisateur est suspendu..."
                value={suspendDialog.reason}
                onChange={(e) => setSuspendDialog(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog({ open: false, user: null, reason: '' })}>Annuler</Button>
            <Button onClick={handleSuspend} disabled={actionLoading === `suspend-${suspendDialog.user?.id}`} className="bg-amber-600 hover:bg-amber-700">
              {actionLoading === `suspend-${suspendDialog.user?.id}` && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
  const [ownerMode, setOwnerMode] = useState<'existing' | 'new'>('new')
  const [newOwnerName, setNewOwnerName] = useState('')
  const [newOwnerEmail, setNewOwnerEmail] = useState('')
  const [newOwnerPassword, setNewOwnerPassword] = useState('')
  const [newShopPlan, setNewShopPlan] = useState('FREE')
  const [creatingShop, setCreatingShop] = useState(false)
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string; shopUrl: string } | null>(null)
  const [sellerUsers, setSellerUsers] = useState<{ id: string; name: string; email: string }[]>([])


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

  async function loadSellerUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setSellerUsers((data.users || []).filter((u: any) => u.role === 'SELLER'))
      }
    } catch { /* ignore */ }
  }

  async function handleCreateShop() {
    if (!newShopName.trim() || !newShopSlug.trim() || !newShopWhatsapp.trim()) {
      toast.error('Remplissez le nom, slug et WhatsApp')
      return
    }
    if (ownerMode === 'existing' && !newShopOwnerId.trim()) {
      toast.error('Sélectionnez un propriétaire')
      return
    }
    if (ownerMode === 'new' && (!newOwnerName.trim() || !newOwnerEmail.trim() || !newOwnerPassword.trim())) {
      toast.error('Remplissez le nom, email et mot de passe du propriétaire')
      return
    }
    if (ownerMode === 'new' && newOwnerPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setCreatingShop(true)
    setLastCredentials(null)
    try {
      const body: Record<string, string> = { name: newShopName, slug: newShopSlug, whatsapp: newShopWhatsapp, plan: newShopPlan }
      if (ownerMode === 'existing') {
        body.ownerId = newShopOwnerId
      } else {
        body.ownerName = newOwnerName
        body.ownerEmail = newOwnerEmail
        body.ownerPassword = newOwnerPassword
      }
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Boutique créée avec succès !')
        if (data.credentials) {
          setLastCredentials(data.credentials)
        } else {
          setShowCreateShop(false)
          resetCreateForm()
        }
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

  function resetCreateForm() {
    setNewShopName('')
    setNewShopSlug('')
    setNewShopWhatsapp('')
    setNewShopOwnerId('')
    setNewShopPlan('FREE')
    setNewOwnerName('')
    setNewOwnerEmail('')
    setNewOwnerPassword('')
    setLastCredentials(null)
  }

  function sendViaWhatsApp() {
    if (!lastCredentials || !newShopWhatsapp) return
    const phone = newShopWhatsapp.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Bonjour ! 🎉\n\nVotre boutique *${newShopName}* a été créée sur Boutiko.\n\n` +
      `🔑 *Identifiants de connexion :*\n📧 Email : ${lastCredentials.email}\n🔐 Mot de passe : ${lastCredentials.password}\n\n` +
      `🌐 Votre boutique : ${lastCredentials.shopUrl}\n\n` +
      `Connectez-vous et commencez à vendre ! 🚀`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
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
            <SelectItem value="STARTER">Starter</SelectItem>
            <SelectItem value="PRO">Pro</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
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
              <Label>Plan</Label>
              <Select value={newShopPlan} onValueChange={setNewShopPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Gratuit</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Propriétaire</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={ownerMode === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setOwnerMode('new'); loadSellerUsers() }}
                  className={ownerMode === 'new' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >Nouveau vendeur</Button>
                <Button
                  type="button"
                  variant={ownerMode === 'existing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setOwnerMode('existing'); loadSellerUsers() }}
                  className={ownerMode === 'existing' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >Vendeur existant</Button>
              </div>
              {ownerMode === 'new' ? (
                <div className="space-y-3">
                  <Input placeholder="Nom du vendeur" value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} />
                  <Input placeholder="Email" type="email" value={newOwnerEmail} onChange={(e) => setNewOwnerEmail(e.target.value)} />
                  <Input placeholder="Mot de passe (min 6 caractères)" type="text" value={newOwnerPassword} onChange={(e) => setNewOwnerPassword(e.target.value)} />
                </div>
              ) : (
                <Select value={newShopOwnerId} onValueChange={setNewShopOwnerId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un vendeur" /></SelectTrigger>
                  <SelectContent>
                    {sellerUsers.length === 0 ? (
                      <SelectItem value="_none" disabled>Aucun vendeur disponible</SelectItem>
                    ) : sellerUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          {/* Credentials + WhatsApp Send */}
          {lastCredentials && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-800">✅ Boutique créée — Identifiants du vendeur :</p>
              <div className="text-sm space-y-1 text-emerald-700">
                <p>📧 Email : <span className="font-mono font-semibold">{lastCredentials.email}</span></p>
                <p>🔐 Mot de passe : <span className="font-mono font-semibold">{lastCredentials.password}</span></p>
                <p>🌐 Boutique : <span className="font-mono">{lastCredentials.shopUrl}</span></p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={sendViaWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Envoyer par WhatsApp
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateShop(false); resetCreateForm() }}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
          {!lastCredentials && (
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateShop(false); resetCreateForm() }}>Annuler</Button>
              <Button onClick={handleCreateShop} disabled={creatingShop} className="bg-blue-600 hover:bg-blue-700">
                {creatingShop && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── ORDERS TAB ──────────────────────────────────────────────────────────────

const adminStatusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
]

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors du chargement des commandes')
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(statusFilter, search)
    }, 30_000)
    return () => clearInterval(interval)
  }, [statusFilter, search, loadOrders])

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
        toast.success(`Statut mis à jour : ${statusConfig[newStatus]?.label || newStatus}`)
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpdatingId(null)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'PENDING': return <Clock className="h-3.5 w-3.5" />
      case 'CONFIRMED': return <Package className="h-3.5 w-3.5" />
      case 'DELIVERED': return <CheckCircle className="h-3.5 w-3.5" />
      case 'CANCELLED': return <XCircle className="h-3.5 w-3.5" />
      default: return null
    }
  }

  function parseItems(itemsStr: string) {
    try { return JSON.parse(itemsStr) } catch { return [] }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Commandes</h2>
        <Button variant="outline" size="sm" onClick={() => loadOrders(statusFilter, search)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

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
                  <TableHead className="text-center">Actions</TableHead>
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
                      <TableCell className="text-center">
                        <Select
                          value={o.status}
                          onValueChange={(val) => updateOrderStatus(o.id, val)}
                          disabled={updatingId === o.id}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            {updatingId === o.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {adminStatusOptions.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
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

// ─── SUPER ADMINS TAB ──────────────────────────────────────────────────

interface AdminAccount {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

function AdminAdmins() {
  const { user } = useAppStore()
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' })

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/admins')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des administrateurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Tous les champs sont requis')
      return
    }
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(`Compte ${form.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'} créé avec succès`)
        setForm({ name: '', email: '', password: '', role: 'ADMIN' })
        loadAdmins()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(id)
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Administrateur supprimé')
        loadAdmins()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleteLoading(null)
    }
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Super Admins</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les comptes administrateurs de la plateforme
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {admins.length} admin{admins.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Create form */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Créer un compte admin
            </CardTitle>
            <CardDescription>
              Ajoutez un nouvel administrateur ou super admin à la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Nom complet</Label>
                  <Input
                    id="admin-name"
                    placeholder="Ex: Super Admin"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@terangaflow.app"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mot de passe</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Rôle</Label>
                  <Select value={form.role} onValueChange={(val) => setForm(prev => ({ ...prev, role: val }))}>
                    <SelectTrigger id="admin-role">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Créer le compte
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admin list */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : admins.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun administrateur trouvé</p>
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
                  <TableHead>Rôle</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      {admin.role === 'SUPER_ADMIN' ? (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border-0">
                          <Crown className="h-3 w-3 mr-1" />
                          SUPER ADMIN
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          ADMIN
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(admin.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(admin.id)}
                          disabled={deleteLoading === admin.id || admin.id === user?.id}
                          title={admin.id === user?.id ? 'Vous ne pouvez pas supprimer votre compte' : 'Supprimer'}
                        >
                          {deleteLoading === admin.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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

// ─── RESELLERS TAB ──────────────────────────────────────────────────────────

interface AdminReseller {
  id: string
  name: string
  email: string
  companyName: string
  commission: number
  clientCount: number
  isActive: boolean
  primaryColor: string
  createdAt: string
}

function AdminResellers() {
  const [resellers, setResellers] = useState<AdminReseller[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', companyName: '', commission: '' })
  const [creating, setCreating] = useState(false)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState<{ id: string; companyName: string; primaryColor: string; commission: string; isActive: boolean }>({ id: '', companyName: '', primaryColor: '', commission: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const loadResellers = useCallback(async (s: string, st: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      if (st && st !== 'all') params.set('status', st)
      const res = await fetch(`/api/admin/resellers?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResellers(data.resellers || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des revendeurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResellers(search, statusFilter)
  }, [search, statusFilter, loadResellers])

  async function handleCreate() {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim() || !createForm.companyName.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          companyName: createForm.companyName,
          commission: Number(createForm.commission) || 0,
        }),
      })
      if (res.ok) {
        toast.success('Revendeur créé avec succès')
        setShowCreateDialog(false)
        setCreateForm({ name: '', email: '', password: '', companyName: '', commission: '' })
        loadResellers(search, statusFilter)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  function openEditDialog(r: AdminReseller) {
    setEditForm({
      id: r.id,
      companyName: r.companyName,
      primaryColor: r.primaryColor,
      commission: String(r.commission),
      isActive: r.isActive,
    })
    setShowEditDialog(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/resellers/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: editForm.companyName,
          primaryColor: editForm.primaryColor,
          commission: Number(editForm.commission) || 0,
          isActive: editForm.isActive,
        }),
      })
      if (res.ok) {
        toast.success('Revendeur mis à jour')
        setShowEditDialog(false)
        loadResellers(search, statusFilter)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const filteredResellers = statusFilter === 'all'
    ? resellers
    : resellers.filter(r => statusFilter === 'active' ? r.isActive : !r.isActive)

  const totalClients = resellers.reduce((sum, r) => sum + (r.clientCount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Revendeurs</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un revendeur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{resellers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total revendeurs</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{resellers.filter(r => r.isActive).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Revendeurs actifs</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold">{totalClients}</p>
          <p className="text-xs text-muted-foreground mt-1">Total clients</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
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
      ) : filteredResellers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun revendeur trouvé</p>
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
                  <TableHead>Entreprise</TableHead>
                  <TableHead className="text-center">Commission</TableHead>
                  <TableHead className="text-center">Clients</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResellers.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>{r.companyName}</TableCell>
                    <TableCell className="text-center">{r.commission}%</TableCell>
                    <TableCell className="text-center">{r.clientCount || 0}</TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? 'outline' : 'secondary'} className={r.isActive ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}>
                        {r.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(r)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setActionLoading(r.id)
                            fetch(`/api/admin/resellers/${r.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isActive: !r.isActive }),
                            }).then(res => {
                              if (res.ok) {
                                toast.success(r.isActive ? 'Revendeur désactivé' : 'Revendeur activé')
                                loadResellers(search, statusFilter)
                              }
                            }).catch(() => toast.error('Erreur')).finally(() => setActionLoading(null))
                          }}
                          disabled={actionLoading === r.id}
                          title={r.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {actionLoading === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className={`h-4 w-4 ${r.isActive ? 'text-amber-600' : 'text-emerald-600'}`} />}
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un revendeur</DialogTitle>
            <DialogDescription>Ajoutez un nouveau revendeur à la plateforme.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-reseller-name">Nom</Label>
              <Input id="create-reseller-name" placeholder="Nom complet" value={createForm.name} onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-reseller-email">Email</Label>
              <Input id="create-reseller-email" type="email" placeholder="email@exemple.com" value={createForm.email} onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-reseller-password">Mot de passe</Label>
              <Input id="create-reseller-password" type="password" placeholder="Mot de passe" value={createForm.password} onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-reseller-company">Nom de l&apos;entreprise</Label>
              <Input id="create-reseller-company" placeholder="Ma société" value={createForm.companyName} onChange={(e) => setCreateForm(prev => ({ ...prev, companyName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-reseller-commission">Commission (%)</Label>
              <Input id="create-reseller-commission" type="number" placeholder="10" value={createForm.commission} onChange={(e) => setCreateForm(prev => ({ ...prev, commission: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-blue-600 hover:bg-blue-700">
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le revendeur</DialogTitle>
            <DialogDescription>Mettez à jour les informations du revendeur.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reseller-company">Nom de l&apos;entreprise</Label>
              <Input id="edit-reseller-company" value={editForm.companyName} onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reseller-color">Couleur principale</Label>
              <div className="flex items-center gap-2">
                <Input id="edit-reseller-color" placeholder="#3b82f6" value={editForm.primaryColor} onChange={(e) => setEditForm(prev => ({ ...prev, primaryColor: e.target.value }))} className="flex-1" />
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: editForm.primaryColor }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reseller-commission">Commission (%)</Label>
              <Input id="edit-reseller-commission" type="number" placeholder="10" value={editForm.commission} onChange={(e) => setEditForm(prev => ({ ...prev, commission: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Actif</Label>
                <p className="text-xs text-muted-foreground">Le revendeur peut se connecter</p>
              </div>
              <Switch checked={editForm.isActive} onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
