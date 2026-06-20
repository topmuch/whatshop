'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Video, Loader2, Save, RotateCcw, Eye } from 'lucide-react'

interface HeroVideoConfig {
  youtubeUrl: string
  title: string
  subtitle: string
  ctaText: string
  enabled: boolean
}

interface VideoHeroConfigProps {
  shopSlug: string
}

export function VideoHeroConfig({ shopSlug }: VideoHeroConfigProps) {
  const [config, setConfig] = useState<HeroVideoConfig>({
    youtubeUrl: '',
    title: 'Bienvenue dans notre boutique',
    subtitle: 'Découvrez notre collection exclusive',
    ctaText: 'Découvrir',
    enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Load config
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/shops/${shopSlug}/modern-store-config`)
        if (res.ok) {
          const data = await res.json()
          if (data.config?.heroVideo) {
            setConfig(data.config.heroVideo)
          }
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [shopSlug])

  // Extract YouTube ID for preview
  function extractYouTubeId(url: string): string | null {
    if (!url) return null
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const p of patterns) {
      const match = url.match(p)
      if (match) return match[1]
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    return null
  }

  function handlePreview() {
    const id = extractYouTubeId(config.youtubeUrl)
    if (id) {
      setPreviewUrl(`https://www.youtube.com/embed/${id}?autoplay=0&mute=0&controls=1`)
    } else {
      toast.error('URL YouTube invalide')
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${shopSlug}/modern-store-config`)
      if (!res.ok) throw new Error()
      const data = await res.json()

      const updatedConfig = { ...data.config, heroVideo: config }

      const saveRes = await fetch(`/api/shops/${shopSlug}/modern-store-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: updatedConfig }),
      })

      if (saveRes.ok) {
        toast.success('Configuration vidéo hero sauvegardée !')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setConfig({
      youtubeUrl: '',
      title: 'Bienvenue dans notre boutique',
      subtitle: 'Découvrez notre collection exclusive',
      ctaText: 'Découvrir',
      enabled: false,
    })
    setPreviewUrl(null)
    toast.info('Configuration réinitialisée')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Vidéo Hero YouTube
        </CardTitle>
        <CardDescription>
          Configurez la vidéo YouTube qui s&apos;affichera en plein écran dans le hero de votre boutique (ratio 16:9, lecture automatique, muet).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable switch */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label className="text-sm font-medium">Activer la vidéo hero</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Remplace l&apos;image hero par une vidéo YouTube en plein écran
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig((c) => ({ ...c, enabled: checked }))}
          />
        </div>

        <div className="space-y-4">
          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="youtube-url">URL YouTube de la vidéo</Label>
            <div className="flex gap-2">
              <Input
                id="youtube-url"
                placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                value={config.youtubeUrl}
                onChange={(e) => setConfig((c) => ({ ...c, youtubeUrl: e.target.value }))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePreview}
                title="Prévisualiser"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Formats acceptés : youtube.com/watch?v=ID, youtu.be/ID, ou l&apos;ID directement
            </p>
          </div>

          {/* Preview iframe */}
          {previewUrl && (
            <div className="relative w-full overflow-hidden rounded-lg border">
              <div className="aspect-video">
                <iframe
                  src={previewUrl}
                  title="Aperçu vidéo"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Overlay title */}
          <div className="space-y-2">
            <Label htmlFor="video-title">Titre superposé</Label>
            <Input
              id="video-title"
              placeholder="Bienvenue dans notre boutique"
              value={config.title}
              onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
            />
          </div>

          {/* Overlay subtitle */}
          <div className="space-y-2">
            <Label htmlFor="video-subtitle">Sous-titre superposé</Label>
            <Input
              id="video-subtitle"
              placeholder="Découvrez notre collection exclusive"
              value={config.subtitle}
              onChange={(e) => setConfig((c) => ({ ...c, subtitle: e.target.value }))}
            />
          </div>

          {/* CTA text */}
          <div className="space-y-2">
            <Label htmlFor="video-cta">Texte du bouton d&apos;appel à l&apos;action</Label>
            <Input
              id="video-cta"
              placeholder="Découvrir"
              value={config.ctaText}
              onChange={(e) => setConfig((c) => ({ ...c, ctaText: e.target.value }))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Sauvegarder
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}