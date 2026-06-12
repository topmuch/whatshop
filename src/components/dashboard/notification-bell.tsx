'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, ShoppingCart, Radio, Store, Package, AlertTriangle, Settings, UserPlus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SellerNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
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
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_ORDER':
      return <ShoppingCart className="h-4 w-4 text-emerald-500" />
    case 'SHOP_LIVE':
      return <Radio className="h-4 w-4 text-red-500" />
    case 'NEW_SHOP':
      return <Store className="h-4 w-4 text-pink-500" />
    case 'LOW_STOCK':
      return <Package className="h-4 w-4 text-amber-500" />
    case 'UPGRADE_REQUEST':
      return <Settings className="h-4 w-4 text-violet-500" />
    case 'NEW_SELLER':
      return <UserPlus className="h-4 w-4 text-sky-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NotificationBell({ dark = true }: { dark?: boolean }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<SellerNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const POLL_INTERVAL = 30_000

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=10&offset=0')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      // Silently fail — non-critical
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    const interval = setInterval(() => { fetchNotifications() }, POLL_INTERVAL)
    fetchNotifications() // eslint-disable-line react-hooks/set-state-in-effect
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function markAsRead(notificationId: string) {
    const notif = notifications.find((n) => n.id === notificationId)
    if (!notif || notif.isRead) return

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
      )
      setUnreadCount((prev) => prev + 1)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className={`relative h-9 w-9 ${
          dark
            ? 'text-white/70 hover:text-white hover:bg-white/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border bg-popover text-popover-foreground shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Notification list */}
          <ScrollArea className="max-h-96">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                      !notif.isRead ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold' : 'font-normal'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="shrink-0 h-2 w-2 rounded-full bg-pink-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}