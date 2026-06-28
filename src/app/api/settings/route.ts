import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireShopOwner } from '@/lib/auth'
import { cacheInvalidate } from '@/lib/cache'

// GET /api/settings — Get seller shop settings (SEO, appearance)
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const shop = await db.shop.findUnique({
      where: { id: user.shop.id },
      select: {
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogImage: true,
        coverImageUrl: true,
        notificationPreferences: true,
        notificationEmail: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/settings — Update seller shop settings (SEO, appearance)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { seoTitle, seoDescription, seoKeywords, ogImage, coverImageUrl, logo, banner, notificationPreferences, notificationEmail } = body

    // Build update data with only provided fields
    const data: Record<string, unknown> = {}
    if (seoTitle !== undefined) data.seoTitle = seoTitle || null
    if (seoDescription !== undefined) data.seoDescription = seoDescription || null
    if (seoKeywords !== undefined) data.seoKeywords = seoKeywords || null
    if (ogImage !== undefined) data.ogImage = ogImage || null
    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl || null
    if (logo !== undefined) data.logo = logo || null
    if (banner !== undefined) data.banner = banner || null
    if (notificationPreferences !== undefined) data.notificationPreferences = notificationPreferences || '{}'
    if (notificationEmail !== undefined) data.notificationEmail = notificationEmail || null

    const updatedShop = await db.shop.update({
      where: { id: user.shop.id },
      data,
      select: {
        id: true, name: true, slug: true, seoTitle: true, seoDescription: true,
        seoKeywords: true, ogImage: true, coverImageUrl: true, logo: true, banner: true,
        notificationPreferences: true, notificationEmail: true,
      },
    })

    // Invalidate cached shop data
    cacheInvalidate(`shop-detail:${user.shop.slug}`)

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}