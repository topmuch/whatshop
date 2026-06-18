'use client'

import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Check, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
  DEFAULT_MODERN_STORE_CONFIG,
  parseModernStoreConfig,
  type ModernStoreConfig,
} from '@/lib/modern-store-types'

interface MarqueeConfigTabProps {
  shopSlug: string
}

const FONT_SIZES = [
  { value: 'xs', label: 'Très petit' },
  { value: 'sm', label: 'Petit' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Grand' },
  { value: 'xl', label: 'Très grand' },
]

const PADDING_OPTIONS = [
  { value: 'py-1.5', label: 'Fin' },
  { value: 'py-2', label: 'Compact' },
  { value: 'py-3', label: 'Normal' },
  { value: 'py-3.5', label: 'Moyen' },
  { value: 'py-4', label: 'Large' },
  { value: 'py-5', label: 'Très large' },
  { value: 'py-6', label: 'Extra large' },
]

const SPEED_LABELS: Record<string, string> = {
  '5': 'Ultra rapide',
  '10': 'Très rapide',
  '15': 'Rapide',
  '20': 'Normal',
  '25': 'Moyen',
  '30': 'Lent',
  '40': 'Très lent',
  '50': 'Ultra lent',
}

function getColorLabel(hex: string): string {
  const labels: Record<string, string> = {
    '#000000': 'Noir',
    '#ffffff': 'Blanc',
    '#2563eb': 'Bleu',
    '#f97316': 'Orange',
    '#ef4444': 'Rouge',
    '#10b981': 'Vert',
    '#8b5cf6': 'Violet',
    '#ec4899': 'Rose',
    '#eab308': 'Jaune',
  }
  return labels[hex.toLowerCase()] || ''
}

export function MarqueeConfigTab({ shopSlug }: MarqueeConfigTabProps) {
  const [config, setConfig] = useState<ModernStoreConfig['marquee']>(
    DEFAULT_MODERN_STORE_CONFIG.marquee,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Track if we have unsaved changes
  const [originalConfig, setOriginalConfig] = useState(config)
  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig)

  // ─── Load config ────────────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    if (!shopSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/shops/${shopSlug}/modern-store-config`)
      if (res.ok) {
        const data = await res.json()
        const parsed = data.config || parseModernStoreConfig(null)
        const marquee = parsed.marquee || DEFAULT_MODERN_STORE_CONFIG.marquee
        setConfig(marquee)
        setOriginalConfig(marquee)
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false)
    }
  }, [shopSlug])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // ─── Save config ────────────────────────────────────────────────────

  async function handleSave() {
    if (!shopSlug) return
    setSaving(true)
    try {
      // Fetch current full config to merge
      const res = await fetch(`/api/shops/${shopSlug}/modern-store-config`)
      const data = await res.json()
      const currentConfig = data.config || parseModernStoreConfig(null)

      const updatedConfig = { ...currentConfig, marquee: config }

      const putRes = await fetch(`/api/shops/${shopSlug}/modern-store-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: updatedConfig }),
      })

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors de la sauvegarde')
        return
      }

      setOriginalConfig(config)
      toast.success('Bande défilante mise à jour !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setConfig(DEFAULT_MODERN_STORE_CONFIG.marquee)
    toast.info('Valeurs par défaut restaurées')
  }

  // ─── Update helpers ─────────────────────────────────────────────────

  function update<K extends keyof ModernStoreConfig['marquee']>(
    key: K,
    value: ModernStoreConfig['marquee'][K],
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // ─── Preview ────────────────────────────────────────────────────────

  const fontSizeClass: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  function PreviewMarquee() {
    if (!config.enabled) {
      return (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
          <EyeOff className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Bande défilante désactivée</p>
        </div>
      )
    }

    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ padding: config.padding.includes('py-') ? undefined : undefined }}
        >
          <style>{`
            @keyframes marquee-preview {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div
            className={`flex whitespace-nowrap ${config.padding}`}
            style={{ animation: `marquee-preview ${config.speed}s linear infinite` }}
          >
            <span
              className={`mx-6 uppercase font-medium ${fontSizeClass[config.fontSize] ?? 'text-sm'}`}
              style={{
                color: config.textColor,
                letterSpacing: config.letterSpacing,
              }}
            >
              {config.text}
            </span>
            <span
              className={`mx-6 uppercase font-medium ${fontSizeClass[config.fontSize] ?? 'text-sm'}`}
              style={{
                color: config.textColor,
                letterSpacing: config.letterSpacing,
              }}
            >
              {config.text}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Chargement de la configuration...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Preview ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Aperçu en direct</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {showPreview ? 'Masquer' : 'Afficher'}
          </Button>
        </div>
        {showPreview && <PreviewMarquee />}
      </div>

      <Separator />

      {/* ─── Enable/Disable ─── */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="marquee-enabled" className="text-sm font-medium">
            Activer la bande défilante
          </Label>
          <p className="text-xs text-muted-foreground">
            Affiche un texte défilant sous le hero de votre boutique
          </p>
        </div>
        <Switch
          id="marquee-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => update('enabled', checked)}
        />
      </div>

      {!config.enabled ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Activez la bande défilante pour voir les options de configuration.
        </p>
      ) : (
        <div className="space-y-5">
          {/* ─── Text ─── */}
          <div className="space-y-2">
            <Label htmlFor="marquee-text" className="text-sm font-medium">
              Texte défilant
            </Label>
            <p className="text-xs text-muted-foreground">
              Utilisez des séparateurs (★, •, |) entre les différents messages
            </p>
            <Textarea
              id="marquee-text"
              value={config.text}
              onChange={(e) => update('text', e.target.value)}
              placeholder="BIENVENUE ★ LIVRAISON GRATUITE ★ PAIEMENT À LA LIVRAISON"
              rows={2}
            />
          </div>

          <Separator />

          {/* ─── Speed ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Vitesse de défilement</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {config.speed}s — {SPEED_LABELS[String(config.speed)] || 'Personnalisé'}
              </span>
            </div>
            <Slider
              value={[config.speed]}
              onValueChange={([v]) => update('speed', v)}
              min={5}
              max={60}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rapide</span>
              <span>Lent</span>
            </div>
          </div>

          <Separator />

          {/* ─── Colors ─── */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Couleurs</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Background color */}
              <div className="space-y-2">
                <Label htmlFor="marquee-bg" className="text-xs text-muted-foreground">
                  Couleur de fond
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 rounded-md border border-input flex-shrink-0"
                    style={{ backgroundColor: config.backgroundColor }}
                  />
                  <Input
                    id="marquee-bg"
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => update('backgroundColor', e.target.value)}
                    placeholder="#000000"
                    className="font-mono text-sm"
                  />
                  {getColorLabel(config.backgroundColor) && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getColorLabel(config.backgroundColor)}
                    </span>
                  )}
                </div>
                {/* Quick color presets */}
                <div className="flex gap-1.5 mt-1.5">
                  {['#000000', '#1e293b', '#1e3a5f', '#2563eb', '#dc2626', '#059669'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-6 w-6 rounded-full border border-input hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={getColorLabel(color) || color}
                        onClick={() => update('backgroundColor', color)}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Text color */}
              <div className="space-y-2">
                <Label htmlFor="marquee-text-color" className="text-xs text-muted-foreground">
                  Couleur du texte
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 rounded-md border border-input flex-shrink-0"
                    style={{ backgroundColor: config.textColor }}
                  />
                  <Input
                    id="marquee-text-color"
                    type="text"
                    value={config.textColor}
                    onChange={(e) => update('textColor', e.target.value)}
                    placeholder="#ffffff"
                    className="font-mono text-sm"
                  />
                  {getColorLabel(config.textColor) && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getColorLabel(config.textColor)}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {['#ffffff', '#fbbf24', '#34d399', '#93c5fd', '#f9a8d4', '#d4d4d4'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-6 w-6 rounded-full border border-input hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={getColorLabel(color) || color}
                        onClick={() => update('textColor', color)}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ─── Typography ─── */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Typographie</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Font size */}
              <div className="space-y-2">
                <Label htmlFor="marquee-fontsize" className="text-xs text-muted-foreground">
                  Taille du texte
                </Label>
                <Select
                  value={config.fontSize}
                  onValueChange={(v) => update('fontSize', v)}
                >
                  <SelectTrigger id="marquee-fontsize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((fs) => (
                      <SelectItem key={fs.value} value={fs.value}>
                        {fs.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Letter spacing */}
              <div className="space-y-2">
                <Label htmlFor="marquee-spacing" className="text-xs text-muted-foreground">
                  Espacement des lettres
                </Label>
                <Select
                  value={config.letterSpacing}
                  onValueChange={(v) => update('letterSpacing', v)}
                >
                  <SelectTrigger id="marquee-spacing">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.05em">Serré</SelectItem>
                    <SelectItem value="0.1em">Normal</SelectItem>
                    <SelectItem value="0.15em">Légèrement espacé</SelectItem>
                    <SelectItem value="0.2em">Espacé</SelectItem>
                    <SelectItem value="0.25em">Très espacé</SelectItem>
                    <SelectItem value="0.3em">Ultra espacé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Padding */}
              <div className="space-y-2">
                <Label htmlFor="marquee-padding" className="text-xs text-muted-foreground">
                  Hauteur de la bande
                </Label>
                <Select
                  value={config.padding}
                  onValueChange={(v) => update('padding', v)}
                >
                  <SelectTrigger id="marquee-padding">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PADDING_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* ─── Actions ─── */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Enregistrer la bande défilante
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </Button>
        {hasChanges && (
          <span className="text-xs text-muted-foreground">
            Modifications non enregistrées
          </span>
        )}
      </div>
    </div>
  )
}