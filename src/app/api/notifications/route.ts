import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'

// GET /api/notifications — fetch notifications for the authenticated user
export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request)
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          metadata: true,
          createdAt: true,
        },
      }),
      db.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    logger.error('Failed to fetch notifications', 'NotificationsAPI', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/notifications — mark a notification as read
export async function PATCH(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request)
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId requis' }, { status: 400 })
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 })
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to mark notification as read', 'NotificationsAPI', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}