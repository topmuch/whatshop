/**
 * Server-side JSON-LD component for shop structured data.
 * Renders valid schema.org markup in the initial HTML (visible to crawlers).
 *
 * Maps Boutiko sectors to the most specific schema.org type:
 *   - Store (default e-commerce)
 *   - Restaurant (restaurant sector)
 *   - HealthAndBeautyBusiness (beauté-service, santé)
 *   - ProfessionalService (consulting, formation)
 *   - LocalBusiness (artisanat, fallback)
 */

// ─── Types (DB-level, not Zustand) ──────────────────────────────────────────

export interface ShopSeoData {
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  banner?: string | null
  whatsapp: string
  address?: string | null
  phone?: string | null
  sector?: string | null
  businessHours?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  ogImage?: string | null
  coverImageUrl?: string | null
  contactEmail?: string | null
  products?: Array<{
    name: string
    slug?: string | null
    description?: string | null
    price: number
    image?: string | null
    images?: string | null
    isAvailable: boolean
    categoryId?: string | null
  }>
  categories?: Array<{
    id: string
    name: string
  }>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSchemaType(sector?: string | null): string {
  switch (sector) {
    case 'restaurant':
      return 'Restaurant'
    case 'beaute-service':
    case 'sante':
      return 'HealthAndBeautyBusiness'
    case 'consulting':
    case 'formation':
      return 'ProfessionalService'
    case 'artisanat':
      return 'LocalBusiness'
    default:
      return 'Store'
  }
}

/** Recursively strip undefined/null values — Google rejects them. */
function stripNullish<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      const filtered = value
        .map((item) =>
          typeof item === 'object' && item !== null
            ? stripNullish(item as Record<string, unknown>)
            : item,
        )
        .filter((item) => {
          if (typeof item === 'object' && item !== null)
            return Object.keys(item as Record<string, unknown>).length > 0
          return item !== undefined && item !== null
        })
      if (filtered.length > 0) clean[key] = filtered
    } else if (typeof value === 'object') {
      const stripped = stripNullish(value as Record<string, unknown>)
      if (Object.keys(stripped).length > 0) clean[key] = stripped
    } else {
      clean[key] = value
    }
  }
  return clean
}

/** Parse JSON string arrays safely (images, categories). */
function parseJsonArray(value?: string | null): unknown[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function JsonLdServer({ shop }: { shop: ShopSeoData }) {
  const schemaType = getSchemaType(shop.sector)
  const shopUrl = `https://boutiko.pro/boutique/${shop.slug}`
  const primaryImage = shop.ogImage || shop.banner || shop.logo || shop.coverImageUrl

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: shop.name,
    description: shop.seoDescription || shop.description || `Découvrez ${shop.name} sur Boutiko`,
    url: shopUrl,
    telephone: shop.phone || shop.whatsapp,
    address: shop.address
      ? { '@type': 'PostalAddress', streetAddress: shop.address, addressCountry: 'CI' }
      : undefined,
    image: primaryImage || undefined,
    logo: shop.logo || undefined,
    priceRange: '$$',
  }

  // Opening hours (may be JSON or plain text)
  if (shop.businessHours) {
    try {
      const parsed = JSON.parse(shop.businessHours)
      if (typeof parsed === 'object' && parsed !== null) {
        base.openingHoursSpecification = buildOpeningHours(parsed)
      } else {
        base.openingHours = shop.businessHours
      }
    } catch {
      // Plain text — use as-is
      base.openingHours = shop.businessHours
    }
  }

  // Contact email
  if (shop.contactEmail) {
    base.email = shop.contactEmail
  }

  const isRestaurant = shop.sector === 'restaurant'
  const isService =
    shop.sector === 'beaute-service' ||
    shop.sector === 'sante' ||
    shop.sector === 'consulting' ||
    shop.sector === 'formation' ||
    shop.sector === 'artisanat'

  const availableProducts = (shop.products || []).filter((p) => p.isAvailable)

  // E-commerce: OfferCatalog
  if (!isRestaurant && !isService && availableProducts.length > 0) {
    base.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Produits',
      itemListElement: availableProducts.slice(0, 20).map((p) => {
        const productImages = parseJsonArray(p.images)
        const productImage = p.image || (productImages[0] as string) || undefined
        return stripNullish({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: p.name,
            description: p.description || undefined,
            image: productImage,
            url: p.slug ? `${shopUrl}/p/${p.slug}` : shopUrl,
          },
          price: p.price,
          priceCurrency: 'XOF',
          availability: 'https://schema.org/InStock',
        })
      }),
    }
  }

  // Restaurant: Menu with sections
  if (isRestaurant && shop.categories && shop.categories.length > 0) {
    base.servesCuisine = 'Africaine'
    base.hasMenu = {
      '@type': 'Menu',
      hasMenuSection: shop.categories.map((c) => ({
        '@type': 'MenuSection',
        name: c.name,
        hasMenuItem: availableProducts
          .filter((p) => p.categoryId === c.id)
          .map((p) => ({
            '@type': 'MenuItem',
            name: p.name,
            offers: {
              '@type': 'Offer',
              price: p.price,
              priceCurrency: 'XOF',
            },
          })),
      })),
    }
  }

  // SameAs (WhatsApp deep link as contact)
  if (shop.whatsapp) {
    const cleanPhone = shop.whatsapp.replace(/[^0-9]/g, '')
    if (cleanPhone) {
      base.sameAs = [`https://wa.me/${cleanPhone}`]
    }
  }

  const jsonLd = stripNullish(base)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ─── Opening Hours Builder ──────────────────────────────────────────────────

/**
 * Converts a parsed business hours object into schema.org OpeningHoursSpecification.
 * Expected input format (from DB JSON):
 * { "lundi": "08:00-18:00", "mardi": "09:00-17:00", ... }
 * or { "1": { "open": "08:00", "close": "18:00" }, ... }
 */
function buildOpeningHours(hours: Record<string, unknown>): unknown[] {
  const DAY_MAP: Record<string, string> = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    lundi: 'Monday',
    mardi: 'Tuesday',
    mercredi: 'Wednesday',
    jeudi: 'Thursday',
    vendredi: 'Friday',
    samedi: 'Saturday',
    dimanche: 'Sunday',
  }

  const specs: unknown[] = []

  for (const [key, value] of Object.entries(hours)) {
    const day = DAY_MAP[key]
    if (!day) continue

    if (typeof value === 'string' && value.includes('-')) {
      const [open, close] = value.split('-').map((s) => s.trim())
      if (open && close) {
        specs.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: open,
          closes: close,
        })
      }
    } else if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      const open = typeof obj.open === 'string' ? obj.open : undefined
      const close = typeof obj.close === 'string' ? obj.close : undefined
      if (open && close) {
        specs.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: open,
          closes: close,
        })
      }
    }
  }

  return specs
}