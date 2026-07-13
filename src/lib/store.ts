import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppView = 'landing' | 'login' | 'register' | 'onboarding' | 'dashboard' | 'reseller' | 'shop' | 'admin' | 'about' | 'pricing' | 'contact' | 'privacy' | 'terms' | 'faq'
export type DashboardTab = 'overview' | 'analytics' | 'stats' | 'messages' | 'products' | 'categories' | 'orders' | 'live' | 'marketing-kit' | 'templates' | 'settings' | 'integrations' | 'ai-tools' | 'single-product'
export type AdminTab = 'admin-overview' | 'admin-subscriptions' | 'admin-domains' | 'admin-upgrades' | 'admin-config' | 'admin-support' | 'admin-moderation' | 'admin-marketing' | 'admin-users' | 'admin-shops' | 'admin-orders' | 'admin-admins' | 'admin-resellers' | 'admin-notifications'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image?: string
  quantity: number
}

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface Shop {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  banner?: string
  whatsapp: string
  address?: string
  phone?: string
  plan: string
  businessType?: string
  sector?: string
  template: string
  accentColor?: string
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  ogImage?: string
  coverImageUrl?: string
  customDomain?: string
  customDomainStatus?: string
  subscriptionStatus?: string
  subscriptionEndDate?: string
  trialEndDate?: string
  heroImages?: string
  promoBanners?: string
  brands?: string
  primaryColor?: string
  secondaryColor?: string
  customColors?: string // JSON: { primary?, secondary?, accent? }
  heroTitle?: string
  heroSubtitle?: string
  heroTagline?: string
  heroImageUrl?: string
  consultantPhotoUrl?: string
  aboutText?: string
  contactEmail?: string
  businessHours?: string
  googleMapsUrl?: string
  productsTitle?: string
  productsTagline?: string
  categoriesTitle?: string
  categoriesTagline?: string
  testimonialsTitle?: string
  testimonialsTagline?: string
  trustBadges?: string
  footerLinks?: string
  // Analytics
  whatsappClicks?: number
  contactFormSubmits?: number
  pageViews?: number
  // Facebook Integrations
  facebookConnected?: boolean
  facebookPageId?: string
  facebookPageName?: string
  facebookPixelId?: string
  facebookCatalogId?: string
  catalogEnabled?: boolean
  catalogLastSync?: string
  catalogProductCount?: number
  notificationPreferences?: string | Record<string, unknown>
  trackPageViews?: boolean
  trackProductViews?: boolean
  trackWhatsAppClicks?: boolean
  // Restaurant menu QR
  isRestaurant?: boolean
  qrCodeUrl?: string
  // Live mode
  isLiveMode?: boolean
  liveProductId?: string
  liveStartedAt?: string
  liveUrl?: string | null
  ownerId?: string | null
  // Single Product Landing Page template
  templateType?: string // STANDARD | SINGLE_PRODUCT | MODERN_STORE | MODERN_STORE_2 | COSMIKA_DARK | FRESH_MARKET | MINIMALISTE
  singleProductConfig?: string | null // JSON string
  modernStoreConfig?: string | null // JSON string
}

export interface Testimonial {
  id: string
  clientName: string
  clientAvatar?: string
  clientRole?: string
  comment: string
  rating: number
  createdAt: string
}

export interface TrustBadge {
  emoji: string
  title: string
  subtitle: string
  order: number
}

export interface Product {
  id: string
  name: string
  slug?: string
  shortDescription?: string
  description?: string
  price: number
  oldPrice?: number | null
  image?: string
  images?: string[]
  stock?: number
  isAvailable: boolean
  categoryId?: string
  categoryName?: string
  createdAt?: string
  isFeatured?: boolean
  isBestSeller?: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  productCount?: number
}

export interface ShippingZone {
  id: string
  shopId: string
  name: string
  price: number
  sortOrder: number
}

interface AppState {
  // Navigation
  view: AppView
  setView: (view: AppView) => void
  dashboardTab: DashboardTab
  setDashboardTab: (tab: DashboardTab) => void
  adminTab: AdminTab
  setAdminTab: (tab: AdminTab) => void
  shopSlug: string
  setShopSlug: (slug: string) => void

  // Auth
  user: User | null
  shop: Shop | null
  shops: Shop[]
  setUser: (user: User | null) => void
  setShop: (shop: Shop | null) => void
  setShops: (shops: Shop[]) => void
  isAuthenticated: boolean

  // Cart (for public shop)
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number

  // Shipping zone selection (for public shop cart)
  selectedShippingZone: ShippingZone | null
  setSelectedShippingZone: (zone: ShippingZone | null) => void

  // Public shop data
  publicShop: Shop | null
  publicProducts: Product[]
  publicCategories: Category[]
  setPublicShop: (shop: Shop | null) => void
  setPublicProducts: (products: Product[]) => void
  setPublicCategories: (categories: Category[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      view: 'landing' as AppView,
      setView: (view) => set({ view }),
      dashboardTab: 'overview',
      setDashboardTab: (tab) => set({ dashboardTab: tab }),
      adminTab: 'admin-overview' as AdminTab,
      setAdminTab: (tab) => set({ adminTab: tab }),
      shopSlug: '',
      setShopSlug: (slug) => {
        set({ shopSlug: slug, view: 'shop' })
      },

      // Auth
      user: null,
      shop: null,
      shops: [],
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setShop: (shop) => set({ shop }),
      setShops: (shops) => set({ shops }),
      isAuthenticated: false,

      // Cart
      cart: [],
      addToCart: (item) => {
        const { cart } = get()
        const existing = cart.find((c) => c.productId === item.productId)
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          })
        } else {
          set({ cart: [...cart, { ...item, id: crypto.randomUUID() }] })
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((c) => c.productId !== productId) })
      },
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
        } else {
          set({
            cart: get().cart.map((c) =>
              c.productId === productId ? { ...c, quantity } : c
            ),
          })
        }
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      // Shipping zone selection
      selectedShippingZone: null,
      setSelectedShippingZone: (zone) => set({ selectedShippingZone: zone }),

      // Public shop data
      publicShop: null,
      publicProducts: [],
      publicCategories: [],
      setPublicShop: (shop) => set({ publicShop: shop }),
      setPublicProducts: (products) => set({ publicProducts: products }),
      setPublicCategories: (categories) => set({ publicCategories: categories }),
    }),
    {
      name: 'boutiko-storage',
      partialize: (state) => ({
        cart: state.cart,
        // view is NOT persisted — it must always be derived from the URL on page load
        // to prevent stale 'dashboard' view from hijacking shop slug routes.
        user: state.user,
        shop: state.shop,
        shops: state.shops,
        isAuthenticated: state.isAuthenticated,
      }),
      // Custom merge: explicitly EXCLUDE 'view' from the loaded state.
      // The default merge is a shallow spread ({ ...state, ...partial }), which means
      // old localStorage entries that still contain view:'dashboard' would
      // overwrite the initial view:'landing' and hijack shop-slug routes.
      merge: (persistedState, currentState) => {
        const filtered = { ...(persistedState as Record<string, unknown>) }
        delete filtered['view']
        delete filtered['dashboardTab']
        delete filtered['adminTab']
        delete filtered['shopSlug']
        delete filtered['publicShop']
        delete filtered['publicProducts']
        delete filtered['publicCategories']
        delete filtered['selectedShippingZone']
        return { ...currentState, ...filtered } as AppState
      },
    }
  )
)
