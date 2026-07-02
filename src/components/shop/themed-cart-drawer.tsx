'use client'

/**
 * ThemedCartDrawer — Shared slide-up bottom cart bar used by multiple themes.
 *
 * Based on the BeautyCartDrawer pattern. All color/style differences are
 * driven by the `theme` prop so each calling theme only passes a config
 * object instead of duplicating the entire drawer.
 *
 * Supports an optional `removeFromCart` prop (used by Cosmika); when absent
 * the drawer falls back to `updateCartQuantity(id, 0)` to remove items.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { formatPrice } from '@/lib/shared'
import type { CartItem } from '@/lib/store'

// ─── Theme configuration ──────────────────────────────────────────────────────

export interface ThemedCartDrawerTheme {
  // Text colors (hex / css values for inline styles)
  text: string
  textMuted: string
  price: string

  // Backgrounds
  bg: string
  bgExpanded?: string      // defaults to bg
  border: string

  // Primary accent
  primary: string
  primaryLight: string

  // WhatsApp CTA
  whatsapp: string
  whatsappFg: string
  whatsappDark?: string    // optional second stop for gradient (TikTok)

  // Toggle button overrides
  toggleBg?: string        // explicit bg on the toggle button (e.g. TikTok darkBg)
  toggleBorder?: string    // border color on the toggle button (Luxe glassBorder, TikTok border)

  // Decorative
  shadow?: string          // box-shadow on the outer wrapper
  imageBg?: string         // bg behind product thumbnail
  qtyBg?: string           // bg behind the +/− controls
  countBg?: string         // bg behind the item-count badge
  fontFamily?: string      // serif font for prices / total
  backdropBlur?: boolean   // add backdrop-blur-xl to expanded + bar
  separatorClass?: string  // extra className on <Separator> (e.g. TikTok 'bg-white/10')

  // Tailwind utility strings
  roundedItem?: string     // default 'rounded-xl'
  roundedBtn?: string      // default 'rounded-xl'
  maxWidth?: string        // default '' (no max-width)
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThemedCartDrawerProps {
  expanded: boolean
  onToggle: () => void
  onClear: () => void
  onCheckout: () => void
  total: number
  itemCount: number
  cart: CartItem[]
  updateCartQuantity: (id: string, qty: number) => void
  removeFromCart?: (productId: string) => void
  theme: ThemedCartDrawerTheme
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThemedCartDrawer({
  expanded,
  onToggle,
  onClear,
  onCheckout,
  total,
  itemCount,
  cart,
  updateCartQuantity,
  removeFromCart,
  theme,
}: ThemedCartDrawerProps) {
  const t = theme
  const roundedItem = t.roundedItem ?? 'rounded-xl'
  const roundedBtn = t.roundedBtn ?? 'rounded-xl'
  const mw = t.maxWidth ?? ''

  const handleDecrease = (item: CartItem) => {
    if (removeFromCart && item.quantity <= 1) {
      removeFromCart(item.productId)
    } else {
      updateCartQuantity(item.productId, item.quantity - 1)
    }
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={t.shadow ? { boxShadow: t.shadow } : undefined}
    >
      {/* ── Expanded cart items ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className={`overflow-hidden border-t ${t.backdropBlur ? 'backdrop-blur-xl' : ''}`}
            style={{
              background: t.bgExpanded ?? t.bg,
              borderColor: t.border,
            }}
          >
            <ScrollArea className="max-h-64">
              <div className={`${mw} mx-auto p-4 space-y-3`}>
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: t.text, fontFamily: t.fontFamily }}
                  >
                    Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 h-9 text-xs"
                    onClick={onClear}
                  >
                    <Trash2 className="size-3 mr-1" />
                    Tout supprimer
                  </Button>
                </div>

                {/* Empty state */}
                {cart.length === 0 && (
                  <p
                    className="text-sm text-center py-6"
                    style={{ color: t.textMuted }}
                  >
                    Votre panier est vide
                  </p>
                )}

                {/* Cart items */}
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${roundedItem} shrink-0 overflow-hidden`}
                      style={{
                        background: t.imageBg ?? `${t.primaryLight}40`,
                      }}
                    >
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover"
                        fallbackIcon="package"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium line-clamp-1"
                        style={{ color: t.text }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs font-bold"
                        style={{
                          color: t.price,
                          fontFamily: t.fontFamily,
                        }}
                      >
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center ${roundedBtn}`}
                      style={{
                        background:
                          t.qtyBg ?? `${t.primaryLight}30`,
                      }}
                    >
                      <button
                        className="h-9 w-9 flex items-center justify-center"
                        onClick={() => handleDecrease(item)}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="size-3 text-red-400" />
                        ) : (
                          <Minus
                            className="size-3"
                            style={{ color: t.primary }}
                          />
                        )}
                      </button>
                      <span
                        className="text-sm font-semibold min-w-[24px] text-center"
                        style={{ color: t.text }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        className="h-9 w-9 flex items-center justify-center"
                        onClick={() =>
                          updateCartQuantity(
                            item.productId,
                            item.quantity + 1,
                          )
                        }
                      >
                        <Plus
                          className="size-3"
                          style={{ color: t.primary }}
                        />
                      </button>
                    </div>
                    <span
                      className="text-sm font-bold w-24 text-right"
                      style={{
                        color: t.price,
                        fontFamily: t.fontFamily,
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Total row */}
                {cart.length > 0 && (
                  <>
                    <Separator
                      style={t.separatorClass ? undefined : { background: t.border }}
                      className={t.separatorClass}
                    />
                    <div
                      className="flex items-center justify-between font-bold"
                      style={{ color: t.text }}
                    >
                      <span>Total</span>
                      <span
                        style={{
                          color: t.price,
                          fontFamily: t.fontFamily,
                        }}
                      >
                        {formatPrice(total)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart bar ── */}
      <div
        className={`border-t px-4 py-3 ${t.backdropBlur ? 'backdrop-blur-xl' : ''}`}
        style={{ background: t.bg, borderColor: t.border }}
      >
        <div className={`${mw} mx-auto flex items-center gap-3`}>
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 gap-1.5 shrink-0 ${roundedBtn}`}
            style={{
              color: t.text,
              ...(t.toggleBg ? { background: t.toggleBg } : {}),
              ...(t.toggleBorder ? { borderColor: t.toggleBorder, borderWidth: 1, borderStyle: 'solid' } : {}),
            }}
            onClick={onToggle}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
            <span
              className="px-1.5 h-5 text-xs text-white rounded-md flex items-center font-bold"
              style={{
                background: t.countBg ?? t.primary,
              }}
            >
              {itemCount}
            </span>
            <span className="hidden sm:inline text-sm font-medium">
              panier
            </span>
          </Button>

          <div className="flex-1">
            <p className="text-xs" style={{ color: t.textMuted }}>
              Total
            </p>
            <p
              className="font-bold text-sm"
              style={{
                color: t.price,
                fontFamily: t.fontFamily,
              }}
            >
              {formatPrice(total)}
            </p>
          </div>

          <Button
            className={`h-10 gap-2 font-semibold text-sm ${roundedBtn} px-6`}
            style={{
              background: t.whatsappDark
                ? `linear-gradient(135deg, ${t.whatsapp}, ${t.whatsappDark})`
                : t.whatsapp,
              color: t.whatsappFg,
            }}
            onClick={onCheckout}
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">
              Commander via WhatsApp
            </span>
            <span className="sm:hidden">Commander</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}