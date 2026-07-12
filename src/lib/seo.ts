// Client-side SEO utility — injects dynamic meta tags when a shop is loaded

const AFRICAN_KEYWORDS = [
  'boutique en ligne',
  'e-commerce Afrique',
  'acheter en ligne',
  'vente en ligne',
  'WhatsApp shopping',
  'boutique en ligne Sénégal',
  'boutique en ligne Côte d\'Ivoire',
  'boutique en ligne Cameroun',
  'boutique en ligne Mali',
  'boutique en ligne Togo',
  'boutique en ligne Bénin',
  'boutique en ligne Burkina Faso',
  'boutique en ligne Niger',
  'boutique en ligne Tchad',
  'boutique en ligne Guinée',
]

export function injectShopMeta(shop: { name: string; slug: string; description?: string | null; logo?: string | null; whatsapp?: string | null }) {
  if (typeof document === 'undefined') return

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'
  const title = `${shop.name} — Boutique en ligne sur Boutiko`
  const description = shop.description 
    ? shop.description.slice(0, 160) 
    : `Découvrez les produits de ${shop.name} sur Boutiko. Boutique en ligne en Afrique. Commandez sur WhatsApp, paiement Mobile Money.`
  const ogImage = (shop as Record<string, unknown>).ogImage as string | undefined
    || shop.logo || `${baseUrl}/api/og?shop=${shop.slug}`
  const url = `${baseUrl}/${shop.slug}`

  // Helper to set or create meta tag
  const setMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  document.title = title
  
  setMeta('name', 'description', description)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:image', ogImage)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:locale', 'fr_FR')
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', ogImage)
  setMeta('name', 'keywords', [shop.name, 'Boutiko', ...AFRICAN_KEYWORDS].join(', '))

  // Inject JSON-LD structured data for LocalBusiness
  let jsonLd = document.getElementById('shop-structured-data') as HTMLScriptElement | null
  if (!jsonLd) {
    jsonLd = document.createElement('script')
    jsonLd.id = 'shop-structured-data'
    jsonLd.type = 'application/ld+json'
    document.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop.name,
    description: description,
    url: url,
    image: ogImage,
    telephone: shop.whatsapp || undefined,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CI',
    },
  })
}

export function resetMeta() {
  if (typeof document === 'undefined') return
  
  document.title = 'Boutiko — Créez votre boutique en ligne en Afrique'
  
  const defaults: Record<string, string> = {
    'description': 'Créez votre boutique en ligne en Afrique francophone. E-commerce au Sénégal, Côte d\'Ivoire, Cameroun, Mali, Togo, Bénin, Burkina Faso, Niger, Tchad, Guinée. Vendez sur WhatsApp, Mobile Money.',
    'og:title': 'Boutiko — Créez votre boutique en ligne en Afrique',
    'og:description': 'Créez votre boutique en ligne en Afrique francophone. E-commerce au Sénégal, Côte d\'Ivoire, Cameroun, Mali, Togo, Bénin, Burkina Faso, Niger, Tchad, Guinée.',
    'og:image': 'https://boutiko.pro/og-boutiko.png',
    'og:url': 'https://boutiko.pro',
    'og:type': 'website',
    'og:locale': 'fr_FR',
    'twitter:card': '',
    'twitter:title': '',
    'twitter:description': '',
    'twitter:image': '',
    'keywords': AFRICAN_KEYWORDS.join(', '),
  }

  // Map property/name keys to their attribute selectors
  const attrMap: Record<string, string> = {
    'description': 'name',
    'og:title': 'property',
    'og:description': 'property',
    'og:image': 'property',
    'og:url': 'property',
    'og:type': 'property',
    'og:locale': 'property',
    'twitter:card': 'name',
    'twitter:title': 'name',
    'twitter:description': 'name',
    'twitter:image': 'name',
    'keywords': 'name',
  }

  for (const [key, content] of Object.entries(defaults)) {
    const attr = attrMap[key]
    const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
    if (el) {
      if (content) {
        el.setAttribute('content', content)
      }
    }
  }

  // Remove shop structured data (both old and new)
  const jsonLd = document.getElementById('shop-structured-data')
  if (jsonLd) jsonLd.remove()
  const boutikoJsonLd = document.getElementById('boutiko-jsonld')
  if (boutikoJsonLd) boutikoJsonLd.remove()
}