/**
 * permissions.ts — Rôle, abonnement et limites d'accès
 *
 * Ce module centralise toute la logique de vérification des permissions :
 * - Vérification de rôle (SUPER_ADMIN, ADMIN, RESELLER, SELLER)
 * - Vérification des limites d'abonnement (nombre max de boutiques)
 * - Accès aux données d'abonnement d'un utilisateur
 */

import { db } from '@/lib/db'
import { PlanType, SubStatus, Role } from '@prisma/client'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export interface PlanConfig {
  type: PlanType
  label: string
  price: number        // Prix en FCFA
  maxShops: number     // Nombre max de boutiques
  customDomain: boolean
  features: string[]
}

export interface ShopLimitResult {
  allowed: boolean
  currentCount: number
  maxAllowed: number
  planType: PlanType
  message: string
}

export interface SubscriptionInfo {
  id: string
  planType: PlanType
  status: SubStatus
  maxShops: number
  startDate: Date
  endDate: Date | null
}

// ─── PLAN CONFIGURATION ────────────────────────────────────────────────────────

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  STARTER: {
    type: 'STARTER',
    label: 'Starter',
    price: 5000,
    maxShops: 1,
    customDomain: false,
    features: [
      '1 boutique',
      'Produits illimités',
      'Commandes WhatsApp',
      'Statistiques de base',
      'Thèmes gratuits',
    ],
  },
  PRO: {
    type: 'PRO',
    label: 'Pro',
    price: 8000,
    maxShops: 3,
    customDomain: false,
    features: [
      'Jusqu\'à 3 boutiques',
      'Produits illimités',
      'Commandes WhatsApp',
      'Statistiques avancées',
      'Tous les thèmes',
      'Live TikTok',
      'Outils IA',
    ],
  },
  BUSINESS: {
    type: 'BUSINESS',
    label: 'Business',
    price: 20000,
    maxShops: 10,
    customDomain: true,
    features: [
      'Jusqu\'à 10 boutiques',
      'Produits illimités',
      'Commandes WhatsApp',
      'Statistiques avancées',
      'Tous les thèmes',
      'Live TikTok',
      'Outils IA',
      'Domaine personnalisé',
      'Support prioritaire',
    ],
  },
}

// ─── ROLE HIERARCHY ────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<Role, number> = {
  SELLER: 0,
  RESELLER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

/**
 * Check if a user's role meets the minimum required level.
 */
export function hasMinimumRole(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? -1
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999
  return userLevel >= requiredLevel
}

/**
 * Check if a user has one of the allowed roles.
 */
export function hasRole(userRole: string, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole as Role)
}

// ─── SUBSCRIPTION HELPERS ──────────────────────────────────────────────────────

/**
 * Get the subscription info for a user. Returns null if no subscription exists.
 */
export async function getSubscription(userId: string): Promise<SubscriptionInfo | null> {
  const sub = await db.subscription.findUnique({
    where: { userId },
  })

  if (!sub) return null

  return {
    id: sub.id,
    planType: sub.planType,
    status: sub.status,
    maxShops: sub.maxShops,
    startDate: sub.startDate,
    endDate: sub.endDate,
  }
}

/**
 * Get or create a default subscription for a user.
 * New users get a STARTER plan in TRIAL status.
 */
export async function getOrCreateSubscription(userId: string): Promise<SubscriptionInfo> {
  const existing = await db.subscription.findUnique({
    where: { userId },
  })

  if (existing) {
    return {
      id: existing.id,
      planType: existing.planType,
      status: existing.status,
      maxShops: existing.maxShops,
      startDate: existing.startDate,
      endDate: existing.endDate,
    }
  }

  const planConfig = PLAN_CONFIGS.STARTER
  const created = await db.subscription.create({
    data: {
      userId,
      planType: 'STARTER',
      status: 'TRIAL',
      maxShops: planConfig.maxShops,
    },
  })

  return {
    id: created.id,
    planType: created.planType,
    status: created.status,
    maxShops: created.maxShops,
    startDate: created.startDate,
    endDate: created.endDate,
  }
}

/**
 * Check if a user can create a new shop based on their subscription.
 * Returns an object with allowed status and details.
 */
