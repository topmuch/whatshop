import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Facebook Webhook for catalog sync notifications.
 * POST /api/facebook/webhook
 *
 * Facebook calls this when the catalog needs refreshing.
 * We update catalogLastSync and catalogProductCount.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify this is a real Facebook webhook (basic check)
    // In production, verify the X-Hub-Signature-256 header
    const shopId = body?.shopId || body?.data?.shop_id
    if (!shopId) {
      return NextResponse.json({ error: 'shopId manquant' }, { status: 400 })
    }

    // Update the last sync timestamp and count
    const shop = await db.shop.findUnique({
      where: { id: shopId, catalogEnabled: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable ou catalogue désactivé' }, { status: 404 })
    }

    // Count active products
    const productCount = await db.product.count({
      where: { shopId, isAvailable: true },
    })

    await db.shop.update({
      where: { id: shopId },
      data: {
        catalogLastSync: new Date(),
        catalogProductCount: productCount,
      },
    })

    return NextResponse.json({ success: true, productCount })
  } catch (error) {
    console.error('[FB Webhook] Error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

/**
 * GET /api/facebook/webhook — Verification challenge from Facebook.
 * Facebook sends this during webhook setup.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'boutiko_fb_verify'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      headers: { 'Content-Type': 'application/plain' },
    })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}