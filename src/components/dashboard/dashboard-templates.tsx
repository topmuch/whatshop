'use client'

import { useAppStore } from '@/lib/store'
import { templates, type TemplateId } from '@/lib/templates'
import { TemplateSelector } from './template-selector'
import { TemplateCustomization } from './template-customization'
import { ThemeCustomization } from './theme-customization'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'

export function DashboardTemplates() {
  const { shop, setShop, publicShop, setPublicShop } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [accentColor, setAccentColor] = useState('#25D366')

  useEffect(() => {
    if (shop) {
      setAccentColor(
        (shop as unknown as Record<string, unknown>).accentColor as string ||
        templates[(shop.template as TemplateId) || 'xstore-electro']?.colors?.primary ||
        '#10B981'
      )
    }
  }, [shop])

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
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Choisir un template</CardTitle>
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

      {/* Color customization */}
      <ThemeCustomization />
    </div>
  )
}