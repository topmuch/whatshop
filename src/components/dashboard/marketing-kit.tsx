'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  QrCode,
  Download,
  Loader2,
  ImageIcon,
  CreditCard,
  Sparkles,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductOption {
  id: string
  name: string
  price: number
  image?: string
  images?: string[]
  stock?: number
  isAvailable: boolean
}

type QRSize = 300 | 600 | 1200
type QRFormat = 'png' | 'svg'
type StoryTemplate = 'moderne' | 'luxe' | 'streetwear' | 'minimaliste'
type BottomSticker = 'bio' | 'whatsapp'

interface StoryTemplateConfig {
  id: StoryTemplate
  label: string
  description: string
  gradientFrom: string
  gradientTo: string
  textColor: string
  accentColor: string
  font: string
  fontWeight: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORY_TEMPLATES: StoryTemplateConfig[] = [
  {
    id: 'moderne',
    label: 'Moderne',
    description: 'Dégradé rose-orange, texte blanc, centré',
    gradientFrom: '#EC4899',
    gradientTo: '#F97316',
    textColor: '#FFFFFF',
    accentColor: '#FBBF24',
    font: 'sans-serif',
    fontWeight: 'bold',
  },
  {
    id: 'luxe',
    label: 'Luxe',
    description: 'Dégradé sombre-or, élégant',
    gradientFrom: '#1A1A2E',
    gradientTo: '#C9A84C',
    textColor: '#FFFFFF',
    accentColor: '#C9A84C',
    font: 'serif',
    fontWeight: 'bold',
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    description: 'Dégradé noir-rouge, urbain',
    gradientFrom: '#0A0A0A',
    gradientTo: '#DC2626',
    textColor: '#FFFFFF',
    accentColor: '#EF4444',
    font: 'sans-serif',
    fontWeight: '900',
  },
  {
    id: 'minimaliste',
    label: 'Minimaliste',
    description: 'Fond blanc, texte noir, épuré',
    gradientFrom: '#FFFFFF',
    gradientTo: '#F5F5F5',
    textColor: '#111111',
    accentColor: '#111111',
    font: 'sans-serif',
    fontWeight: '600',
  },
]

const QR_SIZES: { value: QRSize; label: string }[] = [
  { value: 300, label: 'Petit (300px)' },
  { value: 600, label: 'Moyen (600px)' },
  { value: 1200, label: 'Grand (1200px)' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

function getFirstImage(product: ProductOption): string {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0]
  }
  return product.image || ''
}

/* ------------------------------------------------------------------ */
/*  QR Code Tab                                                        */
/* ------------------------------------------------------------------ */

function QRCodeTab() {
  const shop = useAppStore((s) => s.shop)
  const [color, setColor] = useState(shop?.primaryColor || '#EC4899')
  const [size, setSize] = useState<QRSize>(600)
  const [format, setFormat] = useState<QRFormat>('png')
  const [logoUrl, setLogoUrl] = useState('')
  const [qrData, setQrData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debouncedColor, setDebouncedColor] = useState(color)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce color changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedColor(color)
    }, 500)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [color])

  // Auto-regenerate when color or size changes (if we already have a QR)
  useEffect(() => {
    if (qrData && shop?.id) {
      generateQR()
    }
  }, [debouncedColor, size])

  async function generateQR() {
    if (!shop?.id) {
      toast.error('Veuillez sélectionner une boutique')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/marketing/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          size,
          color: debouncedColor,
          format,
          logoUrl: logoUrl.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      const data = await res.json()
      setQrData(data.qrData)
      toast.success('QR code généré avec succès')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!qrData) return

    if (format === 'svg') {
      const blob = new Blob([qrData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-code-${shop?.slug || 'boutique'}.svg`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const a = document.createElement('a')
      a.href = qrData
      a.download = `qr-code-${shop?.slug || 'boutique'}.png`
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Personnalisez votre QR code pour votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-color">Couleur</Label>
              <div className="flex items-center gap-3">
                <input
                  id="qr-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 rounded-md border cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Size */}
            <div className="flex flex-col gap-2">
              <Label>Taille</Label>
              <Select
                value={String(size)}
                onValueChange={(v) => setSize(Number(v) as QRSize)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QR_SIZES.map((s) => (
                    <SelectItem key={s.value} value={String(s.value)}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="flex flex-col gap-2">
              <Label>Format</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={format === 'png' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormat('png')}
                  className="flex-1"
                >
                  PNG
                </Button>
                <Button
                  type="button"
                  variant={format === 'svg' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormat('svg')}
                  className="flex-1"
                >
                  SVG
                </Button>
              </div>
            </div>

            {/* Logo URL */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-logo">Logo (optionnel)</Label>
              <Input
                id="qr-logo"
                placeholder="https://exemple.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Saisissez l&apos;URL du logo à superposer au centre du QR code
              </p>
            </div>

            {/* Generate button */}
            <Button
              onClick={generateQR}
              disabled={loading || !shop?.id}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer le QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aperçu</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            {loading && !qrData ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Génération en cours...</p>
              </div>
            ) : qrData ? (
              <>
                <div className="relative inline-block">
                  <img
                    src={qrData}
                    alt="QR Code"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />
                  {logoUrl.trim() && format === 'png' && (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white p-1 shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
                <Button onClick={handleDownload} variant="outline" className="w-full max-w-xs">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Configurez et générez votre QR code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Story Canvas Drawing Helpers                                       */
/* ------------------------------------------------------------------ */

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

/* ------------------------------------------------------------------ */
/*  Stories Tab                                                        */
/* ------------------------------------------------------------------ */

function StoriesTab() {
  const shop = useAppStore((s) => s.shop)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [templateId, setTemplateId] = useState<StoryTemplate>('moderne')
  const [primaryOverride, setPrimaryOverride] = useState(shop?.primaryColor || '')
  const [secondaryOverride, setSecondaryOverride] = useState('')
  const [bottomSticker, setBottomSticker] = useState<BottomSticker>('bio')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const templateConfig = STORY_TEMPLATES.find((t) => t.id === templateId)!

  useEffect(() => {
    if (shop?.id) {
      fetchProducts()
    }
  }, [shop?.id])

  async function fetchProducts() {
    if (!shop?.id) return
    setLoadingProducts(true)
    try {
      const res = await fetch(`/api/products?shopId=${shop.id}&limit=100&all=true`)
      if (res.ok) {
        const data = await res.json()
        const list: ProductOption[] = (data.products || data || []).map(
          (p: { id: string; name: string; price: number; image?: string; images?: unknown; stock?: number; isAvailable: boolean }) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            images: Array.isArray(p.images) ? p.images : [],
            stock: p.stock,
            isAvailable: p.isAvailable,
          })
        )
        setProducts(list)
        if (list.length > 0 && !selectedProductId) {
          setSelectedProductId(list[0].id)
        }
      }
    } catch {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoadingProducts(false)
    }
  }

  function drawStory(product: ProductOption) {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    const gradientFrom = primaryOverride || templateConfig.gradientFrom
    const gradientTo = secondaryOverride || templateConfig.gradientTo
    const textColor = templateConfig.textColor
    const accentColor = templateConfig.accentColor

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, H)
    gradient.addColorStop(0, gradientFrom)
    gradient.addColorStop(1, gradientTo)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, W, H)

    // Font family
    const fontFamily = templateConfig.font

    // Shop logo (top center, small)
    const logo = shop?.logo
    if (logo) {
      const logoSize = 60
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.onload = () => {
        ctx.save()
        const logoX = W / 2 - logoSize / 2
        const logoY = 60
        drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 12)
        ctx.clip()
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()

        // Shop name below logo
        ctx.fillStyle = textColor
        ctx.font = `600 24px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.fillText(shop!.name, W / 2, 145)
        ctx.textAlign = 'start'

        continueDrawing(ctx, product, textColor, accentColor, fontFamily, W, H)
      }
      logoImg.onerror = () => {
        // Draw shop name without logo
        ctx.fillStyle = textColor
        ctx.font = `700 32px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.fillText(shop!.name, W / 2, 100)
        ctx.textAlign = 'start'

        continueDrawing(ctx, product, textColor, accentColor, fontFamily, W, H)
      }
      logoImg.src = logo
    } else {
      // Shop name centered at top
      ctx.fillStyle = textColor
      ctx.font = `700 32px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.fillText(shop!.name, W / 2, 100)
      ctx.textAlign = 'start'

      continueDrawing(ctx, product, textColor, accentColor, fontFamily, W, H)
    }
  }

  function continueDrawing(
    ctx: CanvasRenderingContext2D,
    product: ProductOption,
    textColor: string,
    accentColor: string,
    fontFamily: string,
    W: number,
    H: number
  ) {
    const productImage = getFirstImage(product)

    if (productImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        drawProductAndText(ctx, img, product, textColor, accentColor, fontFamily, W, H)
        finishStory(ctx, W, H)
      }
      img.onerror = () => {
        drawProductAndText(ctx, null, product, textColor, accentColor, fontFamily, W, H)
        finishStory(ctx, W, H)
      }
      img.src = productImage
    } else {
      drawProductAndText(ctx, null, product, textColor, accentColor, fontFamily, W, H)
      finishStory(ctx, W, H)
    }
  }

  function drawProductAndText(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null,
    product: ProductOption,
    textColor: string,
    accentColor: string,
    fontFamily: string,
    W: number,
    H: number
  ) {
    const imgPadding = 80
    const imgMaxW = W - imgPadding * 2
    const imgMaxH = 800
    const imgY = 180

    if (img) {
      // Calculate aspect-fit dimensions
      const scale = Math.min(imgMaxW / img.width, imgMaxH / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      const imgX = (W - drawW) / 2

      ctx.save()
      drawRoundedRect(ctx, imgX, imgY, drawW, drawH, 32)
      ctx.clip()
      ctx.drawImage(img, imgX, imgY, drawW, drawH)
      ctx.restore()

      // Shadow border
      ctx.save()
      drawRoundedRect(ctx, imgX, imgY, drawW, drawH, 32)
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Product name below image
      const textY = imgY + drawH + 60
      ctx.fillStyle = textColor
      ctx.font = `900 48px ${fontFamily}`
      ctx.textAlign = 'center'
      const nameLines = wrapText(ctx, product.name, W - 120)
      nameLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, textY + i * 58)
      })

      // Price
      const priceY = textY + nameLines.length * 58 + 30
      ctx.fillStyle = accentColor
      ctx.font = `900 56px ${fontFamily}`
      ctx.fillText(formatPrice(product.price), W / 2, priceY)

      // Best-seller badge
      const badgeY = priceY + 60
      const badgeText = '\uD83D\uDD25 Best-Seller'
      ctx.font = `700 28px ${fontFamily}`
      const badgeWidth = ctx.measureText(badgeText).width + 40
      const badgeX = W / 2 - badgeWidth / 2
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, 44, 22)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.fillText(badgeText, W / 2, badgeY + 30)

      // Bottom sticker
      const stickerY = H - 120
      const stickerText =
        bottomSticker === 'bio'
          ? 'Lien en bio \uD83D\uDD17'
          : 'Commander sur WhatsApp \uD83D\uDCAC'

      ctx.font = `700 30px ${fontFamily}`
      const stickerW = ctx.measureText(stickerText).width + 60
      const stickerX = W / 2 - stickerW / 2
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      drawRoundedRect(ctx, stickerX, stickerY, stickerW, 56, 28)
      ctx.fill()
      ctx.fillStyle = '#111111'
      ctx.textAlign = 'center'
      ctx.fillText(stickerText, W / 2, stickerY + 37)
      ctx.textAlign = 'start'
    } else {
      // No product image — draw placeholder
      const placeholderY = 300
      const placeholderH = 500
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      drawRoundedRect(ctx, imgPadding, placeholderY, imgMaxW, placeholderH, 24)
      ctx.fill()
      ctx.fillStyle = textColor
      ctx.font = `600 28px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.fillText('Aucune image', W / 2, placeholderY + placeholderH / 2)

      // Product name
      const textY = placeholderY + placeholderH + 60
      ctx.fillStyle = textColor
      ctx.font = `900 48px ${fontFamily}`
      const nameLines = wrapText(ctx, product.name, W - 120)
      nameLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, textY + i * 58)
      })

      // Price
      const priceY = textY + nameLines.length * 58 + 30
      ctx.fillStyle = accentColor
      ctx.font = `900 56px ${fontFamily}`
      ctx.fillText(formatPrice(product.price), W / 2, priceY)

      // Best-seller badge
      const badgeY = priceY + 60
      const badgeText = '\uD83D\uDD25 Best-Seller'
      ctx.font = `700 28px ${fontFamily}`
      const badgeWidth = ctx.measureText(badgeText).width + 40
      const badgeX = W / 2 - badgeWidth / 2
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, 44, 22)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.fillText(badgeText, W / 2, badgeY + 30)

      // Bottom sticker
      const stickerY = H - 120
      const stickerText =
        bottomSticker === 'bio'
          ? 'Lien en bio \uD83D\uDD17'
          : 'Commander sur WhatsApp \uD83D\uDCAC'

      ctx.font = `700 30px ${fontFamily}`
      const stickerW = ctx.measureText(stickerText).width + 60
      const stickerX = W / 2 - stickerW / 2
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      drawRoundedRect(ctx, stickerX, stickerY, stickerW, 56, 28)
      ctx.fill()
      ctx.fillStyle = '#111111'
      ctx.textAlign = 'center'
      ctx.fillText(stickerText, W / 2, stickerY + 37)
      ctx.textAlign = 'start'
    }
  }

  function finishStory(ctx: CanvasRenderingContext2D, _W: number, H: number) {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
          setGenerating(false)
        } else {
          setGenerating(false)
          toast.error('Erreur lors de la génération de l\'image')
        }
      },
      'image/png',
      1
    )
    void _W
    void H
  }

  function handleGenerateStory() {
    if (!selectedProduct) {
      toast.error('Veuillez sélectionner un produit')
      return
    }
    setGenerating(true)
    setPreviewUrl(null)

    // Use requestAnimationFrame to let the canvas ref be available
    requestAnimationFrame(() => {
      drawStory(selectedProduct)
    })
  }

  function handleDownloadStory() {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `story-${selectedProduct?.name || 'produit'}.png`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Product selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProducts ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {formatPrice(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Template selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modèle de Story</CardTitle>
              <CardDescription>
                Choisissez un style pour votre story
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {STORY_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplateId(tmpl.id)}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                      templateId === tmpl.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Mini gradient preview */}
                    <div
                      className="w-full h-16 rounded-lg mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${tmpl.gradientFrom}, ${tmpl.gradientTo})`,
                      }}
                    />
                    <p className="font-semibold text-sm">{tmpl.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {tmpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color overrides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Couleurs personnalisées</CardTitle>
              <CardDescription>
                Optionnel — remplace les couleurs du modèle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="story-primary-color">Couleur primaire</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="story-primary-color"
                    type="color"
                    value={primaryOverride || templateConfig.gradientFrom}
                    onChange={(e) => setPrimaryOverride(e.target.value)}
                    className="w-12 h-10 rounded-md border cursor-pointer"
                  />
                  <Input
                    value={primaryOverride}
                    onChange={(e) => setPrimaryOverride(e.target.value)}
                    placeholder={templateConfig.gradientFrom}
                    className="flex-1 font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="story-secondary-color">Couleur secondaire</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="story-secondary-color"
                    type="color"
                    value={secondaryOverride || templateConfig.gradientTo}
                    onChange={(e) => setSecondaryOverride(e.target.value)}
                    className="w-12 h-10 rounded-md border cursor-pointer"
                  />
                  <Input
                    value={secondaryOverride}
                    onChange={(e) => setSecondaryOverride(e.target.value)}
                    placeholder={templateConfig.gradientTo}
                    className="flex-1 font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Bottom sticker toggle */}
              <div className="flex flex-col gap-2">
                <Label>Sticker en bas</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={bottomSticker === 'bio' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBottomSticker('bio')}
                    className="flex-1"
                  >
                    Lien en bio
                  </Button>
                  <Button
                    type="button"
                    variant={bottomSticker === 'whatsapp' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBottomSticker('whatsapp')}
                    className="flex-1"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleGenerateStory}
                disabled={generating || !selectedProduct}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Générer la Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Aperçu de la Story
            </CardTitle>
            <CardDescription>
              Format 9:16 (1080×1920) — prêt pour Instagram/TikTok
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {generating ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Génération de la story...</p>
              </div>
            ) : previewUrl ? (
              <>
                <div className="relative w-full max-w-[240px] mx-auto">
                  <img
                    src={previewUrl}
                    alt="Story preview"
                    className="w-full rounded-xl shadow-lg"
                    style={{ aspectRatio: '9/16' }}
                  />
                </div>
                <Button
                  onClick={handleDownloadStory}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger la Story
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Sélectionnez un produit et un modèle pour générer votre story</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Business Card Tab                                                  */
/* ------------------------------------------------------------------ */

function BusinessCardTab() {
  const shop = useAppStore((s) => s.shop)
  const [bgColor, setBgColor] = useState(shop?.primaryColor || '#EC4899')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function generateBusinessCard() {
    if (!shop?.id) {
      toast.error('Veuillez sélectionner une boutique')
      return
    }

    setGenerating(true)
    setPreviewUrl(null)

    requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const W = 1200
      const H = 675
      canvas.width = W
      canvas.height = H

      // Background
      const gradient = ctx.createLinearGradient(0, 0, W, H)
      gradient.addColorStop(0, bgColor)
      gradient.addColorStop(1, adjustColor(bgColor, -30))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, W, H)

      // Subtle pattern overlay
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      for (let i = 0; i < W; i += 40) {
        for (let j = 0; j < H; j += 40) {
          if ((i + j) % 80 === 0) {
            ctx.fillRect(i, j, 20, 20)
          }
        }
      }

      // Left side: Shop logo + name
      const leftCenterX = W * 0.25

      const shopLogo = shop.logo
      if (shopLogo) {
        const logoImg = new Image()
        logoImg.crossOrigin = 'anonymous'
        logoImg.onload = () => {
          const logoSize = 120
          ctx.save()
          drawRoundedRect(ctx, leftCenterX - logoSize / 2, 120, logoSize, logoSize, 20)
          ctx.clip()
          ctx.drawImage(logoImg, leftCenterX - logoSize / 2, 120, logoSize, logoSize)
          ctx.restore()

          // White border around logo
          ctx.save()
          drawRoundedRect(ctx, leftCenterX - logoSize / 2, 120, logoSize, logoSize, 20)
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'
          ctx.lineWidth = 3
          ctx.stroke()
          ctx.restore()

          drawCardText(ctx, leftCenterX, 280, W, H)
        }
        logoImg.onerror = () => {
          drawCardText(ctx, leftCenterX, 160, W, H)
        }
        logoImg.src = shopLogo
      } else {
        drawCardText(ctx, leftCenterX, 160, W, H)
      }
    })
  }

  function drawCardText(
    ctx: CanvasRenderingContext2D,
    leftCenterX: number,
    nameY: number,
    W: number,
    H: number
  ) {
    // Shop name
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 42px sans-serif'
    ctx.textAlign = 'center'
    const nameLines = wrapText(ctx, shop!.name, W * 0.4)
    nameLines.forEach((line, i) => {
      ctx.fillText(line, leftCenterX, nameY + i * 52)
    })

    // Shop description (if available)
    const descY = nameY + nameLines.length * 52 + 20
    if (shop!.description) {
      ctx.font = '400 22px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      const descLines = wrapText(ctx, shop!.description.substring(0, 80), W * 0.4)
      descLines.forEach((line, i) => {
        if (i < 2) {
          ctx.fillText(line, leftCenterX, descY + i * 30)
        }
      })
    }

    // Vertical divider
    const divX = W * 0.5
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(divX, 80, 2, H - 160)

    // Right side: QR code text + "Scannez pour commander"
    const rightCenterX = W * 0.75

    // QR code placeholder circle
    const qrSize = 200
    const qrX = rightCenterX - qrSize / 2
    const qrY = (H - qrSize) / 2 - 30

    ctx.fillStyle = '#FFFFFF'
    drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 16)
    ctx.fill()

    // QR code icon (simple square pattern)
    ctx.fillStyle = '#111111'
    const innerPad = 30
    const innerSize = qrSize - innerPad * 2
    ctx.fillRect(qrX + innerPad, qrY + innerPad, innerSize, innerSize)
    ctx.fillStyle = '#FFFFFF'
    // Create a simple QR-like pattern
    const cellSize = innerSize / 7
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if ((r + c) % 2 === 0 || r === 0 || r === 6 || c === 0 || c === 6) {
          if (!(r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            ctx.fillRect(
              qrX + innerPad + c * cellSize + 2,
              qrY + innerPad + r * cellSize + 2,
              cellSize - 4,
              cellSize - 4
            )
          }
        }
      }
    }

    // "Scannez pour commander" text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 26px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Scannez pour commander', rightCenterX, qrY + qrSize + 50)

    // URL
    ctx.font = '400 18px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(`boutiko.pro/${shop!.slug}`, rightCenterX, qrY + qrSize + 82)

    // Branding
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '600 14px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('Propulsé par Boutiko', W - 40, H - 30)
    ctx.textAlign = 'start'

    finishCard(ctx)
  }

  function finishCard(_ctx: CanvasRenderingContext2D) {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
          setGenerating(false)
        } else {
          setGenerating(false)
          toast.error('Erreur lors de la génération')
        }
      },
      'image/png',
      1
    )
    void _ctx
  }

  function handleDownload() {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `carte-de-visite-${shop?.slug || 'boutique'}.png`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Carte de Visite Digitale
            </CardTitle>
            <CardDescription>
              Générez une carte de visite avec le QR code de votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-bg-color">Couleur de fond</Label>
              <div className="flex items-center gap-3">
                <input
                  id="card-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 rounded-md border cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>

            <Button
              onClick={generateBusinessCard}
              disabled={generating || !shop?.id}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Générer la carte
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aperçu</CardTitle>
            <CardDescription>
              Format 16:9 (1200×675) — prêt pour les réseaux sociaux
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[250px] gap-4">
            {generating ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Génération en cours...</p>
              </div>
            ) : previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Carte de visite"
                  className="w-full rounded-xl shadow-lg"
                  style={{ aspectRatio: '16/9' }}
                />
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CreditCard className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Cliquez sur &quot;Générer&quot; pour créer votre carte de visite</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Utility: darken/lighten a hex color                                */
/* ------------------------------------------------------------------ */

function adjustColor(hex: string, amount: number): string {
  const sanitized = hex.replace('#', '')
  const num = parseInt(sanitized, 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/* ------------------------------------------------------------------ */
/*  Main Exported Component                                            */
/* ------------------------------------------------------------------ */

export function MarketingKit() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kit Marketing</h2>
        <p className="text-muted-foreground">
          Créez des QR codes, des stories et des cartes de visite pour promouvoir votre boutique
        </p>
      </div>

      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Stories</span>
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Carte de visite</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="mt-6">
          <QRCodeTab />
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <StoriesTab />
        </TabsContent>

        <TabsContent value="card" className="mt-6">
          <BusinessCardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}