import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { phone, name } = await request.json()

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Find or create the live session for the shop
    const liveSession = await db.liveSession.findUnique({
      where: { shopId: shop.id },
    })

    if (!liveSession) {
      return NextResponse.json({ error: 'Aucune session live active' }, { status: 404 })
    }

    const lead = await db.lead.create({
      data: {
        sessionId: liveSession.id,
        phone: phone.trim(),
        name: name?.trim() || null,
      },
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        phone: lead.phone,
        name: lead.name,
      },
    })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
