'use client'

import { useState, useEffect } from 'react'
import type { Shop } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Check,
  Copy,
  Share2,
  Loader2,
  Search,
  ImagePlus,
  Type,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Globe,
  Instagram,
} from 'lucide-react'
import { toast } from 'sonner'

export function SeoDomainTab({ shop }: { shop: Shop | null }) {
  // SEO form state
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [seoSaving, setSeoSaving] = useState(false)

  // Domain state
  const [domainStatus, setDomainStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE')
  const [domainName, setDomainName] = useState('')
  const [domainRejectionReason, setDomainRejectionReason] = useState('')
  const [domainLoading, setDomainLoading] = useState(false)
  const [dnsOpen, setDnsOpen] = useState(false)
  const [domainInput, setDomainInput] = useState('')

  useEffect(() => {
    if (shop) {
      // Fetch SEO settings
      fetch('/api/settings')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setSeoTitle(data.seoTitle || '')
            setSeoDescription(data.seoDescription || '')
            setSeoKeywords(data.seoKeywords || '')
            setOgImage(data.ogImage || '')
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

  async function handleSeoSave() {
    setSeoSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seoTitle,
          seoDescription,
          seoKeywords,
          ogImage,
          coverImageUrl,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors de la sauvegarde SEO')
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

  function copyShopUrl() {
    if (!shop) return
    navigator.clipboard.writeText(`boutiko.pro/${shop.slug}`)
    toast.success('URL copiée !')
  }

  return (
    <>
      {/* SEO & Référencement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            SEO &amp; Référencement
          </CardTitle>
          <CardDescription>
            Optimisez le référencement de votre boutique sur les moteurs de recherche.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Titre SEO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title" className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Titre SEO
              </Label>
              <span className={`text-xs tabular-nums ${seoTitle.length > 60 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {seoTitle.length}/60
              </span>
            </div>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => {
                if (e.target.value.length <= 60) setSeoTitle(e.target.value)
              }}
              placeholder="Ma Boutique - Produits de qualité"
              maxLength={60}
            />
          </div>

          {/* Description SEO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-description" className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Description SEO
              </Label>
              <span className={`text-xs tabular-nums ${seoDescription.length > 160 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {seoDescription.length}/160
              </span>
            </div>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => {
                if (e.target.value.length <= 160) setSeoDescription(e.target.value)
              }}
              placeholder="Découvrez nos produits de qualité à des prix imbattables..."
              rows={3}
              maxLength={160}
            />
          </div>

          {/* Mots-clés SEO */}
          <div className="space-y-2">
            <Label htmlFor="seo-keywords" className="flex items-center gap-2">
              <Type className="h-3.5 w-3.5 text-muted-foreground" />
              Mots-clés SEO
            </Label>
            <Input
              id="seo-keywords"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="mode, beaute, vetements"
            />
            <p className="text-xs text-muted-foreground">
              Séparez les mots-clés par des virgules
            </p>
          </div>

          {/* Image OG */}
          <div className="space-y-2">
            <Label htmlFor="og-image" className="flex items-center gap-2">
              <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
              Image OG
            </Label>
            <Input
              id="og-image"
              type="url"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://..."
            />
            {ogImage && (
              <div className="mt-2 rounded-lg border border-muted overflow-hidden">
                <img
                  src={ogImage}
                  alt="Aperçu Image OG"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
          </div>

          {/* Image de couverture */}
          <div className="space-y-2">
            <Label htmlFor="cover-image-url" className="flex items-center gap-2">
              <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
              Image de couverture
            </Label>
            <Input
              id="cover-image-url"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />
            {coverImageUrl && (
              <div className="mt-2 rounded-lg border border-muted overflow-hidden">
                <img
                  src={coverImageUrl}
                  alt="Aperçu image de couverture"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
          </div>

          <Button onClick={handleSeoSave} disabled={seoSaving} className="gap-2">
            {seoSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Enregistrer le référencement
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
                        <p className="text-sm font-mono font-semibold">boutiko.pro</p>
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
              boutiko.pro/{shop?.slug}
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
                  const url = `https://wa.me/?text=${encodeURIComponent('Découvrez ma boutique sur Boutiko ! boutiko.pro/' + (shop?.slug || ''))}`
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
    </>
  )
}

