'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  User,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  total: number
  customerName?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  status: string
  createdAt: string
  items: string
}

const statusList = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'DELIVERED', label: 'Livrées' },
  { value: 'CANCELLED', label: 'Annulées' },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  CONFIRMED: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-100',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
}

const newStatusOptions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: ['PENDING'],
}

function formatPrice(price: number) {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseItems(itemsStr: string): OrderItem[] {
  try {
    return JSON.parse(itemsStr)
  } catch {
    return []
  }
}

export function DashboardOrders() {
  const { shop } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!shop) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ shopId: shop.id })
      if (statusFilter !== 'ALL') params.set('status', statusFilter)

      const res = await fetch(`/api/orders?${params}`)
      if (res.ok) {
        setOrders(await res.json())
      }
    } catch {
      toast.error('Erreur de chargement des commandes')
    } finally {
      setLoading(false)
    }
  }, [shop, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (!res.ok) {
        toast.error('Erreur lors de la mise à jour')
        return
      }

      toast.success(`Statut mis à jour : ${statusLabels[newStatus]}`)
      fetchOrders()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpdatingId(null)
    }
  }

  function toggleExpand(orderId: string) {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusList.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-1">Aucune commande</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== 'ALL'
                ? `Aucune commande ${statusLabels[statusFilter]?.toLowerCase()} pour le moment.`
                : 'Vos commandes apparaîtront ici.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = parseItems(order.items)
            const isExpanded = expandedOrder === order.id
            const isUpdating = updatingId === order.id

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Order row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden">Date</p>
                      <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden">Client</p>
                      <p className="text-sm font-medium">{order.customerName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden">Produits</p>
                      <p className="text-sm text-muted-foreground">
                        {items.length} article{items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground sm:hidden">Total</p>
                        <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={statusColors[order.status] || ''}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status update dropdown */}
                    {newStatusOptions[order.status]?.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                Modifier
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {newStatusOptions[order.status].map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation()
                                updateStatus(order.id, s)
                              }}
                            >
                              {statusLabels[s]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(order.id)
                      }}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <>
                    <Separator />
                    <div className="p-4 space-y-4 bg-muted/20">
                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Articles commandés</h4>
                        <div className="space-y-2">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Customer info */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Informations client</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          {order.customerName && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4 shrink-0" />
                              <span>{order.customerName}</span>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4 shrink-0" />
                              <span>{order.customerPhone}</span>
                            </div>
                          )}
                          {order.customerAddress && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span>{order.customerAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
