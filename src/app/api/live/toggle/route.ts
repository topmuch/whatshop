import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireShopOwner } from '@/lib/auth'

/**
 * POST /api/live/toggle
 * Toggle live mode. Accepts auth session OR direct shopId (for testing / CLI scripts).
 */
export async function POST(request: NextRequest) {
  try {
    // Try authenticated request first
    let user = null
    try {
      const result = await requireAuth(request)
      user = result.user
    } catch {
      // If not authenticated, try direct shopId with ownership check
      const body = await request.json()
      const { shopId, isActive } = body

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
    } catch {
    // Session invalid — fall back to shopId + ownership check
  }

    if (user) {
      // Authenticated path: use user.shops for multi-shop
      const ownedShop = user.shops.find((s) => s.id === shopId)
      if (!ownedShop) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
    } else {
      // No session and no valid shopId: check ownership directly
      user = await db.user.findUnique({ where: { id: shopId } })
      if (!user) {
        return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
      }
    }

    const data: Record<string, unknown> = {}
    if (isActive !== undefined) data.isActive = isActive
    if (isActive === true && !user) data.isLiveMode = true

    const updated = await db.shop.update({
      where: { id: shop.id },
      data,
      select: { id: true, name: true, slug: true, isLiveMode: true, liveProductId: data.liveProductId || null },
    })

    // Revalidate public page
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath(`/${updated.slug}`)
      if (updated.slug !== shopSlug) revalidatePath(updated.slug)
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, shop: updated })
  } catch (error) {
    console.error('Live toggle error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}