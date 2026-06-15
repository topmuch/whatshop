import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isValidSlug } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { generateSlug } from '@/lib/utils'
import { dispatchWelcomeEmail, dispatchAdminNewShopEmail } from '@/lib/email-dispatch'

// Sector → Template mapping
const sectorTemplateMap: Record<string, string> = {
  // ECOMMERCE sectors
  beaute: 'cosmika-beauty',
  mode: 'cosmika-beauty',
  electronique: 'xstore-electro',
  alimentation: 'xstore-electro',
  autre: 'xstore-electro',
  // SERVICE sectors
  'beaute-service': 'cosmika-beauty',
  restaurant: 'cosmika-beauty',
  consulting: 'xstore-electro',
  artisanat: 'xstore-electro',
  sante: 'cosmika-beauty',
}

// Sector → Default categories
const sectorCategoriesMap: Record<string, string[]> = {
  beaute: ['Maquillage', 'Soins', 'Parfums', 'Accessoires Beauté'],
  mode: ['Robes', 'Accessoires', 'Chaussures', 'Hauts'],
  electronique: ['Téléphones', 'Accessoires', 'Ordinateurs', 'Audio'],
  alimentation: ['Boissons', 'Snacks', 'Conserves', 'Épices'],
  autre: ['Produits', 'Divers'],
  'beaute-service': ['Maquillage', 'Coiffure', 'Soins', 'Ongles'],
  restaurant: ['Plats du jour', 'Boissons', 'Desserts', 'Menus spéciaux'],
  consulting: ['Consultation', 'Formation', 'Audit', 'Accompagnement'],
  artisanat: ['Services', 'Réparations', 'Installations', 'Devis'],
  sante: ['Consultations', 'Coaching', 'Soins', 'Programmes'],
}

// Onboarding PRO plan maps to STARTER subscription (user can upgrade later)
const PLAN_TO_SUBSCRIPTION: Record<string, 'STARTER' | 'PRO' | 'BUSINESS'> = {
  TRIAL: 'STARTER',
  PRO: 'PRO',
}


export async function POST(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const {
      businessType,
      sector,
      template: templateOverride,
      name,
      whatsapp,
      description,
      logo,
      plan,
    } = body

    if (!businessType || !name || !whatsapp) {
      return NextResponse.json(
        { error: 'Informations manquantes (type d\'activité, nom, whatsapp requis)' },
        { status: 400 }
      )
    }

    if (!['ECOMMERCE', 'SERVICE'].includes(businessType)) {
      return NextResponse.json({ error: 'Type d\'activité invalide' }, { status: 400 })
    }

    // Check if user already has a shop
    const existingShop = await db.shop.findFirst({ where: { ownerId: user.id } })
    if (existingShop) {
      return NextResponse.json(
        { error: 'Vous avez déjà une boutique' },
        { status: 400 }
      )
    }

    // Auto-assign template based on sector, or use override
    const template = templateOverride || sectorTemplateMap[sector] || 'xstore-electro'

    // Generate slug from name, ensure uniqueness
    let slug = generateSlug(name)
    const slugExists = await db.shop.findUnique({ where: { slug } })
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const finalPlan = plan || 'TRIAL'
    const isPaidPlan = finalPlan === 'PRO'

    // Calculate trial end date if TRIAL plan
    const trialEndDate = finalPlan === 'TRIAL'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null

    // Create the shop — inactive if paid plan (needs admin validation)
    const shop = await db.shop.create({
      data: {
        name,
        slug,
        whatsapp: whatsapp.trim(),
        description: description || null,
        logo: logo || null,
        plan: finalPlan,
        trialEndDate,
        businessType,
        sector: sector || null,
        template,
        ownerId: user.id,
        isActive: !isPaidPlan,
        subscriptionStatus: isPaidPlan ? 'PENDING_ACTIVATION' : 'TRIAL',
      },
    })

    // Auto-create categories based on sector
    const categories = sectorCategoriesMap[sector] || ['Produits', 'Divers']
    await db.category.createMany({
      data: categories.map((catName) => ({
        name: catName,
        shopId: shop.id,
      })),
    })

    // Create or update subscription for the user
    const subPlanType = PLAN_TO_SUBSCRIPTION[finalPlan] || 'STARTER'
    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planType: subPlanType,
        status: isPaidPlan ? 'TRIAL' : 'TRIAL',
        maxShops: subPlanType === 'PRO' ? 3 : 1,
      },
      update: {
        planType: subPlanType,
        maxShops: subPlanType === 'PRO' ? 3 : 1,
      },
    })

    // Fire-and-forget notification: new shop
    try {
      await createNotification(
        'NEW_SHOP',
        'Nouvelle boutique créée',
        `La boutique "${shop.name}" (${businessType}) a été créée par ${user.name}.`,
        { shopId: shop.id, shopName: shop.name, ownerId: user.id, ownerName: user.name }
      )

      // Fire-and-forget emails: welcome + admin notification
      const shopUrl = `https://boutiko.pro/${shop.slug}`
      dispatchWelcomeEmail({
        userId: user.id,
        userName: user.name,
        shopName: shop.name,
        shopSlug: shop.slug,
        shopUrl,
        plan: finalPlan,
        isPaidPlan,
      })
      dispatchAdminNewShopEmail({
        shopName: shop.name,
        ownerName: user.name,
        ownerEmail: user.email,
        plan: finalPlan,
        sector,
        businessType,
      })
    } catch {
      // Notification/email failure must not break onboarding
    }

    // If paid plan: create upgrade request + notify admin + notify user
    if (isPaidPlan) {
      // Create upgrade request for admin validation
      try {
        await db.upgradeRequest.create({
          data: {
            userId: user.id,
            requestedPlan: subPlanType,
            status: 'PENDING',
          },
        })
      } catch {
        // Non-critical
      }

      // Notify admin about paid plan request
      try {
        await createNotification(
          'UPGRADE_REQUEST',
          'Nouvelle demande de plan Pro',
          `${user.name} a choisi le plan Pro pour la boutique "${shop.name}". Validation requise.`,
          { shopId: shop.id, shopName: shop.name, ownerId: user.id, ownerName: user.name, requestedPlan: subPlanType }
        )
      } catch {
        // Non-critical
      }

      // Notify user that their request is being processed
      try {
        await db.notification.create({
          data: {
            type: 'SHOP_LIVE',
            title: 'Demande de plan Pro en cours',
            message: 'Votre demande de plan Pro a été transmise à nos services. Votre site sera activé sous 1H après validation.',
            userId: user.id,
            metadata: JSON.stringify({ shopId: shop.id, shopName: shop.name, requestedPlan: subPlanType }),
          },
        })
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({
      ...shop,
      _pendingActivation: isPaidPlan,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}