export async function checkShopLimit(userId: string): Promise<ShopLimitResult> {
  const subscription = await getOrCreateSubscription(userId)
  const shopCount = await db.shop.count({
    where: { ownerId: userId },
  })

  const planConfig = PLAN_CONFIGS[subscription.planType]
  const maxAllowed = Math.max(subscription.maxShops, planConfig.maxShops)

  // Check subscription status
  if (subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED' || subscription.status === 'SUSPENDED') {
    return {
      allowed: false,
      currentCount: shopCount,
      maxAllowed,
      planType: subscription.planType,
      message: `Votre abonnement ${subscription.status === 'EXPIRED' ? 'a expiré' : 'est ' + subscription.status.toLowerCase()}. Veuillez le renouveler pour créer de nouvelles boutiques.`,
    }
  }

  if (shopCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount: shopCount,
      maxAllowed,
      planType: subscription.planType,
      message: `Limite atteinte (${shopCount}/${maxAllowed}). Passez au plan ${getNextPlanLabel(subscription.planType)} pour créer plus de boutiques.`,
    }
  }

  return {
    allowed: true,
    currentCount: shopCount,
    maxAllowed,
    planType: subscription.planType,
    message: '',
  }
}

/**
 * Upgrade a user's subscription to a new plan.
 */
export async function upgradeSubscription(
  userId: string,
  newPlan: PlanType,
  endDate?: Date
): Promise<SubscriptionInfo> {
  const planConfig = PLAN_CONFIGS[newPlan]

  const updated = await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planType: newPlan,
      status: 'ACTIVE',
      maxShops: planConfig.maxShops,
      endDate: endDate ?? null,
    },
    update: {
      planType: newPlan,
      status: 'ACTIVE',
      maxShops: planConfig.maxShops,
      endDate: endDate ?? null,
    },
  })

  return {
    id: updated.id,
    planType: updated.planType,
    status: updated.status,
    maxShops: updated.maxShops,
    startDate: updated.startDate,
    endDate: updated.endDate,
  }
}

// ─── RESELLER HELPERS ──────────────────────────────────────────────────────────

/**
 * Get the reseller profile for a user. Returns null if not a reseller.
 */
export async function getResellerProfile(userId: string) {
  return db.reseller.findUnique({
    where: { userId },
  })
}

/**
 * Get all clients (sellers) for a given reseller.
 */
export async function getResellerClients(resellerId: string) {
  return db.user.findMany({
    where: { resellerId },
    include: {
      subscription: true,
      shops: {
        select: { id: true, name: true, slug: true, isActive: true, plan: true },
      },
      _count: {
        select: { shops: true, orders: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Create a new reseller profile for a user.
 */
export async function createResellerProfile(
  userId: string,
  data: { companyName?: string; logoUrl?: string; primaryColor?: string; commission?: number }
) {
  return db.reseller.create({
    data: {
      userId,
      companyName: data.companyName ?? null,
      logoUrl: data.logoUrl ?? null,
      primaryColor: data.primaryColor ?? '#EC4899',
      commission: data.commission ?? 10,
    },
  })
}

/**
 * Update a reseller's white-label settings.
 */
export async function updateResellerProfile(
  userId: string,
  data: { companyName?: string; logoUrl?: string; primaryColor?: string; commission?: number }
) {
  return db.reseller.update({
    where: { userId },
    data,
  })
}

// ─── INTERNAL HELPERS ──────────────────────────────────────────────────────────

function getNextPlanLabel(currentPlan: PlanType): string {
  switch (currentPlan) {
    case 'STARTER': return 'Pro'
    case 'PRO': return 'Business'
    case 'BUSINESS': return 'Business (max)'
  }
}

/**
 * Get consolidated stats across all shops for a user.
 */
export async function getConsolidatedStats(userId: string) {
  const shops = await db.shop.findMany({
    where: { ownerId: userId, isActive: true },
    select: { id: true },
  })

  const shopIds = shops.map(s => s.id)

  const [totalProducts, totalOrders, totalVisits, pendingOrders] = await Promise.all([
    db.product.count({
      where: { shopId: { in: shopIds }, isAvailable: true },
    }),
    db.order.count({
      where: { shopId: { in: shopIds } },
    }),
    db.visit.count({
      where: { shopId: { in: shopIds } },
    }),
    db.order.count({
      where: { shopId: { in: shopIds }, status: 'PENDING' },
    }),
  ])

  return {
    shopCount: shops.length,
    totalProducts,
    totalOrders,
    totalVisits,
    pendingOrders,
    shops,
  }
}