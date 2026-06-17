import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_REVIEW_SOURCES = ['MANUAL', 'FACEBOOK', 'TIKTOK'] as const
type ReviewSource = (typeof VALID_REVIEW_SOURCES)[number]

function isValidReviewSource(value: unknown): value is ReviewSource {
  return typeof value === 'string' && (VALID_REVIEW_SOURCES as readonly string[]).includes(value)
}

interface ImportReviewInput {
  customerName: unknown
  rating: unknown
  comment?: unknown
  photos?: unknown
}

// ─── POST /api/reviews/import ─────────────────────────────────────────────────
// Auth required — owner only.
// Body: { productId, source, reviews: [{ customerName, rating, comment?, photos? }] }
export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { productId, source, reviews } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 })
    }

    if (!isValidReviewSource(source)) {
      return NextResponse.json(
        { error: 'source invalide (MANUAL, FACEBOOK ou TIKTOK)' },
        { status: 400 }
      )
    }

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: 'reviews doit être un tableau non vide' },
        { status: 400 }
      )
    }

    // Verify the product belongs to the owner's shop
    const product = await db.product.findFirst({
      where: { id: productId, shopId: shop.id },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    // Validate and build create payloads
    const createData = (reviews as ImportReviewInput[]).map((entry, index) => {
      const { customerName, rating, comment, photos } = entry

      if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
        throw new Error(`Avis #${index + 1}: nom du client requis`)
      }

      const parsedRating =
        typeof rating === 'number'
          ? rating
          : typeof rating === 'string'
            ? parseInt(rating, 10)
            : NaN
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        throw new Error(`Avis #${index + 1}: la note doit être entre 1 et 5`)
      }

      const commentValue =
        comment !== undefined && comment !== null && typeof comment === 'string'
          ? comment
          : null

      let photosArray: string[] = []
      if (photos !== undefined && photos !== null) {
        if (Array.isArray(photos)) {
          photosArray = photos.filter((p) => typeof p === 'string')
        } else if (typeof photos === 'string') {
          try {
            const parsed = JSON.parse(photos)
            photosArray = Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : []
          } catch {
            photosArray = []
          }
        }
      }

      return {
        productId,
        customerName: customerName.trim(),
        rating: parsedRating,
        comment: commentValue,
        photos: JSON.stringify(photosArray),
        source,
        verified: false,
        status: 'PENDING',
      }
    })

    const created = await db.$transaction(
      createData.map((data) => db.review.create({ data }))
    )

    return NextResponse.json({ reviews: created, count: created.length }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Avis #')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Reviews import POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
