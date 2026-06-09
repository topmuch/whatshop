import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const tickets = await db.supportTicket.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      tickets: tickets.map(t => ({
        id: t.id,
        message: t.message,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        shop: {
          id: t.shop.id,
          name: t.shop.name,
          slug: t.shop.slug,
          owner: {
            id: t.shop.owner.id,
            name: t.shop.owner.name,
            email: t.shop.owner.email,
          },
        },
      })),
    })
  } catch (error) {
    console.error('Admin support tickets error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { ticketId, status } = body

    if (!ticketId || !status) {
      return NextResponse.json({ error: 'ticketId et status requis' }, { status: 400 })
    }

    if (!['OPEN', 'RESOLVED'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide. Valeurs acceptées: OPEN, RESOLVED' }, { status: 400 })
    }

    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
    }

    const updated = await db.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    })

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Admin support ticket update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
