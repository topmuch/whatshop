'use client'

import { useState, useEffect, useRef } from 'react'
import type { Shop } from '@/lib/store'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Loader2,
  ImagePlus,
  Trash2,
  Upload,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { uploadFile } from './upload-file'

export function AppearanceTab({ shop }: { shop: Shop | null }) {
  const { setShop, publicShop, setPublicShop } = useAppStore()

  // Hero images (slider)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [heroUrlInput, setHeroUrlInput] = useState('')
  const [heroUploading, setHeroUploading] = useState(false)

  // Promo banners
  const [promoBanners, setPromoBanners] = useState<{id: string; image: string; title: string; link: string}[]>([])
  const [promoUrlInput, setPromoUrlInput] = useState('')
  const [promoUploading, setPromoUploading] = useState(false)

  // Brands carousel
  const [brands, setBrands] = useState<{id: string; name: string; image: string; link: string}[]>([])
  const [brandUrlInput, setBrandUrlInput] = useState('')
  const [brandNameInput, setBrandNameInput] = useState('')
  const [brandUploading, setBrandUploading] = useState(false)

  // Saving state
  const [saving, setSaving] = useState(false)

  const heroInputRef = useRef<HTMLInputElement>(null)
  const promoInputRef = useRef<HTMLInputElement>(null)
  const brandInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shop) {
      // Parse hero images from shop data
      try {
        const heroRaw = (shop as unknown as Record<string, unknown>).heroImages as string | undefined
        const parsed = heroRaw ? JSON.parse(heroRaw) : []
        setHeroImages(Array.isArray(parsed) ? parsed : [])
      } catch {
        setHeroImages([])
      }

      // Parse promo banners from shop data
      try {
        const promoRaw = (shop as unknown as Record<string, unknown>).promoBanners as string | undefined
        const parsed = promoRaw ? JSON.parse(promoRaw) : []
        setPromoBanners(Array.isArray(parsed) ? parsed : [])
      } catch {
        setPromoBanners([])
      }

      // Parse brands from shop data
      try {
        const brandsRaw = (shop as unknown as Record<string, unknown>).brands as string | undefined
        const parsed = brandsRaw ? JSON.parse(brandsRaw) : []
        setBrands(Array.isArray(parsed) ? parsed : [])
      } catch {
        setBrands([])
      }
    }
  }, [shop])

  // ── Hero handlers ──
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

  function addHeroFromUrl() {
    const url = heroUrlInput.trim()
    if (!url) return
    if (heroImages.length >= 6) {
      toast.warning('Maximum 6 images autorisées')
      return
    }
    setHeroImages((prev) => [...prev, url])
    setHeroUrlInput('')
    toast.success('Image ajoutée au slide !')
  }

  // ── Promo handlers ──
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

  function addPromoFromUrl() {
    const url = promoUrlInput.trim()
    if (!url) return
    if (promoBanners.length >= 4) {
      toast.warning('Maximum 4 bannières autorisées')
      return
    }
    const newBanner = {
      id: Date.now().toString(),
      image: url,
      title: 'Promotion',
      link: '',
    }
    setPromoBanners((prev) => [...prev, newBanner])
    setPromoUrlInput('')
    toast.success('Bannière publicitaire ajoutée !')
  }

  function updatePromoBanner(id: string, field: 'title' | 'link', value: string) {
    setPromoBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  // ── Brand handlers ──
  async function handleBrandUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBrandUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        const newBrand = {
          id: Date.now().toString(),
          image: url,
          name: brandNameInput.trim() || 'Marque',
          link: '',
        }
        setBrands((prev) => [...prev, newBrand])
        setBrandNameInput('')
        toast.success('Marque ajoutée !')
      }
    } finally {
      setBrandUploading(false)
      if (brandInputRef.current) brandInputRef.current.value = ''
    }
  }

  function removeBrand(id: string) {
    setBrands((prev) => prev.filter((b) => b.id !== id))
    toast.success('Marque retirée')
  }

  function addBrandFromUrl() {
    const url = brandUrlInput.trim()
    const name = brandNameInput.trim() || 'Marque'
    if (!url) {
      toast.error('Entrez une URL pour le logo de la marque')
      return
    }
    if (brands.length >= 20) {
      toast.warning('Maximum 20 marques autorisées')
      return
    }
    const newBrand = {
      id: Date.now().toString(),
      image: url,
      name,
      link: '',
    }
    setBrands((prev) => [...prev, newBrand])
    setBrandUrlInput('')
    setBrandNameInput('')
    toast.success('Marque ajoutée !')
  }

  function updateBrand(id: string, field: 'name' | 'link', value: string) {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  // ── Save ──
  async function handleSave() {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          heroImages: JSON.stringify(heroImages),
          promoBanners: JSON.stringify(promoBanners),
          brands: JSON.stringify(brands),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors de la sauvegarde')
        return
      }

      const updatedShop = await res.json()
      setShop({
        ...shop,
        ...updatedShop,
      })
      if (publicShop && publicShop.id === shop.id) {
        setPublicShop({
          ...publicShop,
          ...updatedShop,
        })
      }
      toast.success('Apparence mise à jour !')
    } catch (err) {
      console.error('Appearance save error:', err)
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
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

          {/* URL input for hero images */}
          {heroImages.length < 6 && (
            <div className="flex items-center gap-2">
              <Input
                value={heroUrlInput}
                onChange={(e) => setHeroUrlInput(e.target.value)}
                placeholder="Ou collez une URL d'image..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addHeroFromUrl()
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeroFromUrl}
                disabled={!heroUrlInput.trim()}
                className="gap-1.5 h-9 flex-shrink-0"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            </div>
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

          {/* URL input for promo banners */}
          {promoBanners.length < 4 && (
            <div className="flex items-center gap-2">
              <Input
                value={promoUrlInput}
                onChange={(e) => setPromoUrlInput(e.target.value)}
                placeholder="Ou collez une URL d'image..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addPromoFromUrl()
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPromoFromUrl}
                disabled={!promoUrlInput.trim()}
                className="gap-1.5 h-9 flex-shrink-0"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            </div>
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
      {/* Brands Carousel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Carousel des marques
          </CardTitle>
          <CardDescription>
            Ajoutez les logos des marques que vous distribuez (jusqu&apos;à 20). Ils apparaissent dans un carousel sur votre boutique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current brands */}
          {brands.length > 0 && (
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center gap-3 rounded-lg border border-muted p-3">
                  {/* Brand logo thumbnail */}
                  <div className="shrink-0 w-16 h-10 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center">
                    <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  {/* Brand info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nom</Label>
                        <Input
                          value={brand.name}
                          onChange={(e) => updateBrand(brand.id, 'name', e.target.value)}
                          placeholder="Nom de la marque"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Lien (optionnel)</Label>
                        <Input
                          value={brand.link}
                          onChange={(e) => updateBrand(brand.id, 'link', e.target.value)}
                          placeholder="https://example.com"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{brand.image}</p>
                  </div>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeBrand(brand.id)}
                    className="shrink-0 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add brand form */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={brandNameInput}
                onChange={(e) => setBrandNameInput(e.target.value)}
                placeholder="Nom de la marque"
                className="h-9 text-sm"
              />
              <Input
                value={brandUrlInput}
                onChange={(e) => setBrandUrlInput(e.target.value)}
                placeholder="URL du logo (https://...)"
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addBrandFromUrl()
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBrandFromUrl}
                disabled={!brandUrlInput.trim() || brands.length >= 20}
                className="gap-1.5 h-9 flex-shrink-0"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            </div>

            {/* Upload button */}
            <input
              ref={brandInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleBrandUpload}
            />
            {brands.length < 20 && (
              <button
                type="button"
                onClick={() => brandInputRef.current?.click()}
                disabled={brandUploading}
                className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/20 py-4 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {brandUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {brandUploading
                    ? 'Téléchargement en cours...'
                    : `Ou téléchargez un logo (${brands.length}/20)`}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  JPG, PNG, GIF, WebP ou SVG — Max 5 Mo
                </span>
              </button>
            )}
          </div>

          {brands.length > 0 && (
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Enregistrer les marques
            </Button>
          )}

          {brands.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Le carousel de marques s&apos;affiche sur votre boutique au-dessus des produits. Ajoutez les logos des marques que vous vendez.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}