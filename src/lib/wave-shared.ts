// ─── Wave Shared (client-safe) ────────────────────────────────────────────
// Types et utilitaires utilisables côté client ET serveur.
// NE PAS importer 'crypto' ou d'autres modules Node-only ici.

export type PaymentType = 'SUBSCRIPTION' | 'ORDER'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'EXPIRED'

export interface WaveCreatePaymentInput {
  amount: number
  currency?: string
  description: string
  clientPhoneNumber?: string
  merchantWavePhone?: string
  merchantWaveApiKey?: string
}

export interface WaveCreatePaymentResponse {
  success: boolean
  paymentId?: string
  checkoutUrl?: string
  error?: string
  error_code?: string
}

export interface WavePaymentStatus {
  id: string
  status: string
  amount: number
  currency: string
  paid_at?: string
  error_code?: string
  error_message?: string
}

export interface WaveWebhookPayload {
  id: string
  amount: number
  currency: string
  status: string
  client_reference?: string
  paid_at?: string
  error_code?: string
  error_message?: string
  meta?: Record<string, string>
}

/**
 * Formate un montant en FCFA.
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA'
}