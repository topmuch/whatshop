'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Users,
  Settings,
  Plus,
  Copy,
  Check,
  Building2,
  Palette,
  DollarSign,
  ShoppingCart,
  Store,
  TrendingUp,
  Loader2,
  RefreshCw,
  LogOut,
  Menu,
  Sun,
  Moon,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useThemeMode } from '@/lib/use-theme'

// ── Types ────────────────────────────────────────────────────────────────────

interface ResellerClient {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  subscription: {
    planType: string
    status: string
    maxShops: number
  } | null
  shops: {
    id: string
    name: string
    slug: string
    isActive: boolean
    plan: string
  }[]
  shopCount: number
  orderCount: number
}

interface ResellerProfile {
  id: string
  companyName: string | null
  logoUrl: string | null
  primaryColor: string
  commission: number
  isActive: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, number> = {
  STARTER: 5000,
  PRO: 15000,
  BUSINESS: 30000,
}

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
}

const PLAN_BADGE_CLASSES: Record<string, string> = {
  STARTER: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
  PRO: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  BUSINESS: 'bg-green-100 text-green-800 hover:bg-green-100',
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  TRIAL: 'Essai',
  EXPIRED: 'Expiré',
  INACTIVE: 'Inactif',
}

const SUBSCRIPTION_STATUS_BADGE_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 hover:bg-green-100',
  TRIAL: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  EXPIRED: 'bg-red-100 text-red-800 hover:bg-red-100',
  INACTIVE: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
}

type ResellerTab = 'clients' | 'settings'

// ── Helper: generate random password ─────────────────────────────────────────

function generatePassword(length = 14): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// ── Helper: format date ──────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ── Helper: format currency ──────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

// ── Sidebar Navigation ───────────────────────────────────────────────────────

const sidebarNavItems: {
  id: ResellerTab
  label: string
  icon: React.ReactNode
}[] = [
  { id: 'clients', label: 'Mes clients', icon: <Users className="h-5 w-5" /> },
  { id: 'settings', label: 'Marque blanche', icon: <Settings className="h-5 w-5" /> },
]

