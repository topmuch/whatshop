import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

// PATCH /api/admin/shops/[id] - Toggle active or change plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { id } = await params
    const body = await request.json()
    const { isActive, plan } = body

    const shop = await db.shop.findUnique({ where: { id } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const updated = await db.shop.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(plan ? { plan } : {}),
      },
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      isActive: updated.isActive,
      plan: updated.plan,
    })
  } catch (error) {
    console.error('Admin shop update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/shops/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { id } = await params

    const shop = await db.shop.findUnique({ where: { id } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    await db.shop.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin shop delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
