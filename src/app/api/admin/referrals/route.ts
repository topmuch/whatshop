import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    // Find all shops that were referred by another shop
    const referrals = await db.shop.findMany({
      where: {
        referredById: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        referee: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json({
      referrals: referrals.map(r => ({
        referredShop: {
          name: r.name,
          slug: r.slug,
        },
        referrerShop: {
          name: r.referee!.name,
          slug: r.referee!.slug,
        },
        referredDate: r.createdAt.toISOString(),
        rewardStatus: r.plan === 'FREE' ? 'PENDING' : 'CLAIMED',
      })),
    })
  } catch (error) {
    console.error('Admin referrals error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
