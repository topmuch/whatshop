import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { Prisma } from '@prisma/client'

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
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceUpdate = searchParams.get('force') === '1'

    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@boutiko.pro'
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!'
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin'

    if (password.length < 6) {
      return NextResponse.json({
        ok: false,
        error: 'SUPER_ADMIN_PASSWORD doit contenir au moins 6 caractères.',
      }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

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
        hint: "Utilisez ?force=1 pour mettre à jour les identifiants depuis les variables d'environnement.",
      })
    }

    if (existingSuperAdmin && forceUpdate) {
      // Check if another user already has the target email
      const userWithNewEmail = await db.user.findUnique({ where: { email } })

      if (userWithNewEmail && userWithNewEmail.id !== existingSuperAdmin.id) {
        // Delete the user that occupies the target email, then update the SUPER_ADMIN
        await db.user.delete({ where: { id: userWithNewEmail.id } })
      }

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
        message: 'SUPER_ADMIN mis à jour avec succès !',
        email,
        role: 'SUPER_ADMIN',
      })
    }

    // No SUPER_ADMIN exists — check if email is already taken
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

    // Return the real error in dev for debugging
    const message = process.env.NODE_ENV === 'development'
      ? String(error)
      : 'Erreur serveur lors du setup.'

    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}