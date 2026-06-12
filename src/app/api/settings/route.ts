import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings — Get seller shop settings (SEO, appearance)
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('boutiko-user')?.value

    if (!userEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { shops: true },
    })

    if (!user || !user.shops?.[0]) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      seoTitle: user.shops[0].seoTitle,
      seoDescription: user.shops[0].seoDescription,
      seoKeywords: user.shops[0].seoKeywords,
      ogImage: user.shops[0].ogImage,
      coverImageUrl: user.shops[0].coverImageUrl,
      notificationPreferences: user.shops[0].notificationPreferences,
      notificationEmail: user.shops[0].notificationEmail,
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/settings — Update seller shop settings (SEO, appearance)
export async function PUT(request: NextRequest) {
  try {
    // Read user email from cookie
    const userEmail = request.cookies.get('boutiko-user')?.value

    if (!userEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Find user with their shop
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { shops: true },
    })

    if (!user || !user.shops?.[0]) {
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
      where: { id: user.shops[0].id },
      data,
      select: {
        id: true, name: true, slug: true, seoTitle: true, seoDescription: true,
        seoKeywords: true, ogImage: true, coverImageUrl: true, logo: true, banner: true,
        notificationPreferences: true, notificationEmail: true,
      },
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
