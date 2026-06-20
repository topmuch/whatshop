import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface MessageItem {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  source: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface MessagesResponse {
  messages: MessageItem[]
  pagination: Pagination
}

const VALID_STATUSES = ['NEW', 'READ', 'REPLIED'] as const
const VALID_UPDATE_STATUSES = ['READ', 'REPLIED'] as const
const VALID_SOURCES = ['ALL', 'FORM', 'ORDER', 'SYSTEM', 'WHATSAPP', 'CALL'] as const

// ─── GET HANDLER ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const auth = await requireAuth(request)
    if (auth.response) return auth.response
    const user = auth.user

    // Parse query params
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const statusParam = searchParams.get('status')
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const search = searchParams.get('search')
    const sourceParam = searchParams.get('source')

    // Validate shopId
    if (!shopId || typeof shopId !== 'string' || shopId.trim().length === 0) {
      return NextResponse.json({ error: 'Paramètre shopId requis' }, { status: 400 })
    }

    // Verify shop ownership
    const shop = await db.shop.findUnique({
      where: { id: shopId.trim() },
      select: { id: true, ownerId: true },
    })

    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
    }

    // Parse pagination
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10) || 20))

    // Build where clause
    const where: Record<string, unknown> = { shopId: shop.id }

    if (statusParam && statusParam !== 'ALL') {
      if (!VALID_STATUSES.includes(statusParam as typeof VALID_STATUSES[number])) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      }
      where.status = statusParam
    }

    if (search && search.trim().length > 0) {
      const term = search.trim()
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
      ]
    }

    if (sourceParam && sourceParam !== 'ALL') {
      if (!VALID_SOURCES.includes(sourceParam as typeof VALID_SOURCES[number])) {
        return NextResponse.json({ error: 'Source invalide' }, { status: 400 })
      }
      where.source = sourceParam
    }

    // Get total count
    const total = await db.contactMessage.count({ where })

    // Get messages
    const messagesRaw = await db.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        source: true,
        createdAt: true,
      },
    })

    const messages: MessageItem[] = messagesRaw.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      message: m.message,
      status: m.status,
      source: m.source,
      createdAt: m.createdAt.toISOString(),
    }))

    const response: MessagesResponse = {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur récupération messages:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// ─── PATCH HANDLER (BULK UPDATE) ───────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    // Authentication
    const auth = await requireAuth(request)
    if (auth.response) return auth.response
    const user = auth.user

    // Parse body
    const body = await request.json()
    const { shopId, messageIds, status } = body as {
      shopId?: string
      messageIds?: string[]
      status?: string
    }

    // Validate
    if (!shopId || typeof shopId !== 'string' || shopId.trim().length === 0) {
      return NextResponse.json({ error: 'Paramètre shopId requis' }, { status: 400 })
    }

    if (!Array.isArray(messageIds) || messageIds.length === 0 || messageIds.length > 100) {
      return NextResponse.json({ error: 'messageIds invalide (tableau requis, max 100)' }, { status: 400 })
    }

    for (const id of messageIds) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        return NextResponse.json({ error: 'messageIds contient des identifiants invalides' }, { status: 400 })
      }
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

    // Bulk update — only update messages belonging to this shop
    const result = await db.contactMessage.updateMany({
      where: {
        id: { in: messageIds.map(id => id.trim()) },
        shopId: shop.id,
      },
      data: {
        status: status as "READ" | "REPLIED",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    console.error('Erreur mise à jour messages:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}