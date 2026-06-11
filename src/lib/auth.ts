import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

// ─── TYPES ─────────────────────────────────────────────────────────────────────

/** Minimal shop shape returned from DB (used in auth responses). */
export interface AuthShop {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  banner?: string | null
  whatsapp: string
  address?: string | null
  phone?: string | null
  plan: string
  sector?: string | null
  template: string
  isActive: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  coverImageUrl?: string | null
  customDomain?: string | null
  customDomainStatus?: string | null
  subscriptionStatus?: string | null
  subscriptionEndDate?: string | null
  heroImages?: string
  promoBanners?: string
  brands?: string
  primaryColor?: string
  secondaryColor?: string
  heroTitle?: string
  heroSubtitle?: string
  heroTagline?: string
  heroImageUrl?: string
  productsTitle?: string
  productsTagline?: string
  categoriesTitle?: string
  categoriesTagline?: string
  testimonialsTitle?: string
  testimonialsTagline?: string
  trustBadges?: string
  footerLinks?: string
}

/** User type returned from auth functions — includes `shops` array + `shop` (first/primary). */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  shops: AuthShop[]
  shop: AuthShop | null   // backward compat: primary shop (shops[0])
}

// ─── PASSWORD UTILITIES ───────────────────────────────────────────────────────

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

/**
 * Check if a password is stored as plaintext (legacy) vs bcrypt hash.
 * bcrypt hashes always start with $2b$ or $2a$.
 */
export function isHashed(password: string): boolean {
  return password.startsWith('$2b$') || password.startsWith('$2a$')
}

// ─── AUTHENTICATION ────────────────────────────────────────────────────────────

/**
 * Authenticate a user by email and plain password.
 * Returns the user object (with shops array) on success, null on failure.
 * Also migrates plaintext passwords to bcrypt hashes on successful login.
 */
export async function authenticateUser(
  email: string,
  plainPassword: string
): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: { shops: true },
  })

  if (!user) return null

  // Check password
  let isMatch: boolean
  if (isHashed(user.password)) {
    isMatch = await verifyPassword(plainPassword, user.password)
  } else {
    // Legacy plain-text password — check directly, then migrate
    isMatch = user.password === plainPassword
    if (isMatch) {
      const hashed = await hashPassword(plainPassword)
      await db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      })
    }
  }

  if (!isMatch) return null

  return mapUserWithShops(user)
}

/**
 * Get the authenticated user from the session cookie.
 * Returns the user object (with shops array + primary shop) on success, null on failure.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const userEmail = request.cookies.get('boutiko-user')?.value
  if (!userEmail) return null

  const user = await db.user.findUnique({
    where: { email: userEmail },
    include: { shops: true },
  })

  if (!user) return null

  return mapUserWithShops(user)
}

/**
 * Require authentication — returns user or a 401 response.
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }
  return { user, response: null }
}

/**
 * Require a specific shop ownership — returns user+shop or error response.
 * Uses the primary shop (shops[0]) unless a specific shopId is provided.
 */
export async function requireShopOwner(request: NextRequest, shopId?: string) {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }
  if (!user.shop) {
    return { user: null, response: NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 }) }
  }
  if (shopId && user.shop.id !== shopId) {
    // Also check if the requested shopId belongs to this user (multi-shop)
    const ownedShop = user.shops.find(s => s.id === shopId)
    if (!ownedShop) {
      return { user: null, response: NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 }) }
    }
    return { user, shop: ownedShop, response: null }
  }
  return { user, shop: user.shop, response: null }
}

// ─── SLUG VALIDATION ──────────────────────────────────────────────────────────

/**
 * Validate a shop slug format.
 * Must be lowercase alphanumeric with hyphens, no reserved words, 3-50 chars.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) return false
  const reserved = [
    'api', 'admin', 'dashboard', 'login', 'register', 'onboarding',
    'pricing', 'contact', 'about', 'privacy', 'terms', 'faq', 'assets',
    'static', 'images', 'uploads', '_next', 'favicon', 'robots', 'sitemap',
    'shop', 'shops', 'order', 'orders', 'product', 'products', 'category',
    'categories', 'settings', 'seed', 'live', 'support', 'auth', 'ai',
    'reseller', 'revendeur',
  ]
  return !reserved.includes(slug.toLowerCase())
}

// ─── COOKIE MANAGEMENT ────────────────────────────────────────────────────────

/**
 * Set the session cookie on a response.
 */
export function setSessionCookie(response: NextResponse, email: string) {
  const isSecure = process.env.COOKIE_SECURE === 'true'
  response.cookies.set('boutiko-user', email, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

/**
 * Clear the session cookie.
 */
export function clearSessionCookie(response: NextResponse) {
  const isSecure = process.env.COOKIE_SECURE === 'true'
  response.cookies.set('boutiko-user', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// ─── INTERNAL HELPERS ──────────────────────────────────────────────────────────

/**
 * Map a Prisma user (with shops array) to AuthUser shape with `shop` (primary) computed.
 */
function mapUserWithShops(user: { id: string; email: string; name: string; role: string; shops: unknown[] }): AuthUser {
  const shops = user.shops as AuthShop[]
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    shops,
    shop: shops.length > 0 ? shops[0] : null,
  }
}

/**
 * Map a single shop from Prisma to the AuthShop shape.
 */
export function mapShopToAuthShop(shop: Record<string, unknown>): AuthShop {
  return {
    id: shop.id as string,
    name: shop.name as string,
    slug: shop.slug as string,
    description: (shop.description as string) ?? null,
    logo: (shop.logo as string) ?? null,
    banner: (shop.banner as string) ?? null,
    whatsapp: shop.whatsapp as string,
    address: (shop.address as string) ?? null,
    phone: (shop.phone as string) ?? null,
    plan: shop.plan as string,
    sector: (shop.sector as string) ?? null,
    template: (shop.template as string) ?? 'classic',
    isActive: shop.isActive as boolean,
    seoTitle: (shop.seoTitle as string) ?? null,
    seoDescription: (shop.seoDescription as string) ?? null,
    coverImageUrl: (shop.coverImageUrl as string) ?? null,
    customDomain: (shop.customDomain as string) ?? null,
    customDomainStatus: (shop.customDomainStatus as string) ?? null,
    subscriptionStatus: (shop.subscriptionStatus as string) ?? null,
    subscriptionEndDate: shop.subscriptionEndDate ? new Date(shop.subscriptionEndDate as string).toISOString() : null,
    heroImages: (shop.heroImages as string) ?? '[]',
    promoBanners: (shop.promoBanners as string) ?? '[]',
    brands: (shop.brands as string) ?? '[]',
    primaryColor: (shop.primaryColor as string) ?? '#EC4899',
    secondaryColor: (shop.secondaryColor as string) ?? null,
  }
}