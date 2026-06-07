'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect } from 'react'
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
  ExternalLink,
  Palette,
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

  // Shop form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState('')
  const [banner, setBanner] = useState('')
  const [template, setTemplate] = useState('classic')

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

      // Fetch product count
      fetch(`/api/products?shopId=${shop.id}`)
        .then((res) => res.ok ? res.json() : [])
        .then((products) => setProductCount(products.length))
        .catch(() => {})
    }
  }, [shop])

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
    navigator.clipboard.writeText(`whatsshop.com/${shop.slug}`)
    toast.success('URL copiée !')
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop-logo">URL du logo</Label>
              <Input
                id="shop-logo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-banner">URL de la bannière</Label>
              <Input
                id="shop-banner"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://example.com/banner.png"
              />
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
                <Badge variant="secondary" className={planBadgeColors[currentPlan]}>
                  {planLabels[currentPlan]}
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
              whatsshop.com/{shop?.slug}
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
                  const url = `https://wa.me/?text=${encodeURIComponent('Découvrez ma boutique sur WhatsShop ! whatsshop.com/' + (shop?.slug || ''))}`
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
