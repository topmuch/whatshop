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
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

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
