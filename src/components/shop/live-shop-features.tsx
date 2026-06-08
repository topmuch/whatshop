'use client'

import { useAppStore, type Product } from '@/lib/store'
import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Star, Clock, Gift, Send, Package } from 'lucide-react'
import { toast } from 'sonner'

function formatPrice(price: number) {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

/* ─── Live Banner ────────────────────────────────────────────────────── */
function LiveBanner({ timeLeft, isActive }: { timeLeft: string; isActive: boolean }) {
  if (!isActive) return null

  return (
    <div className="sticky top-0 z-50 bg-red-600 text-white text-center py-2.5 px-4 font-bold shadow-lg animate-pulse">
      <div className="flex items-center justify-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <span className="text-sm sm:text-base">🔴 OFFRE LIVE EN COURS</span>
        <span className="text-sm sm:text-base">— Fin dans</span>
        <span className="font-mono text-lg tracking-wider bg-red-700 px-2 py-0.5 rounded">{timeLeft}</span>
      </div>
    </div>
  )
}

/* ─── Flash Pin Product Card ──────────────────────────────────────────── */
function FlashPinProduct({
  product,
  promoCode,
  shopWhatsapp,
  shopName,
  outOfStock,
  onWhatsAppClick,
}: {
  product: Product | null
  promoCode: { code: string; discountPercent: number } | null
  shopWhatsapp: string
  shopName: string
  outOfStock: boolean
  onWhatsAppClick: () => void
}) {
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(false)

  if (!product) return null

  const productImage = (product.images && product.images[0]) || product.image

  const isPromoValid = promoInput.toUpperCase() === promoCode?.code
  const finalPrice = isPromoValid && promoCode
    ? product.price - (product.price * promoCode.discountPercent) / 100
    : product.price

  function generateWhatsAppLink() {
    const promoText = isPromoValid && promoCode
      ? `\n🎟️ *Code Promo* : ${promoInput.toUpperCase()} (-${promoCode.discountPercent}%)\n`
      : ''

    const message = `Bonjour ${shopName} 👋, je souhaite commander depuis votre LIVE 🔴:\n\n` +
      `📦 *Produit* : ${product.name}\n` +
      `💰 *Prix* : ${product.price.toLocaleString('fr-FR')} FCFA\n` +
      promoText +
      `💵 *Total* : ${finalPrice.toLocaleString('fr-FR')} FCFA\n\n` +
      `Merci de confirmer ma commande !`

    return `https://wa.me/${shopWhatsapp?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4 mb-6 relative z-10"
    >
      <div className={`rounded-2xl border-2 ${outOfStock ? 'border-gray-400 opacity-60' : 'border-red-500'} overflow-hidden shadow-xl bg-white`}>
        {/* Flash Pin Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Star className="h-4 w-4 fill-current" />
            ⭐ PRODUIT DU MOMENT
          </div>
          {outOfStock && (
            <Badge variant="destructive" className="text-xs">ÉPUISÉ - Rejoins le Live !</Badge>
          )}
        </div>

        {/* Product Image */}
        <div className="relative">
          {productImage ? (
            <img src={productImage} alt={product.name} className="w-full h-56 sm:h-72 object-cover" />
          ) : (
            <div className="w-full h-56 sm:h-72 flex items-center justify-center bg-gray-100">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {promoCode && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-md animate-bounce">
              🎟️ -{promoCode.discountPercent}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl sm:text-3xl font-bold text-red-600">
              {formatPrice(finalPrice)}
            </span>
            {isPromoValid && promoCode && (
              <span className="text-sm line-through text-gray-400">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</p>
          )}

          {/* Promo Code Input */}
          {promoCode && !outOfStock && (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={`Code Promo (${promoCode.code})`}
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase())
                  setAppliedPromo(false)
                }}
                className="flex-1 text-sm uppercase"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isPromoValid) {
                    setAppliedPromo(true)
                    toast.success(`Code ${promoInput.toUpperCase()} appliqué ! -${promoCode.discountPercent}%`)
                  } else {
                    toast.error('Code promo invalide')
                  }
                }}
                className={appliedPromo ? 'bg-green-100 border-green-500 text-green-700' : ''}
              >
                Appliquer
              </Button>
            </div>
          )}

          {/* Giant WhatsApp Button */}
          {!outOfStock && (
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsAppClick}
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 sm:py-5 rounded-xl text-lg shadow-lg transition-all active:scale-[0.98] gap-3"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Commander sur WhatsApp
            </a>
          )}

          {outOfStock && (
            <div className="text-center py-4 bg-gray-100 rounded-xl text-gray-600 font-semibold">
              🚫 Rupture de stock — Rejoins le Live pour la suite !
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Lead Capture Form ────────────────────────────────────────────────── */
function LeadCaptureForm({
  shopSlug,
  socketRef,
}: {
  shopSlug: string
  socketRef: React.MutableRefObject<Socket | null>
}) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return

    // Save via API
    try {
      await fetch(`/api/shops/${shopSlug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() || undefined }),
      })
    } catch {
      // Also try via socket
      socketRef.current?.emit('live:submitLead', {
        phone: phone.trim(),
        name: name.trim() || undefined,
      })
    }

    setSubmitted(true)
    toast.success('Merci ! Vous recevrez le catalogue VIP 🎁')
  }

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto px-4 mb-6 relative z-10">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 sm:p-6 text-center">
          <span className="text-3xl mb-2 block">🎉</span>
          <h3 className="font-bold text-purple-800 text-lg">Inscription confirmée !</h3>
          <p className="text-sm text-purple-600 mt-1">Vous recevrez bientôt le catalogue VIP sur WhatsApp</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 mb-6 relative z-10">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-purple-600" />
          <h3 className="font-bold text-purple-800">🎁 Recevoir le catalogue VIP</h3>
        </div>
        <p className="text-sm text-purple-600 mb-4">
          Laissez votre numéro WhatsApp pour recevoir le catalogue complet et les offres exclusives !
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Votre nom (optionnel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:w-1/3"
          />
          <Input
            placeholder="Numéro WhatsApp (ex: 22507070707)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="sm:w-1/3"
            required
            type="tel"
          />
          <Button
            type="submit"
            className="sm:w-1/3 bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <Send className="h-4 w-4" />
            Recevoir le catalogue
          </Button>
        </form>
      </div>
    </div>
  )
}

