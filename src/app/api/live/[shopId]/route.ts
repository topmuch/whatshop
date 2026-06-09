import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// GET /api/live/[shopId] - Get live session for a shop (public read)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params

    const liveSession = await db.liveSession.findUnique({
      where: { shopId },
      include: {
        promoCodes: {
          select: {
            id: true,
            code: true,
            discountPercent: true,
            isActive: true,
            usedCount: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        leads: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true,
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
      startedAt: liveSession.startedAt,
      endedAt: liveSession.endedAt,
      promoCodes: liveSession.promoCodes,
      leads: liveSession.leads,
    })
  } catch (error) {
    console.error('Error fetching seller live session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/live/[shopId] - Create or update live session (toggle live, set pinned product, etc.)
// SECURITY: Requires shop owner authentication
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    // SECURITY: Verify the requester owns this shop
    const { user, response: authError } = await requireShopOwner(request, shopId)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { isActive, durationMinutes, pinnedProductId, promoCode } = body

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Upsert the live session
    const liveSession = await db.liveSession.upsert({
      where: { shopId },
      create: {
        shopId,
        isActive: isActive ?? true,
        endTime: durationMinutes
          ? new Date(Date.now() + durationMinutes * 60 * 1000)
          : null,
        pinnedProductId: pinnedProductId || null,
        startedAt: new Date(),
      },
      update: {
        isActive: isActive ?? true,
        ...(isActive === true
          ? { startedAt: new Date(), endedAt: null }
          : {}),
        ...(isActive === false ? { endedAt: new Date() } : {}),
        endTime: durationMinutes
          ? new Date(Date.now() + durationMinutes * 60 * 1000)
          : undefined,
        pinnedProductId: pinnedProductId !== undefined ? pinnedProductId : undefined,
      },
    })

    // Create promo code if provided
    if (promoCode && promoCode.code && promoCode.discountPercent) {
      await db.livePromoCode.create({
        data: {
          sessionId: liveSession.id,
          code: promoCode.code,
          discountPercent: promoCode.discountPercent,
        },
      })
    }

    // Fetch the updated session with relations
    const updatedSession = await db.liveSession.findUnique({
      where: { shopId },
      include: {
        promoCodes: {
          select: {
            id: true,
            code: true,
            discountPercent: true,
            isActive: true,
            usedCount: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error('Live session create/update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/live/[shopId] - Update live session (extend time, etc.)
// SECURITY: Requires shop owner authentication
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    // SECURITY: Verify the requester owns this shop
    const { user, response: authError } = await requireShopOwner(request, shopId)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { isActive, durationMinutes, pinnedProductId, whatsappClicks } = body

    const liveSession = await db.liveSession.findUnique({
      where: { shopId },
    })

    if (!liveSession) {
      return NextResponse.json({ error: 'Session live introuvable' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (isActive !== undefined) {
      updateData.isActive = isActive
      if (isActive === true) {
        updateData.startedAt = new Date()
        updateData.endedAt = null
      } else {
        updateData.endedAt = new Date()
      }
    }

    if (durationMinutes !== undefined && durationMinutes > 0) {
      updateData.endTime = new Date(Date.now() + durationMinutes * 60 * 1000)
    }

    if (pinnedProductId !== undefined) {
      updateData.pinnedProductId = pinnedProductId || null
    }

    if (whatsappClicks !== undefined) {
      updateData.whatsappClicks = whatsappClicks
    }

    const updatedSession = await db.liveSession.update({
      where: { shopId },
      data: updateData,
      include: {
        promoCodes: {
          select: {
            id: true,
            code: true,
            discountPercent: true,
            isActive: true,
            usedCount: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error('Live session update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
