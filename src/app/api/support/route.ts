import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/support — Create a support ticket
export async function POST(request: NextRequest) {
  try {
    // Read user email from cookie
    const userEmail = request.cookies.get('whatsshop-user')?.value

    if (!userEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Find user with their shop
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { shop: true },
    })

    if (!user || !user.shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    const ticket = await db.supportTicket.create({
      data: {
        shopId: user.shop.id,
        message: message.trim(),
        status: 'OPEN',
      },
    })

    return NextResponse.json({ success: true, ticket }, { status: 201 })
  } catch (error) {
    console.error('Support POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
