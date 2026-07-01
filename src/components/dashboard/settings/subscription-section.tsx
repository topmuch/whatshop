'use client'

import { useState, useEffect } from 'react'
import type { Shop } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Crown,
  Globe,
  Loader2,
  Store,
  Zap,
  ArrowUpRight,
  AlertCircle,
  Clock,
  Smartphone,
} from 'lucide-react'
import { toast } from 'sonner'
import { WavePayButton } from '@/components/payments/wave-pay-button'

export function SubscriptionSection({ shop }: { shop: Shop | null }) {
  const [subscriptionData, setSubscriptionData] = useState<{
    planType: string
    status: string
    maxShops: number
    currentShopCount: number
    endDate: string | null
    pendingUpgrade: { id: string; requestedPlan: string; requestedLabel: string; requestedPrice: number; createdAt: string } | null
    planConfig: { label: string; price: number; maxShops: number; customDomain: boolean; features: string[] }
    allPlans: { type: string; label: string; price: number; maxShops: number; customDomain: boolean; features: string[] }[]
  } | null>(null)
  const [subLoading, setSubLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  // Fetch subscription data
  useEffect(() => {
    fetch('/api/subscription')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSubscriptionData(data)
      })
      .catch(() => {})
      .finally(() => setSubLoading(false))
  }, [])

  async function handleUpgrade(planType: string) {
    setUpgrading(planType)
    try {
      const res = await fetch('/api/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors de la demande')
        return
      }
      const data = await res.json()
      // Update local state to show pending
      setSubscriptionData((prev) =>
        prev
          ? {
              ...prev,
              pendingUpgrade: data.request || null,
            }
          : prev
      )
      toast.success('Demande envoyée ! Un administrateur va la valider.')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Mon forfait
        </CardTitle>
        <CardDescription>
          Gérez votre abonnement et créez jusqu&apos;à 10 boutiques
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : subscriptionData ? (
          <>
            {/* Current plan summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 mb-5"
              style={{ borderColor: subscriptionData.planType === 'BUSINESS' ? '#D4AF37' : subscriptionData.planType === 'PRO' ? '#0891B2' : '#9ca3af' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl"
                  style={{
                    background: subscriptionData.planType === 'BUSINESS'
                      ? 'linear-gradient(135deg, #D4AF37, #F59E0B)'
                      : subscriptionData.planType === 'PRO'
                      ? 'linear-gradient(135deg, #0891B2, #06B6D4)'
                      : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                  }}
                >
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{subscriptionData.planConfig.label}</span>
                    <Badge
                      variant="secondary"
                      className={
                        subscriptionData.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : subscriptionData.status === 'TRIAL'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }
                    >
                      {subscriptionData.status === 'ACTIVE'
                        ? 'Actif'
                        : subscriptionData.status === 'TRIAL'
                        ? 'Essai'
                        : subscriptionData.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionData.currentShopCount}/{subscriptionData.maxShops} boutiques utilisées
                    {subscriptionData.endDate && (
                      <span className="ml-2">
                        · Expire le {new Date(subscriptionData.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{subscriptionData.planConfig.price.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-muted-foreground">FCFA/mois</p>
              </div>
            </div>

            {/* Shop usage bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Boutiques utilisées</span>
                <span className="font-semibold">{subscriptionData.currentShopCount} / {subscriptionData.maxShops}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((subscriptionData.currentShopCount / subscriptionData.maxShops) * 100, 100)}%`,
                    background: subscriptionData.currentShopCount >= subscriptionData.maxShops
                      ? '#ef4444'
                      : subscriptionData.planType === 'BUSINESS'
                      ? '#D4AF37'
                      : subscriptionData.planType === 'PRO'
                      ? '#0891B2'
                      : '#6b7280',
                  }}
                />
              </div>
              {subscriptionData.currentShopCount >= subscriptionData.maxShops && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Limite atteinte ! Passez à un forfait supérieur pour créer plus de boutiques.
                </p>
              )}
            </div>

            {/* Pending upgrade banner */}
            {subscriptionData.pendingUpgrade && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-800 text-sm">
                      Demande en attente de validation
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Vous avez demandé le forfait <strong>{subscriptionData.pendingUpgrade.requestedLabel}</strong>{' '}
                      ({subscriptionData.pendingUpgrade.requestedPrice.toLocaleString('fr-FR')} FCFA/mois) le{' '}
                      {new Date(subscriptionData.pendingUpgrade.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-amber-600 mt-1.5">
                      Un administrateur va examiner votre demande. Vous serez notifié dès validation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Available upgrades */}
            {subscriptionData.allPlans
              .filter((p) => p.type !== subscriptionData.planType)
              .filter((p) => {
                const order = ['STARTER', 'PRO', 'BUSINESS']
                return order.indexOf(p.type) > order.indexOf(subscriptionData.planType)
              })
              .length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Passer à un forfait supérieur
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subscriptionData.allPlans
                    .filter((p) => p.type !== subscriptionData.planType)
                    .filter((p) => {
                      const order = ['STARTER', 'PRO', 'BUSINESS']
                      return order.indexOf(p.type) > order.indexOf(subscriptionData.planType)
                    })
                    .map((plan) => (
                      <div
                        key={plan.type}
                        className="relative rounded-xl border p-4 hover:shadow-md transition-shadow"
                      >
                        {plan.type === 'BUSINESS' && (
                          <div className="absolute -top-2.5 left-4">
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              POPULAIRE
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold">{plan.label}</span>
                          <div className="text-right">
                            <span className="text-lg font-bold">{plan.price.toLocaleString('fr-FR')}</span>
                            <span className="text-xs text-muted-foreground ml-0.5">FCFA/mois</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 mb-4">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Store className="h-3.5 w-3.5 text-green-600" />
                            Jusqu&apos;à {plan.maxShops} boutique{plan.maxShops > 1 ? 's' : ''}
                          </p>
                          {plan.features.map((f) => (
                            <p key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {f}
                            </p>
                          ))}
                          {plan.customDomain && (
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Globe className="h-3 w-3 text-blue-500" />
                              Domaine personnalisé
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <WavePayButton
                            type="SUBSCRIPTION"
                            planType={plan.type}
                            amount={plan.price}
                            description={`Abonnement Boutiko - Plan ${plan.label}`}
                            size="sm"
                            className="w-full"
                            buttonText={`Payer ${plan.price.toLocaleString('fr-FR')} FCFA via Wave`}
                            onSuccess={() => {
                              // Recharger les données d'abonnement
                              fetch('/api/subscription')
                                .then(r => r.ok ? r.json() : null)
                                .then(d => { if (d) setSubscriptionData(d) })
                            }}
                          />
                          <Button
                            className="w-full gap-1.5"
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpgrade(plan.type)}
                            disabled={upgrading === plan.type || !!subscriptionData.pendingUpgrade}
                          >
                            {upgrading === plan.type ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : subscriptionData.pendingUpgrade ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                            {subscriptionData.pendingUpgrade ? 'Demande en cours...' : `Ou demander par validation admin`}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Impossible de charger les informations d&apos;abonnement.
          </p>
        )}
      </CardContent>
    </Card>
  )
}