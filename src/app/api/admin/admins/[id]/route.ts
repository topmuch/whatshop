import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

// DELETE /api/admin/admins/[id] — remove an admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

  try {
    const { id } = await params

    // Find the target user
    const target = await db.user.findUnique({
      where: { id },
    })

    if (!target) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (target.role !== 'ADMIN' && target.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cet utilisateur n\'est pas un admin' }, { status: 400 })
    }

    // Cannot delete yourself
    if (target.id === admin.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
    }

    // Only SUPER_ADMIN can delete SUPER_ADMIN
    if (target.role === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Seul un SUPER_ADMIN peut supprimer un SUPER_ADMIN' }, { status: 403 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin admins DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
