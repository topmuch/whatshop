import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { NEW_PLAN_CONFIGS, getPlanConfig } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const shops = await db.shop.findMany({
      where: {
        ...(status ? { subscriptionStatus: status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      subscriptions: shops.map(s => ({
        shopId: s.id,
        shopName: s.name,
        shopSlug: s.slug,
        ownerId: s.owner.id,
        ownerName: s.owner.name,
        ownerEmail: s.owner.email,
        plan: s.plan,
        status: s.subscriptionStatus || 'NONE',
        endDate: s.subscriptionEndDate?.toISOString() ?? null,
        trialEndDate: s.trialEndDate?.toISOString() ?? null,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin subscriptions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { shopId, action, newPlan } = body

    if (!shopId || !action) {
      return NextResponse.json({ error: 'shopId et action requis' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // ─── Validate Payment: TRIAL → ACTIVE (annual subscription) ───
    if (action === 'validate_payment') {
      const annualEndDate = new Date()
      annualEndDate.setFullYear(annualEndDate.getFullYear() + 1)

      // Determine plan config
      const planKey = shop.plan as keyof typeof NEW_PLAN_CONFIGS
      const planConfig = NEW_PLAN_CONFIGS[planKey] || NEW_PLAN_CONFIGS.LIVE

      // Update the shop
      const updated = await db.shop.update({
        where: { id: shopId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: annualEndDate,
          trialEndDate: null, // clear trial
          isActive: true,
          plan: shop.plan, // keep the plan the user chose
        },
      })

      // Update the user's subscription record
      await db.subscription.upsert({
        where: { userId: shop.ownerId },
        create: {
          userId: shop.ownerId,
          planType: shop.plan as 'LIVE' | 'LIVE_PRO' | 'BOUTIQUE_PRO',
          status: 'ACTIVE',
          maxShops: planConfig.maxShops,
          endDate: annualEndDate,
        },
        update: {
          planType: shop.plan as 'LIVE' | 'LIVE_PRO' | 'BOUTIQUE_PRO',
          status: 'ACTIVE',
          maxShops: planConfig.maxShops,
          endDate: annualEndDate,
        },
      })

      // Mark upgrade request as approved if exists
      try {
        await db.upgradeRequest.updateMany({
          where: { userId: shop.ownerId, status: 'PENDING' },
          data: { status: 'APPROVED' },
        })
      } catch {
        // Non-critical
      }

      return NextResponse.json({
        message: `Paiement validé pour "${shop.name}" — Abonnement annuel actif jusqu'au ${annualEndDate.toLocaleDateString('fr-FR')}`,
        newStatus: 'ACTIVE',
        endDate: annualEndDate.toISOString(),
      })
    }

    // ─── Extend Trial: push trialEndDate by N days ───
    if (action === 'extend_trial') {
      const extraDays = body.days || 7
      const baseDate = shop.trialEndDate
        ? new Date(shop.trialEndDate)
        : new Date()

      // If trial already expired, start from now
      if (baseDate < new Date()) {
        baseDate.setTime(new Date().getTime())
      }

      const newTrialEnd = new Date(baseDate)
      newTrialEnd.setDate(newTrialEnd.getDate() + extraDays)

      const updated = await db.shop.update({
        where: { id: shopId },
        data: {
          trialEndDate: newTrialEnd,
          subscriptionStatus: 'TRIAL',
          isActive: true,
        },
      })

      return NextResponse.json({
        message: `Essai prolongé de ${extraDays} jours pour "${shop.name}" — Nouvelle fin: ${newTrialEnd.toLocaleDateString('fr-FR')}`,
        trialEndDate: newTrialEnd.toISOString(),
      })
    }

    // ─── Upgrade Plan: change the plan type ───
    if (action === 'upgrade') {
      if (!newPlan || !NEW_PLAN_CONFIGS[newPlan as keyof typeof NEW_PLAN_CONFIGS]) {
        return NextResponse.json({ error: 'Plan invalide. Utilisez: LIVE, LIVE_PRO, BOUTIQUE_PRO' }, { status: 400 })
      }

      const planConfig = getPlanConfig(newPlan)
      const annualEndDate = new Date()
      annualEndDate.setFullYear(annualEndDate.getFullYear() + 1)

      // Update the shop
      const updated = await db.shop.update({
        where: { id: shopId },
        data: {
          plan: newPlan,
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: annualEndDate,
          trialEndDate: null,
          isActive: true,
        },
      })

      // Update user subscription
      await db.subscription.upsert({
        where: { userId: shop.ownerId },
        create: {
          userId: shop.ownerId,
          planType: newPlan as 'LIVE' | 'LIVE_PRO' | 'BOUTIQUE_PRO',
          status: 'ACTIVE',
          maxShops: planConfig.maxShops,
          endDate: annualEndDate,
        },
        update: {
          planType: newPlan as 'LIVE' | 'LIVE_PRO' | 'BOUTIQUE_PRO',
          status: 'ACTIVE',
          maxShops: planConfig.maxShops,
          endDate: annualEndDate,
        },
      })

      return NextResponse.json({
        message: `Forfait de "${shop.name}" mis à jour vers ${planConfig.label}`,
        newPlan,
        newStatus: 'ACTIVE',
        endDate: annualEndDate.toISOString(),
      })
    }

    // ─── Legacy actions ───
    const validActions = ['activate', 'suspend', 'cancel', 'extend']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Action invalide. Utilisez: validate_payment, extend_trial, upgrade, activate, suspend, cancel, extend' }, { status: 400 })
    }

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'activate': {
        const endDate = new Date()
        endDate.setFullYear(endDate.getFullYear() + 1)
        updateData = {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: endDate,
          trialEndDate: null,
          isActive: true,
        }
        break
      }
      case 'suspend': {
        updateData = {
          subscriptionStatus: 'SUSPENDED',
          isActive: false,
        }
        break
      }
      case 'cancel': {
        updateData = {
          subscriptionStatus: 'CANCELLED',
        }
        break
      }
      case 'extend': {
        const baseDate = shop.subscriptionEndDate
          ? new Date(shop.subscriptionEndDate)
          : new Date()
        if (baseDate < new Date()) {
          baseDate.setTime(new Date().getTime())
        }
        baseDate.setFullYear(baseDate.getFullYear() + 1)
        updateData = {
          subscriptionEndDate: baseDate,
          subscriptionStatus: 'ACTIVE',
          isActive: true,
        }
        break
      }
    }

    const updated = await db.shop.update({
      where: { id: shopId },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      subscriptionStatus: updated.subscriptionStatus,
      subscriptionEndDate: updated.subscriptionEndDate?.toISOString() ?? null,
      isActive: updated.isActive,
    })
  } catch (error) {
    console.error('Admin subscription update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}