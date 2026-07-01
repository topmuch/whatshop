'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Smartphone, Loader2 } from 'lucide-react'
import { useWavePayment, WavePaymentHandler } from '@/components/payments/wave-payment-handler'
import { formatFCFA } from '@/lib/wave'

interface WavePayButtonProps {
  type: 'SUBSCRIPTION' | 'ORDER'
  planType?: string
  orderId?: string
  shopId?: string
  clientPhoneNumber?: string
  amount: number
  description: string
  onSuccess?: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  buttonText?: string
}

export function WavePayButton({
  type,
  planType,
  orderId,
  shopId,
  clientPhoneNumber,
  amount,
  description,
  onSuccess,
  variant = 'default',
  size = 'default',
  className = '',
  buttonText,
}: WavePayButtonProps) {
  const [showHandler, setShowHandler] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | undefined>()
  const { createPayment, loading, error } = useWavePayment()

  const handleClick = async () => {
    const result = await createPayment({
      type,
      planType,
      orderId,
      shopId,
      clientPhoneNumber,
    })

    if (result) {
      setPaymentId(result.paymentId)
      setCheckoutUrl(result.checkoutUrl)
      setShowHandler(true)
    }
  }

  const handleClose = () => {
    setShowHandler(false)
    setPaymentId(null)
    setCheckoutUrl(undefined)
  }

  if (showHandler && paymentId) {
    return (
      <WavePaymentHandler
        paymentId={paymentId}
        amount={amount}
        description={description}
        checkoutUrl={checkoutUrl}
        type={type}
        onSuccess={() => {
          onSuccess?.()
          handleClose()
        }}
        onError={() => {}}
        onClose={handleClose}
      />
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={loading}
        variant={variant}
        size={size}
        className={`bg-emerald-500 hover:bg-emerald-600 text-white ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Smartphone className="h-4 w-4 mr-2" />
        )}
        {buttonText || `Payer ${formatFCFA(amount)} via Wave`}
      </Button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}