'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  ShoppingCart,
  Truck,
  Package,
  ShieldCheck,
  BadgePercent,
  Leaf,
  ChevronRight,
  Phone,
  Clock,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  ArrowLeft,
  Star,
  Heart,
  MessageCircle,
  Minus,
  X,
  Store,
  Menu,
  RotateCcw,
} from 'lucide-react'
import { useAppStore, type Shop as ShopType, type Product, type Category } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import { buildWhatsAppBuyNowLink, buildWhatsAppCartLink } from '@/lib/whatsapp-utils'
import { useCartStore } from '@/store/cart-store'
import { ThemedCartDrawer, type ThemedCartDrawerTheme } from '@/components/shop/themed-cart-drawer'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════

const TEAL_600 = '#0D9488'
const TEAL_700 = '#0F766E'
const TEAL_800 = '#115E59'
const TEAL_900 = '#134E4A'
const ORANGE_500 = '#F97316'
const ORANGE_400 = '#FB923C'
const GREEN_600 = '#16A34A'
const GREEN_500 = '#22C55E'
const BLUE_500 = '#3B82F6'
const RED_500 = '#EF4444'
const GRAY_50 = '#F9FAFB'
const GRAY_100 = '#F3F4F6'
const GRAY_200 = '#E5E7EB'
const GRAY_300 = '#D1D5DB'
const GRAY_600 = '#6B7280'
const GRAY_800 = '#1F2937'
const GRAY_900 = '#111827'

type View = 'home' | 'product'

interface FreshProduct {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  image: string
  images?: string[]
  categoryId?: string | null
  categoryName?: string | null
  isAvailable: boolean
  createdAt?: string | null
  shortDescription?: string | null
  description?: string | null
  stock?: number | null
}

interface FreshCategory {
  id: string
  name: string
  image?: string | null
}

interface PublicShopData extends ShopType {
  templateType?: string
  contactEmail?: string
}

