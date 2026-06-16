'use client'

import { useState, useEffect } from 'react'
import type { Shop } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function NotificationTab({ shop }: { shop: Shop | null }) {
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    notifyNewOrder: true,
    notifyLowStock: false,
    notifyWeeklyReport: false,
    notifyNewReview: true,
  })
  const [notifEmail, setNotifEmail] = useState('')
  const [savingNotif, setSavingNotif] = useState(false)

  useEffect(() => {
    if (shop) {
      fetch('/api/settings')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            if (data.notificationPreferences) {
              try {
                setNotifPrefs(JSON.parse(data.notificationPreferences))
              } catch { /* ignore */ }
            }
            if (data.notificationEmail) {
              setNotifEmail(data.notificationEmail)
            }
          }
        })
        .catch(() => {})
    }
  }, [shop])

  async function saveNotifPrefs() {
    setSavingNotif(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationPreferences: JSON.stringify(notifPrefs),
          notificationEmail: notifEmail,
        }),
      })
      if (!res.ok) {
        toast.error('Erreur lors de la sauvegarde des préférences')
        return
      }
      toast.success('Préférences de notification enregistrées !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSavingNotif(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Notifications &amp; Email
        </CardTitle>
        <CardDescription>
          Choisissez les notifications que vous souhaitez recevoir par email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { key: 'notifyNewOrder', label: 'Nouvelle commande', desc: 'Recevez un email à chaque nouvelle commande' },
            { key: 'notifyLowStock', label: 'Alerte stock bas', desc: 'Notification quand un produit a moins de 5 en stock' },
            { key: 'notifyWeeklyReport', label: 'Rapport hebdomadaire', desc: 'Résumé de vos ventes chaque lundi' },
            { key: 'notifyNewReview', label: 'Avis client', desc: 'Quand un client laisse un avis ou commentaire' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-3 rounded-lg border border-muted cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={!!notifPrefs[item.key]}
                onChange={(e) =>
                  setNotifPrefs((prev: Record<string, boolean>) => ({ ...prev, [item.key]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="pt-2">
          <Label className="text-sm font-medium">Email de contact</Label>
          <p className="text-xs text-muted-foreground mb-2">Adresse où recevoir les notifications</p>
          <Input
            type="email"
            value={notifEmail}
            onChange={(e) => setNotifEmail(e.target.value)}
            placeholder="votre@email.com"
            className="max-w-sm"
          />
        </div>

        <Button
          onClick={saveNotifPrefs}
          disabled={savingNotif}
          className="gap-2"
        >
          {savingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Enregistrer les préférences
        </Button>
      </CardContent>
    </Card>
  )
}