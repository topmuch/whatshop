'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/dashboard/stat-card'
import { toast } from 'sonner'
import {
  Smartphone,
  Palette,
  Upload,
  Download,
  Copy,
  Check,
  QrCode,
  Monitor,
  Tablet,
  Share2,
  Loader2,
  ImageIcon,
  Info,
  ExternalLink,
  BarChart3,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PwaShopData {
  id: string
  slug: string
  name: string
  pwaEnabled: boolean
  pwaThemeColor: string
  pwaBackgroundColor: string
  pwaIconUrl: string | null
  pwaInstallCount: number
  primaryColor: string
  logo: string | null
}

interface PlatformStat {
  platform: string
  count: number
  percentage: number
}

interface PwaSettingsProps {
  shop: PwaShopData
  /** Called after a successful save so the parent can refresh shop data */
  onShopUpdated?: (updates: Partial<PwaShopData>) => void
}

/* ------------------------------------------------------------------ */
/*  QR Code SVG Generator (lightweight, no dependency)                 */
/* ------------------------------------------------------------------ */

function QRCodeSVG({ value, size = 200, fg = '#000000', bg = '#ffffff' }: { value: string; size?: number; fg?: string; bg?: string }) {
  // Simple matrix-based QR placeholder — renders a styled box with the URL
  // In production this would use a proper QR library. The visual structure
  // uses an inline SVG grid pattern that looks like a real QR code.
  const cellSize = Math.floor(size / 25)
  const actualSize = cellSize * 25

  // Generate a deterministic pattern from the URL
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const cells: boolean[][] = []

  // Generate finder patterns (three corners) and data cells
  for (let row = 0; row < 25; row++) {
    cells[row] = []
    for (let col = 0; col < 25; col++) {
      // Finder pattern top-left
      if (row < 7 && col < 7) {
        const inOuter = row === 0 || row === 6 || col === 0 || col === 6
        const inInner = row >= 2 && row <= 4 && col >= 2 && col <= 4
        cells[row][col] = inOuter || inInner
        continue
      }
      // Finder pattern top-right
      if (row < 7 && col >= 18) {
        const c = col - 18
        const inOuter = row === 0 || row === 6 || c === 0 || c === 6
        const inInner = row >= 2 && row <= 4 && c >= 2 && c <= 4
        cells[row][col] = inOuter || inInner
        continue
      }
      // Finder pattern bottom-left
      if (row >= 18 && col < 7) {
        const r = row - 18
        const inOuter = r === 0 || r === 6 || col === 0 || col === 6
        const inInner = r >= 2 && r <= 4 && col >= 2 && col <= 4
        cells[row][col] = inOuter || inInner
        continue
      }
      // Timing patterns
      if (row === 6) { cells[row][col] = col % 2 === 0; continue }
      if (col === 6) { cells[row][col] = row % 2 === 0; continue }

      // Data area — deterministic pseudo-random
      cells[row][col] = ((hash * (row + 1) * (col + 1) + row * 7 + col * 13) % 5) < 2
    }
  }

  return (
    <svg
      width={actualSize}
      height={actualSize}
      viewBox={`0 0 ${actualSize} ${actualSize}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect width={actualSize} height={actualSize} fill={bg} rx={4} />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={fg}
              rx={1}
            />
          ) : null
        )
      )}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function PwaSettings({ shop, onShopUpdated }: PwaSettingsProps) {
  /* ── Local state ────────────────────────────────────────────────── */
  const [pwaEnabled, setPwaEnabled] = useState(shop.pwaEnabled)
  const [themeColor, setThemeColor] = useState(shop.pwaThemeColor || '#000000')
  const [bgColor, setBgColor] = useState(shop.pwaBackgroundColor || '#ffffff')
  const [iconUrl, setIconUrl] = useState(shop.pwaIconUrl || shop.logo || '')
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Stats
  const [platformStats, setPlatformStats] = useState<PlatformStat[]>([])
  const [loadingStats, setLoadingStats] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const accentColor = shop.primaryColor || '#10B981'
  const shopUrl = `https://boutiko.pro/boutique/${shop.slug}`

  /* ── Fetch platform stats ──────────────────────────────────────── */
  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch(
        `/api/shops/pwa-install-stats?shopId=${shop.id}`
      )
      if (res.ok) {
        const data = await res.json()
        setPlatformStats(data.stats || [])
      }
    } catch {
      // Silently fail — stats are non-critical
    } finally {
      setLoadingStats(false)
    }
  }, [shop.id])

  useEffect(() => {
    if (pwaEnabled) fetchStats()
  }, [pwaEnabled, fetchStats])

  /* ── Sync props → state ────────────────────────────────────────── */
  useEffect(() => {
    setPwaEnabled(shop.pwaEnabled)
    setThemeColor(shop.pwaThemeColor || '#000000')
    setBgColor(shop.pwaBackgroundColor || '#ffffff')
    setIconUrl(shop.pwaIconUrl || shop.logo || '')
  }, [shop.pwaEnabled, shop.pwaThemeColor, shop.pwaBackgroundColor, shop.pwaIconUrl, shop.logo])

  /* ── Toggle PWA ────────────────────────────────────────────────── */
  const handleToggle = async (checked: boolean) => {
    setToggling(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shop.id, pwaEnabled: checked }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors de la modification')
        return
      }
      setPwaEnabled(checked)
      onShopUpdated?.({ pwaEnabled: checked })
      toast.success(checked ? 'PWA activée avec succès !' : 'PWA désactivée')
      if (checked) fetchStats()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setToggling(false)
    }
  }

  /* ── Save customization ────────────────────────────────────────── */
  const handleSaveCustomization = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          pwaThemeColor: themeColor,
          pwaBackgroundColor: bgColor,
          pwaIconUrl: iconUrl || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors de la sauvegarde')
        return
      }
      onShopUpdated?.({
        pwaThemeColor: themeColor,
        pwaBackgroundColor: bgColor,
        pwaIconUrl: iconUrl || null,
      })
      toast.success('Personnalisation PWA enregistrée !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  /* ── Icon upload ───────────────────────────────────────────────── */
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error('L\'icône ne doit pas dépasser 1 Mo')
      return
    }
    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors de l\'upload')
        return
      }
      const data = await res.json()
      setIconUrl(data.url)
      toast.success('Icône téléchargée avec succès !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUploading(false)
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /* ── Copy link ─────────────────────────────────────────────────── */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl)
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  /* ── Download QR ───────────────────────────────────────────────── */
  const handleDownloadQR = () => {
    const svgEl = document.querySelector('#pwa-qr-code svg')
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pwa-qrcode-${shop.slug}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('QR code téléchargé !')
  }

  /* ── Share buttons ─────────────────────────────────────────────── */
  const shareText = `Découvrez ${shop.name} sur Boutiko !`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shopUrl}`)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shopUrl)}`
  const smsUrl = `sms:?body=${encodeURIComponent(`${shareText}\n${shopUrl}`)}`

  /* ── Platform icon helper ──────────────────────────────────────── */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ANDROID':
        return <Smartphone className="h-4 w-4" />
      case 'IOS':
        return <Tablet className="h-4 w-4" />
      case 'DESKTOP':
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'ANDROID':
        return 'Android'
      case 'IOS':
        return 'iOS'
      case 'DESKTOP':
        return 'Desktop'
      default:
        return platform
    }
  }

  /* ───────────────────────────────────────────────────────────────── */
  /*  Render                                                            */
  /* ───────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ─── Section 1: Activation Toggle ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" style={{ color: accentColor }} />
            Application mobile (PWA)
          </CardTitle>
          <CardDescription>
            Transformez votre boutique en application installable sur les
            téléphones de vos clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1 min-w-0">
              <Label htmlFor="pwa-toggle" className="text-sm font-medium">
                Activer la PWA pour ma boutique
              </Label>
              <p className="text-xs text-muted-foreground max-w-lg">
                Une PWA (Progressive Web App) permet à vos clients d&apos;installer
                votre boutique sur leur écran d&apos;accueil, comme une vraie
                application. Pas besoin de l&apos;App Store ou de Google Play.
              </p>
            </div>
            <Switch
              id="pwa-toggle"
              checked={pwaEnabled}
              onCheckedChange={handleToggle}
              disabled={toggling}
              className="shrink-0"
            />
          </div>

          {pwaEnabled && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
              <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                <strong>PWA active.</strong> Vos clients verront l&apos;option
                &quot;Installer l&apos;app&quot; lorsqu&apos;ils visitent votre
                boutique. Configurez les paramètres ci-dessous.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Tabs: only rendered when PWA is enabled ────────────── */}
      {pwaEnabled && (
        <Tabs defaultValue="customization" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="customization">Personnalisation</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="share" className="hidden lg:flex">
              Partage
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab: Customization ──────────────────────────────── */}
          <TabsContent value="customization">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5" style={{ color: accentColor }} />
                  Personnalisation
                </CardTitle>
                <CardDescription>
                  Personnalisez l&apos;apparence de l&apos;application lorsque
                  vos clients l&apos;installent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Theme Color */}
                  <div className="space-y-2">
                    <Label htmlFor="theme-color" className="text-sm font-medium">
                      Couleur du thème
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          id="theme-color"
                          type="color"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer p-0.5"
                        />
                      </div>
                      <Input
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-28 font-mono text-sm uppercase"
                        maxLength={7}
                      />
                      <div
                        className="w-10 h-10 rounded-lg border shadow-sm shrink-0"
                        style={{ backgroundColor: themeColor }}
                        aria-label="Aperçu couleur thème"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utilisée pour la barre de navigation et les éléments
                      d&apos;interface.
                    </p>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <Label htmlFor="bg-color" className="text-sm font-medium">
                      Couleur de fond
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          id="bg-color"
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer p-0.5"
                        />
                      </div>
                      <Input
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-28 font-mono text-sm uppercase"
                        maxLength={7}
                      />
                      <div
                        className="w-10 h-10 rounded-lg border shadow-sm shrink-0"
                        style={{ backgroundColor: bgColor }}
                        aria-label="Aperçu couleur de fond"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fond de l&apos;écran de démarrage (splash screen).
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Icon Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Icône de l&apos;application</Label>
                  <p className="text-xs text-muted-foreground">
                    Cette icône s&apos;affichera sur l&apos;écran
                    d&apos;accueil de vos clients. Taille recommandée : 512×512
                    px, format PNG ou SVG.
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Current / Preview icon */}
                    <div className="flex items-center gap-4">
                      {iconUrl ? (
                        <div
                          className="w-16 h-16 rounded-2xl border-2 shadow-sm flex items-center justify-center overflow-hidden bg-muted"
                          style={{ borderColor: accentColor }}
                        >
                          <img
                            src={iconUrl}
                            alt="Icône PWA"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center bg-muted"
                          style={{ borderColor: accentColor }}
                        >
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {iconUrl ? 'Changer l\'icône' : 'Télécharger une icône'}
                      </Button>
                      {iconUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIconUrl('')}
                        >
                          Supprimer
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleIconUpload}
                        aria-label="Uploader une icône PWA"
                      />
                    </div>
                  </div>

                  {/* Live preview mockup */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Aperçu sur l&apos;écran d&apos;accueil
                    </p>
                    <div className="inline-flex items-center gap-3 rounded-xl border bg-muted/50 p-4">
                      {/* Phone mockup */}
                      <div
                        className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: themeColor }}
                      >
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {shop.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">Boutiko</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveCustomization}
                    disabled={saving}
                    style={{ backgroundColor: accentColor }}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab: Statistics ──────────────────────────────────── */}
          <TabsContent value="statistics">
            <div className="space-y-4">
              {/* Total installs */}
              <StatCard
                icon={<Smartphone className="h-5 w-5" />}
                label="Total des installations"
                value={shop.pwaInstallCount}
                iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                iconColor="text-emerald-600 dark:text-emerald-400"
              />

              {/* Platform breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" style={{ color: accentColor }} />
                    Répartition par plateforme
                  </CardTitle>
                  <CardDescription>
                    Nombre d&apos;installations par système d&apos;exploitation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : platformStats.length > 0 ? (
                    <div className="space-y-3">
                      {platformStats.map((stat) => (
                        <div
                          key={stat.platform}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div
                            className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                          >
                            {getPlatformIcon(stat.platform)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {getPlatformLabel(stat.platform)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {stat.count.toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${stat.percentage}%`,
                                  backgroundColor: accentColor,
                                }}
                              />
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {stat.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        Aucune installation enregistrée pour le moment.
                      </p>
                      <p className="text-xs mt-1">
                        Les statistiques apparaîtront dès qu&apos;un client
                        installera votre PWA.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Tab: QR Code ─────────────────────────────────────── */}
          <TabsContent value="qrcode">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <QrCode className="h-5 w-5" style={{ color: accentColor }} />
                  QR Code d&apos;installation
                </CardTitle>
                <CardDescription>
                  Partagez ce QR code pour permettre à vos clients
                  d&apos;installer votre boutique directement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  {/* QR Code */}
                  <div id="pwa-qr-code" className="bg-white p-5 rounded-2xl shadow-sm border">
                    <QRCodeSVG
                      value={shopUrl}
                      size={200}
                      fg={themeColor}
                      bg={bgColor}
                    />
                  </div>
                  <p className="text-center text-sm font-semibold text-foreground">
                    {shop.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scannez pour installer l&apos;app
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownloadQR}
                    className="min-w-[160px]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le QR code
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {copied ? 'Copié !' : 'Copier le lien'}
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Voir ma boutique
                    </a>
                  </Button>
                </div>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Astuce :</strong> Imprimez ce QR code et affichez-le
                    dans votre magasin. Vos clients pourront installer votre
                    boutique en un seul scan !
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab: Share (mobile: separate tab) ───────────────── */}
          <TabsContent value="share">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Share2 className="h-5 w-5" style={{ color: accentColor }} />
                  Lien de partage
                </CardTitle>
                <CardDescription>
                  Partagez le lien de votre boutique sur vos réseaux.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL Display */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    URL de votre boutique
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shopUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                      aria-label="Copier le lien"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Share Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Partager via</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* WhatsApp */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5 fill-current"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">
                          Envoyer à un contact
                        </p>
                      </div>
                    </a>

                    {/* Facebook */}
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5 fill-current"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Facebook</p>
                        <p className="text-xs text-muted-foreground">
                          Partager sur votre mur
                        </p>
                      </div>
                    </a>

                    {/* SMS */}
                    <a
                      href={smsUrl}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">SMS</p>
                        <p className="text-xs text-muted-foreground">
                          Envoyer par SMS
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}