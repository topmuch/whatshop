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
    const { isActive, discountPercent, maxUses, expiresAt } = body

    const promoCode = await db.promoCode.findUnique({ where: { id } })
    if (!promoCode) {
      return NextResponse.json({ error: 'Code promo introuvable' }, { status: 404 })
    }

    const updated = await db.promoCode.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(discountPercent !== undefined ? { discountPercent } : {}),
        ...(maxUses !== undefined ? { maxUses } : {}),
        ...(expiresAt !== undefined
          ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
          : {}),
      },
    })

    return NextResponse.json({
      id: updated.id,
      code: updated.code,
      discountPercent: updated.discountPercent,
      maxUses: updated.maxUses,
      currentUses: updated.currentUses,
      expiresAt: updated.expiresAt?.toISOString() ?? null,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Admin promo code update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
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

    const promoCode = await db.promoCode.findUnique({ where: { id } })
    if (!promoCode) {
      return NextResponse.json({ error: 'Code promo introuvable' }, { status: 404 })
    }

    await db.promoCode.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin promo code delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
