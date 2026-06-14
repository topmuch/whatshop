'use client'

import React from 'react'
import { useAppStore } from '@/lib/store'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Clock,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Copy,
  ExternalLink,
  ShoppingBag,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/shared'
import { getBusinessLabels } from '@/lib/business-labels'
import { formatDateTime } from '@/lib/utils'

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

const statusConfig: Record<string, {
  label: string
  className: string
  icon: React.ReactNode
  dotColor: string
}> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    icon: <Clock className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Confirmée',
    className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
    icon: <Package className="h-3.5 w-3.5" />,
    dotColor: 'bg-cyan-500',
  },
  DELIVERED: {
    label: 'Livrée',
    className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Annulée',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
    icon: <XCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-red-500',
  },
}

const statusFlow = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']

const newStatusOptions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: ['PENDING'],
}



function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return formatDateTime(dateStr)
}

function parseItems(itemsStr: string): OrderItem[] {
  try {
    return JSON.parse(itemsStr)
  } catch {
    return []
  }
}

function getOrderNumber(orderId: string): string {
  // Use last 4 chars of the ID as order number, formatted as #1001+
  const last4 = orderId.slice(-4).toUpperCase()
  const num = parseInt(last4, 36) % 9000 + 1000
  return `#${num}`
}

export function DashboardOrders() {
  const { shop } = useAppStore()
  const labels = getBusinessLabels(shop?.businessType, shop?.sector)
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
      toast.error(`Erreur de chargement des ${labels.ordersTitle.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }, [shop, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Stats
  const stats = useMemo(() => {
    if (!orders.length) return { total: 0, pending: 0, confirmed: 0, revenue: 0 }
    const allOrders = orders
    const pending = allOrders.filter((o) => o.status === 'PENDING').length
    const confirmed = allOrders.filter(
      (o) => o.status === 'CONFIRMED' || o.status === 'DELIVERED'
    ).length
    const revenue = allOrders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.total, 0)
    return {
      total: allOrders.length,
      pending,
      confirmed,
      revenue,
    }
  }, [orders])

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

      const config = statusConfig[newStatus]
      toast.success(`Statut mis à jour : ${config?.label || newStatus}`)
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

  function handleContactWhatsApp(phone?: string | null) {
    if (!phone) {
      toast.error('Aucun numéro de téléphone disponible')
      return
    }
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  function handleCopyShopUrl() {
    if (!shop) return
    const url = `${window.location.origin}?shop=${shop.slug}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Lien copié dans le presse-papier')
    }).catch(() => {
      toast.error('Erreur lors de la copie')
    })
  }

  function getStatusFlowIndex(status: string): number {
    const idx = statusFlow.indexOf(status)
    return idx >= 0 ? idx : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{`Mes ${labels.ordersTitle.toLowerCase()}`}</h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 overflow-hidden border-t-4 border-t-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{`Total ${labels.ordersTitle.toLowerCase()}`}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 overflow-hidden border-t-4 border-t-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 overflow-hidden border-t-4 border-t-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmées / Livrées</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 overflow-hidden border-t-4 border-t-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
              <p className="text-xs text-muted-foreground">Revenus (livrées)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{labels.ordersEmpty}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {statusFilter !== 'ALL'
                ? `${labels.ordersEmpty.split(' pour le moment')[0]} ${statusConfig[statusFilter]?.label?.toLowerCase() || ''} pour le moment.`
                : `Partagez votre boutique pour recevoir des ${labels.ordersTitle.toLowerCase()}.`}
            </p>
            {statusFilter === 'ALL' && shop && (
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={handleCopyShopUrl}>
                  <Copy className="h-4 w-4" />
                  Copier le lien de la boutique
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleCopyShopUrl}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => {
              const items = parseItems(order.items)
              const isExpanded = expandedOrder === order.id
              const isUpdating = updatingId === order.id
              const config = statusConfig[order.status] || statusConfig.PENDING
              const orderNumber = getOrderNumber(order.id)
              const flowIndex = getStatusFlowIndex(order.status)

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    {/* Order row */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 items-center">
                          {/* Order number */}
                          <div>
                            <p className="text-xs text-muted-foreground sm:hidden">Commande</p>
                            <p className="text-sm font-bold text-primary">{orderNumber}</p>
                          </div>
                          {/* Customer */}
                          <div>
                            <p className="text-xs text-muted-foreground sm:hidden">Client</p>
                            <p className="text-sm font-medium truncate">
                              {order.customerName || '—'}
                            </p>
                          </div>
                          {/* Date */}
                          <div className="hidden sm:block">
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeDate(order.createdAt)}
                            </p>
                          </div>
                          {/* Items */}
                          <div className="hidden sm:block">
                            <p className="text-xs text-muted-foreground">Articles</p>
                            <p className="text-sm text-muted-foreground">
                              {items.length} article{items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {/* Total + Status */}
                          <div className="flex items-center justify-between sm:justify-start gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground sm:hidden">Total</p>
                              <p className="text-sm font-bold text-primary">
                                {formatPrice(order.total)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Status badge */}
                              <Badge
                                variant="secondary"
                                className={`${config.className} gap-1 text-xs font-medium`}
                              >
                                {config.icon}
                                {config.label}
                              </Badge>

                              {/* Mini flow indicator */}
                              <div className="hidden md:flex items-center gap-0.5">
                                {statusFlow.filter((s) => s !== 'CANCELLED').map((s, idx) => (
                                  <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                      idx <= flowIndex && order.status !== 'CANCELLED'
                                        ? statusConfig[s].dotColor
                                        : 'bg-muted-foreground/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
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
                                className="text-xs h-8"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                    Modifier
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {newStatusOptions[order.status].map((s) => {
                                const sConfig = statusConfig[s]
                                return (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateStatus(order.id, s)
                                    }}
                                    className="gap-2"
                                  >
                                    <span className={sConfig.dotColor}>●</span>
                                    {sConfig.label}
                                  </DropdownMenuItem>
                                )
                              })}
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
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator />
                          <div className="p-4 space-y-4 bg-muted/20">
                            {/* Status Timeline */}
                            <div className="flex items-center gap-2">
                              {statusFlow.map((s, idx) => {
                                const sConfig = statusConfig[s]
                                const isActive =
                                  (idx <= flowIndex && order.status !== 'CANCELLED') ||
                                  (order.status === 'CANCELLED' && s === 'CANCELLED')
                                const isCurrent = order.status === s

                                return (
                                  <div key={s} className="flex items-center gap-2">
                                    <div className="flex flex-col items-center gap-1">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                          isActive
                                            ? sConfig.dotColor + ' text-white scale-110'
                                            : 'bg-muted text-muted-foreground'
                                        } ${isCurrent ? 'ring-2 ring-offset-2 ring-' + sConfig.dotColor.replace('bg-', '') : ''}`}
                                      >
                                        {isActive ? (
                                          <span className="text-[10px]">
                                            {React.cloneElement(sConfig.icon as React.ReactElement<any>, {
                                              className: 'h-3 w-3',
                                            })}
                                          </span>
                                        ) : (
                                          <span className="text-[8px]">○</span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">
                                        {sConfig.label}
                                      </span>
                                    </div>
                                    {idx < statusFlow.length - 1 && (
                                      <div
                                        className={`h-0.5 w-6 sm:w-10 transition-colors ${
                                          idx < flowIndex
                                            ? statusConfig[statusFlow[idx]].dotColor
                                            : 'bg-muted'
                                        }`}
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* Items */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Articles commandés
                              </h4>
                              <div className="space-y-2 bg-background rounded-lg p-3">
                                {items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                        <Package className="h-4 w-4 text-muted-foreground/40" />
                                      </div>
                                      <div>
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-muted-foreground ml-1.5">
                                          × {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-primary">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                                <Separator className="my-1" />
                                <div className="flex items-center justify-between text-sm font-bold pt-1">
                                  <span>Total</span>
                                  <span className="text-primary">{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Customer info */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Informations client
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {order.customerName && (
                                  <div className="flex items-center gap-2.5 bg-background rounded-lg p-3 text-sm">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Nom</p>
                                      <p className="font-medium">{order.customerName}</p>
                                    </div>
                                  </div>
                                )}
                                {order.customerPhone && (
                                  <div className="flex items-center gap-2.5 bg-background rounded-lg p-3 text-sm">
                                    <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                                      <Phone className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Téléphone</p>
                                      <p className="font-medium">{order.customerPhone}</p>
                                    </div>
                                  </div>
                                )}
                                {order.customerAddress && (
                                  <div className="flex items-center gap-2.5 bg-background rounded-lg p-3 text-sm">
                                    <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center shrink-0">
                                      <MapPin className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Adresse</p>
                                      <p className="font-medium">{order.customerAddress}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* WhatsApp contact + Timestamp */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Créée le {formatDateTime(order.createdAt)}</span>
                              </div>
                              {order.customerPhone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 h-8 text-xs"
                                  onClick={() => handleContactWhatsApp(order.customerPhone)}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Contacter via WhatsApp
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
