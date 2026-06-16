'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FacebookStatus } from '@/components/integrations/facebook-status'
import { SocialPublish } from './social-publish'
import {
  Facebook,
  BarChart3,
  Music2,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  Radio,
  Rss,
  MessageSquare,
  Store,
} from 'lucide-react'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type View = 'hub' | 'wizard' | 'catalog' | 'social'

interface CatalogProduct {
  id: string
  name: string
  price: number
  image?: string
  status: 'synced' | 'error' | 'pending'
}

/* ------------------------------------------------------------------ */
/*  Integration card definitions                                       */
/* ------------------------------------------------------------------ */

const INTEGRATIONS = [
  {
    id: 'facebook',
    name: 'Facebook & Instagram',
    description: 'Synchronisez vos produits et trackez vos publicités',
    icon: <Facebook className="size-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'google',
    name: 'Google Analytics',
    description: 'Suivez le trafic de votre boutique',
    icon: <BarChart3 className="size-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    comingSoon: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    description: 'Vendez sur TikTok',
    icon: <Music2 className="size-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    comingSoon: true,
  },
  {
    id: 'email',
    name: 'Email Marketing',
    description: 'Newsletters et campagnes email',
    icon: <MessageSquare className="size-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    comingSoon: true,
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro')
  : 'https://boutiko.pro'

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Jamais'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

/* ================================================================== */
/*  HUB VIEW — All integrations                                       */
/* ================================================================== */

function HubView({ onOpen }: { onOpen: (id: string) => void }) {
  const shop = useAppStore((s) => s.shop)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Intégrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connectez vos outils marketing pour booster vos ventes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((item) => {
          const isFacebook = item.id === 'facebook'
          const isConnected = isFacebook && !!shop?.facebookConnected

          return (
            <Card key={item.id} className={`relative overflow-hidden ${item.comingSoon ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 ${item.bgColor}`}>
                    <span className={item.color}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      {item.comingSoon && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">Bientôt</Badge>
                      )}
                      {isConnected && (
                        <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5">
                          <CheckCircle2 className="size-3 mr-0.5" />Connecté
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{item.description}</p>

                    {isFacebook && !isConnected && (
                      <Button size="sm" className="h-8 text-xs" onClick={() => onOpen('facebook')}>
                        <Facebook className="size-3.5 mr-1.5" />
                        Connecter
                      </Button>
                    )}

                    {isFacebook && isConnected && (
                      <div className="space-y-2">
                        <FacebookStatus />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => onOpen('facebook')}
                        >
                          Voir le dashboard
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  3-STEP WIZARD VIEW                                                */
/* ================================================================== */

function WizardView({ onBack, onOpenSocial }: { onBack: () => void; onOpenSocial: () => void }) {
  const shop = useAppStore((s) => s.shop)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [catalogEnabled, setCatalogEnabled] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Detect if user just returned from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('fb_success')) {
      toast.success(`Page "${params.get('fb_page') || 'Facebook'}" connectée !`)
      // Clean URL
      window.history.replaceState({}, '', '/dashboard')
      setStep(2) // Jump to catalog config
    }
    if (params.get('fb_error')) {
      toast.error('Erreur de connexion Facebook. Réessayez.')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  const handleOAuth = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/facebook/oauth')
      if (res.redirected) {
        window.location.href = res.url
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur de connexion')
        setLoading(false)
      }
    } catch {
      toast.error('Erreur réseau')
      setLoading(false)
    }
  }

  const handleActivateCatalog = async () => {
    if (!shop?.id) return
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogEnabled: true }),
      })
      if (res.ok) {
        setCatalogEnabled(true)
        toast.success('Catalogue activé !')
        setStep(3)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleForceSync = async () => {
    if (!shop?.id) return
    setSyncing(true)
    try {
      const res = await fetch('/api/facebook/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id }),
      })
      if (res.ok) {
        toast.success('Synchronisation lancée !')
        window.location.reload()
      }
    } catch {
      toast.error('Erreur de synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  const catalogUrl = shop?.id ? `${BASE_URL}/api/catalog/${shop.id}` : ''
  const productCount = shop?.catalogProductCount ?? 0

  // ── Step indicators ──
  const steps = [
    { num: 1, label: 'Connexion' },
    { num: 2, label: 'Catalogue' },
    { num: 3, label: 'WhatsApp' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Facebook className="size-5 text-blue-600" />
            Intégration Facebook
          </h2>
          <p className="text-sm text-muted-foreground">
            Connectez en 3 étapes simples
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center size-8 rounded-full text-sm font-bold transition-colors ${
                step >= s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 ${step > s.num ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ──────────────────────────── ÉTAPE 1 ──────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <Facebook className="size-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Connectez votre page Facebook</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous allons récupérer les informations de votre page Facebook.
                  Aucune publication ne sera faite sans votre accord.
                </p>
              </div>
            </div>

            {shop?.facebookConnected ? (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Page connectée</span>
                </div>
                <p className="text-sm text-green-700/80 dark:text-green-400/80 pl-7">
                  {shop.facebookPageName}
                </p>
              </div>
            ) : (
              <Button
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                onClick={handleOAuth}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Facebook className="size-4 mr-2" />
                )}
                Se connecter avec Facebook
              </Button>
            )}

            {(shop?.facebookConnected || catalogEnabled) && (
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={() => setStep(2)}
              >
                Continuer <ArrowRight className="size-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ──────────────────────────── ÉTAPE 2 ──────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                <Rss className="size-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Configurez le catalogue</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Vos produits seront visibles sur Facebook dans ~2 heures.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Catalog toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">Synchroniser tous les produits</p>
                  <p className="text-xs text-muted-foreground">
                    Tous les produits actifs seront envoyés sur Facebook
                  </p>
                </div>
                <Switch
                  checked={catalogEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCatalogEnabled(true)
                    }
                  }}
                />
              </div>

              {catalogEnabled && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-amber-600" />
                    <span className="font-medium">{productCount} produits seront synchronisés</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le flux XML sera disponible à l&apos;adresse ci-dessous.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 text-xs bg-white dark:bg-gray-800 rounded px-3 py-2 truncate border">
                      {catalogUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(catalogUrl)
                        toast.success('URL copiée !')
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4 mr-2" /> Retour
              </Button>
              <Button
                className="flex-1 h-10"
                disabled={!catalogEnabled || loading}
                onClick={handleActivateCatalog}
              >
                {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                Activer la synchronisation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──────────────────────────── ÉTAPE 3 ──────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <MessageCircle className="size-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Commandes via WhatsApp</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Vos clients seront redirigés vers WhatsApp pour commander.
                </p>
              </div>
            </div>

            {/* WhatsApp info */}
            <div className="space-y-3">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                    <MessageCircle className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Numéro WhatsApp</p>
                    <p className="text-lg font-bold">{shop?.whatsapp || 'Non configuré'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message automatique envoyé au vendeur :</p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm italic">
                    &quot;Bonjour, je suis intéressé(e) par : &quot;[PRODUIT]&quot; à [PRIX] FCFA
                    <br />(Vu sur Facebook)&quot;
                  </div>
                </div>
              </div>
            </div>

            {/* Final activation */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="font-bold text-green-700 dark:text-green-400">
                  Synchronisation active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pl-7 text-sm">
                <span className="text-muted-foreground">Dernière synchro :</span>
                <span className="font-medium">{timeAgo(shop?.catalogLastSync as string)}</span>
                <span className="text-muted-foreground">Produits synchronisés :</span>
                <span className="font-medium">{productCount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-10" onClick={onBack}>
                Terminer
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={handleForceSync}
                disabled={syncing}
              >
                {syncing ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RefreshCw className="size-4 mr-2" />}
                Forcer une synchro
              </Button>
              <Button
                className="flex-1 h-10"
                onClick={onOpenSocial}
              >
                <ShoppingBag className="size-4 mr-2" />
                Publier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ================================================================== */
/*  CATALOG STATUS VIEW                                               */
/* ================================================================== */

function CatalogStatusView({ onBack }: { onBack: () => void }) {
  const shop = useAppStore((s) => s.shop)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shop?.id) return
    fetch(`/api/catalog/${shop.id}/json`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(
          (data.items || []).map((p: { id: string; name: string; price: number; image?: string }) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            status: 'synced' as const,
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [shop?.id])

  const catalogUrl = shop?.id ? `${BASE_URL}/api/catalog/${shop.id}` : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Statut du catalogue</h2>
          <p className="text-sm text-muted-foreground">Suivez la synchronisation de vos produits</p>
        </div>
      </div>

      {/* Status summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatusCard label="Statut" value={shop?.catalogEnabled ? 'Actif' : 'Inactif'} good={!!shop?.catalogEnabled} />
            <StatusCard label="Dernière synchro" value={timeAgo(shop?.catalogLastSync as string)} />
            <StatusCard label="Produits" value={`${shop?.catalogProductCount ?? 0} synchronisés`} />
            <StatusCard label="Prochaine synchro" value="Automatique (1h)" />
          </div>
        </CardContent>
      </Card>

      {/* Catalog URL */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">URL du flux XML</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted rounded px-3 py-2 truncate border">
              {catalogUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(catalogUrl)
                toast.success('URL copiée !')
              }}
            >
              <Copy className="size-3.5 mr-1" /> Copier
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs shrink-0"
              onClick={() => window.open(catalogUrl, '_blank')}
            >
              <ExternalLink className="size-3.5 mr-1" /> Ouvrir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Produits synchronisés</CardTitle>
          <CardDescription>{products.length} produits dans le flux</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Aucun produit synchronisé
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Statut</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <CheckCircle2 className="size-4 text-green-500" />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-right text-sm">
                        {Number(p.price).toLocaleString('fr-FR')} XOF
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
  )
}

function StatusCard({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${good ? 'text-green-600' : ''}`}>{value}</p>
    </div>
  )
}

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export function DashboardIntegrations() {
  const [view, setView] = useState<View>('hub')

  const shop = useAppStore((s) => s.shop)
  const handleOpen = useCallback((id: string) => {
    if (id === 'facebook') {
      setView(shop?.facebookConnected ? 'wizard' : 'wizard')
    }
  }, [shop?.facebookConnected])

  const openSocial = useCallback(() => setView('social'), [])

  if (view === 'social' && shop) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('wizard')}>
            <ArrowLeft className="size-4 mr-1" /> Retour
          </Button>
        </div>
        <SocialPublish
          shopId={shop.id}
          shopSlug={shop.slug}
          facebookConnected={shop.facebookConnected ?? false}
          facebookPageName={shop.facebookPageName ?? null}
        />
      </div>
    )
  }
  if (view === 'wizard') return <WizardView onBack={() => setView('hub')} onOpenSocial={openSocial} />
  if (view === 'catalog') return <CatalogStatusView onBack={() => setView('hub')} />

  return <HubView onOpen={handleOpen} />
}