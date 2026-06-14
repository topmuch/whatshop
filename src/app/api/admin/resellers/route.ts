import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// GET /api/admin/resellers — list all resellers with profiles, client counts, shops counts, subscriptions
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    // Build the where clause
    const where: Prisma.UserWhereInput = {
      role: 'RESELLER',
      resellerProfile: { isNot: null },
    }

    // Status filter: active → isActive=true, inactive → isActive=false
    if (status === 'active' || status === 'inactive') {
      where.resellerProfile = {
        ...((where.resellerProfile as Prisma.ResellerWhereInput) || {}),
        isActive: status === 'active',
      }
    }

    // Search filter: match on name or email
    if (search.trim()) {
      const term = search.trim()
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
      ]
    }

    const resellers = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isSuspended: true,
        createdAt: true,
        resellerProfile: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            primaryColor: true,
            commission: true,
            isActive: true,
            createdAt: true,
          },
        },
        subscription: {
          select: {
            id: true,
            planType: true,
            status: true,
            maxShops: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            resellerClients: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // For each reseller, count total shops across all their clients
    const resellerIds = resellers.map(r => r.id)
    const clientShopCounts = resellerIds.length > 0
      ? await db.shop.groupBy({
          by: ['ownerId'],
          where: { ownerId: { in: resellerIds } },
          _count: { id: true },
        })
      : []

    const clientShopCountMap = new Map(clientShopCounts.map(c => [c.ownerId, c._count.id]))

    const formatted = resellers.map(r => ({
      user: {
        id: r.id,
        name: r.name,
        email: r.email,
        isSuspended: r.isSuspended,
        createdAt: r.createdAt.toISOString(),
      },
      profile: r.resellerProfile
        ? {
            id: r.resellerProfile.id,
            companyName: r.resellerProfile.companyName,
            logoUrl: r.resellerProfile.logoUrl,
            primaryColor: r.resellerProfile.primaryColor,
            commission: r.resellerProfile.commission,
            isActive: r.resellerProfile.isActive,
            createdAt: r.resellerProfile.createdAt.toISOString(),
          }
        : null,
      clientCount: r._count.resellerClients,
      totalShopsCount: clientShopCountMap.get(r.id) ?? 0,
      subscription: r.subscription
        ? {
            id: r.subscription.id,
            planType: r.subscription.planType,
            status: r.subscription.status,
            maxShops: r.subscription.maxShops,
            startDate: r.subscription.startDate.toISOString(),
            endDate: r.subscription.endDate?.toISOString() ?? null,
          }
        : null,
    }))

    return NextResponse.json({ resellers: formatted })
  } catch (error) {
    console.error('Admin resellers GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/resellers — create a new reseller
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

  try {
    const body = await request.json()
    const { name, email, password, companyName, commission } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Le nom, l\'email et le mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Validate commission if provided
    if (commission !== undefined && commission !== null) {
      if (typeof commission !== 'number' || commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: 'La commission doit être un nombre entre 0 et 100' },
          { status: 400 }
        )
      }
    }

    // Check if email is already taken
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    // Create user + reseller profile + subscription in a transaction
    const user = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: name.trim(),
          role: 'RESELLER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isSuspended: true,
          createdAt: true,
        },
      })

      const resellerProfile = await tx.reseller.create({
        data: {
          userId: createdUser.id,
          companyName: companyName?.trim() || null,
          commission: commission ?? 10,
        },
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          primaryColor: true,
          commission: true,
          isActive: true,
          createdAt: true,
        },
      })

      // Default STARTER/TRIAL subscription
      await tx.subscription.create({
        data: {
          userId: createdUser.id,
          planType: 'STARTER',
          status: 'TRIAL',
          maxShops: 1,
        },
      })

      return { ...createdUser, resellerProfile }
    })

    return NextResponse.json({ reseller: user }, { status: 201 })
  } catch (error) {
    console.error('Admin resellers POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admin/resellers — update a reseller's profile
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

  try {
    const body = await request.json()
    const { userId, companyName, primaryColor, commission, isActive } = body

    if (!userId) {
      return NextResponse.json({ error: 'L\'identifiant utilisateur est requis' }, { status: 400 })
    }

    // Validate commission if provided
    if (commission !== undefined && commission !== null) {
      if (typeof commission !== 'number' || commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: 'La commission doit être un nombre entre 0 et 100' },
          { status: 400 }
        )
      }
    }

    // Validate primaryColor if provided
    if (primaryColor !== undefined && primaryColor !== null) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
        return NextResponse.json(
          { error: 'La couleur primaire doit être au format hexadécimal (#RRGGBB)' },
          { status: 400 }
        )
      }
    }

    // Check the user exists and is a RESELLER
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (existingUser.role !== 'RESELLER') {
      return NextResponse.json(
        { error: 'Cet utilisateur n\'est pas un revendeur' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Prisma.ResellerUpdateInput = {}

    if (companyName !== undefined) {
      updateData.companyName = companyName?.trim() || null
    }
    if (primaryColor !== undefined) {
      updateData.primaryColor = primaryColor
    }
    if (commission !== undefined) {
      updateData.commission = commission
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const updatedProfile = await db.reseller.update({
      where: { userId },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        primaryColor: true,
        commission: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Admin resellers PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}