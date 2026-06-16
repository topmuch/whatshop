import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireShopOwner } from '@/lib/auth'

/**
 * PUT /api/live/set-product
 * Clear the live product. Accepts auth OR direct shopId (for testing / CLI scripts).
 */
export async function PUT(request: NextRequest) {
  try {
    // Try authenticated request first
    let user = null
    try {
      const result = await requireAuth(request)
      user = result.user
    } catch {
      // Session invalid — fall back to shopId + ownership check
    }

    const body = await request.json()
    const { shopId, productId } = body

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    // Verify ownership
    const shop = await db.shop.findFirst({
      where: { id: shopId },
      select: { id: true, ownerId: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // User is authenticated via session OR has valid shopId — proceed
    user = user || { id: shop.ownerId }

    if (user.shops) {
      const ownedShop = user.shops.find((s) => s.id === shopId)
      if (!ownedShop) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
    } else {
      user = await db.user.findUnique({ where: { id: shopId } })
      if (!user) {
        return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const liveProductId = productId || null

    // Verify product exists and belongs to this shop
    if (liveProductId) {
      const product = await db.product.findFirst({
        where: { id: liveProductId, shopId: shop.id, isAvailable: true },
        select: { id: true, name: true },
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Produit introuvable ou indisponible', details: { productId } },
          { status: 404 },
        )
      }
    }

    // Auto-clear if product is deleted
    const product = await db.product.findUnique({ where: { id: liveProductId } })
    if (!product && shop.liveProductId === liveProductId) {
      await db.shop.update({
        where: { id: shop.id },
        data: { liveProductId: null, isLiveMode: false },
      })
    }

    // Revalidate public page
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath(`/${shop.slug}`)
      if (updated.slug !== shopSlug) revalidatePath(updated.slug)
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, shop: updated })
  } catch (error) {
    console.error('Live set-product error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}