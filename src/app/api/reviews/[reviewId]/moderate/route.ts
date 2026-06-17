import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_REVIEW_STATUSES = ['PUBLISHED', 'REJECTED'] as const
type ReviewStatus = (typeof VALID_REVIEW_STATUSES)[number]

function isValidReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === 'string' && (VALID_REVIEW_STATUSES as readonly string[]).includes(value)
}

// ─── PUT /api/reviews/[reviewId]/moderate ─────────────────────────────────────
// Auth required — owner only.
// Body: { status: 'PUBLISHED' | 'REJECTED' } (and/or { verified?: boolean }).
// Verify the review's product belongs to the owner's shop.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params

    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Fetch the review with its product to verify ownership
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { id: true, shopId: true } } },
    })
    if (!existingReview) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
    }

    if (existingReview.product.shopId !== shop.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { status, verified } = body

    const data: Record<string, unknown> = {}

    if (status !== undefined) {
      if (!isValidReviewStatus(status)) {
        return NextResponse.json(
          { error: 'Statut invalide (PUBLISHED ou REJECTED)' },
          { status: 400 }
        )
      }
      data.status = status
    }

    if (verified !== undefined) {
      data.verified = Boolean(verified)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existingReview)
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data,
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Review moderate PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
