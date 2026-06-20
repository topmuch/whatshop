'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag, MessageCircle, CreditCard } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/shared'
import { buildWhatsAppCartLink } from '@/lib/whatsapp-utils'
import { QuantitySelector } from './quantity-selector'
import { toast } from 'sonner'

interface CartDrawerProps {
  whatsapp: string
  shopName: string
  shopId: string
  accent: string
  onCheckout?: () => void
}

/**
 * Panier coulissant (slide-in) pour le template Modern Store.
 * Contrôlé par `useCartStore.isOpen` / `closeCart`.
 * Animation via framer-motion AnimatePresence.
 */
export function CartDrawer({
  whatsapp,
  shopName,
  shopId,
  accent,
  onCheckout,
}: CartDrawerProps) {
  const { items, isOpen, removeItem, updateQuantity, closeCart, getSubtotal, getItemCount } =
    useCartStore()
  const [submittingWa, setSubmittingWa] = useState(false)

  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  const handleWhatsAppOrder = useCallback(async () => {
    if (items.length === 0) return
    setSubmittingWa(true)
    try {
      // Enregistre la commande côté serveur (source WhatsApp)
      await fetch('/api/orders/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variantId: i.variantId,
            variantName: i.variantName,
          })),
          total,
          customerName: 'Commande WhatsApp',
        }),
      })
      const link = buildWhatsAppCartLink({
        whatsapp,
        shopName,
        items,
        subtotal,
        deliveryFee,
        total,
      })
      window.open(link, '_blank', 'noopener,noreferrer')
      toast.success('Commande envoyée sur WhatsApp')
    } catch {
      toast.error("Erreur lors de l'envoi de la commande WhatsApp")
    } finally {
      setSubmittingWa(false)
    }
  }, [items, shopId, total, whatsapp, shopName, subtotal, deliveryFee])

  const handleCheckout = () => {
    closeCart()
    onCheckout?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ─── Overlay ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* ─── Panel ─── */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Panier"
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <ShoppingBag className="h-5 w-5" style={{ color: accent }} />
                Mon Panier
                <span
                  className="ml-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {itemCount}
                </span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Fermer le panier"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              /* ─── Empty state ─── */
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Votre panier est vide
                </h3>
                <p className="text-sm text-gray-500">
                  Ajoutez des produits pour commencer vos achats.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
                  style={{ backgroundColor: accent }}
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <>
                {/* ─── Items list ─── */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="space-y-3">
                    {items.map((item) => {
                      const key = `${item.productId}-${item.variantId || ''}`
                      return (
                        <li
                          key={key}
                          className="flex gap-3 rounded-2xl border border-gray-100 p-3"
                        >
                          {/* Image */}
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                  {item.name}
                                </p>
                                {item.variantName && (
                                  <p className="text-xs text-gray-500">
                                    {item.variantName}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.productId, item.variantId)
                                }
                                aria-label={`Supprimer ${item.name}`}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-end justify-between gap-2">
                              <QuantitySelector
                                value={item.quantity}
                                min={1}
                                onChange={(n) =>
                                  updateQuantity(
                                    item.productId,
                                    n,
                                    item.variantId,
                                  )
                                }
                              />
                              <span
                                className="text-sm font-bold"
                                style={{ color: accent }}
                              >
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* ─── Footer ─── */}
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Livraison</span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(deliveryFee)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
                      <span className="text-base font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold" style={{ color: accent }}>
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={submittingWa}
                    onClick={handleWhatsAppOrder}
                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:bg-green-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <MessageCircle className="h-5 w-5" fill="white" />
                    {submittingWa ? 'Envoi...' : 'Commander via WhatsApp'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-900 bg-white py-3 text-sm font-bold uppercase tracking-wide text-gray-900 transition-all hover:bg-gray-900 hover:text-white active:scale-[0.98]"
                  >
                    <CreditCard className="h-5 w-5" />
                    Procéder au checkout
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
