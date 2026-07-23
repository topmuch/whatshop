import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isValidSlug } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { generateSlug } from '@/lib/utils'
import { dispatchWelcomeEmail, dispatchAdminNewShopEmail } from '@/lib/email-dispatch'

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

// Plan configuration: maps onboarding plan to subscription details
const PLAN_CONFIG: Record<string, { planType: string; maxShops: number }> = {
  TRIAL: { planType: 'LIVE', maxShops: 1 },
  LIVE: { planType: 'LIVE', maxShops: 1 },
  LIVE_PRO: { planType: 'LIVE_PRO', maxShops: 2 },
  BOUTIQUE_PRO: { planType: 'BOUTIQUE_PRO', maxShops: 1 },
}

const TRIAL_DAYS = 7

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

    const finalPlan = plan || 'TRIAL'
    const planConfig = PLAN_CONFIG[finalPlan] || PLAN_CONFIG['TRIAL']

    // Generate slug from name with uniqueness check
    const trimmedName = name.trim()
    let slug = generateSlug(trimmedName)
    if (!slug) {
      slug = `boutique-${Date.now().toString(36)}`
    }
    const slugExists = await db.shop.findUnique({ where: { slug } })
    if (slugExists) {
      let found = false
      for (let i = 2; i <= 5; i++) {
        const candidate = `${slug}-${i}`
        const candidateExists = await db.shop.findUnique({ where: { slug: candidate } })
        if (!candidateExists) {
          slug = candidate
          found = true
          break
        }
      }
      if (!found) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    // Auto-assign template — cosmika-dark par défaut (sélection de template supprimée de l'onboarding).
    // Override client accepté si fourni (utile pour réintroduire le choix plus tard).
    // Pour les plans LIVE/LIVE_PRO, on garde le whitelist historique ; cosmika-dark y est ajouté
    // pour ne pas écraser la valeur par défaut.
    const LIVE_ALLOWED = new Set(['live-template', 'live-1', 'live-2', 'live-3', 'xstore-electro', 'cosmika-dark'])
    let template = templateOverride || 'cosmika-dark'
    // LIVE/LIVE_PRO plans: enforce allowed templates, default to live-template
    if ((finalPlan === 'LIVE' || finalPlan === 'LIVE_PRO') && !LIVE_ALLOWED.has(template)) {
      template = 'live-template'
    }

    // ALL plans start with a 7-day trial
    const trialEndDate = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

    // Create the shop — all plans active during trial
    const shop = await db.shop.create({
      data: {
        name: trimmedName,
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
        isActive: true,
        subscriptionStatus: 'TRIAL',
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

    // Create or update subscription for the user — always TRIAL status
    const subPlanType = planConfig.planType
    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planType: subPlanType,
        status: 'TRIAL',
        maxShops: planConfig.maxShops,
      },
      update: {
        planType: subPlanType,
        status: 'TRIAL',
        maxShops: planConfig.maxShops,
        endDate: null,
      },
    })

    // Fire-and-forget notification: new shop
    try {
      await createNotification(
        'NEW_SHOP',
        'Nouvelle boutique créée',
        `La boutique "${shop.name}" (${businessType}) a été créée par ${user.name}. Plan: ${finalPlan} — Essai ${TRIAL_DAYS} jours.`,
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
        isPaidPlan: finalPlan !== 'TRIAL',
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

    // ALL plans (except bare TRIAL) create an upgrade request for admin validation
    if (finalPlan !== 'TRIAL') {
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
          `Nouvelle inscription — Plan ${finalPlan} (essai ${TRIAL_DAYS}j)`,
          `${user.name} a choisi le plan ${finalPlan} pour "${shop.name}". Essai de ${TRIAL_DAYS} jours — en attente de validation de paiement.`,
          { shopId: shop.id, shopName: shop.name, ownerId: user.id, ownerName: user.name, requestedPlan: subPlanType }
        )
      } catch {
        // Non-critical
      }

      // Notify user about their trial period
      try {
        await db.notification.create({
          data: {
            type: 'SHOP_LIVE',
            title: `Bienvenue ! Votre essai de ${TRIAL_DAYS} jours commence`,
            message: `Votre boutique "${shop.name}" est active avec le plan ${finalPlan}. Vous avez ${TRIAL_DAYS} jours pour valider votre abonnement. Au-delà, votre site sera désactivé. Contactez le support pour valider votre offre.`,
            userId: user.id,
            metadata: JSON.stringify({ shopId: shop.id, shopName: shop.name, requestedPlan: subPlanType, trialEndsAt: trialEndDate.toISOString() }),
          },
        })
      } catch {
        // Non-critical
      }

      // System message in shop's inbox about trial
      try {
        await db.contactMessage.create({
          data: {
            shopId: shop.id,
            name: 'Boutiko',
            email: 'support@boutiko.pro',
            phone: null,
            message: `🎉 Bienvenue sur Boutiko !\n\nVotre boutique "${shop.name}" est active avec le plan ${finalPlan}.\n\nVous disposez de ${TRIAL_DAYS} jours d'essai gratuit. Pour continuer à utiliser votre boutique après cette période, contactez le support pour valider votre abonnement.\n\nN'hésitez pas à nous écrire si vous avez des questions !`,
            status: 'NEW',
            source: 'SYSTEM',
          },
        })
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({
      ...shop,
      _trialDays: TRIAL_DAYS,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}