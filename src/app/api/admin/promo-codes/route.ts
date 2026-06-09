import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      promoCodes: promoCodes.map(pc => ({
        id: pc.id,
        code: pc.code,
        discountPercent: pc.discountPercent,
        maxUses: pc.maxUses,
        currentUses: pc.currentUses,
        expiresAt: pc.expiresAt?.toISOString() ?? null,
        isActive: pc.isActive,
        createdAt: pc.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin promo codes error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { code, discountPercent, maxUses, expiresAt } = body

    if (!code || discountPercent === undefined || maxUses === undefined) {
      return NextResponse.json({ error: 'code, discountPercent et maxUses requis' }, { status: 400 })
    }

    const existing = await db.promoCode.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Un code promo avec ce nom existe déjà' }, { status: 409 })
    }

    const promoCode = await db.promoCode.create({
      data: {
        code,
        discountPercent,
        maxUses,
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
      },
    })

    return NextResponse.json({
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountPercent: promoCode.discountPercent,
        maxUses: promoCode.maxUses,
        currentUses: promoCode.currentUses,
        expiresAt: promoCode.expiresAt?.toISOString() ?? null,
        isActive: promoCode.isActive,
        createdAt: promoCode.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin promo code create error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
