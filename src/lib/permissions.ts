/**
 * permissions.ts — Rôle, abonnement et limites d'accès
 *
 * Ce module centralise toute la logique de vérification des permissions :
 * - Vérification de rôle (SUPER_ADMIN, ADMIN, RESELLER, SELLER)
 * - Vérification des limites d'abonnement (nombre max de boutiques, produits)
 * - Accès aux données d'abonnement d'un utilisateur
 */

import { db } from '@/lib/db'
import { PlanType, SubStatus, Role } from '@prisma/client'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type NewPlanType = 'LIVE' | 'LIVE_PRO' | 'BOUTIQUE_PRO'
export type AnyPlanType = PlanType | NewPlanType

export interface PlanConfig {
  type: PlanType | NewPlanType
  label: string
  price: number          // Prix en FCFA (annuel)
  maxShops: number       // Nombre max de boutiques
  maxProducts: number    // Nombre max de produits (par boutique pour LIVE_PRO)
  customDomain: boolean
  fullDashboard: boolean // true = toutes les features visibles
  features: string[]
}

export interface ShopLimitResult {
  allowed: boolean
  currentCount: number
  maxAllowed: number
  planType: string
  message: string
}

export interface ProductLimitResult {
  allowed: boolean
  currentCount: number
  maxAllowed: number
  message: string
}

export interface SubscriptionInfo {
  id: string
  planType: string
  status: SubStatus
  maxShops: number
  startDate: Date
  endDate: Date | null
}

// ─── PLAN CONFIGURATION ────────────────────────────────────────────────────────

export const NEW_PLAN_CONFIGS: Record<NewPlanType, PlanConfig> = {
  LIVE: {
    type: 'LIVE',
    label: 'Live',
    price: 20000,
    maxShops: 1,
    maxProducts: 20,
    customDomain: false,
    fullDashboard: false,
    features: [
      '1 boutique',
      '20 produits',
      'Live TikTok',
      'Posts Facebook',
      'Commandes WhatsApp',
      '1 thème inclus',
      'Dashboard simplifié',
    ],
  },
  LIVE_PRO: {
    type: 'LIVE_PRO',
    label: 'Live Pro',
    price: 35000,
    maxShops: 2,
    maxProducts: 25, // par boutique
    customDomain: false,
    fullDashboard: false,
    features: [
      '2 boutiques',
      '25 produits / boutique',
      'Live TikTok',
      'Posts Facebook',
      'Commandes WhatsApp',
      '1 thème inclus',
      'Dashboard simplifié',
    ],
  },
  BOUTIQUE_PRO: {
    type: 'BOUTIQUE_PRO',
    label: 'Boutique Pro',
    price: 30000,
    maxShops: 1,
    maxProducts: 40,
    customDomain: true,
    fullDashboard: true,
    features: [
      '1 boutique',
      '40 produits',
      'Toutes les fonctionnalités',
      'Live TikTok',
      'Posts Facebook',
      'Commandes WhatsApp',
      'Tous les thèmes premium',
      'Domaine personnalisé',
      'Statistiques avancées',
      'Outils IA',
      'Dashboard complet',
    ],
  },
}

// Legacy plans — mapped to new system for backward compatibility
export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  STARTER: { ...NEW_PLAN_CONFIGS.LIVE, type: 'STARTER', label: 'Starter', price: 20000, maxProducts: 20, features: ['1 boutique', '20 produits', 'Commandes WhatsApp'] },
  PRO: { ...NEW_PLAN_CONFIGS.BOUTIQUE_PRO, type: 'PRO', label: 'Pro', price: 30000, maxProducts: 40, features: ['1 boutique', '40 produits', 'Toutes les fonctionnalités'] },
  BUSINESS: { ...NEW_PLAN_CONFIGS.BOUTIQUE_PRO, type: 'BUSINESS', label: 'Business', price: 30000, maxProducts: 40, maxShops: 10, features: ['10 boutiques', '40 produits', 'Toutes les fonctionnalités'] },
  LIVE: NEW_PLAN_CONFIGS.LIVE,
  LIVE_PRO: NEW_PLAN_CONFIGS.LIVE_PRO,
  BOUTIQUE_PRO: NEW_PLAN_CONFIGS.BOUTIQUE_PRO,
}

/** Get config for any plan string (handles legacy + new) */
export function getPlanConfig(plan: string): PlanConfig {
  return (PLAN_CONFIGS as Record<string, PlanConfig>)[plan] ?? NEW_PLAN_CONFIGS.LIVE
}

/** Check if a plan is a "simplified dashboard" plan */
export function isSimplifiedPlan(plan: string): boolean {
  const cfg = getPlanConfig(plan)
  return !cfg.fullDashboard
}

// ─── PLAN ORDER (for upgrade checks) ───────────────────────────────────────────

const PLAN_ORDER: Record<string, number> = {
  LIVE: 0,
  LIVE_PRO: 1,
  BOUTIQUE_PRO: 2,
  STARTER: 0, // legacy → maps to LIVE
  PRO: 2,      // legacy → maps to BOUTIQUE_PRO
  BUSINESS: 3, // legacy
}

