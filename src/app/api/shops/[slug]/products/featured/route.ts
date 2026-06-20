import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Look up the shop by slug to get the shopId
    const shop = await db.shop.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }
    const shopId = shop.id
    const { user, response: authError } = await requireShopOwner(request, shopId)
    if (authError) return authError

    const body = await request.json()
    const { productId, isFeatured } = body as { productId: string; isFeatured: boolean }

    if (!productId || typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'productId et isFeatured requis' }, { status: 400 })
    }

    // Verify product belongs to this shop
    const product = await db.product.findFirst({
      where: { id: productId, shopId },
      select: { id: true, name: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    // If setting as featured, un-feature all other products in this shop first
    if (isFeatured) {
      await db.product.updateMany({
        where: { shopId, isFeatured: true },
        data: { isFeatured: false },
      })
    }

    await db.product.update({
      where: { id: productId },
      data: { isFeatured },
    })

    return NextResponse.json({ success: true, productName: product.name, isFeatured })
  } catch (error) {
    console.error('Toggle featured product error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}