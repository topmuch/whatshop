import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

const FB_APP_ID = process.env.FACEBOOK_APP_ID || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

/**
 * Initiate Facebook OAuth flow.
 * GET /api/facebook/oauth
 *
 * Redirects the seller to Facebook's OAuth consent screen.
 * After approval, Facebook redirects to /api/facebook/oauth/callback.
 */
export async function GET(request: NextRequest) {
  const { user, response: authErr } = await requireAuth(request)
  if (!user) return authErr
  if (!user.shop?.id) return NextResponse.json({ error: 'Boutique requise' }, { status: 400 })
  if (!FB_APP_ID) {
    return NextResponse.json({
      error: "L'intégration Facebook n'est pas encore configurée sur cette plateforme. L'administrateur doit créer une application Facebook (developers.facebook.com) et définir les variables d'environnement FACEBOOK_APP_ID et FACEBOOK_APP_SECRET.",
      code: 'FB_NOT_CONFIGURED',
    }, { status: 503 })
  }

  const redirectUri = `${BASE_URL}/api/facebook/oauth/callback`
  const params = new URLSearchParams({
    client_id: FB_APP_ID,
    redirect_uri: redirectUri,
    scope: 'pages_manage_metadata,pages_read_engagement,business_management',
    state: user.shop.id,
  })

  return NextResponse.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`)
}