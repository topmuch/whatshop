import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

// PATCH /api/admin/users/[id] — Suspend or unsuspend a user
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

    if (!action || (action !== 'suspend' && action !== 'unsuspend')) {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez "suspend" ou "unsuspend".' },
        { status: 400 }
      )
    }

    const target = await db.user.findUnique({ where: { id } })

    if (!target) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Cannot suspend yourself
    if (target.id === admin.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous suspendre vous-même' },
        { status: 400 }
      )
    }

    // Only SUPER_ADMIN can suspend other SUPER_ADMIN users
    if (target.role === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Seul un SUPER_ADMIN peut suspendre un autre SUPER_ADMIN' },
        { status: 403 }
      )
    }

    let updated
    if (action === 'suspend') {
      updated = await db.user.update({
        where: { id },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspendedReason: reason || null,
        },
      })
    } else {
      // unsuspend
      updated = await db.user.update({
        where: { id },
        data: {
          isSuspended: false,
          suspendedAt: null,
          suspendedReason: null,
        },
      })
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isSuspended: updated.isSuspended,
      suspendedAt: updated.suspendedAt?.toISOString() ?? null,
      suspendedReason: updated.suspendedReason,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Admin user PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — Delete a user (cascade deletes all their data)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    // Only SUPER_ADMIN can delete users
    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Seul un SUPER_ADMIN peut supprimer des utilisateurs' },
        { status: 403 }
      )
    }

    const { id } = await params

    const target = await db.user.findUnique({ where: { id } })

    if (!target) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Cannot delete yourself
    if (target.id === admin.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Cannot delete other SUPER_ADMIN users
    if (target.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un SUPER_ADMIN' },
        { status: 403 }
      )
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}