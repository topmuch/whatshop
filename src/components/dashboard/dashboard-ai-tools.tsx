'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  Wand2,
  Instagram,
  Facebook,
  MessageCircle,
  Copy,
  Check,
  Download,
  Printer,
  QrCode,
  Share2,
  Loader2,
  Image as ImageIcon,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/shared'

interface ProductOption {
  id: string
  name: string
  price: number
  description?: string | null
}

interface GeneratedContent {
  instagram: string
  facebook: string
  whatsapp: string
  hashtags: string[]
}

// ============ SECTION A: AI Content Generator ============

function ContentGenerator({ preselectedProduct }: { preselectedProduct?: ProductOption }) {
  const { shop } = useAppStore()
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [inputMode, setInputMode] = useState<'product' | 'manual'>('product')

  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const posterRef = useRef<HTMLDivElement>(null)

  // Fetch products
  useEffect(() => {
    if (!shop) return
    setLoadingProducts(true)
    fetch(`/api/products?shopId=${shop.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        // Pre-select product if coming from product page
        if (preselectedProduct) {
          setSelectedProductId(preselectedProduct.id)
          setInputMode('product')
        }
      })
      .catch(() => toast.error('Erreur de chargement des produits'))
      .finally(() => setLoadingProducts(false))
  }, [shop, preselectedProduct])

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  async function handleGenerate() {
    const productName = inputMode === 'product' ? selectedProduct?.name : manualName
    const productPrice = inputMode === 'product' ? selectedProduct?.price : Number(manualPrice)
    const productDesc = inputMode === 'product' ? selectedProduct?.description : ''

    if (!productName || !productPrice) {
      toast.error('Veuillez remplir le nom et le prix du produit')
      return
    }

    setGenerating(true)
    setContent(null)

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          price: productPrice,
          description: productDesc || undefined,
          shopName: shop?.name || undefined,
          shopSlug: shop?.slug || undefined,
        }),
      })

      if (!res.ok) {
        toast.error('Erreur lors de la génération du contenu')
        return
      }

      const data = await res.json()
      setContent(data)
      toast.success('Contenu généré avec succès !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setGenerating(false)
    }
  }

  async function copyToClipboard(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copié dans le presse-papiers !')
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Erreur de copie')
    }
  }

  function sendWhatsApp(text: string) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Générateur de contenu IA</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Ajoutez un produit et laissez l&apos;IA créer vos publications pour les réseaux sociaux.
        </p>
      </div>

      {/* Input section */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'product' | 'manual')}>
            <TabsList className="mb-4">
              <TabsTrigger value="product" className="gap-2">
                <Package className="h-4 w-4" />
                Produit existant
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Saisie manuelle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="product">
              <div className="space-y-2">
                <Label htmlFor="product-select">Sélectionnez un produit</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product-select">
                    <SelectValue placeholder="Choisir un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : products.length === 0 ? (
                      <SelectItem value="empty" disabled>Aucun produit trouvé</SelectItem>
                    ) : (
                      products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {formatPrice(p.price)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mt-2">
                    {selectedProduct.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-name">Nom du produit *</Label>
                  <Input
                    id="manual-name"
                    placeholder="Ex: Robe Wax Colorée"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-price">Prix (FCFA) *</Label>
                  <Input
                    id="manual-price"
                    type="number"
                    placeholder="15000"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleGenerate}
            disabled={generating || (inputMode === 'product' ? !selectedProductId : !manualName || !manualPrice)}
            className="w-full sm:w-auto gap-2 mt-4"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Générer le contenu
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {generating && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {content && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {/* Instagram Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="rounded-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <CardTitle className="text-lg">Publication Instagram</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => copyToClipboard(content.instagram, 'instagram')}
                    >
                      {copiedField === 'instagram' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedField === 'instagram' ? 'Copié' : 'Copier'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-white dark:bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {content.instagram}
                  </div>
                  {content.hashtags && content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {content.hashtags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100">
                          #{tag.replace(/^#/, '')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Facebook Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-sky-50/50 dark:from-blue-950/20 dark:to-sky-950/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Description Facebook</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => copyToClipboard(content.facebook, 'facebook')}
                    >
                      {copiedField === 'facebook' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedField === 'facebook' ? 'Copié' : 'Copier'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-white dark:bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {content.facebook}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* WhatsApp Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">Message WhatsApp</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => copyToClipboard(content.whatsapp, 'whatsapp')}
                      >
                        {copiedField === 'whatsapp' ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedField === 'whatsapp' ? 'Copié' : 'Copier'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-100"
                        onClick={() => sendWhatsApp(content.whatsapp)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-white dark:bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {content.whatsapp}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ SECTION B: QR Code & Poster ============

function QrCodePoster() {
  const { shop } = useAppStore()
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const shopUrl = shop ? `boutiko.com/${shop.slug}` : ''

  async function generateQrCode() {
    if (!shop) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://${shopUrl}`,
          shopName: shop.name,
        }),
      })
      if (!res.ok) {
        toast.error('Erreur lors de la génération du QR code')
        return
      }
      const data = await res.json()
      setQrSvg(data.svg)
      toast.success('QR code généré !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setGenerating(false)
    }
  }

  function downloadQrCode() {
    if (!qrSvg) return

    // Convert SVG to PNG data URL for download
    const svgBlob = new Blob([qrSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-code-${shop?.slug || 'boutique'}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('QR code téléchargé !')
  }

  function handlePrintPoster() {
    if (!posterRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression')
      return
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Affiche - ${shop?.name || 'Ma Boutique'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; font-family: system-ui, sans-serif; }
          .poster { text-align: center; padding: 40px; max-width: 400px; }
          .poster h1 { font-size: 28px; font-weight: 800; color: #25D366; margin-bottom: 8px; }
          .poster .subtitle { font-size: 14px; color: #666; margin-bottom: 24px; }
          .poster .qr-container { margin: 20px auto; }
          .poster .qr-container svg { width: 250px; height: 250px; }
          .poster .url { font-size: 16px; color: #333; font-weight: 600; margin-top: 16px; }
          .poster .cta { font-size: 14px; color: #25D366; font-weight: 600; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .poster .divider { width: 60px; height: 3px; background: #25D366; margin: 20px auto; border-radius: 2px; }
        </style>
      </head>
      <body>
        <div class="poster">
          <h1>${shop?.name || 'Ma Boutique'}</h1>
          <div class="divider"></div>
          <p class="subtitle">Commandez en ligne, recevez chez vous</p>
          <div class="qr-container">${qrSvg}</div>
          <p class="url">${shopUrl}</p>
          <p class="cta">📱 Scannez pour commander</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  function shareShop() {
    const text = `Découvrez ma boutique en ligne ! 🛍️ Commandez vos produits préférés facilement.\n\n${shopUrl}`
    if (navigator.share) {
      navigator.share({ title: shop?.name || 'Ma Boutique', text, url: `https://${shopUrl}` })
    } else {
      copyToClipboard(text)
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Lien copié !')
    } catch {
      toast.error('Erreur de copie')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">QR Code de ma boutique</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Générez un QR code que vos clients peuvent scanner pour accéder à votre boutique.
        </p>
      </div>

      {/* Shop URL display */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <Label className="text-xs text-muted-foreground">URL de votre boutique</Label>
              <p className="font-mono text-sm text-primary font-medium mt-1 truncate">{shopUrl}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => copyToClipboard(`https://${shopUrl}`)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate QR */}
      {!qrSvg && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={generateQrCode} disabled={generating} className="gap-2 flex-1 sm:flex-none">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Générer le QR code
              </>
            )}
          </Button>
          <Button variant="outline" onClick={shareShop} className="gap-2 flex-1 sm:flex-none">
            <Share2 className="h-4 w-4" />
            Partager le lien
          </Button>
        </div>
      )}

      {/* QR Code display */}
      {qrSvg && !generating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className="bg-white rounded-xl p-4 shadow-sm border"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  style={{ width: '200px', height: '200px' }}
                />
                <p className="text-sm font-medium mt-4">{shop?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{shopUrl}</p>

                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Button onClick={downloadQrCode} variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Télécharger le QR code
                  </Button>
                  <Button onClick={() => setShowPoster(!showPoster)} variant="outline" size="sm" className="gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {showPoster ? 'Masquer l\'affiche' : 'Voir l\'affiche'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poster preview */}
          <AnimatePresence>
            {showPoster && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-xl border-2 border-dashed border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium">Aperçu de l&apos;affiche</p>
                      <Button onClick={handlePrintPoster} size="sm" className="gap-1.5">
                        <Printer className="h-3.5 w-3.5" />
                        Imprimer l&apos;affiche
                      </Button>
                    </div>

                    {/* Poster preview card */}
                    <div
                      ref={posterRef}
                      className="bg-white rounded-xl p-8 text-center mx-auto max-w-sm shadow-lg border"
                    >
                      <h3 className="text-2xl font-extrabold text-green-600">{shop?.name || 'Ma Boutique'}</h3>
                      <div className="w-16 h-0.5 bg-green-500 rounded mx-auto my-3" />
                      <p className="text-sm text-gray-500">Commandez en ligne, recevez chez vous</p>
                      <div className="my-6 flex justify-center" dangerouslySetInnerHTML={{ __html: qrSvg }} style={{ width: '180px', height: '180px' }} />
                      <p className="font-mono font-semibold text-sm text-gray-800">{shopUrl}</p>
                      <p className="text-green-600 font-bold text-sm mt-3 uppercase tracking-wider">
                        📱 Scannez pour commander
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

// ============ MAIN COMPONENT ============

export function DashboardAiTools({ preselectedProduct }: { preselectedProduct?: ProductOption }) {
  return (
    <div className="space-y-8">
      {/* Section A: AI Content Generator */}
      <ContentGenerator preselectedProduct={preselectedProduct} />

      <Separator />

      {/* Section B: QR Code & Poster */}
      <QrCodePoster />
    </div>
  )
}
