'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageCircle,
  Mail,
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Inbox,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DailyDataPoint {
  date: string
  label: string
  whatsappClicks: number
  contactFormSubmits: number
  pageViews: number
}

interface TopProduct {
  id: string
  name: string
  whatsappClicks: number
  percentage: number
  image?: string
}

interface RecentMessage {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

interface AnalyticsStatsResponse {
  whatsappClicks: number
  contactFormSubmits: number
  pageViews: number
  productCount: number
  whatsappClicks7d: number
  contactFormSubmits7d: number
  whatsappClicksPrev7d: number
  contactFormSubmitsPrev7d: number
  whatsappClicksChange: number
  contactFormSubmitsChange: number
  dailyData: DailyDataPoint[]
  topProducts: TopProduct[]
  recentMessages: RecentMessage[]
  insights: string[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin}min`
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD < 7) return `il y a ${diffD}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString('fr-FR')
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'NEW':
      return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/40 dark:text-sky-300">Nouveau</Badge>
    case 'READ':
      return <Badge variant="secondary">Lu</Badge>
    case 'REPLIED':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">Répondu</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getInsightStyle(insight: string): { bg: string; icon: React.ReactNode } {
  const lower = insight.toLowerCase()
  if (lower.includes('augment') || lower.includes('progress') || lower.includes('excellent') || lower.includes('super') || lower.includes('bien') || lower.includes('✅') || lower.includes('📈') || lower.includes('🚀') || lower.includes('🎉') || lower.includes('💪')) {
    return {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
      icon: <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    }
  }
  if (lower.includes('attention') || lower.includes('alert') || lower.includes('dimin') || lower.includes('baisse') || lower.includes('⚠️') || lower.includes('🚨') || lower.includes('⚠') || lower.includes('manque') || lower.includes('urgent')) {
    return {
      bg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    }
  }
  return {
    bg: 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-300',
    icon: <Lightbulb className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />,
  }
}

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name} :</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  KPI Change Badge                                                   */
/* ------------------------------------------------------------------ */

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) return null
  const isPositive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DashboardStats() {
  const shop = useAppStore(s => s.shop)
  const [data, setData] = useState<AnalyticsStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!shop?.id) return
    try {
      const res = await fetch(`/api/shops/analytics-stats?shopId=${shop.id}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [shop?.id])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  async function markAsRead(messageId: string) {
    if (!shop?.id) return
    try {
      const res = await fetch('/api/shops/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, messageIds: [messageId], status: 'READ' }),
      })
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            recentMessages: prev.recentMessages.map(m =>
              m.id === messageId ? { ...m, status: 'READ' } : m
            ),
          }
        })
        toast.success('Message marqué comme lu')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-56" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-52" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  /* ---- Empty state ---- */
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Aucune donnée disponible</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Les statistiques apparaîtront ici une fois que votre boutique aura reçu des visites et des interactions.
        </p>
        <Button variant="outline" className="mt-4" onClick={fetchStats}>
          Actualiser
        </Button>
      </div>
    )
  }

  /* ---- KPI Cards ---- */
  const kpiCards = [
    {
      label: 'Clics WhatsApp',
      value: formatNumber(data.whatsappClicks),
      change: data.whatsappClicksChange,
      icon: <MessageCircle className="h-5 w-5" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Messages Contact',
      value: formatNumber(data.contactFormSubmits),
      change: data.contactFormSubmitsChange,
      icon: <Mail className="h-5 w-5" />,
      iconBg: 'bg-pink-100 dark:bg-pink-900/40',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
    {
      label: 'Vues de page',
      value: formatNumber(data.pageViews),
      icon: <Eye className="h-5 w-5" />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Produits en ligne',
      value: formatNumber(data.productCount),
      icon: <Package className="h-5 w-5" />,
      iconBg: 'bg-sky-100 dark:bg-sky-900/40',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Section 1: KPI Cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <Card key={card.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.change !== undefined && card.change !== 0 && (
                  <div className="mt-1">
                    <ChangeBadge value={card.change} />
                    <span className="text-xs text-muted-foreground ml-1">vs 7 jours</span>
                  </div>
                )}
                {card.change === 0 && (
                  <span className="text-xs text-muted-foreground mt-1 block">vs 7 jours</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 2: Chart — Évolution sur 7 jours */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évolution sur 7 jours</CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value: string) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="whatsappClicks"
                    name="Clics WhatsApp"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="contactFormSubmits"
                    name="Messages contact"
                    fill="#ec4899"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Aucune donnée pour les 7 derniers jours
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Sections 3 & 4: Top Products + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Top 5 Produits les plus demandés */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Produits les plus demandés</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate max-w-[60%]">
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {product.whatsappClicks} clics
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(product.percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Aucun produit avec des clics WhatsApp pour le moment
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Derniers messages de contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers messages de contact</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentMessages.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {data.recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold truncate">{msg.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{msg.email}</span>
                        {getStatusBadge(msg.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {msg.message.length > 80 ? msg.message.slice(0, 80) + '...' : msg.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                        {msg.status === 'NEW' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400"
                            onClick={() => markAsRead(msg.id)}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                Aucun message reçu pour le moment
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Insights & Recommandations */}
      {data.insights.length > 0 && (
        <section>
          <h3 className="text-base font-semibold mb-3">Insights & Recommandations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.insights.map((insight, i) => {
              const style = getInsightStyle(insight)
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border ${style.bg}`}
                >
                  {style.icon}
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}