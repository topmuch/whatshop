'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  customerSchema,
  formatZodErrors,
  type CustomerInput,
} from '@/lib/order-schemas'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, ArrowLeft, ShoppingBag, MapPin, User, Phone, Home, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface CheckoutFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type FormStep = 'form' | 'success'

export function CheckoutForm({ open, onOpenChange, onSuccess }: CheckoutFormProps) {
  const {
    cart,
    publicShop,
    selectedShippingZone,
    clearCart,
    getCartTotal,
  } = useAppStore()

  const [step, setStep] = useState<FormStep>('form')
  const [submitting, submittingFinish, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const subtotal = getCartTotal()
  const shippingFee = selectedShippingZone?.price ?? 0
  const total = subtotal + shippingFee
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
    },
  })

  // Reset form step when sheet opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Delay reset to allow close animation
      setTimeout(() => {
        setStep('form')
        setServerError(null)
        setOrderId(null)
      }, 300)
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = async (customer: CustomerInput) => {
    if (!publicShop) return
    setSubmitting(true)
    setServerError(null)

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      const payload = {
        shopId: publicShop.id,
        items,
        subtotal,
        total,
        customer,
        ...(selectedShippingZone
          ? {
              shippingZoneId: selectedShippingZone.id,
              shippingZoneName: selectedShippingZone.name,
              shippingFee,
            }
          : {}),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && data.details) {
          // Zod field errors from server
          const msgs = Object.values(data.details).join('. ')
          setServerError(msgs || data.error)
        } else {
          setServerError(data.error || 'Erreur lors de la commande')
        }
        return
      }

      // Success!
      setOrderId(data.id)
      setStep('success')
      clearCart()
      reset()
      onSuccess?.()

      toast.success('Commande confirmée !')
    } catch {
      setServerError('Erreur de connexion. Vérifiez votre réseau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        {step === 'success' ? (
          /* ═══ SUCCESS STATE ═══ */
          <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Commande confirmée !</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Votre commande a été enregistrée avec succès. Le vendeur a été notifié et vous contactera bientôt.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500">Référence</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{orderId}</p>
              </div>
            )}
            <Separator className="w-full max-w-xs" />
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continuer mes achats
            </Button>
          </div>
        ) : (
          /* ═══ CHECKOUT FORM ═══ */
          <>
            {/* Header */}
            <div className="border-b px-6 py-4">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </span>
                  Finaliser la commande
                </SheetTitle>
              </SheetHeader>
            </div>

            {/* Order Summary Bar */}
            <div className="px-6 py-3 bg-muted/50 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {itemCount} article{itemCount > 1 ? 's' : ''}
                </span>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {selectedShippingZone
                      ? `Sous-total + livraison (${selectedShippingZone.name})`
                      : 'Total'}
                  </p>
                  <p className="text-lg font-bold">{formatPrice(total)}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-5">
                  {/* Server Error */}
                  {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                      {serverError}
                    </div>
                  )}

                  {/* ─── Personal Info ─── */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="checkout-firstName" className="text-sm">
                          Prénom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="checkout-firstName"
                          placeholder="Amadou"
                          autoComplete="given-name"
                          {...register('firstName')}
                          aria-invalid={!!errors.firstName}
                        />
                        {errors.firstName && (
                          <p className="text-xs text-red-500">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="checkout-lastName" className="text-sm">
                          Nom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="checkout-lastName"
                          placeholder="Diallo"
                          autoComplete="family-name"
                          {...register('lastName')}
                          aria-invalid={!!errors.lastName}
                        />
                        {errors.lastName && (
                          <p className="text-xs text-red-500">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── Contact ─── */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact
                    </h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-phone" className="text-sm">
                        Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="checkout-phone"
                        type="tel"
                        placeholder="+221 77 123 45 67"
                        autoComplete="tel"
                        {...register('phone')}
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* ─── Delivery Address ─── */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Adresse de livraison
                    </h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-address" className="text-sm">
                        Adresse <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="checkout-address"
                        placeholder="Quartier Médina, Rue 10"
                        autoComplete="street-address"
                        {...register('address')}
                        aria-invalid={!!errors.address}
                      />
                      {errors.address && (
                        <p className="text-xs text-red-500">{errors.address.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-city" className="text-sm">
                        Ville <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="checkout-city"
                        placeholder="Dakar"
                        autoComplete="address-level2"
                        {...register('city')}
                        aria-invalid={!!errors.city}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500">{errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  {/* ─── Price Breakdown ─── */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {selectedShippingZone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Livraison ({selectedShippingZone.name})
                        </span>
                        <span>{formatPrice(shippingFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Submit Button */}
              <div className="border-t px-6 py-4 space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 text-base font-semibold"
                  disabled={submitting || cart.length === 0}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {submitting ? 'Traitement en cours...' : `Confirmer — ${formatPrice(total)}`}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => handleOpenChange(false)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour au panier
                </Button>
              </div>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}