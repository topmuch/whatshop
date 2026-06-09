import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    const broadcasts = await db.broadcastMessage.findMany({
      where: {
        ...(all ? {} : { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      broadcasts: broadcasts.map(b => ({
        id: b.id,
        message: b.message,
        isActive: b.isActive,
        createdAt: b.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin broadcast error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Le message est requis' }, { status: 400 })
    }

    // Deactivate all previous active broadcasts
    await db.broadcastMessage.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create the new active broadcast
    const broadcast = await db.broadcastMessage.create({
      data: { message: message.trim() },
    })

    return NextResponse.json({
      broadcast: {
        id: broadcast.id,
        message: broadcast.message,
        isActive: broadcast.isActive,
        createdAt: broadcast.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin broadcast create error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { id, isActive } = body

    if (!id || isActive === undefined) {
      return NextResponse.json({ error: 'id et isActive requis' }, { status: 400 })
    }

    const broadcast = await db.broadcastMessage.findUnique({ where: { id } })
    if (!broadcast) {
      return NextResponse.json({ error: 'Diffusion introuvable' }, { status: 404 })
    }

    // If activating this broadcast, deactivate all others first
    if (isActive) {
      await db.broadcastMessage.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const updated = await db.broadcastMessage.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({
      id: updated.id,
      message: updated.message,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Admin broadcast update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const broadcast = await db.broadcastMessage.findUnique({ where: { id } })
    if (!broadcast) {
      return NextResponse.json({ error: 'Diffusion introuvable' }, { status: 404 })
    }

    await db.broadcastMessage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin broadcast delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
