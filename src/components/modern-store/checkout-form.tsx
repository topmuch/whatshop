'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Truck,
  Wallet,
  Smartphone,
} from 'lucide-react'
import { WavePaymentHandler } from '@/components/payments/wave-payment-handler'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { useAppStore, type ShippingZone } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CheckoutFormProps {
  whatsapp: string
  shopName: string
  shopId: string
  accent: string
  onSuccess?: (order: { id: string }) => void
  onBack?: () => void
}

type PaymentMethod = 'COD' | 'WAVE'
type Step = 'form' | 'wave-payment' | 'success'

/**
 * Formulaire de checkout classique pour le template Modern Store.
 * POST les données vers /api/orders (qui valide via `createOrderSchema`).
 */
export function CheckoutForm({
  shopId,
  shopName,
  accent,
  onSuccess,
  onBack,
}: CheckoutFormProps) {
  const { items, getSubtotal, clearCart } = useCartStore()
  const [step, setStep] = useState<Step>('form')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')

  const shopSlug = useAppStore((s) => s.shopSlug)

  // Fetch shipping zones on mount
  useEffect(() => {
    if (!shopSlug) return
    let cancelled = false
    async function fetchZones() {
      try {
        const res = await fetch(`/api/shops/${shopSlug}/public-shipping-zones`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setShippingZones(data.zones ?? [])
        }
      } catch {
        // Shipping zones are optional
      } finally {
        if (!cancelled) setZonesLoading(false)
      }
    }
    fetchZones()
    return () => {
      cancelled = true
    }
  }, [shopSlug])

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [wavePaymentId, setWavePaymentId] = useState<string | null>(null)
  const [waveCheckoutUrl, setWaveCheckoutUrl] = useState<string | undefined>()

  const subtotal = getSubtotal()
  const total = subtotal + (deliveryFee || 0)

  const itemsList = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image || undefined,
      })),
    [items],
  )

  const validate = (): string | null => {
    if (!fullName.trim() || fullName.trim().length < 3)
      return 'Veuillez saisir votre nom complet'
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8)
      return 'Numéro de téléphone invalide'
    if (!address.trim() || address.trim().length < 5)
      return 'Adresse de livraison invalide'
    if (!city.trim()) return 'Veuillez saisir votre ville'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Email invalide'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const v = validate()
    if (v) {
      setServerError(v)
      return
    }

    // Split full name → first/last name pour le schema API
    const parts = fullName.trim().split(/\s+/)
    const firstName = parts[0] || fullName.trim()
    const lastName = parts.slice(1).join(' ') || firstName

    setSubmitting(true)
    try {
      const payload = {
        shopId,
        items: itemsList,
        subtotal,
        total,
        customer: {
          firstName,
          lastName,
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          notes: notes.trim() || undefined,
        },
        shippingFee: deliveryFee,
        paymentMethod,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && data.details) {
          const msgs = Object.values(data.details).join('. ')
          setServerError(msgs || data.error)
        } else {
          setServerError(data.error || 'Erreur lors de la commande')
        }
        return
      }

      setOrderId(data.id)

      // Si paiement Wave, créer le paiement et afficher le handler
      if (paymentMethod === 'WAVE') {
        try {
          const waveRes = await fetch('/api/payments/wave/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'ORDER',
              orderId: data.id,
              shopId,
              clientPhoneNumber: phone.trim(),
            }),
          })
          const waveData = await waveRes.json()
          if (waveRes.ok) {
            setWavePaymentId(waveData.paymentId)
            setWaveCheckoutUrl(waveData.checkoutUrl)
            setStep('wave-payment')
          } else {
            // Wave non configuré par le marchand, fallback vers succès
            toast.warning('Paiement Wave non disponible. Votre commande a été enregistrée.')
            setStep('success')
            clearCart()
            onSuccess?.({ id: data.id })
          }
        } catch {
          setStep('success')
          clearCart()
          onSuccess?.({ id: data.id })
        }
      } else {
        setStep('success')
        clearCart()
        onSuccess?.({ id: data.id })
        toast.success('Commande confirmée !')
      }
    } catch {
      setServerError('Erreur de connexion. Vérifiez votre réseau.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'wave-payment' && wavePaymentId) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <button
          type="button"
          onClick={() => {
            setStep('success')
            clearCart()
            onSuccess?.({ id: orderId! })
          }}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <WavePaymentHandler
          paymentId={wavePaymentId}
          amount={total}
          description={`Commande ${orderId?.slice(-8).toUpperCase()} - ${shopName}`}
          checkoutUrl={waveCheckoutUrl}
          type="ORDER"
          onSuccess={() => {
            setStep('success')
            clearCart()
            onSuccess?.({ id: orderId! })
            toast.success('Paiement confirmé ! Le marchand a été notifié.')
          }}
          onError={() => {
            // Reste sur la page wave-payment pour montrer l'erreur
          }}
          onClose={() => {
            setStep('success')
            clearCart()
            onSuccess?.({ id: orderId! })
          }}
        />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Commande confirmée !
        </h2>
        <p className="text-sm text-gray-500">
          Merci pour votre commande. Le vendeur a été notifié et vous contactera
          très bientôt pour finaliser la livraison.
        </p>
        {orderId && (
          <div className="rounded-xl bg-gray-50 px-4 py-2">
            <p className="text-xs text-gray-500">Référence</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {orderId}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => onBack?.()}
          className="mt-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-gray-500">Votre panier est vide.</p>
        <Button variant="outline" onClick={() => onBack?.()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button
        type="button"
        onClick={() => onBack?.()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="mb-6 text-3xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_380px]">
        {/* ─── Left: form fields ─── */}
        <div className="space-y-6">
          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Coordonnées */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="h-4 w-4" />
              Coordonnées
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ck-fullname" className="text-sm">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ck-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Amadou Diallo"
                  autoComplete="name"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ck-phone" className="text-sm">
                    <Phone className="mr-1 inline h-3.5 w-3.5" />
                    Téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ck-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 123 45 67"
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ck-email" className="text-sm">
                    <Mail className="mr-1 inline h-3.5 w-3.5" />
                    Email{' '}
                    <span className="font-normal text-gray-400">(optionnel)</span>
                  </Label>
                  <Input
                    id="ck-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Livraison */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="h-4 w-4" />
              Adresse de livraison
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ck-address" className="text-sm">
                  Adresse <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ck-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier Médina, Rue 10"
                  autoComplete="street-address"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ck-city" className="text-sm">
                  Ville <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ck-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dakar"
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ck-notes" className="text-sm">
                  <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                  Instructions{' '}
                  <span className="font-normal text-gray-400">(optionnel)</span>
                </Label>
                <Textarea
                  id="ck-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions de livraison, repères, préférences..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Paiement */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Wallet className="h-4 w-4" />
              Mode de paiement
            </h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <label
                htmlFor="pay-cod"
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem id="pay-cod" value="COD" />
                <Truck className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Paiement à la livraison
                  </p>
                  <p className="text-xs text-gray-500">Payez en espèces</p>
                </div>
              </label>
              <label
                htmlFor="pay-wave"
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  paymentMethod === 'WAVE'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <RadioGroupItem id="pay-wave" value="WAVE" />
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Wave
                  </p>
                  <p className="text-xs text-gray-500">Paiement mobile instantané</p>
                </div>
              </label>
            </RadioGroup>
          </section>
        </div>

        {/* ─── Right: order summary ─── */}
        <aside className="space-y-4 self-start rounded-2xl border border-gray-100 bg-gray-50 p-5 md:sticky md:top-20">
          <h2 className="text-sm font-semibold text-gray-900">
            Récapitulatif
          </h2>

          {/* Items list */}
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId || ''}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="line-clamp-2 flex-1 text-gray-700">
                  {item.name}{' '}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Shipping zone selector or manual delivery fee */}
          <div className="space-y-1.5 border-t border-gray-200 pt-3">
            <Label className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Zone de livraison
            </Label>
            {zonesLoading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des zones…
              </div>
            ) : shippingZones.length > 0 ? (
              <div className="space-y-2">
                <Select
                  value={selectedZoneId}
                  onValueChange={(value) => {
                    setSelectedZoneId(value)
                    const zone = shippingZones.find((z) => z.id === value)
                    setDeliveryFee(zone?.price ?? 0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une zone de livraison" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <span className="flex items-center justify-between gap-4 w-full">
                          <span>{zone.name}</span>
                          <span className="text-gray-400 text-xs ml-auto">
                            {zone.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="ck-delivery"
                  type="number"
                  min={0}
                  value={deliveryFee || ''}
                  onChange={(e) => {
                    setDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))
                    // Clear zone selection if user manually edits fee
                    const matched = shippingZones.find(
                      (z) => z.price === (parseInt(e.target.value) || 0)
                    )
                    setSelectedZoneId(matched?.id ?? '')
                  }}
                  placeholder="0"
                  className="text-sm"
                />
                <p className="text-[11px] text-gray-400">
                  Sélectionnez une zone ou saisissez un montant manuellement.
                </p>
              </div>
            ) : (
              <>
                <Input
                  id="ck-delivery"
                  type="number"
                  min={0}
                  value={deliveryFee || ''}
                  onChange={(e) =>
                    setDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  placeholder="0"
                />
                <p className="text-[11px] text-gray-400">
                  Frais de livraison (FCFA)
                </p>
              </>
            )}
          </div>

          <div className="space-y-1.5 border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Livraison</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span
                className="text-xl font-bold"
                style={{ color: accent }}
              >
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting || items.length === 0}
            className="w-full gap-2 text-sm font-bold uppercase tracking-wide"
            style={{ backgroundColor: accent, color: '#fff' }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            {submitting ? 'Traitement...' : 'Confirmer la commande'}
          </Button>
        </aside>
      </form>
    </div>
  )
}
