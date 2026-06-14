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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Facebook,
  BarChart3,
  Music2,
  MessageCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Plug,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type IntegrationsView = 'hub' | 'facebook'

interface FacebookEvent {
  id: string
  eventName: string
  source: 'PIXEL' | 'CAPI' | 'BOTH'
  status: 'sent' | 'delivered' | 'failed'
  createdAt: string
}

interface FacebookSettingsResponse {
  pixelId?: string
  accessToken?: string
  catalogId?: string
  trackPageViews?: boolean
  trackProductViews?: boolean
  trackWhatsAppClicks?: boolean
  events?: FacebookEvent[]
  tokenStatus?: 'valid' | 'invalid'
}

/* ------------------------------------------------------------------ */
/*  Integration card definitions                                       */
/* ------------------------------------------------------------------ */

interface IntegrationCard {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  available: boolean
  configurable?: IntegrationsView
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardIntegrations() {
  const shop = useAppStore((s) => s.shop)

  /* ----- View state ----- */
  const [view, setView] = useState<IntegrationsView>('hub')

  /* ----- Facebook config state ----- */
  const [pixelId, setPixelId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [trackPageViews, setTrackPageViews] = useState(true)
  const [trackProductViews, setTrackProductViews] = useState(true)
  const [trackWhatsAppClicks, setTrackWhatsAppClicks] = useState(true)

  /* ----- Loading states ----- */
  const [savingPixel, setSavingPixel] = useState(false)
  const [testingPixel, setTestingPixel] = useState(false)
  const [testingToken, setTestingToken] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  /* ----- Data states ----- */
  const [events, setEvents] = useState<FacebookEvent[]>([])
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'invalid' | null>(null)

  /* ----- Initialize from shop data ----- */
  useEffect(() => {
    if (shop) {
      setPixelId(shop.facebookPixelId || '')
      setAccessToken(shop.facebookAccessToken || '')
      setTrackPageViews(shop.trackPageViews ?? true)
      setTrackProductViews(shop.trackProductViews ?? true)
      setTrackWhatsAppClicks(shop.trackWhatsAppClicks ?? true)
    }
  }, [shop])

  /* ----- Fetch events and token status on entering facebook view ----- */
  const loadFacebookData = useCallback(async () => {
    setLoadingEvents(true)
    try {
      const res = await fetch('/api/integrations/facebook')
      if (!res.ok) throw new Error('Erreur de chargement')
      const data: FacebookSettingsResponse = await res.json()
      setEvents(data.events || [])
      setTokenStatus(data.tokenStatus || null)
    } catch {
      toast.error('Impossible de charger les données Facebook')
    } finally {
      setLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'facebook') {
      loadFacebookData()
    }
  }, [view, loadFacebookData])

  /* ----- Integration cards ----- */
  const integrations: IntegrationCard[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Pixel, Conversions API (CAPI) et catalogue produits',
      icon: <Facebook className="h-6 w-6" />,
      connected: !!shop?.facebookPixelId,
      available: true,
      configurable: 'facebook',
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Suivi de trafic et statistiques avancées',
      icon: <BarChart3 className="h-6 w-6" />,
      connected: false,
      available: false,
    },
    {
      id: 'tiktok-pixel',
      name: 'TikTok Pixel',
      description: 'Suivi des conversions et retargeting TikTok',
      icon: <Music2 className="h-6 w-6" />,
      connected: false,
      available: false,
    },
    {
      id: 'whatsapp-api',
      name: 'WhatsApp Business API',
      description: 'Messages automatisés et API WhatsApp Business',
      icon: <MessageCircle className="h-6 w-6" />,
      connected: false,
      available: false,
    },
  ]

  /* ----- Save pixel settings ----- */
  const handleSavePixel = async () => {
    if (!pixelId.trim()) {
      toast.error('Veuillez entrer un Pixel ID')
      return
    }
    setSavingPixel(true)
    try {
      const res = await fetch('/api/integrations/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelId: pixelId.trim(),
          trackPageViews,
          trackProductViews,
          trackWhatsAppClicks,
        }),
      })
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      toast.success('Paramètres du Pixel sauvegardés')
    } catch {
      toast.error("Impossible de sauvegarder les paramètres du Pixel")
    } finally {
      setSavingPixel(false)
    }
  }

  /* ----- Test pixel ----- */
  const handleTestPixel = async () => {
    if (!pixelId.trim()) {
      toast.error('Veuillez entrer un Pixel ID avant de tester')
      return
    }
    setTestingPixel(true)
    try {
      const res = await fetch('/api/integrations/facebook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-pixel', pixelId: pixelId.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors du test')
      toast.success('Pixel testé avec succès ! Un événement test a été envoyé.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du test du Pixel')
    } finally {
      setTestingPixel(false)
    }
  }

  /* ----- Save CAPI token ----- */
  const handleSaveToken = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/integrations/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: accessToken.trim() }),
      })
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      toast.success('Token d\'accès sauvegardé')
    } catch {
      toast.error("Impossible de sauvegarder le token d'accès")
    } finally {
      setSavingSettings(false)
    }
  }

  /* ----- Test token ----- */
  const handleTestToken = async () => {
    if (!accessToken.trim()) {
      toast.error('Veuillez entrer un token avant de tester')
      return
    }
    setTestingToken(true)
    try {
      const res = await fetch('/api/integrations/facebook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate-token', accessToken: accessToken.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors du test')
      setTokenStatus(data.valid ? 'valid' : 'invalid')
      toast.success(data.valid ? 'Token valide — Conversions API connecté' : 'Token invalide')
    } catch (err) {
      setTokenStatus('invalid')
      toast.error(err instanceof Error ? err.message : 'Token invalide')
    } finally {
      setTestingToken(false)
    }
  }

  /* ----- Copy catalog feed URL ----- */
  const handleCopyFeedUrl = () => {
    const feedUrl = `https://boutiko.pro/api/catalog/${shop?.id}/route.ts`
    navigator.clipboard.writeText(feedUrl).then(() => {
      toast.success('URL du flux copiée dans le presse-papiers')
    }).catch(() => {
      toast.error('Impossible de copier l\'URL')
    })
  }

  /* ----- Render: Integrations Hub ----- */
  const renderHub = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Plug className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Intégrations</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Connectez vos outils marketing et analytique pour suivre vos performances.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="relative overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-xl shrink-0 ${
                      integration.id === 'facebook'
                        ? 'bg-[#1877F2]/10 text-[#1877F2]'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {integration.icon}
                  </div>

                  {/* Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{integration.name}</h3>
                      {integration.connected && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                          Connecté
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {integration.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer: Action buttons */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!integration.available && (
                    <Badge variant="secondary" className="text-xs">
                      Bientôt disponible
                    </Badge>
                  )}
                </div>

                {integration.available && integration.configurable && (
                  <Button
                    size="sm"
                    onClick={() => setView(integration.configurable!)}
                    className="gap-2"
                  >
                    Configurer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}

                {!integration.available && (
                  <Button size="sm" variant="outline" disabled>
                    Configurer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  /* ----- Render: Events Table ----- */
  const renderEventsTable = () => {
    if (loadingEvents) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground text-sm">Chargement des événements…</span>
        </div>
      )
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun événement récent</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Les événements Facebook apparaîtront ici une fois le Pixel ou la CAPI configurés.
          </p>
        </div>
      )
    }

    return (
      <div className="max-h-96 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Événement</TableHead>
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-xs font-medium">{event.eventName}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      event.source === 'CAPI'
                        ? 'bg-blue-50 text-blue-700'
                        : event.source === 'PIXEL'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {event.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.status === 'delivered' || event.status === 'sent' ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Livré
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-500">
                      <XCircle className="h-3.5 w-3.5" />
                      Échoué
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  /* ----- Render: Facebook Configuration ----- */
  const renderFacebookConfig = () => {
    const catalogFeedUrl = `https://boutiko.pro/api/catalog/${shop?.id}/route.ts`

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('hub')}
            className="gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] shrink-0">
              <Facebook className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight">Configuration Facebook</h1>
              <p className="text-muted-foreground text-sm truncate">
                Pixel, Conversions API et Catalogue
              </p>
            </div>
          </div>
        </div>

        {/* ─── Section 1: Facebook Pixel ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Facebook Pixel</CardTitle>
            <CardDescription>
              Suivez les actions de vos visiteurs sur votre boutique avec le Meta Pixel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Pixel ID */}
            <div className="space-y-2">
              <Label htmlFor="pixel-id">Pixel ID</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pixel-id"
                  placeholder="Ex: 123456789012345"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  className="max-w-sm"
                />
                {pixelId && (
                  <Badge
                    className="bg-green-100 text-green-700 hover:bg-green-100 text-xs shrink-0"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configuré
                  </Badge>
                )}
              </div>
              <a
                href="https://www.facebook.com/business/help/1717878534939900"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Comment trouver mon Pixel ID ?
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Toggle switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="toggle-page-views" className="text-sm">Track Page Views</Label>
                  <p className="text-xs text-muted-foreground">Suivre les vues de pages de la boutique</p>
                </div>
                <Switch
                  id="toggle-page-views"
                  checked={trackPageViews}
                  onCheckedChange={setTrackPageViews}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="toggle-product-views" className="text-sm">Track Product Views</Label>
                  <p className="text-xs text-muted-foreground">Suivre les vues de fiches produits</p>
                </div>
                <Switch
                  id="toggle-product-views"
                  checked={trackProductViews}
                  onCheckedChange={setTrackProductViews}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="toggle-wa-clicks" className="text-sm">Track WhatsApp Clicks</Label>
                  <p className="text-xs text-muted-foreground">Suivre les clics sur le bouton WhatsApp</p>
                </div>
                <Switch
                  id="toggle-wa-clicks"
                  checked={trackWhatsAppClicks}
                  onCheckedChange={setTrackWhatsAppClicks}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleSavePixel} disabled={savingPixel || !pixelId.trim()} className="gap-2">
                {savingPixel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Sauvegarder
              </Button>
              <Button
                variant="outline"
                onClick={handleTestPixel}
                disabled={testingPixel || !pixelId.trim()}
                className="gap-2"
              >
                {testingPixel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Tester le Pixel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 2: Conversions API (CAPI) ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversions API (CAPI)</CardTitle>
            <CardDescription>
              Envoyez les événements directement depuis le serveur pour plus de fiabilité et de précision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Access token */}
            <div className="space-y-2">
              <Label htmlFor="access-token">Token d&apos;accès Facebook</Label>
              <div className="relative max-w-sm">
                <Input
                  id="access-token"
                  type={showToken ? 'text' : 'password'}
                  placeholder="Ex: EAAxxxxx..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showToken ? 'Masquer le token' : 'Afficher le token'}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <a
                href="https://developers.facebook.com/docs/marketing-api/conversions-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Comment générer un token permanent ?
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Token status */}
            {tokenStatus && (
              <div className="flex items-center gap-2">
                {tokenStatus === 'valid' ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connecté
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Non connecté
                  </Badge>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleSaveToken} disabled={savingSettings || !accessToken.trim()} className="gap-2">
                {savingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Sauvegarder le token
              </Button>
              <Button
                variant="outline"
                onClick={handleTestToken}
                disabled={testingToken || !accessToken.trim()}
                className="gap-2"
              >
                {testingToken ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Tester la connexion
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 3: Catalog Produits ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catalogue Produits</CardTitle>
            <CardDescription>
              Synchronisez automatiquement vos produits avec votre catalogue Facebook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Catalog ID */}
            {shop?.facebookCatalogId && (
              <div className="space-y-2">
                <Label>Catalogue ID</Label>
                <Input value={shop.facebookCatalogId} readOnly className="max-w-sm bg-muted" />
              </div>
            )}

            {/* Feed URL */}
            <div className="space-y-2">
              <Label>URL du flux de produits</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={catalogFeedUrl}
                  readOnly
                  className="font-mono text-xs bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyFeedUrl}
                  className="shrink-0"
                  aria-label="Copier l'URL du flux"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Comment configurer :</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Copiez l&apos;URL du flux ci-dessus et collez-la dans votre{' '}
                  <a
                    href="https://www.facebook.com/business/help/1253565828232669"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Catalogue Facebook
                    <ExternalLink className="h-3 w-3 inline ml-0.5" />
                  </a>
                  .
                </li>
                <li>Le flux est mis à jour automatiquement à chaque modification de vos produits.</li>
                <li>Utilisez le format de flux XML pour une meilleure compatibilité.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 4: Événements Récents ─── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Événements Récents</CardTitle>
                <CardDescription>
                  Historique des événements envoyés via le Pixel et la Conversions API.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFacebookData}
                className="gap-2 shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingEvents ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>{renderEventsTable()}</CardContent>
        </Card>
      </div>
    )
  }

  /* ----- Main render ----- */
  return (
    <div className="w-full max-w-5xl mx-auto">
      {view === 'hub' ? renderHub() : renderFacebookConfig()}
    </div>
  )
}
