import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

/**
 * GET /api/setup
 *
 * Setup endpoint — creates or updates SUPER_ADMIN from environment variables.
 * Designed for Coolify / fresh deployments.
 *
 * Configurable via environment variables:
 *   SUPER_ADMIN_EMAIL    (default: admin@boutiko.pro)
 *   SUPER_ADMIN_PASSWORD (default: Admin123!)
 *   SUPER_ADMIN_NAME     (default: Super Admin)
 *
 * Query parameter:
 *   ?force=1  — Force update email/password even if SUPER_ADMIN exists.
 *               Should be called once after changing env vars on an existing deployment.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceUpdate = searchParams.get('force') === '1'

    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@boutiko.pro'
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!'
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin'

    // Check if a SUPER_ADMIN already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    })

    if (existingSuperAdmin && !forceUpdate) {
      return NextResponse.json({
        ok: true,
        message: 'Un SUPER_ADMIN existe déjà. Aucune action nécessaire.',
        email: existingSuperAdmin.email,
        role: existingSuperAdmin.role,
        hint: 'Utilisez ?force=1 pour mettre à jour les identifiants depuis les variables d\'environnement.',
      })
    }

    if (password.length < 6) {
      return NextResponse.json({
        ok: false,
        error: 'SUPER_ADMIN_PASSWORD doit contenir au moins 6 caractères.',
      }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    if (existingSuperAdmin && forceUpdate) {
      // Update existing SUPER_ADMIN with new env vars
      await db.user.update({
        where: { id: existingSuperAdmin.id },
        data: {
          email,
          password: hashedPassword,
          name,
        },
      })
      console.log('[SETUP] SUPER_ADMIN updated:', email)

      return NextResponse.json({
        ok: true,
        message: `SUPER_ADMIN mis à jour avec succès !`,
        email,
        role: 'SUPER_ADMIN',
      })
    }

    // Check if email is already taken by another role
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      // Upgrade existing user to SUPER_ADMIN
      await db.user.update({
        where: { id: existingUser.id },
        data: { role: 'SUPER_ADMIN', password: hashedPassword },
      })
      console.log('[SETUP] User promoted to SUPER_ADMIN:', email)

      return NextResponse.json({
        ok: true,
        message: `Utilisateur ${email} promu en SUPER_ADMIN.`,
        email,
        role: 'SUPER_ADMIN',
      })
    }

    // Create new SUPER_ADMIN
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