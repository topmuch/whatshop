import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

// POST /api/admin/notifications/read-all
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

  try {
    await db.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notifications read-all error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}