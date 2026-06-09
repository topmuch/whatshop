'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TemplateSelector } from '@/components/dashboard/template-selector'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Check,
  X,
  Copy,
  Share2,
  Loader2,
  Store,
  Crown,
  Globe,
  Instagram,
  Palette,
  QrCode,
  Download,
  RefreshCw,
  Search,
  ImagePlus,
  Trash2,
  Type,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

const planLimits = {
  FREE: { products: 10, price: '0 FCFA/mois', features: { categories: true, orders: true, whatsapp: true, customLogo: false, analytics: false } },
  STANDARD: { products: 100, price: '5 000 FCFA/mois', features: { categories: true, orders: true, whatsapp: true, customLogo: true, analytics: true } },
  PREMIUM: { products: Infinity, price: '15 000 FCFA/mois', features: { categories: true, orders: true, whatsapp: true, customLogo: true, analytics: true } },
}

const planBadgeColors: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  STANDARD: 'bg-green-100 text-green-800 hover:bg-green-100',
  PREMIUM: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
}

const planLabels: Record<string, string> = {
  FREE: 'Gratuit',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
}

export function DashboardSettings() {
  const { shop, setShop } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [productCount, setProductCount] = useState(0)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  // Shop form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState('')
  const [banner, setBanner] = useState('')
  const [template, setTemplate] = useState('classic')

  // Hero images (slider)
  const [heroImages, setHeroImages] = useState<string[]>([])

  // Promo banners
  const [promoBanners, setPromoBanners] = useState<{id: string; image: string; title: string; link: string}[]>([])
  const [promoUploading, setPromoUploading] = useState(false)

  // Upload states
  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [heroUploading, setHeroUploading] = useState(false)

  // SEO form state
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [seoSaving, setSeoSaving] = useState(false)

  // Domain state
  const [domainStatus, setDomainStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE')
  const [domainName, setDomainName] = useState('')
  const [domainRejectionReason, setDomainRejectionReason] = useState('')
  const [domainLoading, setDomainLoading] = useState(false)
  const [dnsOpen, setDnsOpen] = useState(false)
  const [domainInput, setDomainInput] = useState('')

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const promoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shop) {
      setName(shop.name)
      setDescription(shop.description || '')
      setWhatsapp(shop.whatsapp)
      setAddress(shop.address || '')
      setPhone(shop.phone || '')
      setLogo(shop.logo || '')
      setBanner(shop.banner || '')
      setTemplate(shop.template || 'classic')

      // Parse hero images from shop data
      try {
        const heroRaw = (shop as Record<string, unknown>).heroImages as string | undefined
        const parsed = heroRaw ? JSON.parse(heroRaw) : []
        setHeroImages(Array.isArray(parsed) ? parsed : [])
      } catch {
        setHeroImages([])
      }

      // Parse promo banners from shop data
      try {
        const promoRaw = (shop as Record<string, unknown>).promoBanners as string | undefined
        const parsed = promoRaw ? JSON.parse(promoRaw) : []
        setPromoBanners(Array.isArray(parsed) ? parsed : [])
      } catch {
        setPromoBanners([])
      }

      // Fetch product count
      fetch(`/api/products?shopId=${shop.id}`)
        .then((res) => res.ok ? res.json() : [])
        .then((products) => setProductCount(Array.isArray(products) ? products.length : 0))
        .catch(() => setProductCount(0))

      // Generate QR code
      generateQrCode()

      // Fetch SEO settings
      fetch('/api/settings')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setSeoTitle(data.seoTitle || '')
            setSeoDescription(data.seoDescription || '')
            setCoverImageUrl(data.coverImageUrl || '')
          }
        })
        .catch(() => {})

      // Fetch domain status
      fetch('/api/settings/domain/status')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setDomainStatus(data.status || 'NONE')
            setDomainName(data.domain || '')
            setDomainRejectionReason(data.rejectionReason || '')
          }
        })
        .catch(() => {})
    }
  }, [shop])

  // Upload helper
  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erreur lors du téléchargement')
      return null
    }
    const data = await res.json()
    return data.url
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        setLogo(url)
        toast.success('Logo téléchargé avec succès !')
      }
    } finally {
      setLogoUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        setBanner(url)
        toast.success('Bannière téléchargée avec succès !')
      }
    } finally {
      setBannerUploading(false)
      if (bannerInputRef.current) bannerInputRef.current.value = ''
    }
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setHeroUploading(true)
    try {
      const newImages: string[] = []
      for (let i = 0; i < files.length; i++) {
        if (heroImages.length + newImages.length >= 6) {
          toast.warning('Maximum 6 images autorisées')
          break
        }
        const url = await uploadFile(files[i])
        if (url) newImages.push(url)
      }
      if (newImages.length > 0) {
        setHeroImages((prev) => [...prev, ...newImages])
        toast.success(`${newImages.length} image(s) ajoutée(s) au slide !`)
      }
    } finally {
      setHeroUploading(false)
      if (heroInputRef.current) heroInputRef.current.value = ''
    }
  }

  function removeHeroImage(index: number) {
    setHeroImages((prev) => prev.filter((_, i) => i !== index))
    toast.success('Image retirée du slide')
  }

  async function handlePromoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPromoUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        const newBanner = {
          id: Date.now().toString(),
          image: url,
          title: 'Promotion',
          link: '',
        }
        setPromoBanners((prev) => [...prev, newBanner])
        toast.success('Bannière publicitaire ajoutée !')
      }
    } finally {
      setPromoUploading(false)
      if (promoInputRef.current) promoInputRef.current.value = ''
    }
  }

  function removePromoBanner(id: string) {
    setPromoBanners((prev) => prev.filter((b) => b.id !== id))
    toast.success('Bannière retirée')
  }

  function updatePromoBanner(id: string, field: 'title' | 'link', value: string) {
    setPromoBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  async function generateQrCode() {
    if (!shop) return
    setQrLoading(true)
    try {
      const shopUrl = `https://boutiko.com/${shop.slug}`
      const res = await fetch('/api/ai/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shopUrl, shopName: shop.name }),
      })
      if (res.ok) {
        const data = await res.json()
        setQrDataUrl(data.dataUrl)
      }
    } catch {
      // fallback
    } finally {
      setQrLoading(false)
    }
  }

  function downloadQrCode() {
    if (!qrDataUrl || !shop) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 900
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 800, 900)
      const qrSize = 600
      const offsetX = (800 - qrSize) / 2
      ctx.drawImage(img, offsetX, 60, qrSize, qrSize)
      ctx.fillStyle = '#1a1a2e'
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(shop.name, 400, 720)
      ctx.fillStyle = '#6b7280'
      ctx.font = '18px monospace'
      ctx.fillText(`boutiko.com/${shop.slug}`, 400, 760)
      ctx.fillStyle = '#25D366'
      ctx.font = '14px system-ui, -apple-system, sans-serif'
      ctx.fillText('Propulsé par Boutiko', 400, 800)
      canvas.toBlob((blob) => {
        if (!blob) return
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = `qr-${shop.slug}.png`
        a.click()
        URL.revokeObjectURL(pngUrl)
      }, 'image/png')
    }
    img.src = qrDataUrl
  }

  async function handleSave() {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          name,
          description,
          whatsapp,
          address,
          phone,
          logo,
          banner,
          template,
          heroImages: JSON.stringify(heroImages),
          promoBanners: JSON.stringify(promoBanners),
        }),
      })

      if (!res.ok) {
        toast.error('Erreur lors de la sauvegarde')
        return
      }

      const updatedShop = await res.json()
      setShop({
        id: updatedShop.id,
        name: updatedShop.name,
        slug: updatedShop.slug,
        description: updatedShop.description,
        logo: updatedShop.logo,
        banner: updatedShop.banner,
        whatsapp: updatedShop.whatsapp,
        address: updatedShop.address,
        phone: updatedShop.phone,
        plan: updatedShop.plan,
        template: updatedShop.template || 'classic',
        isActive: updatedShop.isActive,
      })
      toast.success('Boutique mise à jour !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  function copyShopUrl() {
    if (!shop) return
    navigator.clipboard.writeText(`boutiko.com/${shop.slug}`)
    toast.success('URL copiée !')
  }

  async function handleSeoSave() {
    setSeoSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seoTitle,
          seoDescription,
          coverImageUrl,
        }),
      })
      if (!res.ok) {
        toast.error('Erreur lors de la sauvegarde SEO')
        return
      }
      toast.success('Paramètres SEO enregistrés !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSeoSaving(false)
    }
  }

  async function handleDomainRequest() {
    if (!domainInput.trim()) {
      toast.error('Veuillez entrer un nom de domaine')
      return
    }
    setDomainLoading(true)
    try {
      const res = await fetch('/api/settings/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erreur lors de la demande de domaine')
        return
      }
      const data = await res.json()
      setDomainStatus(data.status || 'PENDING')
      setDomainName(data.domain || domainInput.trim())
      setDnsOpen(true)
      toast.success('Demande de domaine envoyée !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setDomainLoading(false)
    }
  }

  const currentPlan = shop?.plan || 'FREE'
  const limits = planLimits[currentPlan as keyof typeof planLimits] || planLimits.FREE

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      {/* Shop Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Informations de la boutique
          </CardTitle>
          <CardDescription>
            Modifiez les informations de votre boutique en ligne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Nom de la boutique</Label>
            <Input
              id="shop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de votre boutique"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-desc">Description</Label>
            <Textarea
              id="shop-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre activité..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop-whatsapp">Numéro WhatsApp *</Label>
              <Input
                id="shop-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+221 77 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-phone">Téléphone</Label>
              <Input
                id="shop-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 33 987 65 43"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-address">Adresse</Label>
            <Input
              id="shop-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Dakar, Sénégal"
            />
          </div>

          {/* Logo & Banner Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo de la boutique</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {logo ? (
                <div className="relative rounded-lg border border-muted overflow-hidden group">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-24 object-contain bg-white p-2"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Changer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      onClick={() => setLogo('')}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {logoUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {logoUploading ? 'Téléchargement...' : 'Cliquez pour télécharger le logo'}
                  </span>
                </button>
              )}
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>Bannière de la boutique</Label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleBannerUpload}
              />
              {banner ? (
                <div className="relative rounded-lg border border-muted overflow-hidden group">
                  <img
                    src={banner}
                    alt="Bannière"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Changer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      onClick={() => setBanner('')}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={bannerUploading}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {bannerUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {bannerUploading ? 'Téléchargement...' : 'Cliquez pour télécharger la bannière'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Hero Slider Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" />
            Images du slide (page d&apos;accueil)
          </CardTitle>
          <CardDescription>
            Ajoutez jusqu&apos;à 6 images qui défilent en haut de votre boutique publique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current hero images */}
          {heroImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {heroImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg border border-muted overflow-hidden group aspect-video"
                >
                  <img
                    src={img}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-black/60 text-white border-0">
                      {idx + 1}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHeroImage(idx)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <input
            ref={heroInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={handleHeroUpload}
          />
          {heroImages.length < 6 && (
            <button
              type="button"
              onClick={() => heroInputRef.current?.click()}
              disabled={heroUploading}
              className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/20 py-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {heroUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {heroUploading
                  ? 'Téléchargement en cours...'
                  : `Cliquez pour ajouter des images (${heroImages.length}/6)`}
              </span>
              <span className="text-xs text-muted-foreground/60">
                JPG, PNG, GIF ou WebP — Max 5 Mo par image
              </span>
            </button>
          )}

          {heroImages.length > 0 && (
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Enregistrer les images du slide
            </Button>
          )}

          {heroImages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Si aucune image n&apos;est ajoutée, les images par défaut du slide seront affichées sur votre boutique.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Promo Banners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" />
            Bannières publicitaires
          </CardTitle>
          <CardDescription>
            Ajoutez des bannières promotionnelles sur votre boutique (jusqu&apos;à 4)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current promo banners */}
          {promoBanners.length > 0 && (
            <div className="space-y-4">
              {promoBanners.map((banner, idx) => (
                <div key={banner.id} className="rounded-lg border border-muted overflow-hidden">
                  {/* Banner preview */}
                  <div className="relative aspect-[16/5] bg-muted/20">
                    <img
                      src={banner.image}
                      alt={banner.title || `Bannière ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-black/60 text-white border-0">
                        {idx + 1}/{promoBanners.length}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePromoBanner(banner.id)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {/* Banner fields */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Titre de la bannière</Label>
                      <Input
                        value={banner.title}
                        onChange={(e) => updatePromoBanner(banner.id, 'title', e.target.value)}
                        placeholder="Ex: Promotion d'été"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Lien (optionnel)</Label>
                      <Input
                        value={banner.link}
                        onChange={(e) => updatePromoBanner(banner.id, 'link', e.target.value)}
                        placeholder="https://example.com/promo"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <input
            ref={promoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handlePromoUpload}
          />
          {promoBanners.length < 4 && (
            <button
              type="button"
              onClick={() => promoInputRef.current?.click()}
              disabled={promoUploading}
              className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/20 py-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {promoUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {promoUploading
                  ? 'Téléchargement en cours...'
                  : `Cliquez pour ajouter une bannière (${promoBanners.length}/4)`}
              </span>
              <span className="text-xs text-muted-foreground/60">
                JPG, PNG, GIF ou WebP — Max 5 Mo — Ratio 16:5 recommandé
              </span>
            </button>
          )}

          {promoBanners.length > 0 && (
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Enregistrer les bannières
            </Button>
          )}

          {promoBanners.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Les bannières publicitaires s&apos;affichent sur votre boutique entre les sections produits.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Template Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Thème de la boutique
          </CardTitle>
          <CardDescription>
            Choisissez un thème pour personnaliser l&apos;apparence de votre boutique publique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateSelector currentTemplate={template} onSelect={setTemplate} />
        </CardContent>
      </Card>

      {/* SEO & Apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            SEO &amp; Apparence
          </CardTitle>
          <CardDescription>
            Optimisez le référencement et l&apos;apparence de votre boutique sur les réseaux sociaux
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title" className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                SEO Title
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {seoTitle.length}/60
              </span>
            </div>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => {
                if (e.target.value.length <= 60) setSeoTitle(e.target.value)
              }}
              placeholder="Titre de votre boutique (60 caractères max)"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-description" className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Meta Description
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {seoDescription.length}/160
              </span>
            </div>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => {
                if (e.target.value.length <= 160) setSeoDescription(e.target.value)
              }}
              placeholder="Description de votre boutique pour les moteurs de recherche (160 caractères max)"
              rows={3}
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-cover" className="flex items-center gap-2">
              <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
              Image de couverture (Open Graph)
            </Label>
            <Input
              id="seo-cover"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <Button onClick={handleSeoSave} disabled={seoSaving} className="gap-2">
            {seoSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Enregistrer SEO
          </Button>
        </CardContent>
      </Card>

      {/* Nom de Domaine Personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Nom de domaine personnalisé
          </CardTitle>
          <CardDescription>
            Utilisez votre propre nom de domaine pour votre boutique Boutiko
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Domain Status Display */}
          {domainStatus === 'APPROVED' && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Domaine actif</p>
                <p className="text-sm text-green-700 font-mono">{domainName}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-auto flex-shrink-0">APPROUVÉ</Badge>
            </div>
          )}

          {domainStatus === 'PENDING' && (
            <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">En attente de validation</p>
                <p className="text-sm text-yellow-700">Votre domaine <span className="font-mono">{domainName}</span> est en cours de vérification.</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 ml-auto flex-shrink-0">EN ATTENTE</Badge>
            </div>
          )}

          {domainStatus === 'REJECTED' && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Demande rejetée</p>
                <p className="text-sm text-red-700">{domainRejectionReason || 'Votre demande de domaine a été rejetée. Vous pouvez soumettre une nouvelle demande.'}</p>
              </div>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100 ml-auto flex-shrink-0">REJETÉ</Badge>
            </div>
          )}

          {domainStatus === 'NONE' && (
            <div className="flex items-center gap-3 rounded-lg border border-muted bg-muted/30 p-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Aucun domaine personnalisé configuré</p>
            </div>
          )}

          {/* Domain Request Form */}
          {(domainStatus === 'NONE' || domainStatus === 'REJECTED') && (
            <div className="space-y-3">
              <Separator />
              <h3 className="text-sm font-semibold">Demander un domaine</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="maboutique.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDomainRequest()
                  }}
                />
                <Button
                  onClick={handleDomainRequest}
                  disabled={domainLoading || !domainInput.trim()}
                  className="gap-2 flex-shrink-0"
                >
                  {domainLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Demander
                </Button>
              </div>
            </div>
          )}

          {/* DNS Instructions (collapsible) */}
          {(domainStatus === 'PENDING' || domainStatus === 'APPROVED') && domainName && (
            <>
              <Separator />
              <Collapsible open={dnsOpen} onOpenChange={setDnsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between gap-2"
                  >
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Configuration DNS requise
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${dnsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pour configurer votre domaine, ajoutez un enregistrement CNAME ou A :
                  </p>

                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</p>
                        <p className="text-sm font-mono font-semibold">CNAME</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom / Hôte</p>
                        <p className="text-sm font-mono font-semibold">@</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valeur</p>
                        <p className="text-sm font-mono font-semibold">boutiko.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      La propagation DNS peut prendre jusqu&apos;à 48 heures.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Mon abonnement
          </CardTitle>
          <CardDescription>
            Gérez votre plan et consultez votre utilisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current plan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan actuel</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={planBadgeColors[currentPlan] || planBadgeColors.FREE}>
                  {planLabels[currentPlan] || planLabels.FREE}
                </Badge>
                <span className="text-sm text-muted-foreground">{limits.price}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Produits utilisés</p>
              <p className="text-lg font-bold">
                {productCount}
                <span className="text-sm text-muted-foreground font-normal">
                  {' '}/ {limits.products === Infinity ? '∞' : limits.products}
                </span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Plan comparison table */}
          <div>
            <h3 className="font-semibold mb-4">Comparer les plans</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonctionnalité</TableHead>
                    <TableHead className="text-center">Gratuit</TableHead>
                    <TableHead className="text-center">Standard</TableHead>
                    <TableHead className="text-center">Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Produits</TableCell>
                    <TableCell className="text-center">10</TableCell>
                    <TableCell className="text-center">100</TableCell>
                    <TableCell className="text-center">Illimité</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Prix</TableCell>
                    <TableCell className="text-center">0 FCFA</TableCell>
                    <TableCell className="text-center">5 000 FCFA/mois</TableCell>
                    <TableCell className="text-center">15 000 FCFA/mois</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Catégories</TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gestion des commandes</TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bouton WhatsApp</TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Logo personnalisé</TableCell>
                    <TableCell className="text-center"><X className="h-4 w-4 text-red-400 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Statistiques avancées</TableCell>
                    <TableCell className="text-center"><X className="h-4 w-4 text-red-400 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Upgrade buttons */}
          <div className="flex flex-wrap gap-3">
            {currentPlan !== 'STANDARD' && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info('Bientôt disponible !')}
              >
                Passer au Standard
              </Button>
            )}
            {currentPlan !== 'PREMIUM' && (
              <Button
                className="gap-2"
                onClick={() => toast.info('Bientôt disponible !')}
              >
                Passer au Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR Code de ma boutique
          </CardTitle>
          <CardDescription>
            Partagez ce QR code pour que vos clients accèdent à votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* QR Code display */}
            <div className="relative flex-shrink-0">
              {qrLoading ? (
                <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/30">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : qrDataUrl ? (
                <div className="w-48 h-48 rounded-2xl bg-white border shadow-sm flex items-center justify-center p-3 hover:shadow-md transition-shadow">
                  <img src={qrDataUrl} alt="QR Code de la boutique" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 bg-muted/30">
                  <QrCode className="h-8 w-8 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">QR Code</span>
                </div>
              )}
            </div>

            {/* Info & actions */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <p className="text-sm text-muted-foreground">Boutique</p>
                <p className="text-lg font-semibold">{shop?.name}</p>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  boutiko.com/{shop?.slug}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={downloadQrCode}
                  disabled={!qrDataUrl}
                >
                  <Download className="h-4 w-4" />
                  Télécharger PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={copyShopUrl}
                >
                  <Copy className="h-4 w-4" />
                  Copier le lien
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={generateQrCode}
                  disabled={qrLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${qrLoading ? 'animate-spin' : ''}`} />
                  Régénérer
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">💡 Idées d&apos;utilisation</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Imprimez-le sur vos cartes de visite</li>
                  <li>• Ajoutez-le à vos affiches et flyers</li>
                  <li>• Partagez-le sur Instagram et WhatsApp</li>
                  <li>• Affichez-le dans votre magasin physique</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            URL de ma boutique
          </CardTitle>
          <CardDescription>
            Partagez votre boutique avec vos clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border bg-muted/50 px-4 py-2.5 font-mono text-sm">
              boutiko.com/{shop?.slug}
            </div>
            <Button variant="outline" size="icon" onClick={copyShopUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Partager sur les réseaux
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast.info('Partage Instagram bientôt disponible')}
              >
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast.info('Partage TikTok bientôt disponible')}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.82a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.23z"/>
                </svg>
                TikTok
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast.info('Partage Facebook bientôt disponible')}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-600" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  const url = `https://wa.me/?text=${encodeURIComponent('Découvrez ma boutique sur Boutiko ! boutiko.com/' + (shop?.slug || ''))}`
                  toast.success('Lien WhatsApp généré !')
                }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-green-600" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
