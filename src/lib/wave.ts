// ─── Wave Payment Provider (SERVER ONLY) ──────────────────────────────────
// Ce fichier utilise 'crypto' (Node-only). Ne JAMAIS importer dans un
// composant client. Pour le client, utiliser '@/lib/wave-shared'.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac } from 'crypto'
import type { PaymentStatus } from './wave-shared'

export type { PaymentStatus, PaymentType } from './wave-shared'
export type { WaveCreatePaymentInput, WaveCreatePaymentResponse, WavePaymentStatus, WaveWebhookPayload } from './wave-shared'
export { formatFCFA } from './wave-shared'

// ─── Config ──────────────────────────────────────────────────────────────────

function getWaveBaseUrl(): string {
  return process.env.WAVE_API_BASE_URL || 'https://api.wave.com/v1'
}

/** Récupère la clé API Wave de Boutiko (env ou SaaSConfig en BDD) */
export function getBoutikoWaveApiKey(): string | null {
  return process.env.WAVE_API_KEY || null
}

export function getBoutikoWaveWebhookSecret(): string | null {
  return process.env.WAVE_WEBHOOK_SECRET || null
}

// ─── Wave API Client ──────────────────────────────────────────────────────────

/**
 * Crée un paiement via l'API Wave Business.
 * - Si merchantWaveApiKey fourni → paiement vers le compte du marchand
 * - Sinon → paiement vers le compte Wave de Boutiko
 */
export async function createWavePayment(
  input: { amount: number; currency?: string; description: string; clientPhoneNumber?: string; merchantWavePhone?: string; merchantWaveApiKey?: string }
): Promise<{ success: boolean; paymentId?: string; checkoutUrl?: string; error?: string; error_code?: string }> {
  const apiKey = input.merchantWaveApiKey || getBoutikoWaveApiKey()
  if (!apiKey) {
    return { success: false, error: 'Aucune clé API Wave configurée', error_code: 'NO_API_KEY' }
  }

  const baseUrl = getWaveBaseUrl()

  try {
    const body: Record<string, unknown> = {
      amount: Math.round(input.amount),
      currency: input.currency || 'XOF',
      description: input.description,
      client_reference: `boutiko_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    }

    if (input.clientPhoneNumber) {
      body.customer_phone_number = input.clientPhoneNumber
    }

    const response = await fetch(`${baseUrl}/checkout/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Wave] Create payment error:', response.status, errorData)
      return {
        success: false,
        error: errorData.message || errorData.error || `Erreur API Wave (${response.status})`,
        error_code: errorData.error_code || String(response.status),
      }
    }

    const data = await response.json()

    return {
      success: true,
      paymentId: data.id,
      checkoutUrl: data.checkout_url || data.payment_link_url,
    }
  } catch (error) {
    console.error('[Wave] Create payment exception:', error)
    return {
      success: false,
      error: 'Erreur de connexion au service Wave',
      error_code: 'CONNECTION_ERROR',
    }
  }
}

/**
 * Vérifie le statut d'un paiement Wave.
 */
export async function checkWavePaymentStatus(
  wavePaymentId: string,
  apiKey?: string
): Promise<{ id: string; status: string; amount: number; currency: string; paid_at?: string; error_code?: string; error_message?: string } | null> {
  const key = apiKey || getBoutikoWaveApiKey()
  if (!key) {
    console.error('[Wave] No API key for status check')
    return null
  }

  const baseUrl = getWaveBaseUrl()

  try {
    const response = await fetch(`${baseUrl}/checkout/payments/${wavePaymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Wave] Status check error:', response.status)
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      paid_at: data.paid_at,
      error_code: data.error_code,
      error_message: data.error_message,
    }
  } catch (error) {
    console.error('[Wave] Status check exception:', error)
    return null
  }
}

/**
 * Vérifie la signature d'un webhook Wave (HMAC-SHA256).
 */
export function verifyWaveWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex')
    const parts = signature.split(',')
    const v1Part = parts.find((p: string) => p.startsWith('v1='))
    if (!v1Part) return false
    const receivedSig = v1Part.slice(3)
    return timingSafeEqual(receivedSig, expectedSig)
  } catch {
    console.error('[Wave] Webhook verification failed')
    return false
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Mappe le statut Wave vers le statut interne Payment.
 */
export function mapWaveStatus(waveStatus: string): PaymentStatus {
  switch (waveStatus) {
    case 'succeeded':
    case 'completed':
    case 'paid':
      return 'SUCCEEDED'
    case 'pending':
    case 'created':
    case 'waiting':
      return 'PENDING'
    case 'processing':
      return 'PROCESSING'
    case 'failed':
    case 'rejected':
      return 'FAILED'
    case 'cancelled':
    case 'canceled':
    case 'expired':
      return waveStatus === 'expired' ? 'EXPIRED' : 'CANCELLED'
    default:
      return 'PENDING'
  }
}

