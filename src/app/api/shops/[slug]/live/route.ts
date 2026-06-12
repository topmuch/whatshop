import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limiting: 30 req/min
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.shopLive)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const liveSession = await db.liveSession.findUnique({
      where: { shopId: shop.id },
      include: {
        promoCodes: {
          select: {
            id: true,
            code: true,
            discountPercent: true,
            isActive: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!liveSession) {
      return NextResponse.json({ isActive: false })
    }

    return NextResponse.json({
      id: liveSession.id,
      isActive: liveSession.isActive,
      endTime: liveSession.endTime,
      pinnedProductId: liveSession.pinnedProductId,
      whatsappClicks: liveSession.whatsappClicks,
      promoCodes: liveSession.promoCodes,
    })
  } catch (error) {
    console.error('Error fetching live session:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
