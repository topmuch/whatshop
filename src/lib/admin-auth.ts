import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Verify that the requesting user is an ADMIN or SUPER_ADMIN.
 * Reads the `whatsshop-user` cookie, looks up the user in the DB,
 * and checks that user.role is ADMIN or SUPER_ADMIN.
 * Returns the user object on success, or null on failure.
 */
export async function verifyAdmin(request: NextRequest) {
  const userEmail = request.cookies.get('whatsshop-user')?.value

  if (!userEmail) {
    return null
  }

  const user = await db.user.findUnique({
    where: { email: userEmail },
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null
  }

  return user
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
