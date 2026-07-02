'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Loader2,
  Check,
  Plus,
  Trash2,
  Star,
  Link as LinkIcon,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Upload,
  Type,
  Palette,
  X,
} from 'lucide-react'
import { MarqueeConfigTab } from './marquee-config-tab'
import { toast } from 'sonner'
import type { Testimonial, TrustBadge } from '@/lib/store'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface TemplateSettings {
  buttonColor: string
  logoSize: string
  heroTitle: string
  heroSubtitle: string
  heroTagline: string
  heroImageUrl: string
  productsTitle: string
  productsTagline: string
  categoriesTitle: string
  categoriesTagline: string
  testimonialsTitle: string
  testimonialsTagline: string
  trustBadges: TrustBadge[]
  footerLinks: { section: string; label: string; url: string }[]
}

interface TemplateCustomizationProps {
  shopSlug: string
}

const EMPTY_SETTINGS: TemplateSettings = {
  buttonColor: '',
  logoSize: '',
  heroTitle: '',
  heroSubtitle: '',
  heroTagline: '',
  heroImageUrl: '',
  productsTitle: '',
  productsTagline: '',
  categoriesTitle: '',
  categoriesTagline: '',
  testimonialsTitle: '',
  testimonialsTagline: '',
  trustBadges: [],
  footerLinks: [],
}

const DEFAULT_BADGES: TrustBadge[] = [
  { emoji: '🚚', title: 'Livraison 24h', subtitle: 'Partout au Sénégal', order: 0 },
  { emoji: '💵', title: 'Paiement Mobile Money', subtitle: 'Orange Money, Wave...', order: 1 },
  { emoji: '🔄', title: 'Retour facile', subtitle: 'Satisfait ou remboursé', order: 2 },
  { emoji: '📱', title: 'Support WhatsApp', subtitle: 'Réponse rapide', order: 3 },
]

// ─── Component ──────────────────────────────────────────────────────────────────