const FRESH_MARKET_CART_THEME: ThemedCartDrawerTheme = {
  text: GRAY_900,
  textMuted: GRAY_600,
  price: GREEN_600,
  bg: '#ffffff',
  border: GRAY_200,
  primary: TEAL_600,
  primaryLight: '#CCFBF1',
  whatsapp: '#25D366',
  whatsappFg: '#ffffff',
  countBg: TEAL_600,
  imageBg: '#F0FDF4',
  qtyBg: '#F0FDF4',
  roundedItem: 'rounded-lg',
  roundedBtn: 'rounded-lg',
  maxWidth: 'max-w-5xl',
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

export function FreshMarketTemplate({
  initialProducts,
  initialCategories,
}: {
  initialProducts?: Product[]
  initialCategories?: Category[]
} = {}) {
  const { publicShop } = useAppStore()
  const shop = publicShop as PublicShopData | null

  const shopId = shop?.id || ''
  const whatsapp = shop?.whatsapp || ''
  const shopName = shop?.name || ''
  const shopSlug = shop?.slug || ''

  // Cart store
  const cartItems = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const openCart = useCartStore((s) => s.openCart)
  const closeCart = useCartStore((s) => s.closeCart)
  const toggleCart = useCartStore((s) => s.toggleCart)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const removeItem = useCartStore((s) => s.removeItem)

  const itemCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems],
  )
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems],
  )

  // ─── State ───
  const [view, setView] = useState<View>('home')
  const [products, setProducts] = useState<FreshProduct[]>([])
  const [categories, setCategories] = useState<FreshCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<FreshProduct | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [productDetail, setProductDetail] = useState<FreshProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<FreshProduct[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)

  // ─── Initial data fetch ───
  useEffect(() => {
    // If products already provided via props, use them directly
    if (initialProducts && initialProducts.length > 0) {
      const mapped = initialProducts.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
        compareAtPrice: p.oldPrice ?? p.compareAtPrice ?? null,
      })) as FreshProduct[]
      setProducts(mapped)
      if (initialCategories && initialCategories.length > 0) {
        setCategories(initialCategories.map((c) => ({ id: c.id, name: c.name, image: c.image })))
      }
      setLoading(false)
      return
    }

    if (!shop?.slug) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/products`, { cache: 'no-store' }),
          fetch(`/api/shops/${shop!.slug}/categories`, { cache: 'no-store' }),
        ])
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        if (!cancelled) {
          const mappedProducts = (Array.isArray(productsData) ? productsData : []).map((p: Record<string, unknown>) => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
            compareAtPrice: p.oldPrice ?? p.compareAtPrice ?? null,
          }))
          setProducts(mappedProducts)
          setCategories(Array.isArray(categoriesData) ? categoriesData.map((c: { id: string; name: string; image?: string | null }) => ({ id: c.id, name: c.name, image: c.image })) : [])
        }
      } catch {
        if (!cancelled) toast.error('Erreur de chargement de la boutique')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [shop?.slug, initialProducts, initialCategories])

  // ─── Fetch product detail ───
  useEffect(() => {
    if (!selectedProduct) return
    let cancelled = false
    setLoadingProduct(true)
    setProductDetail(null)
    setRelatedProducts([])
    async function loadProduct() {
      try {
        const [prodRes, relatedRes] = await Promise.all([
          fetch(`/api/products/${selectedProduct.id}`),
          fetch(`/api/products/${selectedProduct.id}/related`),
        ])
        const prod = await prodRes.json()
        const related = await relatedRes.json()
        if (!cancelled) {
          setProductDetail(prod)
          setRelatedProducts(Array.isArray(related) ? related : [])
        }
      } catch {
        if (!cancelled) toast.error('Erreur de chargement du produit')
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    }
    loadProduct()
    return () => { cancelled = true }
  }, [selectedProduct])

  // Scroll to top on view change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [view])

  // ─── Derived data ───
  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    return result
  }, [products, selectedCategory, searchQuery])

  const newArrivals = useMemo(() => {
    const sorted = [...products]
      .filter((p) => p.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    return sorted.length > 0 ? sorted : products.slice(0, 10)
  }, [products])

  const dealsOfTheDay = useMemo(() => {
    return products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 10)
  }, [products])

  const bestSellers = useMemo(() => products.slice(0, 10), [products])

  const recommended = useMemo(() => {
    const shuffled = [...products]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 10)
  }, [products])

  // ─── Handlers ───
  const handleAddToCart = useCallback(
    (product: FreshProduct) => {
      addItem(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || null,
          quantity: 1,
        },
        shopId,
      )
      toast.success(`${product.name} ajout\u00e9 au panier`)
    },
    [addItem, shopId],
  )

  const handleProductClick = useCallback((p: FreshProduct) => {
    setSelectedProduct(p)
    setView('product')
  }, [])

  const handleCategoryClick = useCallback(
    (catId: string | null) => {
      setSelectedCategory(catId)
      setView('home')
      setTimeout(() => {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    },
    [],
  )

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return
    const link = buildWhatsAppCartLink({
      whatsapp,
      shopName,
      items: cartItems,
      subtotal: cartTotal,
      total: cartTotal,
    })
    window.open(link, '_blank', 'noopener,noreferrer')
  }, [whatsapp, shopName, cartItems, cartTotal])

  const handleCartToggle = useCallback(() => {
    if (isOpen) {
      closeCart()
    } else {
      openCart()
    }
  }, [isOpen, openCart, closeCart])

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
      </div>
    )
  }

  if (!shop) return null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── TOP BAR ─── */}
      <div className="bg-teal-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {shop.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3" />
                {shop.phone}
              </span>
            )}
            <span className="hidden sm:flex items-center gap-1.5">
              <Truck className="size-3" />
              Livraison en 24h
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3" />
              Lun - Sam : 7h - 20h
            </span>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 md:hidden"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <button
            type="button"
            onClick={() => { setView('home'); setSelectedCategory(null); setSearchQuery('') }}
            className="flex items-center gap-2 shrink-0 min-h-[44px]"
            aria-label="Retour \u00e0 l'accueil"
          >
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="h-9 md:h-10 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-gray-900 hidden sm:inline">
                  {shopName}
                </span>
              </div>
            )}
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); setView('home') }}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => { setView('home'); setSelectedCategory(null); setSearchQuery('') }}
              className="text-sm font-medium text-teal-700 hover:text-teal-600 transition-colors"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => {
                setView('home')
                setTimeout(() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
              }}
              className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
            >
              Boutique
            </button>
          </nav>

          {/* Cart button */}
          <button
            type="button"
            onClick={handleCartToggle}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            aria-label="Ouvrir le panier"
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile search bar */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); setView('home') }}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <nav className="px-4 py-3 space-y-1">
                <button
                  type="button"
                  onClick={() => { setView('home'); setSelectedCategory(null); setSearchQuery(''); setMobileMenuOpen(false) }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-teal-700 bg-teal-50"
                >
                  Accueil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('home')
                    setMobileMenuOpen(false)
                    setTimeout(() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Boutique
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Contact
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── MAIN VIEW ─── */}
      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            products={products}
            filteredProducts={filteredProducts}
            newArrivals={newArrivals}
            dealsOfTheDay={dealsOfTheDay}
            bestSellers={bestSellers}
            recommended={recommended}
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            shopName={shopName}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onCategoryClick={handleCategoryClick}
            categoryRef={categoryRef}
          />
        )}

        {view === 'product' && (
          <ProductDetailView
            key={productDetail?.id || 'empty'}
            product={productDetail}
            loading={loadingProduct}
            relatedProducts={relatedProducts}
            whatsapp={whatsapp}
            shopName={shopName}
            shopId={shopId}
            onAddToCart={handleAddToCart}
            onBuyNow={() => {
              if (!selectedProduct) return
              const link = buildWhatsAppBuyNowLink({
                whatsapp,
                shopName,
                productName: selectedProduct.name,
                price: selectedProduct.price,
              })
              window.open(link, '_blank', 'noopener,noreferrer')
            }}
            onBack={() => setView('home')}
            onProductClick={handleProductClick}
          />
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer id="footer" className="mt-auto bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {shop.logo ? (
                  <img src={shop.logo} alt={shopName} className="h-8 w-auto max-w-[140px] object-contain brightness-0 invert" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                      <Store className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base font-bold text-white">{shopName}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Votre march\u00e9 de produits frais en ligne. Qualit\u00e9, fra\u00eecheur et livraison rapide \u00e0 domicile.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="Facebook">
                  <Facebook className="size-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="Instagram">
                  <Instagram className="size-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="Twitter">
                  <Twitter className="size-4" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Liens rapides</h4>
              <ul className="space-y-2.5">
                <li><button type="button" onClick={() => { setView('home'); setSelectedCategory(null) }} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">Accueil</button></li>
                <li><button type="button" onClick={() => { setView('home'); setTimeout(() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">Boutique</button></li>
                <li><span className="text-sm text-gray-400">Promotions</span></li>
                <li><span className="text-sm text-gray-400">Nouveaut\u00e9s</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <ul className="space-y-2.5">
                {shop.address && (
                  <li className="flex items-start gap-2 text-sm text-gray-400">
                    <MapPin className="size-4 shrink-0 mt-0.5 text-teal-500" />
                    {shop.address}
                  </li>
                )}
                {shop.phone && (
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="size-4 shrink-0 text-teal-500" />
                    {shop.phone}
                  </li>
                )}
                {shop.contactEmail && (
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="size-4 shrink-0 text-teal-500" />
                    {shop.contactEmail}
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-3">
                Inscrivez-vous pour recevoir nos offres et promotions.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="h-10 px-4 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shrink-0"
                >
                  OK
                </button>
              </div>
              {/* Payment icons */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-gray-500">Paiement s\u00e9curis\u00e9 :</span>
                <div className="flex items-center gap-1.5">
                  {['Visa', 'MC', 'Orange', 'MTN'].map((p) => (
                    <span key={p} className="px-2 py-1 rounded bg-gray-800 text-[10px] font-bold text-gray-400 border border-gray-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {shopName}. Tous droits r\u00e9serv\u00e9s.
            </p>
            <p className="text-xs text-gray-500">
              Fait avec soin pour vous servir le meilleur
            </p>
          </div>
        </div>
      </footer>

      {/* ─── CART DRAWER ─── */}
      <ThemedCartDrawer
        expanded={isOpen}
        onToggle={handleCartToggle}
        onClear={() => { clearCart(); closeCart(); toast.success('Panier vid\u00e9') }}
        onCheckout={handleCheckout}
        total={cartTotal}
        itemCount={itemCount}
        cart={cartItems}
        updateCartQuantity={(id, qty) => updateQuantity(id, qty)}
        removeFromCart={(productId) => removeItem(productId)}
        theme={FRESH_MARKET_CART_THEME}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════════════════

function HomeView({
  products,
  filteredProducts,
  newArrivals,
  dealsOfTheDay,
  bestSellers,
  recommended,
  categories,
  selectedCategory,
  searchQuery,
  shopName,
  onProductClick,
  onAddToCart,
  onCategoryClick,
  categoryRef,
}: {
  products: FreshProduct[]
  filteredProducts: FreshProduct[]
  newArrivals: FreshProduct[]
  dealsOfTheDay: FreshProduct[]
  bestSellers: FreshProduct[]
  recommended: FreshProduct[]
  categories: FreshCategory[]
  selectedCategory: string | null
  searchQuery: string
  shopName: string
  onProductClick: (p: FreshProduct) => void
  onAddToCart: (p: FreshProduct) => void
  onCategoryClick: (catId: string | null) => void
  categoryRef: React.RefObject<HTMLDivElement | null>
}) {
  // ─── Hero Slider state ───
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=864&h=1152&fit=crop',
      badge: 'Promotions Sp\u00e9ciales',
      title: <>Jusqu&apos;\u00e0 <span className="text-yellow-200">-30%</span></>,
      subtitle: 'D\u00e9couvrez notre s\u00e9lection de produits frais et de saison \u00e0 des prix imbattables.',
      cta: 'D\u00e9couvrir',
    },
    {
      image: '/slider-slide2.png',
      badge: 'Offres du Jour',
      title: <>Produits <span className="text-green-200">Frais</span> Quotidiennement</>,
      subtitle: 'S\u00e9lection rigoureuse de produits frais chaque matin, directement des producteurs locaux.',
      cta: 'Voir les offres',
    },
    {
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=864&h=1152&fit=crop',
      badge: 'Nouveaut\u00e9s',
      title: <>D\u00e9couvrez nos <span className="text-teal-200">Nouveaut\u00e9s</span></>,
      subtitle: 'De nouveaux produits arrivent chaque semaine. Soyez les premiers \u00e0 les d\u00e9guster !',
      cta: 'Explorer',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  return (
    <>
      {/* ─── HERO SLIDER ─── */}
      {!searchQuery && !selectedCategory && (
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full overflow-hidden min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]"
          >
            {/* Background images with crossfade */}
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: idx === currentSlide ? 1 : 0 }}
              >
                <img
                  src={slide.image}
                  alt=""
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}

            {/* Content */}
            <div className="relative z-10 h-full flex items-center px-6 sm:px-10 lg:px-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-xl"
                >
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    {heroSlides[currentSlide].badge}
                  </span>
                  <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-2 sm:mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p className="text-white/90 text-sm sm:text-lg mb-4 sm:mb-6 max-w-md" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-white text-teal-700 font-semibold rounded-full hover:bg-teal-50 transition-colors shadow-lg text-sm sm:text-base"
                  >
                    {heroSlides[currentSlide].cta}
                    <ChevronRight className="size-4" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ─── PROMOTIONAL TILES ─── */}
      {!searchQuery && !selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PromoTile
              color={BLUE_500}
              lightColor="#EFF6FF"
              title="Nouveaut\u00e9s"
              description="D\u00e9couvrez les derniers produits"
              icon={<Star className="size-6" />}
              onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
            />
            <PromoTile
              color={GREEN_500}
              lightColor="#F0FDF4"
              title="Choix Rafra\u00eechissant"
              description="Produits frais s\u00e9lectionn\u00e9s"
              icon={<Leaf className="size-6" />}
              onClick={() => document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' })}
            />
            <PromoTile
              color={RED_500}
              lightColor="#FEF2F2"
              title="Offres Sp\u00e9ciales"
              description="Jusqu'\u00e0 -30% sur une s\u00e9lection"
              icon={<BadgePercent className="size-6" />}
              onClick={() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </section>
      )}

      {/* ─── CATEGORY ICONS ROW ─── */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div ref={categoryRef} className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* All category */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => onCategoryClick(null)}>
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 flex items-center justify-center transition-colors ${
                  !selectedCategory ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="size-8 text-teal-600" />
                  </div>
                </div>
                <span className={`text-sm font-medium text-center max-w-[90px] truncate ${
                  !selectedCategory ? 'text-teal-700' : 'text-gray-500'
                }`}>Tout</span>
              </div>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
                  onClick={() => onCategoryClick(cat.id)}
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 flex items-center justify-center transition-colors ${
                    selectedCategory === cat.id ? 'border-teal-500 bg-teal-50' : 'border-teal-100 bg-teal-50'
                  }`}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Leaf className="size-8 text-teal-600" />
                    )}
                  </div>
                  <span className={`text-sm font-medium text-center max-w-[90px] truncate ${
                    selectedCategory === cat.id ? 'text-teal-700' : 'text-gray-600'
                  }`}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TOUS LES PRODUITS ─── */}
      {!searchQuery && !selectedCategory && products.length > 0 && (
        <section id="products-section" className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Tous les produits</h2>
            <span className="text-sm text-gray-500">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => onProductClick(p)}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
                badge={p.compareAtPrice && p.compareAtPrice > p.price ? 'sale' : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── SEARCH / CATEGORY RESULTS ─── */}
      {(searchQuery.trim() || selectedCategory) && (
        <section id="products-section" className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {searchQuery.trim()
                  ? `R\u00e9sultats pour "${searchQuery}"`
                  : selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name || 'Cat\u00e9gorie'
                    : 'Tous les produits'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouv\u00e9{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            {(searchQuery.trim() || selectedCategory) && (
              <button
                type="button"
                onClick={() => onCategoryClick(null)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                <X className="size-3.5" />
                Effacer
              </button>
            )}
          </div>
          {filteredProducts.length === 0 ? (
            <EmptyState message="Aucun produit trouv\u00e9" />
          ) : (
            <ProductGrid products={filteredProducts} onProductClick={onProductClick} onAddToCart={onAddToCart} />
          )}
        </section>
      )}

      {/* ─── NOUVEAUTÉS ─── */}
      {!searchQuery && !selectedCategory && newArrivals.length > 0 && (
        <section id="new-arrivals" className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nouveaut\u00e9s</h2>
            <button
              type="button"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => onProductClick(p)}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
                badge="new"
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── OFFRES DU JOUR ─── */}
      {!searchQuery && !selectedCategory && dealsOfTheDay.length > 0 && (
        <section id="deals" className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Offres du jour</h2>
            <button
              type="button"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dealsOfTheDay.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => onProductClick(p)}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
                badge="sale"
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── MEILLEURES VENTES ─── */}
      {!searchQuery && !selectedCategory && bestSellers.length > 0 && (
        <section id="best-sellers" className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Meilleures ventes</h2>
            <button
              type="button"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => onProductClick(p)}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── RECOMMANDÉ POUR VOUS ─── */}
      {!searchQuery && !selectedCategory && recommended.length > 0 && (
        <section id="recommended" className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recommand\u00e9 pour vous</h2>
              <button
                type="button"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommended.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => onProductClick(p)}
                  onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRUST SECTION ─── */}
      {!searchQuery && !selectedCategory && (
        <section className="bg-teal-700">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 max-w-xl mx-auto">
                Bringing families together over fresh and authentic food
              </h2>
              <p className="text-teal-100/80 text-sm sm:text-base mb-6 max-w-md mx-auto">
                Nous s\u00e9lectionnons pour vous les meilleurs produits frais, directement aupr\u00e8s des producteurs locaux.
              </p>
              <button
                type="button"
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-full hover:bg-teal-50 transition-colors"
              >
                D\u00e9couvrir nos produits
                <ChevronRight className="size-4" />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── SERVICE ICONS ─── */}
      {!searchQuery && !selectedCategory && (
        <section className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <ServiceIcon
                icon={<Truck className="size-7 text-teal-600" />}
                title="Livraison rapide"
                description="Livraison en 24h dans toute la ville"
              />
              <ServiceIcon
                icon={<Package className="size-7 text-teal-600" />}
                title="1500+ Produits"
                description="Large s\u00e9lection de produits frais"
              />
              <ServiceIcon
                icon={<ShieldCheck className="size-7 text-teal-600" />}
                title="Qualit\u00e9 garantie"
                description="Produits soigneusement s\u00e9lectionn\u00e9s"
              />
              <ServiceIcon
                icon={<BadgePercent className="size-7 text-teal-600" />}
                title="Meilleurs prix"
                description="Prix comp\u00e9titifs tous les jours"
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT SECTION (horizontal scroll)
// ═══════════════════════════════════════════════════════════════════════════

function ProductSection({
  id,
  title,
  products,
  onProductClick,
  onAddToCart,
  badge,
  bg = false,
}: {
  id: string
  title: string
  products: FreshProduct[]
  onProductClick: (p: FreshProduct) => void
  onAddToCart: (p: FreshProduct) => void
  badge?: 'new' | 'sale'
  bg?: boolean
}) {
  if (products.length === 0) return null
  return (
    <section id={id} className={bg ? 'bg-gray-50' : 'bg-white'}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map((p) => (
            <div key={p.id} className="shrink-0 w-[280px] sm:w-[240px] snap-start">
              <ProductCard
                product={p}
                onClick={() => onProductClick(p)}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
                badge={badge}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT GRID (for search/category results)
// ═══════════════════════════════════════════════════════════════════════════

function ProductGrid({
  products,
  onProductClick,
  onAddToCart,
}: {
  products: FreshProduct[]
  onProductClick: (p: FreshProduct) => void
  onAddToCart: (p: FreshProduct) => void
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onClick={() => onProductClick(p)}
          onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
          badge={p.compareAtPrice && p.compareAtPrice > p.price ? 'sale' : undefined}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD
// ═══════════════════════════════════════════════════════════════════════════

function ProductCard({
  product,
  onClick,
  onAddToCart,
  badge,
}: {
  product: FreshProduct
  onClick: () => void
  onAddToCart: (e: React.MouseEvent) => void
  badge?: 'new' | 'sale'
}) {
  const discount = useMemo(() => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
  }, [product.compareAtPrice, product.price])

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer w-full"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-gray-50">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          fallbackIcon="package"
        />
        {/* Badges */}
        {badge === 'new' && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold uppercase rounded-md">
            New
          </span>
        )}
        {discount !== null && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded-md">
            -{discount}%
          </span>
        )}
        {/* Wishlist */}
        <button
          type="button"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
          aria-label="Ajouter aux favoris"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="size-4 text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] leading-5">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-base font-bold" style={{ color: GREEN_600 }}>
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            className="h-9 w-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
            onClick={onAddToCart}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <Plus className="size-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMO TILE
// ═══════════════════════════════════════════════════════════════════════════

function PromoTile({
  color,
  lightColor,
  title,
  description,
  icon,
  onClick,
}: {
  color: string
  lightColor: string
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-xl p-5 text-left transition-shadow hover:shadow-md w-full"
      style={{ backgroundColor: lightColor, borderLeft: `4px solid ${color}` }}
    >
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE ICON
// ═══════════════════════════════════════════════════════════════════════════

function ServiceIcon({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="h-14 w-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Package className="size-7 text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-sm text-gray-400 mt-1">Essayez avec d&apos;autres mots-cl\u00e9s</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ProductDetailView({
  product,
  loading,
  relatedProducts,
  whatsapp,
  shopName,
  shopId,
  onAddToCart,
  onBuyNow,
  onBack,
  onProductClick,
}: {
  product: FreshProduct | null
  loading: boolean
  relatedProducts: FreshProduct[]
  whatsapp: string
  shopName: string
  shopId: string
  onAddToCart: (p: FreshProduct) => void
  onBuyNow: () => void
  onBack: () => void
  onProductClick: (p: FreshProduct) => void
}) {
  const [qty, setQty] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Build the image gallery: use detailed images array, fallback to single image
  const galleryImages = useMemo(() => {
    if (!product) return []
    const imgs = product.images && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : []
    return imgs
  }, [product])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-gray-500 font-medium">Produit introuvable</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 min-h-[44px]"
        >
          <ArrowLeft className="size-4" />
          Retour \u00e0 la boutique
        </button>
      </div>
    )
  }

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const currentImage = galleryImages[activeImageIndex] || product.image

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 font-medium mb-6 transition-colors min-h-[44px]"
      >
        <ArrowLeft className="size-4" />
        Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* ─── Image Gallery ─── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Main image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <ImageWithFallback
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover"
              fallbackIcon="package"
            />
            {discount !== null && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                -{discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    idx === activeImageIndex
                      ? 'border-teal-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    fallbackIcon="package"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── Product Details ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          {/* Category */}
          {product.categoryName && (
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
              {product.categoryName}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold" style={{ color: GREEN_600 }}>
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount !== null && (
              <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs font-bold rounded-md">
                -{discount}%
              </span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4 font-medium">
              {product.shortDescription}
            </p>
          )}

          {/* Full description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                {product.description}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          {product.stock !== undefined && product.stock !== null && (
            <div className="flex items-center gap-2 mb-5">
              <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-medium text-gray-700">Quantit\u00e9 :</span>
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-teal-600 transition-colors"
                aria-label="Diminuer"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-teal-600 transition-colors"
                aria-label="Augmenter"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                for (let i = 0; i < qty; i++) {
                  onAddToCart(product)
                }
              }}
              className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="size-5" />
              Ajouter au panier
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onBuyNow}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="size-5" />
              Acheter via WhatsApp
            </motion.button>
          </div>

          {/* Service badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
              <Truck className="size-5 text-teal-600 mb-1.5" />
              <span className="text-xs text-gray-600 font-medium">Livraison 24h</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
              <ShieldCheck className="size-5 text-teal-600 mb-1.5" />
              <span className="text-xs text-gray-600 font-medium">Qualit\u00e9 garantie</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
              <RotateCcw className="size-5 text-teal-600 mb-1.5" />
              <span className="text-xs text-gray-600 font-medium">Retour facile</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => { onProductClick(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onAddToCart={(e) => { e.stopPropagation(); onAddToCart(p) }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

