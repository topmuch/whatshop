import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/live/toggle
 * Toggle live mode on/off for the authenticated user's shop.
 * Sets/clears isLiveMode + liveStartedAt on the Shop model.
 * Uses revalidatePath so the public page updates within seconds.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive (boolean) requis' }, { status: 400 })
    }

    // If deactivating, also clear the live product
    const data: Record<string, unknown> = {
      isLiveMode: isActive,
    }

    if (isActive) {
      data.liveStartedAt = new Date().toISOString()
    } else {
      data.liveProductId = null
      data.liveStartedAt = null
    }

    const updated = await db.shop.update({
      where: { id: shop.id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        isLiveMode: true,
        liveProductId: true,
        liveStartedAt: true,
      },
    })

    // Revalidate root page (SPA — LiveModeView polls the API every 10s)
    try {
      revalidatePath('/')
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, shop: updated })
  } catch (error) {
    console.error('Live toggle error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}