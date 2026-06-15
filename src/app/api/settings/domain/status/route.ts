import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// GET /api/settings/domain/status — Get current domain request status
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Find domain request for this shop
    const domainRequest = await db.domainRequest.findUnique({
      where: { shopId: user.shop.id },
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