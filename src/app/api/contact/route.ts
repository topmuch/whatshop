import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/contact — Save a contact message and optionally notify via WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, name, email, phone, message } = body

    // Validation
    if (!shopId || !name || !email || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    if (typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message trop court (min 5 caractères)' }, { status: 400 })
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true, whatsapp: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
    }

    // Save the contact message
    await db.contactMessage.create({
      data: {
        shopId,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
      },
    })

    // Track analytics: increment shop counter
    await db.shop.update({
      where: { id: shopId },
      data: { contactFormSubmits: { increment: 1 } },
    })

    // Track analytics: create event
    await db.analyticsEvent.create({
      data: {
        shopId,
        eventType: 'form_submit',
        metadata: null,
        userAgent: request.headers.get('user-agent') || null,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    })
  } catch (error) {
    console.error('Erreur contact:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// GET /api/contact?shopId=xxx — List contact messages for a shop (auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    const messages = await db.contactMessage.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Erreur récupération messages:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}