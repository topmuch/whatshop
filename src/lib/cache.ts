/**
 * Simple in-memory cache for server-side data.
 * Uses a Map with TTL-based expiration.
 * Suitable for single-instance deployments (Coolify/Docker).
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

// Cleanup expired entries every 5 minutes
let cleanupTimer: ReturnType<typeof setInterval> | null = null
function ensureCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.expiresAt <= now) store.delete(key)
    }
  }, 5 * 60_000)
}

/**
 * Get a value from cache. Returns null if not found or expired.
 */
export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

/**
 * Set a value in cache with a TTL in seconds.
 */
export function cacheSet(key: string, data: unknown, ttlSeconds: number): void {
  ensureCleanup()
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function cacheInvalidate(keyOrPrefix: string): void {
  if (keyOrPrefix.endsWith('*')) {
    const prefix = keyOrPrefix.slice(0, -1)
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key)
    }
  } else {
    store.delete(keyOrPrefix)
  }
}

/**
 * Get or set a cache value — fetches via `fn` on cache miss.
 */
export async function cacheFetch<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = cacheGet<T>(key)
  if (cached !== null) return cached

  const data = await fn()
  cacheSet(key, data, ttlSeconds)
  return data
}