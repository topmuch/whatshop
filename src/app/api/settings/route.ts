import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/settings — Update seller shop settings (SEO, appearance)
export async function PUT(request: NextRequest) {
  try {
    // Read user email from cookie
    const userEmail = request.cookies.get('whatsshop-user')?.value

    if (!userEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Find user with their shop
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { shop: true },
    })

    if (!user || !user.shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { seoTitle, seoDescription, coverImageUrl, logo, banner } = body

    // Build update data with only provided fields
    const data: Record<string, unknown> = {}
    if (seoTitle !== undefined) data.seoTitle = seoTitle || null
    if (seoDescription !== undefined) data.seoDescription = seoDescription || null
    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl || null
    if (logo !== undefined) data.logo = logo || null
    if (banner !== undefined) data.banner = banner || null

    const updatedShop = await db.shop.update({
      where: { id: user.shop.id },
      data,
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
