'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { CheckoutForm } from '@/components/shop/checkout-form'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MenuProduct {
  id: string
  name: string
  slug?: string
  shortDescription?: string
  price: number
  image?: string
  stock?: number
  isAvailable: boolean
}

interface MenuCategory {
  id: string
  name: string
  description?: string
  image?: string
  products: MenuProduct[]
}

interface MenuShop {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  whatsapp: string
  address?: string
  phone?: string
  businessHours?: string
  primaryColor?: string
  accentColor?: string
  isRestaurant: boolean
}

interface MenuData {
  shop: MenuShop
  categories: MenuCategory[]
}

interface LocalCartItem {
  product: MenuProduct
  quantity: number
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MenuPageClient({ shopSlug }: { shopSlug: string }) {
  const [data, setData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<LocalCartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  // Zustand store (for checkout form bridge)
  const {
    setPublicShop,
    addToCart: zustandAddToCart,
    clearCart: zustandClearCart,
  } = useAppStore()

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isScrolling = useRef(false)

  // Fetch menu data
  useEffect(() => {
    let cancelled = false
    fetch(`/api/menu/${shopSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not_found' : 'server_error')
        return res.json()
      })
      .then((json: MenuData) => {
        if (!cancelled) {
          setData(json)
          if (json.categories.length > 0) {
            setActiveCategory(json.categories[0].id)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message === 'not_found' ? 'not_found' : 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [shopSlug])

  // Cart operations (local state)
  const addToCart = useCallback((product: MenuProduct) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c
        )
        .filter((c) => c.quantity > 0)
    )
  }, [])

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0)
  const totalPrice = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0)

  // WhatsApp order (keeps existing flow)
  const sendWhatsAppOrder = useCallback(() => {
    if (!data || cart.length === 0) return
    const phone = data.shop.whatsapp.replace(/\D/g, '')
    let msg = `Bonjour ! Je souhaite commander :\n\n`
    cart.forEach((item) => {
      msg += `${item.quantity}x ${item.product.name} — ${formatPrice(item.product.price * item.quantity)}\n`
    })
    msg += `\nTotal : ${formatPrice(totalPrice)}`
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }, [data, cart, totalPrice])

  // Bridge: sync local cart → Zustand store → open checkout
  const openCheckout = useCallback(() => {
    if (!data || cart.length === 0) return

    // Set the public shop so CheckoutForm can read shopId
    setPublicShop({
      id: data.shop.id,
      name: data.shop.name,
      slug: data.shop.slug,
      whatsapp: data.shop.whatsapp,
      phone: data.shop.phone || undefined,
      address: data.shop.address || undefined,
      isRestaurant: data.shop.isRestaurant,
      accentColor: data.shop.accentColor || undefined,
      primaryColor: data.shop.primaryColor || undefined,
      logo: data.shop.logo || undefined,
      isActive: true,
      plan: '',
      template: '',
      description: data.shop.description || undefined,
    })

    // Clear Zustand cart first, then add all items from local cart
    zustandClearCart()
    for (const item of cart) {
      zustandAddToCart({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
      })
    }

    // Close cart drawer, open checkout sheet
    setShowCart(false)
    setShowCheckout(true)
  }, [data, cart, setPublicShop, zustandClearCart, zustandAddToCart])

  // After successful checkout: clear local cart
  const handleCheckoutSuccess = useCallback(() => {
    setCart([])
    toast.success('Commande confirmée ! Le vendeur a été notifié.')
  }, [])

  // Sticky category scroll with intersection observer
  useEffect(() => {
    if (!data) return
    const ids = data.categories.map((c) => c.id)
    const observers: IntersectionObserver[] = []

    ids.forEach((id) => {
      const el = categoryRefs.current[id]
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          if (isScrolling.current) return
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveCategory(id)
            }
          })
        },
        { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [data])

  // Scroll to category
  const scrollToCategory = useCallback((id: string) => {
    isScrolling.current = true
    setActiveCategory(id)
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { isScrolling.current = false }, 600)
  }, [])

  // ─── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header skeleton */}
        <div className="bg-white px-4 py-4 border-b animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <div className="h-5 w-40 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        {/* Category pills skeleton */}
        <div className="px-4 py-3 bg-white border-b flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-full shrink-0" />
          ))}
        </div>
        {/* Items skeleton */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 py-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Error States ─────────────────────────────────────────────────
  if (error === 'not_found' || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Menu introuvable</h1>
          <p className="text-sm text-gray-500">Cette boutique n'existe pas ou n'est plus active.</p>
          <Link href="/" className="inline-block text-sm text-emerald-600 font-medium hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  if (error === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">Erreur de chargement</h1>
          <p className="text-sm text-gray-500">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const accent = data.shop.accentColor || '#10B981'
  const primary = data.shop.primaryColor || '#EC4899'

  // Collect all products for lookup
  const allProducts = data.categories.flatMap((c) => c.products)
  const uncategorized = allProducts.length > 0
    ? allProducts.filter((p) => !data.categories.some((c) => c.products.some((cp) => cp.id === p.id)))
    : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ═══ STICKY HEADER ═══ */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {data.shop.logo ? (
            <Image
              src={data.shop.logo}
              alt={data.shop.name}
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover border"
              unoptimized
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: accent }}
            >
              {data.shop.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{data.shop.name}</h1>
            {data.shop.businessHours && (
              <p className="text-xs text-gray-500 truncate">{data.shop.businessHours}</p>
            )}
          </div>
          {totalItems > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                {totalItems}
              </span>
            </button>
          )}
        </div>

        {/* ═══ CATEGORY PILLS ═══ */}
        {data.categories.length > 1 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: activeCategory === cat.id ? accent : '#f3f4f6',
                  color: activeCategory === cat.id ? '#ffffff' : '#374151',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ═══ PRODUCTS LIST ═══ */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-8 pb-28">
        {data.categories.map((category) => (
          <div key={category.id} ref={(el) => { categoryRefs.current[category.id] = el }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              {category.name}
            </h2>
            {category.products.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Aucun produit dans cette catégorie.</p>
            ) : (
              <div className="space-y-3">
                {category.products.map((product) => {
                  const inCart = cart.find((c) => c.product.id === product.id)
                  return (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex gap-3">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                            {product.name}
                          </h3>
                          {product.shortDescription && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold" style={{ color: accent }}>
                            {formatPrice(product.price)}
                          </span>

                          {inCart ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-gray-900">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white active:opacity-80"
                                style={{ backgroundColor: accent }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white active:opacity-80 transition-transform active:scale-95"
                              style={{ backgroundColor: accent }}
                            >
                              Ajouter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* ═══ FLOATING ORDER BAR ═══ */}
      {totalItems > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pointer-events-none">
          <button
            onClick={() => setShowCart(true)}
            className="w-full max-w-lg mx-auto flex items-center justify-between px-5 py-3.5 rounded-2xl text-white shadow-xl pointer-events-auto active:scale-[0.98] transition-transform"
            style={{ backgroundColor: accent }}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                {totalItems}
              </span>
              <span className="font-semibold text-sm">Voir la commande</span>
            </div>
            <span className="font-bold text-sm">{formatPrice(totalPrice)}</span>
          </button>
        </div>
      )}

      {/* ═══ CART DRAWER ═══ */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCart(false)}
          />

          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-lg font-bold text-gray-900">Votre commande</h2>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">
                  Votre commande est vide
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: accent }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-400 hover:text-red-600 ml-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total + CTA Buttons */}
            {cart.length > 0 && (
              <div className="border-t px-5 py-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-bold" style={{ color: accent }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                {/* Primary: Passer la commande (checkout form) */}
                <button
                  onClick={openCheckout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-white font-semibold text-sm active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: accent }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Passer la commande
                </button>
                {/* Secondary: WhatsApp */}
                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform border-2 text-gray-700 border-gray-200 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Commander via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ CHECKOUT FORM SHEET ═══ */}
      <CheckoutForm
        open={showCheckout}
        onOpenChange={setShowCheckout}
        onSuccess={handleCheckoutSuccess}
      />

      {/* ═══ INLINE STYLES FOR ANIMATION ═══ */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}