export function isPlanUpgrade(currentPlan: string, newPlan: string): boolean {
  return (PLAN_ORDER[newPlan] ?? 0) > (PLAN_ORDER[currentPlan] ?? 0)
}

export function getNextPlans(currentPlan: string): PlanConfig[] {
  const currentLevel = PLAN_ORDER[currentPlan] ?? 0
  return Object.values(NEW_PLAN_CONFIGS).filter(p => (PLAN_ORDER[p.type] ?? 0) > currentLevel)
}

// ─── ROLE HIERARCHY ────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<Role, number> = {
  SELLER: 0,
  RESELLER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

export function hasMinimumRole(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? -1
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999
  return userLevel >= requiredLevel
}

export function hasRole(userRole: string, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole as Role)
}

// ─── SUBSCRIPTION HELPERS ──────────────────────────────────────────────────────

export async function getSubscription(userId: string): Promise<SubscriptionInfo | null> {
  const sub = await db.subscription.findUnique({ where: { userId } })
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

export async function getOrCreateSubscription(userId: string): Promise<SubscriptionInfo> {
  const existing = await db.subscription.findUnique({ where: { userId } })
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
  const planConfig = NEW_PLAN_CONFIGS.LIVE
  const created = await db.subscription.create({
    data: {
      userId,
      planType: 'LIVE',
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

export async function checkShopLimit(userId: string): Promise<ShopLimitResult> {
  const subscription = await getOrCreateSubscription(userId)
  const shopCount = await db.shop.count({ where: { ownerId: userId } })
  const planConfig = getPlanConfig(subscription.planType)
  const maxAllowed = Math.max(subscription.maxShops, planConfig.maxShops)

  if (subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED' || subscription.status === 'SUSPENDED') {
    return {
      allowed: false,
      currentCount: shopCount,
      maxAllowed,
      planType: subscription.planType,
      message: `Votre abonnement ${subscription.status === 'EXPIRED' ? 'a expiré' : 'est ' + subscription.status.toLowerCase()}. Veuillez le renouveler.`,
    }
  }

  if (shopCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount: shopCount,
      maxAllowed,
      planType: subscription.planType,
      message: `Limite atteinte (${shopCount}/${maxAllowed} boutiques). Passez à un plan supérieur.`,
    }
  }

  return { allowed: true, currentCount: shopCount, maxAllowed, planType: subscription.planType, message: '' }
}

/**
 * Check product limit for a specific shop.
 * For LIVE_PRO: maxProducts per boutique (25)
 * For others: maxProducts total for the shop
 */
export async function checkProductLimit(shopId: string, userId: string): Promise<ProductLimitResult> {
  const subscription = await getOrCreateSubscription(userId)
  const planConfig = getPlanConfig(subscription.planType)
  const currentCount = await db.product.count({ where: { shopId } })
  const maxAllowed = planConfig.maxProducts

  if (currentCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed,
      message: `Limite atteinte (${currentCount}/${maxAllowed} produits). Passez à un plan supérieur pour ajouter plus de produits.`,
    }
  }

  return { allowed: true, currentCount, maxAllowed, message: '' }
}

export async function upgradeSubscription(
  userId: string,
  newPlan: string,
  endDate?: Date
): Promise<SubscriptionInfo> {
  const planConfig = getPlanConfig(newPlan)
  const updated = await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planType: newPlan as PlanType,
      status: 'ACTIVE',
      maxShops: planConfig.maxShops,
      endDate: endDate ?? null,
    },
    update: {
      planType: newPlan as PlanType,
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

export async function getResellerProfile(userId: string) {
  return db.reseller.findUnique({ where: { userId } })
}

export async function getResellerClients(resellerId: string) {
  return db.user.findMany({
    where: { resellerId },
    include: {
      subscription: true,
      shops: { select: { id: true, name: true, slug: true, isActive: true, plan: true } },
      _count: { select: { shops: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

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

export async function updateResellerProfile(
  userId: string,
  data: { companyName?: string; logoUrl?: string; primaryColor?: string; commission?: number }
) {
  return db.reseller.update({ where: { userId }, data })
}

// ─── CONSOLIDATED STATS ────────────────────────────────────────────────────────

export async function getConsolidatedStats(userId: string) {
  const shops = await db.shop.findMany({
    where: { ownerId: userId, isActive: true },
    select: { id: true },
  })
  const shopIds = shops.map(s => s.id)

  const [totalProducts, totalOrders, totalVisits, pendingOrders] = await Promise.all([
    db.product.count({ where: { shopId: { in: shopIds }, isAvailable: true } }),
    db.order.count({ where: { shopId: { in: shopIds } } }),
    db.visit.count({ where: { shopId: { in: shopIds } } }),
    db.order.count({ where: { shopId: { in: shopIds }, status: 'PENDING' } }),
  ])

  return { shopCount: shops.length, totalProducts, totalOrders, totalVisits, pendingOrders, shops }
}