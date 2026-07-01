'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Phone, Key, ShieldCheck, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface WaveConfig {
  configured: boolean
  wavePhoneNumber?: string
  hasApiKey?: boolean
  isActive?: boolean
  configuredAt?: string
}

export function WaveConfigPanel() {
  const [config, setConfig] = useState<WaveConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Charger la config
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/merchant/wave-config')
      const data = await res.json()
      setConfig(data)
      if (data.wavePhoneNumber) setPhoneNumber(data.wavePhoneNumber)
      setIsActive(data.isActive !== false)
    } catch (error) {
      console.error('Error loading wave config:', error)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  // Sauvegarder
  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Veuillez entrer votre numéro Wave Business')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/merchant/wave-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wavePhoneNumber: phoneNumber,
          waveApiKey: apiKey.trim() || undefined,
          isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la sauvegarde')
        return
      }

      setConfig(data)
      toast.success('Configuration Wave sauvegardée ✓')
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              Wave Business
            </CardTitle>
            <CardDescription className="mt-1.5">
              Recevez les paiements de vos clients directement sur votre compte Wave
            </CardDescription>
          </div>
          {config?.configured && (
            <Badge variant={config.isActive ? 'default' : 'secondary'} className={config.isActive ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' : ''}>
              {config.isActive ? 'Actif' : 'Inactif'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Numéro Wave Business
          </label>
          <Input
            placeholder="+221 77 123 45 67"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="tel"
          />
          <p className="text-xs text-muted-foreground">
            Le numéro de votre compte Wave Business sur lequel vous recevrez les paiements
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4" />
            Clé API Wave (optionnel)
          </label>
          <Input
            placeholder="wave_sk_live_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Requis pour les paiements automatiques. Obtenez-la depuis votre dashboard Wave Business.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Paiements Wave activés</p>
            <p className="text-xs text-muted-foreground">
              Les clients pourront payer via Wave sur votre boutique
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {config?.configured ? 'Mettre à jour' : 'Configurer Wave'}
          </Button>
          <Button variant="outline" onClick={loadConfig} disabled={saving}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {config?.configured && config.configuredAt && (
          <p className="text-xs text-muted-foreground text-center">
            Configuré le {new Date(config.configuredAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}