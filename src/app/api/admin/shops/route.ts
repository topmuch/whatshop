import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth'
import { checkShopLimit, getOrCreateSubscription } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan') || ''
    const search = searchParams.get('search') || ''

    const shops = await db.shop.findMany({
      where: {
        ...(plan ? { plan } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { slug: { contains: search } },
            { owner: { name: { contains: search } } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true, visits: true } },
      },
    })

    return NextResponse.json({
      shops: shops.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        plan: s.plan,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
        owner: { id: s.owner.id, name: s.owner.name, email: s.owner.email },
        productCount: s._count.products,
        orderCount: s._count.orders,
        visitCount: s._count.visits,
      })),
    })
  } catch (error) {
    console.error('Admin shops error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/shops
 *
 * Creates a shop. Two modes:
 * 1. With `ownerId`: uses an existing user (original behavior).
 * 2. With `ownerName` + `ownerEmail` + `ownerPassword`: creates a new SELLER user first.
 *
 * Returns `credentials` when a new user was created, so the admin can send them
 * via WhatsApp.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { name, slug, whatsapp, ownerId, ownerName, ownerEmail, ownerPassword, plan } = body

    if (!name || !slug || !whatsapp) {
      return NextResponse.json({ error: 'Nom, slug et whatsapp requis' }, { status: 400 })
    }

    let resolvedOwnerId = ownerId

    // If no ownerId provided, create a new user from the given info
    if (!resolvedOwnerId) {
      if (!ownerName || !ownerEmail || !ownerPassword) {
        return NextResponse.json(
          { error: 'Sélectionnez un utilisateur existant OU fournissez nom, email et mot de passe pour en créer un nouveau.' },
          { status: 400 }
        )
      }

      if (ownerPassword.length < 6) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
        return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 })
      }

      // Check email uniqueness
      const existingUser = await db.user.findUnique({ where: { email: ownerEmail } })
      if (existingUser) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
      }

      const hashedPw = await hashPassword(ownerPassword)
      const newUser = await db.user.create({
        data: {
          email: ownerEmail,
          password: hashedPw,
          name: ownerName.trim(),
          role: 'SELLER' as const,
        },
      })
      resolvedOwnerId = newUser.id
    } else {
      // Validate existing owner
      const owner = await db.user.findUnique({ where: { id: resolvedOwnerId } })
      if (!owner) {
        return NextResponse.json({ error: 'Propriétaire introuvable' }, { status: 404 })
      }
    }

    const existingSlug = await db.shop.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 })
    }

    // Ensure subscription exists and check shop limit
    await getOrCreateSubscription(resolvedOwnerId)
    const limitCheck = await checkShopLimit(resolvedOwnerId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: `Limite atteinte pour cet utilisateur (${limitCheck.currentCount}/${limitCheck.maxAllowed}). Mettez à niveau son abonnement.` },
        { status: 403 }
      )
    }

    const shop = await db.shop.create({
      data: {
        name,
        slug,
        whatsapp,
        ownerId: resolvedOwnerId,
        ...(plan ? { plan } : {}),
      },
    })

    // If we created a new user, return the credentials for WhatsApp sharing
    const credentials = !ownerId ? {
      email: ownerEmail,
      password: ownerPassword,
      shopUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/${slug}`,
    } : null

    return NextResponse.json({
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        plan: shop.plan,
        isActive: shop.isActive,
        createdAt: shop.createdAt.toISOString(),
        ownerId: shop.ownerId,
      },
      credentials,
    })
  } catch (error) {
    console.error('Admin create shop error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}