'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShoppingCart,
  DollarSign,
  Eye,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice } from '@/lib/shared'
import { StatCard } from './stat-card'

interface OrdersByDay {
  date: string
  count: number
  revenue: number
}

interface TopProduct {
  name: string
  orders: number
  revenue: number
}

interface AnalyticsData {
  ordersByDay: OrdersByDay[]
  totalOrders: number
  totalRevenue: number
  totalVisits: number
  topProducts: TopProduct[]
  recentGrowth: number
}



function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

// Custom tooltip for the daily orders chart
function DailyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name === 'count' ? 'Commandes' : 'Revenu'} : {entry.name === 'count' ? entry.value : formatPrice(entry.value)}
        </p>
      ))}
    </div>
  )
}

// Custom tooltip for top products chart
function ProductTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopProduct }> }) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{p.name}</p>
      <p className="text-xs text-muted-foreground">
        {p.orders} commande(s) · {formatPrice(p.revenue)}
      </p>
    </div>
  )
}

export function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/shops/my-analytics')
        if (res.ok) {
          setData(await res.json())
        }
      } catch {
        // Error fetching analytics
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <LoadingSkeleton />

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Impossible de charger les analytics</p>
        </CardContent>
      </Card>
    )
  }

  // Format dates for the chart: "01 Juin" style
  const chartData = data.ordersByDay.map((d) => ({
    ...d,
    shortDate: new Date(d.date + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }),
  }))

  // Top products for horizontal bar chart
  const topProductsData = [...data.topProducts].reverse()

  const growthSub =
    data.recentGrowth >= 0 ? `+${data.recentGrowth}% vs semaine préc.` : `${data.recentGrowth}% vs semaine préc.`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez vos performances sur les 14 derniers jours
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Total Commandes"
          value={data.totalOrders.toLocaleString('fr-FR')}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Chiffre d'affaires"
          value={formatPrice(data.totalRevenue)}
          iconBg="bg-pink-100 dark:bg-pink-900/30"
          iconColor="text-pink-600 dark:text-pink-400"
        />
        <StatCard
          icon={<Eye className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Visiteurs"
          value={data.totalVisits.toLocaleString('fr-FR')}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Croissance"
          value={`${data.recentGrowth >= 0 ? '+' : ''}${data.recentGrowth}%`}
          sub={growthSub}
          iconBg={data.recentGrowth >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}
          iconColor={data.recentGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
        />
      </div>

      {/* Orders by Day Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pink-500" />
            Commandes par jour (14 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucune donnée disponible
            </div>
          ) : (
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<DailyTooltip />} />
                  <Bar
                    dataKey="count"
                    name="count"
                    fill="#EC4899"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Top 5 produits par commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-muted-foreground">
              Aucun produit commandé
            </div>
          ) : (
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ProductTooltip />} />
                  <Bar
                    dataKey="orders"
                    fill="#10B981"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}