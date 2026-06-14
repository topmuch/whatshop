import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// ─── HELPERS ──────────────────────────────────────────────────────────────────────

/** Find a shop by slug (public lookup). */
async function findShopBySlug(slug: string) {
  return db.shop.findUnique({
    where: { slug, isActive: true },
    select: { id: true, slug: true, name: true },
  })
}

/** Parse trustBadges JSON string into array. */
function parseTrustBadges(raw: unknown): Array<{ emoji: string; title: string; subtitle: string; order: number }> {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// ─── GET /api/shops/[slug]/testimonials ──────────────────────────────────────────
// Public — no auth needed. Fetch all displayed testimonials for a shop.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await findShopBySlug(slug)
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const testimonials = await db.testimonial.findMany({
      where: {
        shopId: shop.id,
        isDisplayed: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Testimonials GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST /api/shops/[slug]/testimonials ─────────────────────────────────────────
// Auth required — shop owner only. Create a new testimonial.
// The slug param is ignored; shopId comes from the authenticated user's shop.
export async function POST(
  request: NextRequest,
  _context: { params: Promise<{ slug: string }> }
) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { clientName, clientAvatar, clientRole, comment, rating } = body

    // Validate required fields
    if (!clientName || typeof clientName !== 'string' || clientName.trim().length === 0) {
      return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 })
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Commentaire requis' }, { status: 400 })
    }

    // Validate rating 1-5
    const validatedRating = rating !== undefined ? parseInt(rating) : 5
    if (isNaN(validatedRating) || validatedRating < 1 || validatedRating > 5) {
      return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 })
    }

    const testimonial = await db.testimonial.create({
      data: {
        shopId: user.shop.id,
        clientName: clientName.trim(),
        clientAvatar: clientAvatar || null,
        clientRole: clientRole || null,
        comment: comment.trim(),
        rating: validatedRating,
        isDisplayed: true,
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Testimonials POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
