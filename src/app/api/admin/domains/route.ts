import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

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
