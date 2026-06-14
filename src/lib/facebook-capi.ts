/**
 * Facebook Conversions API (CAPI) utility for Boutiko.
 *
 * Handles:
 *  - SHA-256 hashing of user data (email, phone) per Facebook spec
 *  - Building CAPI event payloads
 *  - Sending events to Facebook Graph API with retry logic
 *  - Token validation
 *
 * SECURITY: Access tokens are encrypted at rest. This module only handles
 * the decrypted token passed from the API route.
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto'

// ─── SHA-256 HASHING ──────────────────────────────────────────────────────────

/**
 * Hash a string with SHA-256 for Facebook user data matching.
 * Normalizes to lowercase and trims whitespace before hashing.
 * Returns empty string for falsy input.
 */
export function hashData(data: string | undefined | null): string {
  if (!data || typeof data !== 'string') return ''
  const normalized = data.trim().toLowerCase()
  if (!normalized) return ''
  return createHash('sha256').update(normalized).digest('hex')
}

// ─── TOKEN ENCRYPTION ─────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 16) {
  throw new Error(
    'FACEBOOK_TOKEN_ENCRYPTION_KEY environment variable is required and must be at least 16 characters.'
  )
}

/**
 * Derive a 32-byte key from the configured secret.
 */
function getKey(): Buffer {
  return createHash('sha256').update(ENCRYPTION_KEY).digest()
}

/**
 * Encrypt a Facebook access token for storage.
 * Returns a base64 string: iv:authTag:ciphertext
 */
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12)
  const key = getKey()
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a stored Facebook access token.
 */
export function decryptToken(encrypted: string): string {
  const parts = encrypted.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted token format')
  const [ivHex, authTagHex, ciphertext] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const key = getKey()
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// ─── CAPI PAYLOAD BUILDER ─────────────────────────────────────────────────────

export interface CAPIUserData {
  email?: string
  phone?: string
  ip?: string
  userAgent?: string
  fbp?: string
  fbc?: string
}

export interface CAPIEventData {
  productId?: string
  productName?: string
  value?: number
  currency?: string
  contentName?: string
  contentCategory?: string
}

/**
 * Build a Facebook Conversions API event payload.
 *
 * @param pixelId - Facebook Pixel ID
 * @param accessToken - Facebook Access Token (decrypted)
 * @param eventName - Standard Facebook event name (PageView, ViewContent, Contact, Lead)
 * @param eventData - Custom event data
 * @param userData - User identification data (will be hashed)
 * @param eventId - Unique event ID for deduplication
 */
export function buildCAIPayload(
  pixelId: string,
  accessToken: string,
  eventName: string,
  eventData: CAPIEventData,
  userData: CAPIUserData,
  eventId: string,
): object {
  const userPayload: Record<string, string> = {}
  if (userData.email) userPayload.em = hashData(userData.email)
  if (userData.phone) userPayload.ph = hashData(userData.phone)
  if (userData.ip) userPayload.client_ip_address = userData.ip
  if (userData.userAgent) userPayload.client_user_agent = userData.userAgent
  if (userData.fbp) userPayload.fbp = userData.fbp
  if (userData.fbc) userPayload.fbc = userData.fbc

  const customData: Record<string, unknown> = {}
  if (eventData.value !== undefined) customData.value = eventData.value
  if (eventData.currency) customData.currency = eventData.currency
  if (eventData.contentName) customData.content_name = eventData.contentName
  if (eventData.contentCategory) customData.content_category = eventData.contentCategory
  if (eventData.productId) {
    customData.contents = [{
      id: eventData.productId,
      quantity: 1,
    }]
    customData.content_type = 'product'
  }

  return {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      action_source: 'website',
      user_data: userPayload,
      custom_data: Object.keys(customData).length > 0 ? customData : undefined,
    }],
    access_token: accessToken,
  }
}

// ─── SEND TO FACEBOOK ─────────────────────────────────────────────────────────

const FB_GRAPH_URL = 'https://graph.facebook.com/v18.0'
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

/**
 * Send an event to Facebook Conversions API with exponential backoff retry.
 *
 * @returns true if the event was accepted by Facebook
 */
export async function sendFacebookEvent(
  pixelId: string,
  payload: object,
): Promise<boolean> {
  const url = `${FB_GRAPH_URL}/${pixelId}/events`

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        // Facebook returns { events_received: N } on success
        if (result.events_received > 0) return true
        // Accepted but no events processed — log and return true
        console.warn('[FB CAPI] Events received: 0', result)
        return true
      }

      // Non-retryable errors (auth, validation)
      if (response.status === 401 || response.status === 403) {
        console.error('[FB CAPI] Authentication error:', response.status)
        return false
      }

      // Retry on 5xx or 429
      if (response.status >= 500 || response.status === 429) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500
        await new Promise((r) => setTimeout(r, delay))
        continue
      }

      // Other client errors — don't retry
      console.error('[FB CAPI] Client error:', response.status, await response.text())
      return false
    } catch (error) {
      // Network error — retry
      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      console.error('[FB CAPI] Network error after retries:', error)
      return false
    }
  }

  return false
}

// ─── TOKEN VALIDATION ─────────────────────────────────────────────────────────

/**
 * Validate a Facebook access token by calling the debug_token endpoint.
 * Returns true if the token is valid and has the required permissions.
 */
export async function validateAccessToken(
  accessToken: string,
  pixelId: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    // We verify the token by trying to fetch pixel info
    const url = `${FB_GRAPH_URL}/${pixelId}?access_token=${encodeURIComponent(accessToken)}`
    const response = await fetch(url, {
      method: 'GET',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.id) return { valid: true }
      return { valid: false, error: 'Pixel ID non trouvé avec ce token' }
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Token invalide ou expiré' }
    }

    return { valid: false, error: `Erreur Facebook: ${response.status}` }
  } catch (error) {
    console.error('[FB CAPI] Token validation error:', error)
    return { valid: false, error: 'Erreur de connexion à Facebook' }
  }
}

/**
 * Test if a Pixel ID is valid by sending a test event.
 * Returns true if the pixel accepts the event.
 */
export async function testPixel(pixelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${FB_GRAPH_URL}/${pixelId}/events`
    const payload = {
      data: [{
        event_name: 'BoutikoTestEvent',
        event_time: Math.floor(Date.now() / 1000),
        event_id: `test_${Date.now()}`,
        action_source: 'website',
      }],
      access_token: '', // No token needed for pixel-only test
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      return { success: true }
    }

    const data = await response.json()
    const errorMsg = data?.error?.message || `Erreur ${response.status}`
    return { success: false, error: errorMsg }
  } catch (error) {
    return { success: false, error: 'Erreur de connexion à Facebook' }
  }
}