export function TemplateCustomization({ shopSlug }: TemplateCustomizationProps) {
  // Settings state
  const [settings, setSettings] = useState<TemplateSettings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(false)

  // Dialog states
  const [testimonialDialog, setTestimonialDialog] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [testForm, setTestForm] = useState({ clientName: '', comment: '', rating: 5 })

  // Badge dialog
  const [badgeDialog, setBadgeDialog] = useState(false)
  const [badgeForm, setBadgeForm] = useState<TrustBadge>({ emoji: '⭐', title: '', subtitle: '', order: 0 })

  // Footer link dialog
  const [footerLinkDialog, setFooterLinkDialog] = useState(false)
  const [footerLinkForm, setFooterLinkForm] = useState({ section: '', label: '', url: '' })

  // Hero image upload
  const [heroUploading, setHeroUploading] = useState(false)
  const heroInputRef = React.useRef<HTMLInputElement>(null)

  // ─── Load settings ──────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    if (!shopSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/shops/${shopSlug}/template-settings`)
      if (res.ok) {
        const data = await res.json()
        setSettings({
          buttonColor: data.buttonColor || '',
          logoSize: data.logoSize || '',
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          heroTagline: data.heroTagline || '',
          heroImageUrl: data.heroImageUrl || '',
          productsTitle: data.productsTitle || '',
          productsTagline: data.productsTagline || '',
          categoriesTitle: data.categoriesTitle || '',
          categoriesTagline: data.categoriesTagline || '',
          testimonialsTitle: data.testimonialsTitle || '',
          testimonialsTagline: data.testimonialsTagline || '',
          trustBadges: Array.isArray(data.trustBadges) ? data.trustBadges : DEFAULT_BADGES,
          footerLinks: Array.isArray(data.footerLinks) ? data.footerLinks : [],
        })
      }
    } catch {
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }, [shopSlug])

  const loadTestimonials = useCallback(async () => {
    if (!shopSlug) return
    setTestimonialsLoading(true)
    try {
      const res = await fetch(`/api/shops/${shopSlug}/testimonials`)
      if (res.ok) {
        const data = await res.json()
        setTestimonials(Array.isArray(data) ? data : [])
      }
    } catch {
      // Silently fail
    } finally {
      setTestimonialsLoading(false)
    }
  }, [shopSlug])

  useEffect(() => {
    loadSettings()
    loadTestimonials()
  }, [loadSettings, loadTestimonials])

  // ─── Save settings ──────────────────────────────────────────────────────────

  async function handleSaveSettings() {
    if (!shopSlug) return
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${shopSlug}/template-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors de la sauvegarde')
        return
      }
      toast.success('Paramètres du template enregistrés !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  // ─── Hero image upload ──────────────────────────────────────────────────────

  async function handleHeroImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        toast.error('Erreur lors du téléchargement')
        return
      }
      const data = await res.json()
      setSettings((s) => ({ ...s, heroImageUrl: data.url }))
      toast.success('Image hero téléchargée !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setHeroUploading(false)
      if (heroInputRef.current) heroInputRef.current.value = ''
    }
  }

  // ─── Testimonials CRUD ──────────────────────────────────────────────────────

  function openNewTestimonial() {
    setEditingTestimonial(null)
    setTestForm({ clientName: '', comment: '', rating: 5 })
    setTestimonialDialog(true)
  }

  function openEditTestimonial(t: Testimonial) {
    setEditingTestimonial(t)
    setTestForm({ clientName: t.clientName, comment: t.comment, rating: t.rating })
    setTestimonialDialog(true)
  }

  async function handleSaveTestimonial() {
    if (!shopSlug || !testForm.clientName.trim() || !testForm.comment.trim()) {
      toast.error('Nom et commentaire requis')
      return
    }
    try {
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : `/api/shops/${shopSlug}/testimonials`
      const method = editingTestimonial ? 'PUT' : 'POST'
      const body = editingTestimonial
        ? { clientName: testForm.clientName, comment: testForm.comment, rating: testForm.rating }
        : { clientName: testForm.clientName, comment: testForm.comment, rating: testForm.rating }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur')
        return
      }
      toast.success(editingTestimonial ? 'Témoignage mis à jour !' : 'Témoignage ajouté !')
      setTestimonialDialog(false)
      loadTestimonials()
    } catch {
      toast.error('Erreur de connexion')
    }
  }

  async function handleDeleteTestimonial(id: string) {
    if (!confirm('Supprimer ce témoignage ?')) return
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Témoignage supprimé')
        loadTestimonials()
      }
    } catch {
      toast.error('Erreur de connexion')
    }
  }

  // ─── Trust Badges CRUD ──────────────────────────────────────────────────────

  function openNewBadge() {
    setBadgeForm({ emoji: '⭐', title: '', subtitle: '', order: settings.trustBadges.length })
    setBadgeDialog(true)
  }

  function handleSaveBadge() {
    if (!badgeForm.title.trim()) {
      toast.error('Titre requis')
      return
    }
    setSettings((s) => ({
      ...s,
      trustBadges: [...s.trustBadges, badgeForm].sort((a, b) => a.order - b.order),
    }))
    setBadgeDialog(false)
    toast.success('Badge ajouté !')
  }

  function handleDeleteBadge(index: number) {
    setSettings((s) => ({
      ...s,
      trustBadges: s.trustBadges.filter((_, i) => i !== index),
    }))
  }

  function moveBadge(index: number, direction: 'up' | 'down') {
    setSettings((s) => {
      const badges = [...s.trustBadges]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= badges.length) return s
      ;[badges[index], badges[target]] = [badges[target], badges[index]]
      return { ...s, trustBadges: badges.map((b, i) => ({ ...b, order: i })) }
    })
  }

  // ─── Footer Links CRUD ──────────────────────────────────────────────────────

  function openNewFooterLink() {
    setFooterLinkForm({ section: '', label: '', url: '' })
    setFooterLinkDialog(true)
  }

  function handleSaveFooterLink() {
    if (!footerLinkForm.section.trim() || !footerLinkForm.label.trim() || !footerLinkForm.url.trim()) {
      toast.error('Section, label et URL requis')
      return
    }
    setSettings((s) => ({
      ...s,
      footerLinks: [...s.footerLinks, footerLinkForm],
    }))
    setFooterLinkDialog(false)
    toast.success('Lien ajouté !')
  }

  function handleDeleteFooterLink(index: number) {
    setSettings((s) => ({
      ...s,
      footerLinks: s.footerLinks.filter((_, i) => i !== index),
    }))
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-600" />
            Personnalisation du template
          </CardTitle>
          <CardDescription>
            Configurez les textes, badges de confiance, témoignages et liens du footer de votre boutique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full">
              <TabsTrigger value="appearance" className="text-xs sm:text-sm gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Apparence</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="text-xs sm:text-sm">Hero</TabsTrigger>
              <TabsTrigger value="sections" className="text-xs sm:text-sm">Sections</TabsTrigger>
              <TabsTrigger value="marquee" className="text-xs sm:text-sm gap-1.5">
                <Type className="h-3.5 w-3.5 hidden sm:inline-block" />
                Bande défilante
              </TabsTrigger>
              <TabsTrigger value="badges" className="text-xs sm:text-sm">Badges</TabsTrigger>
              <TabsTrigger value="testimonials" className="text-xs sm:text-sm">Avis</TabsTrigger>
              <TabsTrigger value="footer" className="text-xs sm:text-sm">Footer</TabsTrigger>
            </TabsList>

            {/* ─── APPEARANCE TAB ─── */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                {/* Button Color */}
                <div className="space-y-2">
                  <Label htmlFor="button-color">Couleur des boutons</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="button-color"
                      value={settings.buttonColor || '#0D9488'}
                      onChange={(e) => setSettings((s) => ({ ...s, buttonColor: e.target.value }))}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-muted"
                    />
                    <Input
                      value={settings.buttonColor}
                      onChange={(e) => setSettings((s) => ({ ...s, buttonColor: e.target.value }))}
                      placeholder="#0D9488 (défaut du template)"
                      className="flex-1"
                      maxLength={7}
                    />
                    {settings.buttonColor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive"
                        onClick={() => setSettings((s) => ({ ...s, buttonColor: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour utiliser la couleur par défaut du template.
                  </p>
                </div>

                {/* Logo Size */}
                <div className="space-y-2">
                  <Label htmlFor="logo-size">
                    Taille du logo{settings.logoSize ? ` : ${settings.logoSize}px` : ''}
                  </Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="logo-size"
                      min={24}
                      max={120}
                      step={4}
                      value={settings.logoSize ? parseInt(settings.logoSize) : 40}
                      onChange={(e) => setSettings((s) => ({ ...s, logoSize: e.target.value }))}
                      className="flex-1 h-2 cursor-pointer accent-primary"
                    />
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={settings.logoSize}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '') {
                            setSettings((s) => ({ ...s, logoSize: '' }))
                          } else {
                            const num = parseInt(val)
                            if (!isNaN(num) && num >= 24 && num <= 120) {
                              setSettings((s) => ({ ...s, logoSize: String(num) }))
                            }
                          }
                        }}
                        className="w-20 h-10 text-center"
                        placeholder="px"
                        min={24}
                        max={120}
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                    {settings.logoSize && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive"
                        onClick={() => setSettings((s) => ({ ...s, logoSize: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour utiliser la taille par défaut du template (24–120px).
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ─── HERO TAB ─── */}
            <TabsContent value="hero" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Titre principal</Label>
                <Input
                  id="hero-title"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings((s) => ({ ...s, heroTitle: e.target.value }))}
                  placeholder="Sublimez votre beauté naturelle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Sous-titre</Label>
                <Textarea
                  id="hero-subtitle"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings((s) => ({ ...s, heroSubtitle: e.target.value }))}
                  placeholder="Découvrez notre gamme de produits beauté sélectionnés avec soin..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-tagline">Tagline (accroche)</Label>
                <Input
                  id="hero-tagline"
                  value={settings.heroTagline}
                  onChange={(e) => setSettings((s) => ({ ...s, heroTagline: e.target.value }))}
                  placeholder="✨ Nouvelle collection disponible"
                />
              </div>
              <div className="space-y-2">
                <Label>Image hero</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="url"
                    value={settings.heroImageUrl}
                    onChange={(e) => setSettings((s) => ({ ...s, heroImageUrl: e.target.value }))}
                    placeholder="https://... (ou uploadez ci-dessous)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => heroInputRef.current?.click()}
                    disabled={heroUploading}
                  >
                    {heroUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImageUpload}
                  />
                </div>
                {settings.heroImageUrl && (
                  <div className="mt-2 rounded-lg border border-muted overflow-hidden max-w-sm">
                    <img src={settings.heroImageUrl} alt="Aperçu hero" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ─── SECTIONS TAB ─── */}
            <TabsContent value="sections" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre section produits</Label>
                  <Input
                    value={settings.productsTitle}
                    onChange={(e) => setSettings((s) => ({ ...s, productsTitle: e.target.value }))}
                    placeholder="Nos Produits"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline section produits</Label>
                  <Input
                    value={settings.productsTagline}
                    onChange={(e) => setSettings((s) => ({ ...s, productsTagline: e.target.value }))}
                    placeholder="Les indispensables de votre routine"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre section catégories</Label>
                  <Input
                    value={settings.categoriesTitle}
                    onChange={(e) => setSettings((s) => ({ ...s, categoriesTitle: e.target.value }))}
                    placeholder="Nos Catégories"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline section catégories</Label>
                  <Input
                    value={settings.categoriesTagline}
                    onChange={(e) => setSettings((s) => ({ ...s, categoriesTagline: e.target.value }))}
                    placeholder="Explorez par type de produit"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre section témoignages</Label>
                  <Input
                    value={settings.testimonialsTitle}
                    onChange={(e) => setSettings((s) => ({ ...s, testimonialsTitle: e.target.value }))}
                    placeholder="Ce que disent nos clientes"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline section témoignages</Label>
                  <Input
                    value={settings.testimonialsTagline}
                    onChange={(e) => setSettings((s) => ({ ...s, testimonialsTagline: e.target.value }))}
                    placeholder="Plus de 1000 clientes satisfaites"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ─── TRUST BADGES TAB ─── */}
            <TabsContent value="badges" className="space-y-4">
              <div className="space-y-3">
                {settings.trustBadges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveBadge(i, 'up')}
                        disabled={i === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBadge(i, 'down')}
                        disabled={i === settings.trustBadges.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-2xl">{badge.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{badge.title}</p>
                      <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => handleDeleteBadge(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {settings.trustBadges.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun badge de confiance. Ajoutez-en pour inspirer confiance.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 w-full"
                onClick={openNewBadge}
              >
                <Plus className="h-4 w-4" />
                Ajouter un badge
              </Button>
            </TabsContent>

            {/* ─── TESTIMONIALS TAB ─── */}
            <TabsContent value="testimonials" className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testimonialsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : testimonials.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun témoignage. Ajoutez les avis de vos clientes !
                  </p>
                ) : (
                  testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg border bg-muted/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                            {t.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t.clientName}</p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < t.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditTestimonial(t)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteTestimonial(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.comment}</p>
                    </div>
                  ))
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 w-full"
                onClick={openNewTestimonial}
              >
                <Plus className="h-4 w-4" />
                Ajouter un témoignage
              </Button>
            </TabsContent>

            {/* ─── MARQUEE TAB ─── */}
            <TabsContent value="marquee" className="space-y-4">
              <MarqueeConfigTab shopSlug={shopSlug} />
            </TabsContent>

            {/* ─── FOOTER LINKS TAB ─── */}
            <TabsContent value="footer" className="space-y-4">
              <div className="space-y-3">
                {settings.footerLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun lien de footer. Ajoutez des liens utiles pour vos clientes.
                  </p>
                ) : (
                  settings.footerLinks.map((link, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{link.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.section} — {link.url}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => handleDeleteFooterLink(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 w-full"
                onClick={openNewFooterLink}
              >
                <Plus className="h-4 w-4" />
                Ajouter un lien
              </Button>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <Button onClick={handleSaveSettings} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Enregistrer les paramètres du template
          </Button>
        </CardContent>
      </Card>

      {/* ─── Testimonial Dialog ─── */}
      <Dialog open={testimonialDialog} onOpenChange={setTestimonialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Modifier le témoignage' : 'Nouveau témoignage'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la cliente</Label>
              <Input
                value={testForm.clientName}
                onChange={(e) => setTestForm((f) => ({ ...f, clientName: e.target.value }))}
                placeholder="Aminata Diallo"
              />
            </div>
            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Textarea
                value={testForm.comment}
                onChange={(e) => setTestForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Produit incroyable, je recommande !"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTestForm((f) => ({ ...f, rating: star }))}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= testForm.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30 hover:text-amber-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTestimonial} className="gap-2">
              <Check className="h-4 w-4" />
              {editingTestimonial ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Badge Dialog ─── */}
      <Dialog open={badgeDialog} onOpenChange={setBadgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau badge de confiance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input
                value={badgeForm.emoji}
                onChange={(e) => setBadgeForm((f) => ({ ...f, emoji: e.target.value }))}
                placeholder="🚚"
                className="text-2xl text-center"
              />
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={badgeForm.title}
                onChange={(e) => setBadgeForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Livraison rapide"
              />
            </div>
            <div className="space-y-2">
              <Label>Sous-titre</Label>
              <Input
                value={badgeForm.subtitle}
                onChange={(e) => setBadgeForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Partout en Afrique de l'Ouest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBadgeDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveBadge} className="gap-2">
              <Check className="h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Footer Link Dialog ─── */}
      <Dialog open={footerLinkDialog} onOpenChange={setFooterLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau lien de footer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={footerLinkForm.section}
                onChange={(e) => setFooterLinkForm((f) => ({ ...f, section: e.target.value }))}
                placeholder="Services"
              />
            </div>
            <div className="space-y-2">
              <Label>Label (texte affiché)</Label>
              <Input
                value={footerLinkForm.label}
                onChange={(e) => setFooterLinkForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Politique de livraison"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                type="url"
                value={footerLinkForm.url}
                onChange={(e) => setFooterLinkForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFooterLinkDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveFooterLink} className="gap-2">
              <Check className="h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

