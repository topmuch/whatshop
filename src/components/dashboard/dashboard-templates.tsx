'use client'

import { useAppStore } from '@/lib/store'
import { templates, type TemplateId } from '@/lib/templates'
import { TemplateSelector } from './template-selector'
import { TemplateCustomization } from './template-customization'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check } from 'lucide-react'
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
        templates[(shop.template as TemplateId) || 'classic']?.colors?.primary ||
        '#25D366'
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
            currentTemplate={shop.template || 'classic'}
            onSelect={handleTemplateSelect}
          />
          {saving && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template-specific customization (e.g. Cosmika Beauty) */}
      <TemplateCustomization shopSlug={shop.slug} />
    </div>
  )
}