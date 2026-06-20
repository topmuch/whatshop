import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

interface GeneratePosterRequestBody {
  productId: string
}

/**
 * POST /api/marketing/generate-poster
 * Generates a 768x1344 promotional poster for a product using AI image generation.
 * Requires authentication — the product must belong to the authenticated user's shop.
 */
export async function POST(request: NextRequest) {
  try {
    // ─── Authentication ─────────────────────────────────────────────────
    const { user, response: authError } = await requireShopOwner(request)
    if (authError) return authError
    if (!user || !user.shop) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // ─── Rate limiting ───────────────────────────────────────────────────
    const ip = getClientIp(request)
    const rl = rateLimit(ip, RATE_LIMITS.ai)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429 }
      )
    }

    // ─── Parse body ──────────────────────────────────────────────────────
    const body: GeneratePosterRequestBody = await request.json()
    const { productId } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 })
    }

    // ─── Fetch product from DB ────────────────────────────────────────────
    const product = await db.product.findFirst({
      where: {
        id: productId,
        shopId: user.shop.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        oldPrice: true,
        image: true,
        shopId: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable ou non autorisé' }, { status: 404 })
    }

    // ─── Build the image generation prompt ───────────────────────────────
    const productName = product.name
    const price = product.price.toLocaleString('fr-FR')
    const oldPrice = product.oldPrice ? product.oldPrice.toLocaleString('fr-FR') : null

    let prompt = `Premium e-commerce promotional poster for live shopping. Vertical format 9:16 aspect ratio. White background with thin black border. Left side: black vertical bar with white text 'LIVE SHOWROOM'. Top: red 'EN DIRECT' badge. Below: '⚡ OFFRE FLASH STOCK LIMITÉ' badges in bold. Center: large product image of ${productName} with realistic soft shadow underneath. Below product: product name in huge bold black text "${productName}". Price "${price} FCFA" in large electric blue text.`

    if (oldPrice) {
      prompt += ` Old price "${oldPrice} FCFA" crossed out in gray text above the current price.`
    }

    prompt += ` Green WhatsApp button with text 'COMMANDER PAR WHATSAPP'. Bottom black bar: '🚚 LIVRAISON PARTOUT AU SÉNÉGAL 🇸🇳'. Style: Meta Ads quality, African e-commerce, ultra modern, bold typography, high conversion marketing design, perfectly balanced composition, vibrant colors, clean layout, professional product photography feel.`

    // ─── Generate image with z-ai-web-dev-sdk ─────────────────────────────
    const zai = await ZAI.create()

    const response = await zai.images.generations.create({
      prompt,
      size: '768x1344',
    })

    const base64 = response?.data?.[0]?.base64

    if (!base64) {
      console.error('Poster generation: no image data returned from AI', {
        productId,
        shopId: user.shop.id,
      })
      return NextResponse.json(
        { error: 'Erreur lors de la génération de l\'image' },
        { status: 500 }
      )
    }

    // ─── Return the result ────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      image: base64,
    })
  } catch (error) {
    console.error('Poster generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'affiche' },
      { status: 500 }
    )
  }
}
