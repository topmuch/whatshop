import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/settings/domain — Submit a custom domain request
export async function POST(request: NextRequest) {
  try {
    // Read user email from cookie
    const userEmail = request.cookies.get('whatsshop-user')?.value

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
    const { domain } = body

    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return NextResponse.json({ error: 'Nom de domaine requis' }, { status: 400 })
    }

    const trimmedDomain = domain.trim().toLowerCase()

    // Check if domain is already taken by another shop
    const existingDomain = await db.domainRequest.findUnique({
      where: { domain: trimmedDomain },
    })
    if (existingDomain && existingDomain.shopId !== user.shops[0].id) {
      return NextResponse.json({ error: 'Ce domaine est déjà pris' }, { status: 409 })
    }

    // Upsert domain request for this shop
    await db.domainRequest.upsert({
      where: { shopId: user.shops[0].id },
      create: {
        shopId: user.shops[0].id,
        domain: trimmedDomain,
        status: 'PENDING',
      },
      update: {
        domain: trimmedDomain,
        status: 'PENDING',
        rejectionReason: null,
        reviewedAt: null,
        reviewerId: null,
      },
    })

    // Update shop with pending domain status
    await db.shop.update({
      where: { id: user.shops[0].id },
      data: {
        customDomain: trimmedDomain,
        customDomainStatus: 'PENDING',
        customDomainRejectionReason: null,
      },
    })

    return NextResponse.json({ success: true, domain: trimmedDomain, status: 'PENDING' })
  } catch (error) {
    console.error('Domain POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
