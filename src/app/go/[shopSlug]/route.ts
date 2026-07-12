/**
 * Smart Link: /go/[shopSlug]
 *
 * Redirects to the shop's currently featured product.
 * Falls back to the shop page if no featured product exists.
 * Used as a "link in bio" for social media profiles.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  try {
    const { shopSlug } = await params

    const shop = await db.shop.findUnique({
      where: { slug: shopSlug },
      select: { id: true, slug: true, isActive: true },
    })

    if (!shop || !shop.isActive) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 1. Try featured product
    const featuredProduct = await db.product.findFirst({
      where: { shopId: shop.id, isFeatured: true, isAvailable: true },
      select: { id: true, slug: true },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

    if (featuredProduct) {
      return NextResponse.redirect(
        `${baseUrl}/boutique/${shop.slug}/p/${featuredProduct.slug || featuredProduct.id}`,
        301
      )
    }

    // 2. Try live session pinned product
    const liveSession = await db.liveSession.findUnique({
      where: { shopId: shop.id },
      select: { isActive: true, pinnedProductId: true },
    })

    if (liveSession?.isActive && liveSession.pinnedProductId) {
      const pinned = await db.product.findUnique({
        where: { id: liveSession.pinnedProductId },
        select: { id: true, slug: true },
      })
      if (pinned) {
        return NextResponse.redirect(
          `${baseUrl}/boutique/${shop.slug}/p/${pinned.slug || pinned.id}`,
          301
        )
      }
    }

    // 3. Fallback to shop page
    return NextResponse.redirect(`${baseUrl}/boutique/${shop.slug}`, 301)
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}