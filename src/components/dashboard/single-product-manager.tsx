'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, GripVertical, Loader2, Target, Clock, HelpCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { SingleProductConfig, FAQItem } from '@/lib/single-product-types'

interface Product {
  id: string
  name: string
  price: number
  image?: string | null
}

export function SingleProductManager() {
  const { shop } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [config, setConfig] = useState<SingleProductConfig | null>(null)
  const [templateType, setTemplateType] = useState<string>('STANDARD')
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')

  // Load config + products + faqs
  useEffect(() => {
    if (!shop) return
    async function load() {
      try {
        const [cfgRes, prodRes, faqRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/single-product-config`),
          fetch(`/api/shops/${shop!.slug}/products`),
          fetch(`/api/shops/${shop!.slug}/faqs`),
        ])
        if (cfgRes.ok) {
          const d = await cfgRes.json()
          setConfig(d.config)
          setTemplateType(d.templateType || 'STANDARD')
        }
        if (prodRes.ok) {
          const d = await prodRes.json()
          setProducts(Array.isArray(d) ? d : d.products || [])
        }
        if (faqRes.ok) {
          setFaqs(await faqRes.json())
        }
      } catch {
        toast.error('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [shop])

  const save = useCallback(async (updates: Partial<{ templateType: string; config: SingleProductConfig }>) => {
    if (!shop) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {}
      if (updates.templateType !== undefined) body.templateType = updates.templateType
      if (updates.config !== undefined) body.config = updates.config
      const res = await fetch(`/api/shops/${shop.slug}/single-product-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('save failed')
      const d = await res.json()
      if (updates.templateType !== undefined) setTemplateType(d.templateType)
      if (updates.config !== undefined) setConfig(d.config)
      toast.success('Enregistré')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [shop])

  const toggleTemplate = (checked: boolean) => {
    const newType = checked ? 'SINGLE_PRODUCT' : 'STANDARD'
    save({ templateType: newType })
  }

  const updateConfig = (patch: Partial<SingleProductConfig>) => {
    if (!config) return
    const next = { ...config, ...patch }
    setConfig(next)
    save({ config: next })
  }

  const addFaq = async () => {
    if (!shop || !newFaqQ.trim() || !newFaqA.trim()) return
    try {
      const res = await fetch(`/api/shops/${shop.slug}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newFaqQ, answer: newFaqA }),
      })
      if (!res.ok) throw new Error('add faq failed')
      const faq = await res.json()
      setFaqs([...faqs, faq])
      setNewFaqQ('')
      setNewFaqA('')
      toast.success('FAQ ajoutée')
    } catch {
      toast.error('Erreur')
    }
  }

  const deleteFaq = async (id: string) => {
    if (!shop) return
    try {
      await fetch(`/api/shops/${shop.slug}/faqs/${id}`, { method: 'DELETE' })
      setFaqs(faqs.filter((f) => f.id !== id))
      toast.success('FAQ supprimée')
    } catch {
      toast.error('Erreur')
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Target className="h-6 w-6 text-primary" />
          Single Produit
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Template optimisé conversion pour vendeurs mono-produit et TikTokeurs.
        </p>
      </div>

      {/* Activation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activation du template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <p className="font-medium">Utiliser le template « Single Produit »</p>
              <p className="text-sm text-muted-foreground">
                Remplace votre boutique classique par une landing page focalisée sur un seul produit.
              </p>
            </div>
            <Switch
              checked={templateType === 'SINGLE_PRODUCT'}
              onCheckedChange={toggleTemplate}
              disabled={saving}
            />
          </div>
          {templateType === 'SINGLE_PRODUCT' && shop && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => window.open(`/${shop.slug}`, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Voir la page publique
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Produit mis en avant */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produit mis en avant</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun produit. Ajoutez d'abord un produit dans l'onglet « Produits ».
            </p>
          ) : (
            <Select
              value={config.productId || '__none__'}
              onValueChange={(v) => updateConfig({ productId: v === '__none__' ? null : v })}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un produit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Aucun</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.price.toLocaleString('fr-FR')} FCFA
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Compte à rebours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Compte à rebours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <p className="font-medium">Activer le compte à rebours</p>
              <p className="text-sm text-muted-foreground">
                Crée de l'urgence. Se réinitialise automatiquement chaque jour.
              </p>
            </div>
            <Switch
              checked={config.countdown.enabled}
              onCheckedChange={(v) => updateConfig({ countdown: { ...config.countdown, enabled: v } })}
              disabled={saving}
            />
          </div>
          {config.countdown.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cd-hour">Heure de fin (0-23)</Label>
                <Input
                  id="cd-hour"
                  type="number"
                  min={0}
                  max={23}
                  value={config.countdown.endHour}
                  onChange={(e) => updateConfig({ countdown: { ...config.countdown, endHour: parseInt(e.target.value) || 0 } })}
                  disabled={saving}
                />
              </div>
              <div>
                <Label htmlFor="cd-min">Minute de fin (0-59)</Label>
                <Input
                  id="cd-min"
                  type="number"
                  min={0}
                  max={59}
                  value={config.countdown.endMinute}
                  onChange={(e) => updateConfig({ countdown: { ...config.countdown, endMinute: parseInt(e.target.value) || 0 } })}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5 text-primary" />
            Questions fréquentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.length > 0 && (
            <div className="space-y-2">
              {faqs.map((f) => (
                <div key={f.id} className="flex items-start gap-2 rounded-xl border p-3">
                  <GripVertical className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{f.question}</p>
                    <p className="text-sm text-muted-foreground">{f.answer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
                    onClick={() => deleteFaq(f.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2 rounded-xl border border-dashed p-4">
            <p className="text-sm font-medium">Ajouter une FAQ</p>
            <Input
              placeholder="Question..."
              value={newFaqQ}
              onChange={(e) => setNewFaqQ(e.target.value)}
            />
            <Input
              placeholder="Réponse..."
              value={newFaqA}
              onChange={(e) => setNewFaqA(e.target.value)}
            />
            <Button size="sm" onClick={addFaq} disabled={!newFaqQ.trim() || !newFaqA.trim()}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {saving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde...
        </div>
      )}
    </div>
  )
}
