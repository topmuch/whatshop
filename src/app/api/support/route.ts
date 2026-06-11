import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

// POST /api/support — Create a support ticket
export async function POST(request: NextRequest) {
  try {
    // Read user email from cookie
    const userEmail = request.cookies.get('boutiko-user')?.value

    if (!userEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Find user with their shop
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { shops: true },
    })

    if (!user || !user.shops?.[0]) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    const ticket = await db.supportTicket.create({
      data: {
        shopId: user.shops[0].id,
        message: message.trim(),
        status: 'OPEN',
      },
    })

    // Fire-and-forget notification (don't block the response)
    try {
      await createNotification(
        'SUPPORT_TICKET',
        'Nouveau ticket support',
        `Nouveau ticket de la boutique "${user.shops[0].name}".`,
        { ticketId: ticket.id, shopId: user.shops[0].id, shopName: user.shops[0].name }
      )
    } catch (_notifyError) {
      // Notification failure must not break ticket creation
    }

    return NextResponse.json({ success: true, ticket }, { status: 201 })
  } catch (error) {
    console.error('Support POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
