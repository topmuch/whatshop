'use client'

import { useAppStore } from '@/lib/store'
import { templates, type TemplateId } from '@/lib/templates'
import { TemplateSelector } from './template-selector'
import { TemplateCustomization } from './template-customization'
import { ThemeCustomization } from './theme-customization'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check, ExternalLink, Store, Target, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'

type TemplateType = 'STANDARD' | 'SINGLE_PRODUCT' | 'MODERN_STORE'

const TEMPLATE_TYPES: { id: TemplateType; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'STANDARD',
    name: 'Boutique classique',
    description: 'Catalogue de produits avec catégories, recherche et panier WhatsApp. Idéal pour les boutiques multi-produits.',
    icon: <Store className="h-6 w-6" />,
  },
  {
    id: 'MODERN_STORE',
    name: 'Modern Store',
    description: 'E-commerce moderne avec panier, checkout formulaire (COD/Mobile Money) ET bouton « Buy It Now » WhatsApp. Page d\'accueil, fiches produit, produits similaires.',
    icon: <ShoppingCart className="h-6 w-6" />,
  },
  {
    id: 'SINGLE_PRODUCT',
    name: 'Single Produit',
    description: 'Landing page optimisée conversion pour un seul produit. Countdown, avis, FAQ. Parfait pour TikTokeurs et vendeurs mono-produit.',
    icon: <Target className="h-6 w-6" />,
  },
]

export function DashboardTemplates() {
  const { shop, setShop, publicShop, setPublicShop } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [savingType, setSavingType] = useState(false)
  const [accentColor, setAccentColor] = useState('#25D366')
  const [currentType, setCurrentType] = useState<TemplateType>('STANDARD')

  useEffect(() => {
    if (shop) {
      setAccentColor(
        (shop as unknown as Record<string, unknown>).accentColor as string ||
        templates[(shop.template as TemplateId) || 'xstore-electro']?.colors?.primary ||
        '#10B981'
      )
    }
  }, [shop])

  // Fetch current templateType from API (session shop object may not include it)
  useEffect(() => {
    if (!shop) return
    let cancelled = false
    async function fetchType() {
      try {
        const res = await fetch(`/api/shops/${shop!.slug}/modern-store-config`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled && data.templateType) {
            setCurrentType(data.templateType as TemplateType)
          }
        }
      } catch {
        // Non-critical — fallback to STANDARD
      }
    }
    fetchType()
    return () => { cancelled = true }
  }, [shop])

  async function handleTemplateTypeSelect(type: TemplateType) {
    if (!shop || type === currentType) return
    setSavingType(true)
    try {
      // Both single-product-config and modern-store-config endpoints accept templateType.
      // Use modern-store-config as it works for all types (it just sets templateType).
      const res = await fetch(`/api/shops/${shop.slug}/modern-store-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: type }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors du changement de type')
        return
      }
      const data = await res.json()
      setCurrentType(data.templateType as TemplateType)
      setShop({ ...shop, templateType: data.templateType } as typeof shop)
      if (publicShop && publicShop.id === shop.id) {
        setPublicShop({ ...publicShop, templateType: data.templateType } as typeof publicShop)
      }
      toast.success(`Type de boutique : ${TEMPLATE_TYPES.find((t) => t.id === type)?.name}`)
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSavingType(false)
    }
  }

  async function handleTemplateSelect(templateId: TemplateId) {
    if (!shop) return
    setSaving(true)
    try {
      const t = templates[templateId]
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          template: templateId,
          accentColor: t?.colors?.primary.startsWith('linear') ? '#EC4899' : t?.colors?.primary || accentColor,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors du changement de template')
        return
      }

      const updatedShop = await res.json()
      setShop({
        ...shop,
        template: updatedShop.template || templateId,
        accentColor: updatedShop.accentColor || accentColor,
      })

      if (publicShop && publicShop.id === shop.id) {
        setPublicShop({
          ...publicShop,
          template: updatedShop.template || templateId,
          accentColor: updatedShop.accentColor || accentColor,
        })
      }

      setAccentColor(
        templates[templateId]?.colors?.primary.startsWith('linear')
          ? '#EC4899'
          : templates[templateId]?.colors?.primary || accentColor
      )

      toast.success('Template mis à jour !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  if (!shop) return null

  return (
    <div className="space-y-6">
      {/* ─── Type de boutique (templateType) ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Type de boutique</CardTitle>
          <CardDescription>
            Choisissez la structure de votre boutique. Cette option détermine l'expérience d'achat
            (catalogue classique, e-commerce avec panier, ou page produit unique).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TEMPLATE_TYPES.map((t) => {
            const selected = currentType === t.id
            return (
              <button
                key={t.id}
                onClick={() => handleTemplateTypeSelect(t.id)}
                disabled={savingType}
                className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all disabled:opacity-50 ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                }`}
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${
                    selected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {t.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{t.name}</p>
                    {selected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Check className="h-3 w-3" /> Actif
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  {t.id === 'SINGLE_PRODUCT' && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      ⚙️ Configurez votre produit dans l'onglet « Single Produit »
                    </p>
                  )}
                  {t.id === 'MODERN_STORE' && (
                    <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400">
                      🛒 Panier + checkout COD/Mobile Money + WhatsApp direct
                    </p>
                  )}
                </div>
                {savingType && selected && <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary" />}
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Separator />

      {/* ─── Thème visuel (template) — toujours visible ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Thème visuel</CardTitle>
          <CardDescription>
            Sélectionnez le design de votre boutique publique. Le changement est immédiat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateSelector
            currentTemplate={shop.template || 'xstore-electro'}
            onSelect={handleTemplateSelect}
          />
          <div className="flex items-center gap-3 mt-4">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview button */}
      {shop && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div>
              <p className="font-medium">Aperçu en direct</p>
              <p className="text-sm text-muted-foreground">
                Ouvrez votre boutique dans un nouvel onglet pour voir le thème appliqué
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                window.open(`/${shop.slug}`, '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir ma boutique
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template-specific customization */}
      <TemplateCustomization shopSlug={shop.slug} />

      {/* Color customization (applies to all types) */}
      <ThemeCustomization />
    </div>
  )
}