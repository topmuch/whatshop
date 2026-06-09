import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, reason } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide. Utilisez: approve, reject' }, { status: 400 })
    }

    const domainRequest = await db.domainRequest.findUnique({
      where: { id },
      include: { shop: true },
    })
    if (!domainRequest) {
      return NextResponse.json({ error: 'Demande de domaine introuvable' }, { status: 404 })
    }

    if (domainRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 409 })
    }

    if (action === 'approve') {
      await db.$transaction([
        db.domainRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            rejectionReason: null,
            reviewedAt: new Date(),
            reviewerId: admin.id,
          },
        }),
        db.shop.update({
          where: { id: domainRequest.shopId },
          data: {
            customDomain: domainRequest.domain,
            customDomainStatus: 'APPROVED',
            customDomainRejectionReason: null,
          },
        }),
      ])

      const updated = await db.domainRequest.findUnique({
        where: { id },
        include: {
          shop: { select: { id: true, name: true, customDomain: true, customDomainStatus: true } },
        },
      })

      return NextResponse.json({
        id: updated!.id,
        domain: updated!.domain,
        status: updated!.status,
        rejectionReason: updated!.rejectionReason,
        reviewedAt: updated!.reviewedAt?.toISOString() ?? null,
        shop: updated!.shop,
      })
    }

    // reject
    await db.$transaction([
      db.domainRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || 'Demande rejetée',
          reviewedAt: new Date(),
          reviewerId: admin.id,
        },
      }),
      db.shop.update({
        where: { id: domainRequest.shopId },
        data: {
          customDomainStatus: 'REJECTED',
          customDomainRejectionReason: reason || 'Demande rejetée',
        },
      }),
    ])

    const updated = await db.domainRequest.findUnique({
      where: { id },
      include: {
        shop: { select: { id: true, name: true, customDomain: true, customDomainStatus: true } },
      },
    })

    return NextResponse.json({
      id: updated!.id,
      domain: updated!.domain,
      status: updated!.status,
      rejectionReason: updated!.rejectionReason,
      reviewedAt: updated!.reviewedAt?.toISOString() ?? null,
      shop: updated!.shop,
    })
  } catch (error) {
    console.error('Admin domain review error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
