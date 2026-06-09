import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const domainRequests = await db.domainRequest.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            customDomain: true,
            customDomainStatus: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      domains: domainRequests.map(dr => ({
        id: dr.id,
        shopId: dr.shopId,
        domain: dr.domain,
        status: dr.status,
        rejectionReason: dr.rejectionReason,
        dnsInstructions: dr.dnsInstructions,
        reviewedAt: dr.reviewedAt?.toISOString() ?? null,
        createdAt: dr.createdAt.toISOString(),
        shop: {
          id: dr.shop.id,
          name: dr.shop.name,
          slug: dr.shop.slug,
          customDomain: dr.shop.customDomain,
          customDomainStatus: dr.shop.customDomainStatus,
          owner: dr.shop.owner,
        },
        reviewer: dr.reviewer
          ? { id: dr.reviewer.id, name: dr.reviewer.name, email: dr.reviewer.email }
          : null,
      })),
    })
  } catch (error) {
    console.error('Admin domains error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
