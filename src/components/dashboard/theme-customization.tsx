'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getTemplateDisplayInfo } from '@/lib/template-display'
import ColorPicker from './color-picker'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RotateCcw, Save, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CustomColors {
  primary?: string
  secondary?: string
  accent?: string
}

const COLOR_PRESETS = {
  primary: ['#e11d48', '#1e40af', '#059669', '#ea580c', '#7c3aed', '#db2777', '#0891b2', '#0f172a'],
  secondary: ['#fbbf24', '#64748b', '#f59e0b', '#78350f', '#a855f7', '#10b981', '#6b7280', '#f8fafc'],
  accent: ['#0f172a', '#1f2937', '#e11d48', '#1e40af', '#059669', '#ea580c', '#7c3aed', '#ffffff'],
}

function parseCustomColors(raw: string | undefined): CustomColors {
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function ThemeCustomization() {
  const { shop, setShop, publicShop, setPublicShop } = useAppStore()
  const [colors, setColors] = useState<CustomColors>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load colors from shop
  useEffect(() => {
    if (shop?.customColors) {
      setColors(parseCustomColors(shop.customColors))
    }
  }, [shop?.customColors])

  const updateColor = useCallback((key: keyof CustomColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          customColors: JSON.stringify(colors),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Erreur lors de la sauvegarde')
        return
      }

      const updatedShop = await res.json()

      // Update stores
      setShop({ ...shop, customColors: JSON.stringify(colors) })
      if (publicShop && publicShop.id === shop.id) {
        setPublicShop({ ...publicShop, customColors: JSON.stringify(colors) })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast.success('Couleurs mises à jour !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }, [shop, colors, setShop, publicShop, setPublicShop])

  const handleReset = useCallback(() => {
    setColors({})
    toast.info('Couleurs réinitialisées (non encore sauvegardées)')
  }, [])

  if (!shop) return null

  const displayInfo = getTemplateDisplayInfo(shop.template)
  const primary = colors.primary || displayInfo.style.primaryColor
  const secondary = colors.secondary || '#fbbf24'
  const accent = colors.accent || '#0f172a'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 Personnalisation des couleurs
        </CardTitle>
        <CardDescription>
          Modifiez les couleurs du Template {displayInfo.displayName} pour qu&apos;elles correspondent à votre identité visuelle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div
          className="p-5 rounded-xl border-2 border-gray-100 space-y-4"
          style={{ backgroundColor: primary + '08' }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aperçu en direct</p>

          {/* Mock header */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primary }} />
                <span className="font-bold text-gray-900">Votre Boutique</span>
              </div>
              <button
                className="px-4 py-2 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: accent }}
              >
                Contact
              </button>
            </div>
          </div>

          {/* Mock buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 rounded-full text-white font-semibold text-sm"
              style={{ backgroundColor: accent }}
            >
              Bouton principal
            </button>
            <button
              className="px-6 py-3 rounded-full font-semibold text-sm border-2"
              style={{ borderColor: primary, color: primary }}
            >
              Bouton secondaire
            </button>
            {secondary && (
              <span
                className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: secondary, color: '#0f172a' }}
              >
                Badge
              </span>
            )}
          </div>
        </div>

        {/* Color Pickers */}
        <div className="space-y-5">
          <ColorPicker
            label="Couleur principale (titres, badges, accents)"
            value={colors.primary || ''}
            onChange={(c) => updateColor('primary', c)}
            presets={COLOR_PRESETS.primary}
          />

          <ColorPicker
            label="Couleur secondaire (badges, détails)"
            value={colors.secondary || ''}
            onChange={(c) => updateColor('secondary', c)}
            presets={COLOR_PRESETS.secondary}
          />

          <ColorPicker
            label="Couleur d'accent (boutons CTA)"
            value={colors.accent || ''}
            onChange={(c) => updateColor('accent', c)}
            presets={COLOR_PRESETS.accent}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
            style={{ backgroundColor: primary }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder les couleurs'}
          </Button>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Bon à savoir</p>
          <p>
            Les modifications seront visibles immédiatement sur votre boutique publique.
            Pensez à choisir des couleurs qui contrastent bien pour une meilleure lisibilité.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}