/* ─── Main Live Shop Features Component ─────────────────────────────────── */
export function LiveShopFeatures() {
  const { shopSlug, publicShop, publicProducts } = useAppStore()
  const socketRef = useRef<Socket | null>(null)

  // Live state
  const [isActive, setIsActive] = useState(false)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState('00:00')
  const [pinnedProductId, setPinnedProductId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState<{ code: string; discountPercent: number } | null>(null)
  const [outOfStockProducts, setOutOfStockProducts] = useState<Set<string>>(new Set())

  // Socket.IO connection (buyer side)
  useEffect(() => {
    if (!shopSlug) return

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('buyer:join', { shopSlug })
    })

    socket.on('live:state', (data: {
      isActive: boolean
      endTime: string | null
      pinnedProductId: string | null
      promoCode: { code: string; discountPercent: number } | null
      outOfStockProducts?: string[]
    }) => {
      setIsActive(data.isActive)
      setEndTime(data.endTime ? new Date(data.endTime).getTime() : null)
      setPinnedProductId(data.pinnedProductId)
      setPromoCode(data.promoCode)
      if (data.outOfStockProducts) {
        setOutOfStockProducts(new Set(data.outOfStockProducts))
      }
    })

    socket.on('live:outOfStock', (data: { productId: string }) => {
      setOutOfStockProducts((prev) => new Set([...prev, data.productId]))
    })

    socket.on('live:restoreStock', (data: { productId: string }) => {
      setOutOfStockProducts((prev) => {
        const next = new Set(prev)
        next.delete(data.productId)
        return next
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [shopSlug])

  // Also fetch initial live state via API (in case socket doesn't connect fast)
  useEffect(() => {
    if (!shopSlug) return
    async function fetchLiveState() {
      try {
        const res = await fetch(`/api/shops/${shopSlug}/live`)
        if (res.ok) {
          const data = await res.json()
          if (data.isActive) {
            setIsActive(true)
            setEndTime(data.endTime ? new Date(data.endTime).getTime() : null)
            setPinnedProductId(data.pinnedProductId)
            if (data.promoCodes && data.promoCodes.length > 0) {
              const activePromo = data.promoCodes.find((p: { isActive: boolean }) => p.isActive)
              if (activePromo) {
                setPromoCode({ code: activePromo.code, discountPercent: activePromo.discountPercent })
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }
    fetchLiveState()
  }, [shopSlug])

  // Get pinned product data
  const pinnedProduct = pinnedProductId
    ? publicProducts.find((p) => p.id === pinnedProductId) || null
    : null

  // Show lead form when live starts (computed, not via effect)
  const showLeadForm = isActive || !!pinnedProduct

  // Countdown timer
  useEffect(() => {
    if (!isActive || !endTime) return

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
      if (remaining <= 0) {
        setIsActive(false)
        setEndTime(null)
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isActive, endTime])

  // Track WhatsApp click
  const trackWhatsAppClick = useCallback(() => {
    socketRef.current?.emit('live:whatsappClick')
  }, [])

  // Don't render anything if no live is active and no pinned product
  if (!isActive && !pinnedProduct) return null

  return (
    <>
      {/* Live Banner (sticky above everything) */}
      <LiveBanner timeLeft={timeLeft} isActive={isActive} />

      {/* Flash Pin Product */}
      {pinnedProduct && (
        <FlashPinProduct
          product={pinnedProduct}
          promoCode={promoCode}
          shopWhatsapp={publicShop?.whatsapp || ''}
          shopName={publicShop?.name || ''}
          outOfStock={outOfStockProducts.has(pinnedProductId)}
          onWhatsAppClick={trackWhatsAppClick}
        />
      )}

      {/* Lead Capture Form */}
      {showLeadForm && shopSlug && (
        <LeadCaptureForm shopSlug={shopSlug} socketRef={socketRef} />
      )}
    </>
  )
}
