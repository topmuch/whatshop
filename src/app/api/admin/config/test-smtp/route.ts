import { NextResponse } from 'next/server'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { testSmtpConnection, invalidateEmailCache } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin(request as any)
    if (!admin) return adminUnauthorized()

    // Clear cache to pick up latest DB config
    invalidateEmailCache()

    const result = await testSmtpConnection()
    return NextResponse.json(result)
  } catch (error) {
    console.error('SMTP test error:', error)
    return NextResponse.json(
      { success: false, message: `Erreur serveur: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    )
  }
}