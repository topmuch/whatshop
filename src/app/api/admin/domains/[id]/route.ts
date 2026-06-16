import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { dispatchDomainApprovedEmail, dispatchDomainRejectedEmail } from '@/lib/email-dispatch'
import { verifyDomainDns } from '@/lib/dns-verify'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

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
      // Verify DNS before approving
      const dnsResult = await verifyDomainDns(domainRequest.domain)
      if (!dnsResult.success) {
        return NextResponse.json({
          error: `Vérification DNS échouée : ${dnsResult.message}`,
          dnsResult,
        }, { status: 400 })
      }

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

      // Update DNS instructions with verification result
      await db.domainRequest.update({
        where: { id },
        data: { dnsInstructions: dnsResult.message },
      })

      // Fire-and-forget: email to seller
      try {
        const owner = await db.user.findUnique({ where: { id: domainRequest.shop.ownerId }, select: { name: true } })
        if (owner) {
          dispatchDomainApprovedEmail({
            shopOwnerName: owner.name,
            domain: domainRequest.domain,
            shopName: domainRequest.shop.name,
            dnsInstructions: domainRequest.dnsInstructions,
            ownerId: domainRequest.shop.ownerId,
          })
        }
      } catch { /* non-critical */ }

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

    // Fire-and-forget: email to seller
    try {
      const owner = await db.user.findUnique({ where: { id: domainRequest.shop.ownerId }, select: { name: true } })
      if (owner) {
        dispatchDomainRejectedEmail({
          shopOwnerName: owner.name,
          domain: domainRequest.domain,
          shopName: domainRequest.shop.name,
          reason: reason || 'Demande rejetée',
          ownerId: domainRequest.shop.ownerId,
        })
      }
    } catch { /* non-critical */ }

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
