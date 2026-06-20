import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ─── PUT /api/shops/[slug]/faqs/[faqId] ───────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; faqId: string }> }
) {
  try {
    const { slug, faqId } = await params

    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    if (shop.slug !== slug) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const existingFaq = await db.fAQ.findFirst({
      where: { id: faqId, shopId: shop.id },
    })
    if (!existingFaq) {
      return NextResponse.json({ error: 'FAQ introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { question, answer, order } = body

    const data: Record<string, unknown> = {}

    if (question !== undefined) {
      if (typeof question !== 'string' || question.trim().length === 0) {
        return NextResponse.json({ error: 'Question requise' }, { status: 400 })
      }
      data.question = question.trim()
    }
    if (answer !== undefined) {
      if (typeof answer !== 'string' || answer.trim().length === 0) {
        return NextResponse.json({ error: 'Réponse requise' }, { status: 400 })
      }
      data.answer = answer.trim()
    }
    if (order !== undefined) {
      const parsedOrder = parseInt(order, 10)
      if (isNaN(parsedOrder)) {
        return NextResponse.json({ error: 'Ordre invalide' }, { status: 400 })
      }
      data.order = parsedOrder
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existingFaq)
    }

    const updatedFaq = await db.fAQ.update({ where: { id: faqId }, data })
    return NextResponse.json(updatedFaq)
  } catch (error) {
    console.error('FAQ PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE /api/shops/[slug]/faqs/[faqId] ────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; faqId: string }> }
) {
  try {
    const { slug, faqId } = await params

    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    if (shop.slug !== slug) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const existingFaq = await db.fAQ.findFirst({
      where: { id: faqId, shopId: shop.id },
    })
    if (!existingFaq) {
      return NextResponse.json({ error: 'FAQ introuvable' }, { status: 404 })
    }

    await db.fAQ.delete({ where: { id: faqId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FAQ DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
