import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Parse the JSON `photos` string stored on a Review into a string[]. */
function parsePhotos(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter((p) => typeof p === 'string')
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

interface FormattedReview {
  id: string
  customerName: string
  rating: number
  comment: string | null
  photos: string[]
  source: string
  verified: boolean
  createdAt: string
}

// ─── GET /api/products/[productId]/reviews ────────────────────────────────────
// Public — list PUBLISHED reviews for a product, newest first.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const reviews = await db.review.findMany({
      where: { productId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    })

    const formatted: FormattedReview[] = reviews.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      photos: parsePhotos(r.photos),
      source: r.source,
      verified: r.verified,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Product reviews GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
