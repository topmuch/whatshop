/**
 * In-memory rate limiter for API routes.
 * Uses a simple sliding window counter — sufficient for single-instance deployments.
 *
 * For multi-instance or production with high traffic, replace with Redis-based
 * rate limiting (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 60 seconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null
function ensureCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key)
    }
  }, 60_000)
}

export interface RateLimitOptions {
  /** Max requests in the time window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Custom identifier (defaults to IP) */
  identifier?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given identifier (usually IP address).
 * Returns { success, remaining, resetAt }.
 */
export function rateLimit(ip: string, options: RateLimitOptions): RateLimitResult {
  ensureCleanup()

  const key = `${ip}:${options.maxRequests}:${options.windowSeconds}`
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000

  let entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    entry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { success: true, remaining: options.maxRequests - 1, resetAt: entry.resetAt }
  }

  entry.count++

  if (entry.count > options.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { success: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract client IP from NextRequest.
 * Prefers X-Real-IP (set by trusted reverse proxy, not client-spoofable),
 * then falls back to the rightmost X-Forwarded-For entry (closest to proxy).
 */
export function getClientIp(request: Request): string {
  // Prefer X-Real-IP — set by our trusted reverse proxy (Caddy)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // Fallback: X-Forwarded-For — use the RIGHTMOST entry (set by our proxy),
  // not the leftmost (which is client-spoofable)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const entries = forwarded.split(',').map(s => s.trim())
    const trustedEntry = entries[entries.length - 1]
    if (trustedEntry) return trustedEntry
  }

  return 'unknown'
}

/**
 * Basic CSRF protection — verify the Origin header matches expected hosts.
 * For same-origin requests (browser), this is sufficient with SameSite=Lax cookies.
 *
 * Returns true if the request is safe (same-origin or missing origin for GET),
 * false if it looks like a cross-origin forgery.
 */
export function isCsrfSafe(request: Request): boolean {
  const method = request.method.toUpperCase()
  // Only check mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // If both origin and referer are missing, reject mutations from non-browser clients
  // (allow GET/HEAD/OPTIONS — handled above — but block POST/PUT/DELETE without headers)
  if (!origin && !referer) return false

  // Check origin against allowed hosts
  const allowedHosts = getAllowedHosts()
  if (origin) {
    try {
      const url = new URL(origin)
      if (allowedHosts.some((h) => h === url.hostname || url.hostname.endsWith('.' + h))) {
        return true
      }
    } catch {
      return false
    }
  }

  // Check referer as fallback
  if (referer) {
    try {
      const url = new URL(referer)
      if (allowedHosts.some((h) => h === url.hostname || url.hostname.endsWith('.' + h))) {
        return true
      }
    } catch {
      return false
    }
  }

  return false
}

function getAllowedHosts(): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'boutiko.pro'
  const hosts = [baseUrl, 'localhost']

  // Also allow any configured custom domains pattern
  const customDomain = process.env.CUSTOM_DOMAIN_BASE || ''
  if (customDomain) hosts.push(customDomain)

  return hosts
}

// ─── Pre-configured rate limit presets ───

export const RATE_LIMITS = {
  /** Login: 10 attempts per minute */
  login: { maxRequests: 10, windowSeconds: 60 },
  /** Register: 5 per minute */
  register: { maxRequests: 5, windowSeconds: 60 },
  /** Seed: 3 per hour */
  seed: { maxRequests: 3, windowSeconds: 3600 },
  /** Upload: 10 per minute */
  upload: { maxRequests: 10, windowSeconds: 60 },
  /** AI generation: 5 per minute */
  ai: { maxRequests: 5, windowSeconds: 60 },
  /** Visit tracking: 30 per minute */
  visit: { maxRequests: 30, windowSeconds: 60 },
  /** General API: 60 per minute */
  default: { maxRequests: 60, windowSeconds: 60 },
  /** Shop live session: 30 per minute */
  shopLive: { maxRequests: 30, windowSeconds: 60 },
  /** Shop leads (form submission): 5 per minute */
  shopLeads: { maxRequests: 5, windowSeconds: 60 },
  /** Shop products: 60 per minute */
  shopProducts: { maxRequests: 60, windowSeconds: 60 },
  /** Shop logos listing: 30 per minute */
  shopLogos: { maxRequests: 30, windowSeconds: 60 },
} as const
