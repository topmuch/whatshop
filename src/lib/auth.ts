import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

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

/**
 * Authenticate a user by email and plain password.
 * Returns the user object on success, null on failure.
 * Also migrates plaintext passwords to bcrypt hashes on successful login.
 */
export async function authenticateUser(
  email: string,
  plainPassword: string
) {
  const user = await db.user.findUnique({
    where: { email },
    include: { shop: true },
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
      // Migrate to bcrypt
      const hashed = await hashPassword(plainPassword)
      await db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      })
    }
  }

  if (!isMatch) return null
  return user
}

/**
 * Get the authenticated user from the session cookie.
 * Returns the user object (with shop) on success, null on failure.
 */
export async function getAuthUser(request: NextRequest) {
  const userEmail = request.cookies.get('whatsshop-user')?.value
  if (!userEmail) return null

  const user = await db.user.findUnique({
    where: { email: userEmail },
    include: { shop: true },
  })

  return user
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
    return { user: null, response: NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 }) }
  }
  return { user, response: null }
}

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
  ]
  return !reserved.includes(slug.toLowerCase())
}

/**
 * Set the session cookie on a response.
 */
export function setSessionCookie(response: NextResponse, email: string) {
  // Default to non-secure in production unless explicitly enabled.
  // Set COOKIE_SECURE=true when behind HTTPS (e.g. with a domain + SSL cert).
  const isSecure = process.env.COOKIE_SECURE === 'true'
  response.cookies.set('whatsshop-user', email, {
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
  response.cookies.set('whatsshop-user', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}
