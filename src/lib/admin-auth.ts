import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

/**
 * Verify that the requesting user is an ADMIN or SUPER_ADMIN.
 * Uses the iron-session to get the userId, looks up the user in the DB,
 * and checks that user.role is ADMIN or SUPER_ADMIN.
 * Returns the user object on success, or null on failure.
 */
export async function verifyAdmin(_request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) return null

    // Re-fetch from DB to get fresh role (god-mode changes the session user)
    const freshUser = await db.user.findUnique({
      where: { id: user.godModeOriginalUserId || user.id },
    })

    if (!freshUser || (freshUser.role !== 'ADMIN' && freshUser.role !== 'SUPER_ADMIN')) {
      return null
    }

    return freshUser
  } catch (error) {
    console.error('verifyAdmin failed:', error)
    return null
  }
}

/**
 * Helper that returns a 403 response for unauthorized admin access.
 */
export function adminUnauthorized() {
  return NextResponse.json(
    { error: 'Accès non autorisé. Rôle administrateur requis.' },
    { status: 403 }
  )
}