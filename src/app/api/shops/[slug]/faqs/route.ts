import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ─── GET /api/shops/[slug]/faqs ───────────────────────────────────────────────
// Public — list FAQs for a shop, ordered by `order` asc.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!shop) {
      return NextResponse.json([])
    }

    const faqs = await db.fAQ.findMany({
      where: { shopId: shop.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('FAQs GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST /api/shops/[slug]/faqs ──────────────────────────────────────────────
// Auth required — shop owner only. Create a new FAQ.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Verify the shop from URL belongs to the authenticated user
    if (shop.slug !== slug) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { question, answer } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question requise' }, { status: 400 })
    }
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return NextResponse.json({ error: 'Réponse requise' }, { status: 400 })
    }

    const lastFaq = await db.fAQ.findFirst({
      where: { shopId: shop.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const nextOrder = lastFaq ? lastFaq.order + 1 : 0

    const faq = await db.fAQ.create({
      data: {
        shopId: shop.id,
        question: question.trim(),
        answer: answer.trim(),
        order: nextOrder,
      },
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('FAQs POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
