import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings/domain/status — Get current domain request status
export async function GET(request: NextRequest) {
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

    // Find domain request for this shop
    const domainRequest = await db.domainRequest.findUnique({
      where: { shopId: user.shops[0].id },
    })

    if (!domainRequest) {
      return NextResponse.json({
        domain: null,
        status: 'NONE',
        rejectionReason: null,
      })
    }

    return NextResponse.json({
      domain: domainRequest.domain,
      status: domainRequest.status,
      rejectionReason: domainRequest.rejectionReason,
      dnsInstructions: domainRequest.dnsInstructions,
      createdAt: domainRequest.createdAt,
      reviewedAt: domainRequest.reviewedAt,
    })
  } catch (error) {
    console.error('Domain status GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
