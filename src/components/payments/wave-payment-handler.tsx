'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, Smartphone, RotateCcw } from 'lucide-react'
import { formatFCFA } from '@/lib/wave'

interface PaymentStatusResponse {
  id: string
  status: string
  amount: number
  currency: string
  wavePaymentId?: string
  checkoutUrl?: string
  type: string
  expiresAt?: string
  paidAt?: string
  waveErrorMessage?: string | null
  order?: { id: string; status: string } | null
  subscription?: { id: string; status: string; planType: string } | null
}

interface WavePaymentHandlerProps {
  paymentId: string
  amount: number
  description: string
  checkoutUrl?: string
  type: 'SUBSCRIPTION' | 'ORDER'
  onSuccess?: (data: PaymentStatusResponse) => void
  onError?: (data: PaymentStatusResponse) => void
  onClose?: () => void
  displayAmount?: number
}

const POLL_INTERVAL = 4000
const MAX_POLL_ATTEMPTS = 150

const STATUS_CONFIG: Record<string, {
  icon: typeof CheckCircle2
  color: string
  bgColor: string
  title: string
  description: string
}> = {
  PENDING: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    title: 'En attente de paiement',
    description: 'Confirmez le paiement sur votre téléphone Wave',
  },
  PROCESSING: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    title: 'Paiement en cours',
    description: 'Le paiement est en cours de traitement...',
  },
  SUCCEEDED: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    title: 'Paiement réussi !',
    description: 'Votre paiement a été confirmé avec succès.',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    title: 'Paiement échoué',
    description: 'Le paiement n\'a pas pu aboutir.',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    title: 'Paiement annulé',
    description: 'Le paiement a été annulé.',
  },
  EXPIRED: {
    icon: XCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    title: 'Paiement expiré',
    description: 'Le délai de paiement est écoulé.',
  },
}

export function WavePaymentHandler({
  paymentId,
  amount,
  description,
  checkoutUrl,
  type,
  onSuccess,
  onError,
  onClose,
  displayAmount,
}: WavePaymentHandlerProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const successCalled = useRef(false)
  const errorCalled = useRef(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payments/wave/${paymentId}/status`)
      const data: PaymentStatusResponse = await res.json()

      if (res.ok) {
        setPaymentStatus(data)

        const isFinal = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(data.status)

        if (isFinal) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          if (data.status === 'SUCCEEDED' && !successCalled.current) {
            successCalled.current = true
            onSuccess?.(data)
          } else if (!successCalled.current && !errorCalled.current) {
            errorCalled.current = true
            onError?.(data)
          }
        }
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [paymentId, onSuccess, onError])

  const pollCountRef = useRef(0)

  useEffect(() => {
    // Initial fetch with microtask delay to avoid sync setState in effect
    const initialTimeout = setTimeout(fetchStatus, 0)
    intervalRef.current = setInterval(() => {
      pollCountRef.current += 1
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      fetchStatus()
    }, POLL_INTERVAL)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchStatus])

  const currentStatus = paymentStatus?.status || 'PENDING'
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING
  const StatusIcon = config.icon
  const isFinal = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(currentStatus)
  const isSuccess = currentStatus === 'SUCCEEDED'
  const amountDisplay = displayAmount ?? amount ?? paymentStatus?.amount ?? 0

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Paiement via Wave</p>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold">{formatFCFA(amountDisplay)}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className={`${config.bgColor} rounded-xl p-4 text-center`}>
          <StatusIcon className={`h-8 w-8 mx-auto mb-2 ${config.color} ${currentStatus === 'PROCESSING' ? 'animate-spin' : ''}`} />
          <p className={`font-semibold ${config.color}`}>{config.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          {paymentStatus?.waveErrorMessage && currentStatus === 'FAILED' && (
            <p className="text-xs text-red-500 mt-2">{paymentStatus.waveErrorMessage}</p>
          )}
        </div>

        {!isFinal && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Smartphone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">
                Ouvrez votre application Wave et confirmez le paiement
              </p>
            </div>
            {checkoutUrl && (
              <Button asChild className="w-full" variant="outline">
                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir la page de paiement Wave
                </a>
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              Le paiement expire automatiquement dans 30 minutes
            </p>
          </div>
        )}

        {isFinal && (
          <div className="space-y-3">
            {isSuccess && type === 'SUBSCRIPTION' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm text-emerald-800 font-medium">Votre abonnement est maintenant actif !</p>
                <p className="text-xs text-emerald-600 mt-1">Toutes les fonctionnalités de votre plan sont débloquées.</p>
              </div>
            )}
            {isSuccess && type === 'ORDER' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm text-emerald-800 font-medium">Commande confirmée !</p>
                <p className="text-xs text-emerald-600 mt-1">Le marchand a été notifié et préparera votre commande.</p>
              </div>
            )}
            {!isSuccess && (
              <Button variant="outline" className="w-full" onClick={onClose}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réessayer avec un autre moyen
              </Button>
            )}
            {isSuccess && onClose && (
              <Button variant="outline" className="w-full" onClick={onClose}>Continuer</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Hook pour créer un paiement Wave.
 */
export function useWavePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<{
    paymentId: string
    wavePaymentId?: string
    checkoutUrl?: string
    status: string
    amount: number
  } | null>(null)

  const createPayment = useCallback(async (params: {
    type: 'SUBSCRIPTION' | 'ORDER'
    planType?: string
    orderId?: string
    shopId?: string
    clientPhoneNumber?: string
  }) => {
    setLoading(true)
    setError(null)
    setPaymentResult(null)

    try {
      const res = await fetch('/api/payments/wave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création du paiement')
        return null
      }

      setPaymentResult(data)
      return data
    } catch {
      setError('Erreur de connexion au serveur')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { createPayment, loading, error, paymentResult }
}