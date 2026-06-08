'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  ShoppingCart,
  Tags,
  Crown,
  Copy,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface Stats {
  products: number
  orders: number
  categories: number
}

interface Order {
  id: string
  total: number
  customerName: string
  status: string
  createdAt: string
  items: string
}

function StatCard({
  icon,
  label,
  value,
  badge,
  badgeColor,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  badge?: string
  badgeColor?: string
  iconBg?: string
  iconColor?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {badge && (
              <Badge variant="secondary" className={`mt-2 ${badgeColor}`}>
                {badge}
              </Badge>
            )}
          </div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBg || 'bg-primary/10'} ${iconColor || 'text-primary'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getPlanBadge(plan: string) {
  switch (plan) {
    case 'PREMIUM':
      return { label: 'Premium', color: 'bg-amber-100 text-amber-800 hover:bg-amber-100' }
    case 'STANDARD':
      return { label: 'Standard', color: 'bg-green-100 text-green-800 hover:bg-green-100' }
    default:
      return { label: 'Gratuit', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100' }
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
    case 'CONFIRMED':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmée</Badge>
    case 'DELIVERED':
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Livrée</Badge>
    case 'CANCELLED':
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Annulée</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(price: number) {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

export function DashboardOverview() {
  const { user, shop, setDashboardTab } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!shop) return
      try {
        const [productsRes, ordersRes, categoriesRes] = await Promise.all([
          fetch(`/api/products?shopId=${shop.id}`),
          fetch(`/api/orders?shopId=${shop.id}`),
          fetch(`/api/categories?shopId=${shop.id}`),
        ])

        const products = productsRes.ok ? await productsRes.json() : []
        const ordersData = ordersRes.ok ? await ordersRes.json() : []
        const categories = categoriesRes.ok ? await categoriesRes.json() : []

        setStats({
          products: products.length,
          orders: ordersData.length,
          categories: categories.length,
        })
        setOrders(ordersData.slice(0, 5))
      } catch {
        // Error fetching data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [shop])

  function copyShopUrl() {
    if (!shop) return
    navigator.clipboard.writeText(`whatsshop.com/${shop.slug}`)
    toast.success('URL copiée !')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  const planInfo = getPlanBadge(shop?.plan || 'FREE')

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Bonjour, {user?.name || 'Vendeur'} ! 👋
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">
            Votre boutique : <span className="font-medium text-foreground">whatsshop.com/{shop?.slug}</span>
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyShopUrl}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label="Total produits"
          value={stats?.products ?? 0}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<ShoppingCart className="h-6 w-6" />}
          label="Commandes"
          value={stats?.orders ?? 0}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon={<Tags className="h-6 w-6" />}
          label="Catégories"
          value={stats?.categories ?? 0}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={<Crown className="h-6 w-6" />}
          label="Plan actuel"
          value={planInfo.label}
          badge={planInfo.label}
          badgeColor={planInfo.color}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setDashboardTab('products')} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
        <Button variant="outline" onClick={() => setDashboardTab('categories')} className="gap-2">
          <Tags className="h-4 w-4" />
          Gérer catégories
        </Button>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Commandes récentes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-sm"
            onClick={() => setDashboardTab('orders')}
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="pl-6 font-medium">{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
