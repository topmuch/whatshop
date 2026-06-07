'use client'

import { useAppStore, type Product } from '@/lib/store'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Minus,
  Plus,
  Trash2,
  Package,
  Search,
  X,
  Flame,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Phone,
  MapPin,
  Store,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { ShopHeroCarousel } from './shop-hero-carousel'
import { TemplateProvider } from './template-provider'

type SortOption = 'recent' | 'price-asc' | 'price-desc'

function formatPrice(price: number) {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

function isProductNew(createdAt?: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

function isProductPromo(price: number): boolean {
  return price < 5000
}

function getCategoryCount(products: Product[], categoryId?: string): number {
  return products.filter((p) => p.categoryId === categoryId && p.isAvailable).length
}

export function PublicShop() {
  const {
    shopSlug,
    setView,
    publicShop,
    setPublicShop,
    publicProducts,
    setPublicProducts,
    publicCategories,
    setPublicCategories,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    clearCart,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [cartExpanded, setCartExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchShop = useCallback(async () => {
    if (!shopSlug) return
    setLoading(true)
    try {
      const shopRes = await fetch(`/api/shops/${shopSlug}`)
      if (!shopRes.ok) return
      const shopData = await shopRes.json()
      setPublicShop(shopData)

      // Track visit
      fetch(`/api/shops/${shopSlug}/visit`, { method: 'POST' }).catch(() => {})

      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/shops/${shopSlug}/products`),
        fetch(`/api/shops/${shopSlug}/categories`),
      ])
      if (prodRes.ok) setPublicProducts(await prodRes.json())
      if (catRes.ok) setPublicCategories(await catRes.json())
    } catch {
      // Error loading
    } finally {
      setLoading(false)
    }
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = publicProducts.filter((p) => p.isAvailable)

    // Category filter
    if (activeCategory) {
      products = products.filter((p) => p.categoryId === activeCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        products = [...products].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        products = [...products].sort((a, b) => b.price - a.price)
        break
      case 'recent':
      default:
        // Already sorted by createdAt desc from API
        break
    }

    return products
  }, [publicProducts, activeCategory, searchQuery, sortBy])

  const total = getCartTotal()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function handleAddToCart(product: Product) {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || undefined,
      quantity: 1,
    })
    toast.success(`${product.name} ajouté au panier`)
  }

  function getCartQuantity(productId: string): number {
    return cart.find((c) => c.productId === productId)?.quantity || 0
  }

  function handleWhatsAppCheckout() {
    if (!publicShop) return
    const itemsText = cart
      .map(
        (c) =>
          `🛍 ${c.name} x${c.quantity} — ${(c.price * c.quantity).toLocaleString('fr-FR')} FCFA`
      )
      .join('\n')

    const msg = `Bonjour ${publicShop.name} ! 👋

Je souhaite commander :

${itemsText}

━━━━━━━━━━━━━━
💰 Total : ${total.toLocaleString('fr-FR')} FCFA

📝 Mes informations :
Nom :
Adresse :
Téléphone :

Merci ! 🙏`

    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  function handleCategoryClick(categoryId: string | null) {
    setActiveCategory(categoryId)
    // Scroll to top of products
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="sticky top-0 z-40 bg-background border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 flex-1 max-w-md rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
        {/* Banner skeleton */}
        <Skeleton className="h-48 md:h-64 w-full" />
        {/* Content skeleton */}
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Shop not found
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Boutique introuvable</h2>
          <p className="text-muted-foreground mb-4">
            Cette boutique n&apos;existe pas ou a été désactivée.
          </p>
          <Button onClick={() => setView('landing')}>Retour à l&apos;accueil</Button>
        </Card>
      </div>
    )
  }

  const totalProductCount = publicProducts.filter((p) => p.isAvailable).length
  const isSearching = searchQuery.trim().length > 0

  return (
    <TemplateProvider templateId={publicShop.template || 'classic'}>
    <div className="min-h-screen pb-20" style={{ background: 'var(--tpl-bg)', color: 'var(--tpl-text)' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b" style={{ background: 'var(--tpl-header-bg)', borderColor: 'var(--tpl-border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setView('landing')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 relative"
            onClick={() => cart.length > 0 && setCartExpanded(!cartExpanded)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center" style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Carousel */}
      <ShopHeroCarousel shopName={publicShop.name} whatsapp={publicShop.whatsapp} />

      {/* Shop Info Bar */}
      <div className="border-b" style={{ background: 'var(--tpl-primary)', opacity: 0.06, borderColor: 'var(--tpl-border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {publicShop.logo ? (
              <img
                src={publicShop.logo}
                alt={publicShop.name}
                className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-sm shrink-0" style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}>
                <Store className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate">{publicShop.name}</h1>
              {publicShop.description && (
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{publicShop.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0" style={{ color: 'var(--tpl-text-muted)' }}>
            {publicShop.whatsapp && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" style={{ color: 'var(--tpl-primary)' }} />
                <span className="hidden sm:inline">WhatsApp</span>
              </div>
            )}
            {publicShop.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{publicShop.phone}</span>
              </div>
            )}
            {publicShop.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden md:inline line-clamp-1 max-w-[180px]">{publicShop.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pt-4" ref={scrollRef}>
        {/* Category Filter Pills */}
        {publicCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
            <button
              onClick={() => handleCategoryClick(null)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={
                !activeCategory
                  ? { background: 'var(--tpl-filter-active)', color: 'var(--tpl-filter-active-fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { background: 'var(--tpl-card)', color: 'var(--tpl-text-muted)', border: '1px solid var(--tpl-border)' }
              }
            >
              Tous ({totalProductCount})
            </button>
            {publicCategories.map((cat) => {
              const count = getCategoryCount(publicProducts, cat.id)
              if (count === 0) return null
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                  style={
                    activeCategory === cat.id
                      ? { background: 'var(--tpl-filter-active)', color: 'var(--tpl-filter-active-fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                      : { background: 'var(--tpl-card)', color: 'var(--tpl-text-muted)', border: '1px solid var(--tpl-border)' }
                  }
                >
                  {cat.name}
                  <span
                    className={`text-xs ${
                      activeCategory === cat.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Search results count & Sort */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="text-sm" style={{ color: 'var(--tpl-text-muted)' }}>
            {isSearching ? (
              <span>
                {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} pour
                &quot;{searchQuery}&quot;
              </span>
            ) : (
              <span>
                {totalProductCount} produit{totalProductCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm bg-secondary rounded-lg px-3 py-1.5 border-0 focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const qty = getCartQuantity(product.id)
              const isNew = isProductNew(product.createdAt)
              const isPromo = isProductPromo(product.price)
              const lowStock = product.stock !== undefined && product.stock !== null && product.stock <= 3 && product.stock > 0

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="group h-full flex flex-col" style={{ background: 'var(--tpl-card)', borderRadius: 'var(--tpl-card-rounded)', boxShadow: 'var(--tpl-card-shadow)', overflow: 'var(--tpl-image-rounded)' }}>
                    {/* Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden" style={{ borderRadius: 'var(--tpl-image-rounded)' }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Package className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isNew && (
                          <Badge className="text-white text-[10px] px-1.5 py-0 h-5 font-medium gap-0.5" style={{ background: 'var(--tpl-badge-new)' }}>
                            <Sparkles className="h-3 w-3" />
                            Nouveau
                          </Badge>
                        )}
                        {isPromo && !isNew && (
                          <Badge className="text-white text-[10px] px-1.5 py-0 h-5 font-medium gap-0.5" style={{ background: 'var(--tpl-badge-promo)' }}>
                            <Flame className="h-3 w-3" />
                            Promo
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-3 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--tpl-text)' }}>{product.name}</h3>
                      {product.categoryName && (
                        <span className="text-[11px] mt-0.5" style={{ color: 'var(--tpl-text-muted)' }}>
                          {product.categoryName}
                        </span>
                      )}

                      <div className="mt-auto pt-3">
                        <p className="font-bold text-sm" style={{ color: 'var(--tpl-price)' }}>{formatPrice(product.price)}</p>

                        {lowStock && (
                          <div className="flex items-center gap-1 mt-1.5 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-[11px] font-medium">
                              Plus que {product.stock} en stock
                            </span>
                          </div>
                        )}

                        <div className="mt-2">
                          {qty === 0 ? (
                            <Button
                              size="sm"
                              className="w-full h-8 text-xs gap-1"
                              style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
                              onClick={() => handleAddToCart(product)}
                            >
                              <Plus className="h-3 w-3" />
                              Ajouter au panier
                            </Button>
                          ) : (
                            <div className="flex items-center justify-between gap-1 rounded-lg p-0.5" style={{ background: 'var(--tpl-card)', border: '1px solid var(--tpl-border)' }}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => updateCartQuantity(product.id, qty - 1)}
                              >
                                {qty === 1 ? (
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </Button>
                              <span className="text-sm font-semibold min-w-[24px] text-center">
                                {qty}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => updateCartQuantity(product.id, qty + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {isSearching ? (
                <Search className="h-7 w-7 text-muted-foreground/40" />
              ) : (
                <ShoppingBag className="h-7 w-7 text-muted-foreground/40" />
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {isSearching ? 'Aucun résultat' : 'Aucun produit disponible'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isSearching
                ? `Aucun produit ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`
                : 'Cette boutique n\'a pas encore ajouté de produits. Revenez bientôt !'}
            </p>
            {isSearching && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 mr-2" />
                Effacer la recherche
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cart Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            {/* Expanded Cart */}
            <AnimatePresence>
              {cartExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden bg-card border-t border-b"
                >
                  <ScrollArea className="max-h-64">
                    <div className="max-w-5xl mx-auto p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">
                          Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-7 text-xs"
                          onClick={clearCart}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Tout supprimer
                        </Button>
                      </div>
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-primary font-semibold">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="h-3 w-3 text-destructive" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Button>
                            <span className="text-sm font-semibold min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold w-24 text-right">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex items-center justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart bar buttons */}
            <div className="bg-card border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <div className="max-w-5xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-1.5 shrink-0"
                    onClick={() => setCartExpanded(!cartExpanded)}
                  >
                    {cartExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                    <Badge variant="secondary" className="px-1.5 h-5 text-xs" style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}>
                      {itemCount}
                    </Badge>
                    <span className="hidden sm:inline">panier</span>
                  </Button>

                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--tpl-text-muted)' }}>Total</p>
                    <p className="font-bold text-sm" style={{ color: 'var(--tpl-price)' }}>{formatPrice(total)}</p>
                  </div>

                  <Button
                    className="h-10 gap-2 shrink-0"
                    style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
                    onClick={handleWhatsAppCheckout}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Commander sur WhatsApp</span>
                    <span className="sm:hidden">Commander</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </TemplateProvider>
  )
}
