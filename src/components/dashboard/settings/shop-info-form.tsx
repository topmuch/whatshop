'use client'

import { useState, useEffect, useRef } from 'react'
import type { Shop } from '@/lib/store'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, Loader2, Store, Upload, Trash2, ImagePlus, LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { uploadFile } from './upload-file'

export function ShopInfoForm({ shop }: { shop: Shop | null }) {
  const { setShop, publicShop, setPublicShop } = useAppStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState('')
  const [logoUrlInput, setLogoUrlInput] = useState('')
  const [banner, setBanner] = useState('')
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shop) {
      setName(shop.name)
      setDescription(shop.description || '')
      setWhatsapp(shop.whatsapp)
      setAddress(shop.address || '')
      setPhone(shop.phone || '')
      setLogo(shop.logo || '')
      setBanner(shop.banner || '')
    }
  }, [shop])

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

  async function handleSave() {
    if (!shop) {
      toast.error('Aucune boutique sélectionnée')
      return
    }
    if (!name.trim()) {
      toast.error('Le nom de la boutique est requis')
      return
    }
    if (!whatsapp.trim()) {
      toast.error('Le numéro WhatsApp est requis')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          name: name.trim(),
          description,
          whatsapp: whatsapp.trim(),
          address,
          phone,
          logo,
          banner,
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
      toast.success('Boutique mise à jour !')
    } catch (err) {
      console.error('Settings save error:', err)
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
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
            {/* URL input */}
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Coller l'URL du logo (https://...)"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 shrink-0"
                onClick={() => {
                  const url = logoUrlInput.trim()
                  if (url) {
                    setLogo(url)
                    setLogoUrlInput('')
                    toast.success('Logo URL appliquée !')
                  }
                }}
                disabled={!logoUrlInput.trim()}
              >
                <LinkIcon className="h-3.5 w-3.5 mr-1" />
                Appliquer
              </Button>
            </div>
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
                  {logoUploading ? 'Téléchargement...' : 'Ou collez une URL ci-dessus'}
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
  )
}