import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { encryptToken } from '@/lib/facebook-capi'

const FB_GRAPH = 'https://graph.facebook.com/v18.0'
const FB_APP_ID = process.env.FACEBOOK_APP_ID || ''
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

/**
 * Facebook OAuth callback.
 * GET /api/facebook/oauth/callback?code=...&state=shopId
 *
 * 1. Exchange code → short-lived token
 * 2. Exchange short → long-lived token
 * 3. Fetch Facebook Pages
 * 4. Save page info + encrypted token to Shop
 * 5. Redirect back to dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const shopId = searchParams.get('state')

    if (!code || !shopId) {
      return NextResponse.redirect(`${BASE_URL}/dashboard?fb_error=no_code`)
    }

    // 1. Exchange code for short-lived token
    const redirectUri = `${BASE_URL}/api/facebook/oauth/callback`
    const tokenRes = await fetch(
      `${FB_GRAPH}/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&redirect_uri=${redirectUri}&code=${code}`,
    )
    const tokenData = await tokenRes.json() as { access_token?: string; error?: { message: string } }

    if (!tokenData.access_token) {
      console.error('[FB OAuth] Token exchange failed:', tokenData.error)
      return NextResponse.redirect(`${BASE_URL}/dashboard?fb_error=token_exchange`)
    }

    // 2. Exchange for long-lived token (60 days)
    const llRes = await fetch(
      `${FB_GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`,
    )
    const llData = await llRes.json() as { access_token?: string }
    const longToken = llData.access_token || tokenData.access_token

    // 3. Fetch user's Facebook Pages
    const pagesRes = await fetch(`${FB_GRAPH}/me/accounts?access_token=${longToken}`)
    const pagesData = await pagesRes.json() as { data?: Array<{ id: string; name: string; access_token?: string }> }
    const page = pagesData.data?.[0]

    if (!page) {
      console.error('[FB OAuth] No pages found for user')
      return NextResponse.redirect(`${BASE_URL}/dashboard?fb_error=no_page`)
    }

    // 4. Save to DB — encrypt the page token before storage
    const pageToken = page.access_token || longToken
    await db.shop.update({
      where: { id: shopId },
      data: {
        facebookConnected: true,
        facebookPageId: page.id,
        facebookPageName: page.name,
        facebookAccessToken: encryptToken(pageToken),
      },
    })

    // 5. Redirect to dashboard with success flag
    return NextResponse.redirect(`${BASE_URL}/dashboard?fb_success=1&fb_page=${encodeURIComponent(page.name)}`)
  } catch (error) {
    console.error('[FB OAuth] Callback error:', error)
    return NextResponse.redirect(`${BASE_URL}/dashboard?fb_error=unknown`)
  }
}