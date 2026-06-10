import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

/**
 * GET /api/setup
 *
 * First-time setup endpoint — creates a SUPER_ADMIN if none exists.
 * Designed for Coolify / fresh deployments where the DB is empty.
 *
 * Configurable via environment variables:
 *   SUPER_ADMIN_EMAIL    (default: admin@boutiko.com)
 *   SUPER_ADMIN_PASSWORD (default: Admin123!)
 *   SUPER_ADMIN_NAME     (default: Super Admin)
 *
 * Security: this endpoint only works when ZERO SUPER_ADMIN users exist.
 * Once a superadmin is created, it becomes a no-op.
 */
export async function GET() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@boutiko.com'
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!'
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin'

    // Check if a SUPER_ADMIN already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    })

    if (existingSuperAdmin) {
      return NextResponse.json({
        ok: true,
        message: 'Un SUPER_ADMIN existe déjà. Aucune action nécessaire.',
        email: existingSuperAdmin.email,
        role: existingSuperAdmin.role,
      })
    }

    // Check if email is already taken by another role
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      // Upgrade existing user to SUPER_ADMIN
      await db.user.update({
        where: { id: existingUser.id },
        data: { role: 'SUPER_ADMIN' },
      })
      return NextResponse.json({
        ok: true,
        message: `Utilisateur ${email} promu en SUPER_ADMIN.`,
        email,
        role: 'SUPER_ADMIN',
      })
    }

    // Create new SUPER_ADMIN
    if (password.length < 6) {
      return NextResponse.json({
        ok: false,
        error: 'SUPER_ADMIN_PASSWORD doit contenir au moins 6 caractères.',
      }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const admin = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN',
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    console.log('[SETUP] SUPER_ADMIN created:', admin.email)

    return NextResponse.json({
      ok: true,
      message: 'SUPER_ADMIN créé avec succès !',
      credentials: { email, password },
      admin,
    })
  } catch (error) {
    console.error('[SETUP] Error:', error)
    return NextResponse.json({
      ok: false,
      error: 'Erreur serveur lors du setup.',
    }, { status: 500 })
  }
}