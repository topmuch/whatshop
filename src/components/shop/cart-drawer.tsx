'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Trash2, Minus, Plus, ShoppingBag, MessageCircle, CreditCard } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { ShippingZoneSelector } from '@/components/shop/shipping-zone-selector'
import { CheckoutForm } from '@/components/shop/checkout-form'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const {
    cart,
    shopSlug,
    publicShop,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    selectedShippingZone,
  } = useAppStore()

  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const total = getCartTotal()
  const deliveryFee = selectedShippingZone?.price ?? 0
  const grandTotal = total + deliveryFee
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const generateWhatsAppMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const lines = cart.map((item) => {
      const lineTotal = item.price * item.quantity
      const productUrl = shopSlug
        ? `${baseUrl}/${shopSlug}?product=${item.productId}`
        : ''
      const linkLine = productUrl ? `\n  🔗 ${productUrl}` : ''
      return `- ${item.name} x${item.quantity} : ${lineTotal.toLocaleString('fr-FR')} FCFA${linkLine}`
    })

    const hasShipping = !!selectedShippingZone

    let message: string

    if (hasShipping) {
      message = `Bonjour,

Je souhaite commander :

${lines.join('\n')}

📍 Zone de livraison : ${selectedShippingZone!.name}
🚚 Frais de livraison : ${deliveryFee.toLocaleString('fr-FR')} FCFA
💵 Total : ${grandTotal.toLocaleString('fr-FR')} FCFA

Nom :
Adresse :
Téléphone :`
    } else {
      message = `Bonjour,

Je souhaite commander :

${lines.join('\n')}

Total : ${total.toLocaleString('fr-FR')} FCFA

Nom :
Adresse :
Téléphone :`
    }

    return message
  }

  const handleWhatsAppOrder = () => {
    if (!publicShop || !publicShop.whatsapp) return

    const message = generateWhatsAppMessage()
    const phone = publicShop.whatsapp.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        {/* Header */}
        <SheetHeader className="pr-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Mon panier
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {itemCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Votre panier est vide</h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez des produits pour commencer vos achats
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="flex flex-col gap-3 pb-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border p-3"
                  >
                    {/* Thumbnail */}
                    <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover"
                        sizes="48px"
                        fallbackIcon="package"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label="Supprimer l'article"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold text-primary">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <SheetFooter className="flex-col gap-3 border-t pt-4">
              <Separator />

              {/* Shipping Zone Selector */}
              <div className="w-full px-1">
                <ShippingZoneSelector />
              </div>

              {/* Price Breakdown */}
              <div className="flex w-full flex-col gap-2 px-1">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sous-total</span>
                  <span className="text-sm">
                    {total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                {/* Delivery fee (only if zone selected) */}
                {selectedShippingZone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Livraison ({selectedShippingZone.name})
                    </span>
                    <span className="text-sm">
                      {deliveryFee.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}

                {/* Grand total */}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {grandTotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Order Buttons */}
              <Button
                size="lg"
                className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] text-base font-semibold"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle className="size-5" />
                Commander sur WhatsApp
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 text-base font-semibold"
                onClick={() => setCheckoutOpen(true)}
              >
                <CreditCard className="size-5" />
                Commander sur le site
              </Button>

              {/* Clear Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={clearCart}
              >
                <Trash2 className="size-4 mr-1.5" />
                Vider le panier
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>

    {/* Checkout Form Sheet (opens on top of cart) */}
    <CheckoutForm
        open={checkoutOpen}
        onOpenChange={(nextOpen) => {
          setCheckoutOpen(nextOpen)
          if (!nextOpen) onOpenChange(true) // re-open cart when checkout closes
        }}
        onSuccess={() => {
          onOpenChange(false) // close cart on successful order
        }}
      />
    </>
  )
}