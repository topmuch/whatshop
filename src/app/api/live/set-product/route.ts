import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/live/set-product
 * Set (or clear) the live product for the authenticated user's shop.
 * Validates that the product exists, belongs to the shop, and is available.
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
    const { productId } = body

    // Allow null/undefined to clear the live product
    const liveProductId = productId || null

    // If setting a product, verify it exists and belongs to this shop
    if (liveProductId) {
      const product = await db.product.findFirst({
        where: { id: liveProductId, shopId: shop.id, isAvailable: true },
        select: { id: true, name: true },
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Produit introuvable ou indisponible' },
          { status: 404 },
        )
      }
    }

    const updated = await db.shop.update({
      where: { id: shop.id },
      data: { liveProductId },
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
    console.error('Live set-product error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}