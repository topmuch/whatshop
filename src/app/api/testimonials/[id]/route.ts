import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// ─── PUT /api/testimonials/[id] ─────────────────────────────────────────────────
// Auth required — shop owner only. Update a testimonial.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Verify the testimonial belongs to this shop
    const existingTestimonial = await db.testimonial.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingTestimonial) {
      return NextResponse.json({ error: 'Témoignage introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { clientName, clientAvatar, comment, rating, isDisplayed } = body

    // Build update data — only include fields that are provided
    const data: Record<string, unknown> = {}

    if (clientName !== undefined) {
      if (typeof clientName !== 'string' || clientName.trim().length === 0) {
        return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 })
      }
      data.clientName = clientName.trim()
    }

    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.trim().length === 0) {
        return NextResponse.json({ error: 'Commentaire requis' }, { status: 400 })
      }
      data.comment = comment.trim()
    }

    if (rating !== undefined) {
      const parsedRating = parseInt(rating)
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 })
      }
      data.rating = parsedRating
    }

    if (clientAvatar !== undefined) {
      data.clientAvatar = clientAvatar || null
    }

    if (isDisplayed !== undefined) {
      data.isDisplayed = Boolean(isDisplayed)
    }

    // If nothing to update, return the existing testimonial
    if (Object.keys(data).length === 0) {
      return NextResponse.json(existingTestimonial)
    }

    const updatedTestimonial = await db.testimonial.update({
      where: { id },
      data,
    })

    return NextResponse.json(updatedTestimonial)
  } catch (error) {
    console.error('Testimonials PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE /api/testimonials/[id] ───────────────────────────────────────────────
// Auth required — shop owner only. Delete a testimonial.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Verify the testimonial belongs to this shop
    const existingTestimonial = await db.testimonial.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingTestimonial) {
      return NextResponse.json({ error: 'Témoignage introuvable' }, { status: 404 })
    }

    await db.testimonial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Testimonials DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
