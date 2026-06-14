import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

const VALID_UPDATE_STATUSES = ['READ', 'REPLIED'] as const

// ─── PATCH HANDLER ─────────────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication
    const auth = await requireAuth(request)
    if (auth.response) return auth.response
    const user = auth.user

    // Parse dynamic route params
    const { id: messageId } = await params

    if (!messageId || typeof messageId !== 'string' || messageId.trim().length === 0) {
      return NextResponse.json({ error: 'Identifiant de message invalide' }, { status: 400 })
    }

    // Parse body
    const body = await request.json()
    const { shopId, status } = body as { shopId?: string; status?: string }

    // Validate
    if (!shopId || typeof shopId !== 'string' || shopId.trim().length === 0) {
      return NextResponse.json({ error: 'Paramètre shopId requis' }, { status: 400 })
    }

    if (!status || !VALID_UPDATE_STATUSES.includes(status as "READ" | "REPLIED")) {
      return NextResponse.json({ error: 'Statut invalide (READ ou REPLIED requis)' }, { status: 400 })
    }

    // Verify shop ownership
    const shop = await db.shop.findUnique({
      where: { id: shopId.trim() },
      select: { id: true, ownerId: true },
    })

    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
    }

    // Verify the message belongs to this shop and update it
    const message = await db.contactMessage.findUnique({
      where: { id: messageId.trim() },
      select: { id: true, shopId: true },
    })

    if (!message || message.shopId !== shop.id) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
    }

    await db.contactMessage.update({
      where: { id: message.id },
      data: {
        status: status as "READ" | "REPLIED",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur mise à jour message:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}