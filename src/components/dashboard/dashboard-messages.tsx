'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  CheckCircle2,
  MessageCircle,
  Inbox,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  source: string
  createdAt: string
}

interface MessagesResponse {
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type FilterStatus = 'ALL' | 'NEW' | 'READ' | 'REPLIED'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' à ' + date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'NEW':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/40 dark:text-sky-300 shrink-0">
          Nouveau
        </Badge>
      )
    case 'READ':
      return <Badge variant="secondary" className="shrink-0">Lu</Badge>
    case 'REPLIED':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
          Répondu
        </Badge>
      )
    default:
      return <Badge variant="outline" className="shrink-0">{status}</Badge>
  }
}

function getAvatarColor(status: string): string {
  switch (status) {
    case 'NEW': return 'bg-sky-500 text-white'
    case 'READ': return 'bg-gray-400 text-white dark:bg-gray-500'
    case 'REPLIED': return 'bg-emerald-500 text-white'
    default: return 'bg-gray-400 text-white'
  }
}

function getFilterCounts(
  messages: Message[]
): Record<FilterStatus, number> {
  return {
    ALL: messages.length,
    NEW: messages.filter(m => m.status === 'NEW').length,
    READ: messages.filter(m => m.status === 'READ').length,
    REPLIED: messages.filter(m => m.status === 'REPLIED').length,
  }
}

function openWhatsAppReply(whatsappNumber: string, messageName: string) {
  const msg = encodeURIComponent(
    `Bonjour ${messageName}, merci pour votre message. Je vous réponds concernant votre demande.`
  )
  const phone = whatsappNumber.replace(/\D/g, '')
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
}

/* ------------------------------------------------------------------ */
/*  Tabs config                                                        */
/* ------------------------------------------------------------------ */

const FILTER_TABS: { status: FilterStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'ALL', label: 'Tous', icon: <Inbox className="h-4 w-4" /> },
  { status: 'NEW', label: 'Non lus', icon: <Mail className="h-4 w-4" /> },
  { status: 'READ', label: 'Lus', icon: <MailOpen className="h-4 w-4" /> },
  { status: 'REPLIED', label: 'Répondus', icon: <CheckCircle2 className="h-4 w-4" /> },
]

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DashboardMessages() {
  const shop = useAppStore(s => s.shop)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMessages, setTotalMessages] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [markingRead, setMarkingRead] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---- Debounced search ---- */
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchQuery])

  /* ---- Fetch messages ---- */
  const fetchMessages = useCallback(async () => {
    if (!shop?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        shopId: shop.id,
        status: activeFilter,
        page: String(page),
        limit: '20',
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/shops/messages?${params.toString()}`)
      if (res.ok) {
        const data: MessagesResponse = await res.json()
        setMessages(data.messages)
        setTotalPages(data.pagination.totalPages)
        setTotalMessages(data.pagination.total)
      }
    } catch {
      toast.error('Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }, [shop?.id, activeFilter, page, debouncedSearch])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  /* ---- Reset page on filter change ---- */
  useEffect(() => {
    setPage(1)
    setSelectedIds(new Set())
  }, [activeFilter])

  /* ---- Mark as read ---- */
  async function markAsRead(messageId: string) {
    if (!shop?.id) return
    try {
      const res = await fetch('/api/shops/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, messageIds: [messageId], status: 'READ' }),
      })
      if (res.ok) {
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, status: 'READ' } : m))
        )
        toast.success('Message marqué comme lu')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  /* ---- Bulk mark as read ---- */
  async function bulkMarkAsRead() {
    if (!shop?.id || selectedIds.size === 0) return
    setMarkingRead(true)
    try {
      const res = await fetch('/api/shops/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          messageIds: Array.from(selectedIds),
          status: 'READ',
        }),
      })
      if (res.ok) {
        setMessages(prev =>
          prev.map(m => (selectedIds.has(m.id) ? { ...m, status: 'READ' } : m))
        )
        setSelectedIds(new Set())
        toast.success(`${selectedIds.size} message(s) marqué(s) comme lu(s)`)
      }
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setMarkingRead(false)
    }
  }

  /* ---- Toggle selection ---- */
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(messages.map(m => m.id)))
    }
  }

  /* ---- Loading skeleton ---- */
  if (loading && messages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-full max-w-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  /* ---- Computed ---- */
  const filterCounts = getFilterCounts(messages)
  const allSelected = messages.length > 0 && selectedIds.size === messages.length
  const someSelected = selectedIds.size > 0 && !allSelected

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Messages</h2>
          {totalMessages > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalMessages}
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.status
          const count = filterCounts[tab.status] ?? 0
          return (
            <Button
              key={tab.status}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 gap-1.5 text-sm ${
                isActive
                  ? ''
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveFilter(tab.status)}
            >
              {tab.icon}
              {tab.label}
              {count > 0 && (
                <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  ({count})
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} sélectionné(s)
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            disabled={markingRead}
            onClick={bulkMarkAsRead}
          >
            <Eye className="h-3.5 w-3.5" />
            {markingRead ? 'Mise à jour...' : 'Marquer les sélectionnés comme lus'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setSelectedIds(new Set())}
          >
            Annuler
          </Button>
        </div>
      )}

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">
            {debouncedSearch
              ? 'Aucun message ne correspond à ce filtre'
              : 'Aucun message reçu pour le moment'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {debouncedSearch
              ? 'Essayez de modifier vos critères de recherche ou de filtre.'
              : 'Les messages envoyés via le formulaire de contact de votre boutique apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select all */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Tout sélectionner"
            />
            <span className="text-xs text-muted-foreground">Tout sélectionner</span>
          </div>

          {messages.map((msg) => {
            const isSelected = selectedIds.has(msg.id)
            return (
              <Card
                key={msg.id}
                className={`transition-colors ${
                  isSelected ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(msg.id)}
                        aria-label={`Sélectionner le message de ${msg.name}`}
                      />
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(msg.status)}`}
                    >
                      {msg.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold truncate">{msg.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {msg.email}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {msg.message}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(msg.createdAt)}
                        </span>
                        {getStatusBadge(msg.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {msg.status === 'NEW' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 px-2"
                          onClick={() => markAsRead(msg.id)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span className="hidden sm:inline">Marquer comme lu</span>
                          <span className="sm:hidden">Lu</span>
                        </Button>
                      )}
                      {shop?.whatsapp && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 px-2"
                          onClick={() => openWhatsAppReply(shop.whatsapp, msg.name)}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          <span className="hidden sm:inline">Ouvrir WhatsApp</span>
                          <span className="sm:hidden">WhatsApp</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}