function ResellerSidebarContent({
  activeTab,
  onTabChange,
}: {
  activeTab: ResellerTab
  onTabChange: (tab: ResellerTab) => void
}) {
  const { user, setUser, setShop, setView } = useAppStore()

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
    } catch {
      /* ignore */
    }
    document.cookie = 'boutiko-user=; path=/; max-age=0'
    setUser(null)
    setShop(null)
    setView('landing')
    window.history.replaceState(null, '', '/')
    window.location.replace('/')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-white">Revendeur</span>
      </div>

      <Separator className="bg-white/15" />

      {user && (
        <div className="px-6 py-3">
          <p className="text-sm text-white/80 truncate">{user.name}</p>
          <p className="text-xs text-white/50 truncate">{user.email}</p>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {sidebarNavItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 h-11 px-3 ${
                activeTab === item.id
                  ? 'bg-white/20 text-white font-medium hover:bg-white/25'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/15" />

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

// ── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards({ clients }: { clients: ResellerClient[] }) {
  const totalClients = clients.length
  const activeClients = clients.filter(
    (c) => c.subscription?.status === 'ACTIVE'
  ).length
  const estimatedRevenue = clients.reduce((sum, client) => {
    const planType = client.subscription?.planType || 'STARTER'
    const price = PLAN_PRICES[planType] || 0
    if (client.subscription?.status === 'ACTIVE' || client.subscription?.status === 'TRIAL') {
      return sum + price
    }
    return sum
  }, 0)

  const stats = [
    {
      label: 'Total clients',
      value: totalClients,
      icon: <Users className="h-5 w-5" />,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
    {
      label: 'Clients actifs',
      value: activeClients,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Revenu estimé',
      value: formatCurrency(estimatedRevenue),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Clients Table ────────────────────────────────────────────────────────────

function ClientsTable({
  clients,
  loading,
  onRefresh,
}: {
  clients: ResellerClient[]
  loading: boolean
  onRefresh: () => void
}) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <p className="text-sm text-muted-foreground">
            Chargement des clients...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-pink-600" />
          Liste des clients
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              Aucun client pour le moment
            </p>
            <p className="text-muted-foreground/60 text-xs">
              Créez votre premier client pour commencer
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nom</TableHead>
                  <TableHead className="min-w-[180px]">Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="min-w-[130px]">Statut</TableHead>
                  <TableHead className="text-center">Boutiques</TableHead>
                  <TableHead className="text-center">Commandes</TableHead>
                  <TableHead className="min-w-[120px]">Date création</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {client.email}
                    </TableCell>
                    <TableCell>
                      {client.subscription ? (
                        <Badge
                          className={
                            PLAN_BADGE_CLASSES[
                              client.subscription.planType
                            ] || 'bg-gray-100 text-gray-800'
                          }
                        >
                          {PLAN_LABELS[client.subscription.planType] ||
                            client.subscription.planType}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Aucun plan
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.subscription ? (
                        <Badge
                          className={
                            SUBSCRIPTION_STATUS_BADGE_CLASSES[
                              client.subscription.status
                            ] || 'bg-gray-100 text-gray-700'
                          }
                        >
                          {SUBSCRIPTION_STATUS_LABELS[
                            client.subscription.status
                          ] || client.subscription.status}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Aucun
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{client.shopCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{client.orderCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(client.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Create Client Dialog ─────────────────────────────────────────────────────

function CreateClientDialog({
  open,
  onOpenChange,
  onClientCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState('STARTER')
  const [submitting, setSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  function handleAutoGenerate() {
    setPassword(generatePassword())
  }

  function handleCopyEmail() {
    if (createdCredentials) {
      navigator.clipboard.writeText(createdCredentials.email)
      setCopiedEmail(true)
      toast.success('Email copié !')
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  function handleCopyPassword() {
    if (createdCredentials) {
      navigator.clipboard.writeText(createdCredentials.password)
      setCopiedPassword(true)
      toast.success('Mot de passe copié !')
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  function handleCopyAll() {
    if (createdCredentials) {
      const text = `Email: ${createdCredentials.email}\nMot de passe: ${createdCredentials.password}`
      navigator.clipboard.writeText(text)
      toast.success('Identifiants copiés !')
    }
  }

  function resetForm() {
    setName('')
    setEmail('')
    setPassword('')
    setPlan('STARTER')
    setCreatedCredentials(null)
    setCopiedEmail(false)
    setCopiedPassword(false)
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    if (!email.trim()) {
      toast.error("L'email est requis")
      return
    }
    if (!password || password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reseller/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          plan,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors de la création du client')
        return
      }

      const data = await res.json()
      setCreatedCredentials({
        email: email.trim().toLowerCase(),
        password,
      })
      toast.success(`Client "${name.trim()}" créé avec succès !`)
      onClientCreated()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-pink-600" />
            {createdCredentials
              ? 'Client créé avec succès'
              : 'Créer un nouveau client'}
          </DialogTitle>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
              <p className="text-sm font-medium text-green-800">
                Voici les identifiants de connexion du nouveau client. Partagez-les
                avec lui en toute sécurité.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-24 shrink-0">
                    Email
                  </Label>
                  <div className="flex-1 flex items-center gap-1.5 bg-white rounded-md border px-3 py-2">
                    <span className="text-sm font-mono truncate flex-1">
                      {createdCredentials.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={handleCopyEmail}
                    >
                      {copiedEmail ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-24 shrink-0">
                    Mot de passe
                  </Label>
                  <div className="flex-1 flex items-center gap-1.5 bg-white rounded-md border px-3 py-2">
                    <span className="text-sm font-mono truncate flex-1">
                      {createdCredentials.password}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={handleCopyPassword}
                    >
                      {copiedPassword ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCopyAll}
            >
              <Copy className="h-4 w-4" />
              Copier tous les identifiants
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nom complet</Label>
              <Input
                id="client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">Adresse email</Label>
              <Input
                id="client-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-password">Mot de passe</Label>
              <div className="flex gap-2">
                <Input
                  id="client-password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  className="flex-1 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoGenerate}
                  className="shrink-0 gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Générer</span>
                </Button>
              </div>
              {password && password.length < 8 && (
                <p className="text-xs text-red-500">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plan d&apos;abonnement</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTER">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>Starter</span>
                      <span className="text-xs text-muted-foreground">
                        5 000 FCFA/mois
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PRO">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>Pro</span>
                      <span className="text-xs text-muted-foreground">
                        15 000 FCFA/mois
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="BUSINESS">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>Business</span>
                      <span className="text-xs text-muted-foreground">
                        30 000 FCFA/mois
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className={createdCredentials ? 'gap-2' : undefined}>
          {createdCredentials ? (
            <Button onClick={() => handleDialogClose(false)} className="gap-2">
              <Check className="h-4 w-4" />
              Terminé
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleDialogClose(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Créer le client
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── White-label Settings Panel ───────────────────────────────────────────────

function WhiteLabelSettings() {
  const [profile, setProfile] = useState<ResellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#ec4899')
  const [commission, setCommission] = useState('15')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reseller')
      if (res.ok) {
        const data: ResellerProfile = await res.json()
        setProfile(data)
        setCompanyName(data.companyName || '')
        setLogoUrl(data.logoUrl || '')
        setPrimaryColor(data.primaryColor || '#ec4899')
        setCommission(String(data.commission))
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors du chargement du profil')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleSave() {
    const commissionValue = parseFloat(commission)
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 50) {
      toast.error('La commission doit être entre 0 et 50%')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/reseller', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim() || null,
          logoUrl: logoUrl.trim() || null,
          primaryColor,
          commission: commissionValue,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors de la sauvegarde')
        return
      }

      const data: ResellerProfile = await res.json()
      setProfile(data)
      toast.success('Paramètres de marque blanche mis à jour !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <p className="text-sm text-muted-foreground">
            Chargement des paramètres...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-pink-600" />
          Paramètres de marque blanche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nom de l&apos;entreprise</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Ma Plateforme Commerce"
            />
            <p className="text-xs text-muted-foreground">
              Ce nom sera affiché à vos clients dans l&apos;interface
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url">URL du logo</Label>
            <div className="flex gap-2">
              <Input
                id="logo-url"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemple.com/logo.png"
                className="flex-1"
              />
            </div>
            {logoUrl && (
              <div className="mt-2 rounded-lg border border-muted overflow-hidden bg-muted/20 p-3">
                <img
                  src={logoUrl}
                  alt="Aperçu du logo"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-color">Couleur principale</Label>
            <div className="flex items-center gap-3">
              <input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 rounded-md border cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#ec4899"
                className="flex-1 font-mono"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisée pour personnaliser l&apos;apparence de la plateforme
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Commission (%)</Label>
            <Input
              id="commission"
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="15"
            />
            <p className="text-xs text-muted-foreground">
              Votre commission sur chaque abonnement client (0 à 50%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
          {profile && (
            <Badge
              className={
                profile.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : 'bg-red-100 text-red-800 hover:bg-red-100'
              }
            >
              {profile.isActive ? 'Compte actif' : 'Compte inactif'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ResellerDashboard() {
  const { user, setUser, setShop, setView } = useAppStore()
  const [activeTab, setActiveTab] = useState<ResellerTab>('clients')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<ResellerClient[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { isDark, toggleTheme } = useThemeMode()

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reseller/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors du chargement des clients')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok && !cancelled) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          } else {
            setView('landing')
            return
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (user) {
      setLoading(false)
    } else {
      loadSession()
    }
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  function handleTabChange(tab: string) {
    setActiveTab(tab as ResellerTab)
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const sidebarContent = (
    <ResellerSidebarContent
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  )

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-purple-600 to-pink-600 border-r border-purple-400/30 min-h-screen sticky top-0">
        {sidebarContent}
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
            <SheetContent
              side="left"
              className="w-64 p-0 bg-gradient-to-b from-purple-600 to-pink-600 border-r border-purple-400/30"
            >
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-pink-500 text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Espace Revendeur</span>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-purple-600"
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Tableau de bord revendeur
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez vos clients et configurez votre plateforme en marque blanche
                </p>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4" />
                Créer un nouveau client
              </Button>
            </div>

            {/* Stats cards — always visible */}
            <StatsCards clients={clients} />

            {/* Tabs: Clients / Settings */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="lg:hidden">
                <TabsList className="w-full">
                  <TabsTrigger value="clients" className="flex-1 gap-2">
                    <Users className="h-4 w-4" />
                    Clients
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1 gap-2">
                    <Settings className="h-4 w-4" />
                    Marque blanche
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="clients" className="mt-4 space-y-4">
                <ClientsTable
                  clients={clients}
                  loading={loading}
                  onRefresh={fetchClients}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <WhiteLabelSettings />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Actual Create Client Dialog (controlled separately) */}
      <CreateClientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onClientCreated={fetchClients}
      />
    </div>
  )
}