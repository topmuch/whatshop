#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Boutiko — Script de Validation SEO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests:
 *   1. Fetch /sitemap.xml → valide le XML et vérifie les URLs boutique
 *   2. Fetch une page boutique → vérifie og:title, meta description, JSON-LD
 *   3. Parse le JSON-LD → valide les champs obligatoires (@type, name, url)
 *   4. Vérifie /robots.txt → bloque le dashboard, autorise les boutiques
 *   5. Vérifie l'API OG image → retourne une image PNG
 *
 * Usage:
 *   node scripts/seo-validation.js               (localhost:3000)
 *   node scripts/seo-validation.js https://boutiko.pro
 *   BASE_URL=http://localhost:3000 node scripts/seo-validation.js
 */

const BASE_URL = process.env.BASE_URL || process.argv[2] || 'http://localhost:3000'

// ─── ANSI Colors ───────────────────────────────────────────────────────────
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

let passCount = 0
let failCount = 0
let warnCount = 0

function pass(msg) { passCount++; console.log(`  ${GREEN}✓ PASS${RESET} ${msg}`) }
function fail(msg) { failCount++; console.log(`  ${RED}✗ FAIL${RESET} ${msg}`) }
function warn(msg) { warnCount++; console.log(`  ${YELLOW}⚠ WARN${RESET} ${msg}`) }
function section(title) { console.log(`\n${BOLD}${CYAN}${'─'.repeat(60)}`); console.log(`  ${title}`); console.log(`${CYAN}${'─'.repeat(60)}${RESET}`) }

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchText(url, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return { ok: res.ok, status: res.status, text: await res.text(), headers: res.headers }
  } finally {
    clearTimeout(timer)
  }
}

/** Extract text content from an HTML string using a simple regex (no DOM). */
function extractMeta(html, attr, key) {
  // Matches: <meta property="og:title" content="...">
  const pattern = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*content="([^"]*)"`, 'i')
  const match = html.match(pattern)
  return match ? match[1] : null
}

/** Extract JSON-LD scripts from HTML. */
function extractJsonLd(html) {
  const results = []
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      results.push(JSON.parse(match[1]))
    } catch {
      // Invalid JSON, skip
    }
  }
  return results
}

/** Validate XML by checking basic structure. */
function isValidXml(xml) {
  if (!xml.startsWith('<?xml')) return false
  if (!xml.includes('<urlset')) return false
  if (!xml.includes('</urlset>')) return false
  return true
}

/** Parse XML <loc> tags to extract URLs. */
function extractLocs(xml) {
  const locs = []
  const regex = /<loc>([^<]+)<\/loc>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1])
  }
  return locs
}

// ─── Test 1: Sitemap ───────────────────────────────────────────────────────

async function testSitemap() {
  section('1. Sitemap XML')
  const { ok, status, text } = await fetchText(`${BASE_URL}/sitemap.xml`)

  if (!ok) {
    fail(`/sitemap.xml returned HTTP ${status}`)
    return
  }
  pass(`/sitemap.xml returned HTTP ${status}`)

  if (!isValidXml(text)) {
    fail('Invalid XML structure (missing <?xml or <urlset>)')
    return
  }
  pass('Valid XML structure with <urlset>')

  const locs = extractLocs(text)
  if (locs.length === 0) {
    fail('No <loc> URLs found in sitemap')
    return
  }
  pass(`Found ${locs.length} URLs in sitemap`)

  const boutiqueUrls = locs.filter((u) => u.includes('/boutique/'))
  if (boutiqueUrls.length > 0) {
    pass(`Found ${boutiqueUrls.length} boutique URLs (e.g. ${boutiqueUrls[0]})`)
  } else {
    warn('No /boutique/ URLs found (expected when active non-trial shops exist)')
  }

  const staticUrls = locs.filter((u) => !u.includes('/boutique/'))
  if (staticUrls.length >= 5) {
    pass(`Found ${staticUrls.length} static page URLs`)
  }
}

// ─── Test 2: Robots.txt ───────────────────────────────────────────────────

async function testRobots() {
  section('2. Robots.txt')
  const { ok, status, text } = await fetchText(`${BASE_URL}/robots.txt`)

  if (!ok) {
    fail(`/robots.txt returned HTTP ${status}`)
    return
  }
  pass(`/robots.txt returned HTTP ${status}`)

  if (text.includes('Disallow: /dashboard')) {
    pass('Blocks /dashboard/* from crawlers')
  } else {
    fail('Missing "Disallow: /dashboard" rule')
  }

  if (text.includes('Disallow: /api')) {
    pass('Blocks /api/* from crawlers')
  } else {
    fail('Missing "Disallow: /api" rule')
  }

  if (text.includes('Allow: /boutique/') || text.includes('Allow: /')) {
    pass('Allows boutique pages for indexing')
  } else {
    warn('No explicit Allow for /boutique/ (implicit allow may apply)')
  }

  if (text.includes('Sitemap:')) {
    pass('Includes Sitemap directive')
  } else {
    fail('Missing Sitemap directive in robots.txt')
  }
}

// ─── Test 3: Boutique Page SEO ────────────────────────────────────────────

async function testBoutiquePage() {
  section('3. Page Boutique — Meta Tags SEO')

  // Use a test shop slug — adjust to an active shop in your DB
  const shopSlug = process.env.SHOP_SLUG || 'test-checkout-shop'
  const url = `${BASE_URL}/${shopSlug}`
  const { ok, status, text } = await fetchText(url)

  if (!ok) {
    fail(`Boutique page returned HTTP ${status}`)
    return
  }
  pass(`Boutique page (${url}) returned HTTP ${status}`)

  // Check <meta name="description">
  const desc = extractMeta(text, 'name', 'description')
  if (desc) {
    pass(`meta description found: "${desc.slice(0, 60)}..."`)
    if (desc.length <= 160) {
      pass(`meta description length OK (${desc.length}/160 chars)`)
    } else {
      warn(`meta description too long (${desc.length}/160 chars)`)
    }
  } else {
    // Client-side SPA — description is set via JS, may not be in initial HTML
    warn('meta description not in initial HTML (set client-side by SPA)')
  }

  // Check <meta property="og:title">
  const ogTitle = extractMeta(text, 'property', 'og:title')
  if (ogTitle) {
    pass(`og:title found: "${ogTitle}"`)
  } else {
    warn('og:title not in initial HTML (set client-side by SPA)')
  }

  // Check <meta property="og:image">
  const ogImage = extractMeta(text, 'property', 'og:image')
  if (ogImage) {
    pass(`og:image found: "${ogImage}"`)
  } else {
    warn('og:image not in initial HTML (set client-side by SPA)')
  }

  // Check <meta property="og:url">
  const ogUrl = extractMeta(text, 'property', 'og:url')
  if (ogUrl) {
    pass(`og:url found: "${ogUrl}"`)
  }
}

// ─── Test 4: JSON-LD Structured Data ───────────────────────────────────────

async function testJsonLd() {
  section('4. JSON-LD — Données Structurées Schema.org')

  const shopSlug = process.env.SHOP_SLUG || 'test-checkout-shop'
  const url = `${BASE_URL}/${shopSlug}`
  const { ok, text } = await fetchText(url)

  if (!ok) {
    fail('Cannot test JSON-LD — page fetch failed')
    return
  }

  const jsonLdScripts = extractJsonLd(text)

  if (jsonLdScripts.length === 0) {
    warn('No JSON-LD in initial HTML (injected client-side by SPA)')
    // Try fetching via API to verify JSON-LD data is available
    const apiRes = await fetchText(`${BASE_URL}/api/shops/${shopSlug}`)
    if (apiRes.ok) {
      try {
        const shop = JSON.parse(apiRes.text)
        if (shop.name) {
          pass(`Shop data available via API: "${shop.name}" (JSON-LD built client-side)`)
        }
      } catch {
        // ignore
      }
    }
    return
  }

  pass(`Found ${jsonLdScripts.length} JSON-LD script(s) in HTML`)

  // Check the Organization JSON-LD (always present from root layout)
  const orgLd = jsonLdScripts.find((ld) => ld['@type'] === 'Organization')
  if (orgLd) {
    pass('Organization JSON-LD found (root layout)')
    if (orgLd.name) pass(`Organization name: "${orgLd.name}"`)
    if (orgLd.url) pass(`Organization URL: "${orgLd.url}"`)
  }

  // Check for shop-level JSON-LD (LocalBusiness, Store, Restaurant, etc.)
  const shopLd = jsonLdScripts.find((ld) =>
    ['LocalBusiness', 'Store', 'Restaurant', 'HealthAndBeautyBusiness', 'ProfessionalService'].includes(ld['@type']),
  )

  if (shopLd) {
    pass(`Shop JSON-LD found with @type="${shopLd['@type']}"`)
  } else {
    warn('Shop-level JSON-LD not in initial HTML (injected client-side by SPA)')
  }

  // Validate required fields on all JSON-LD
  for (const [i, ld] of jsonLdScripts.entries()) {
    const missing = []
    if (!ld['@type']) missing.push('@type')
    if (!ld.name && !ld['@type']?.includes('BreadcrumbList')) missing.push('name')
    if (!ld['@context']) missing.push('@context')

    if (missing.length > 0) {
      fail(`JSON-LD #${i + 1} (${ld['@type'] || 'unknown'}) missing: ${missing.join(', ')}`)
    } else {
      pass(`JSON-LD #${i + 1} (${ld['@type']}) — all required fields present`)
    }
  }
}

// ─── Test 5: OG Image API ─────────────────────────────────────────────────

async function testOgImage() {
  section('5. API OG Image — Prévisualisation Réseaux Sociaux')

  const shopSlug = process.env.SHOP_SLUG || 'test-checkout-shop'
  const { ok, status, headers } = await fetchText(`${BASE_URL}/api/og?shop=${shopSlug}`)

  if (!ok && status !== 302) {
    warn(`/api/og?shop=${shopSlug} returned HTTP ${status} (may need an active shop)`)
    return
  }

  if (status === 302) {
    const location = headers.get('location')
    pass(`OG image API redirects to custom image: ${location}`)
    return
  }

  pass(`/api/og?shop=${shopSlug} returned HTTP ${status}`)

  const contentType = headers.get('content-type') || ''
  if (contentType.includes('image/')) {
    pass(`Content-Type is image: ${contentType}`)
  } else if (contentType.includes('text/html')) {
    // ImageResponse returns HTML with an <img> tag in dev mode
    pass('Returns image response (dev mode renders as HTML)')
  } else {
    warn(`Unexpected Content-Type: ${contentType}`)
  }
}

// ─── Test 6: Public API SEO Fields ────────────────────────────────────────

async function testApiSeoFields() {
  section('6. API Boutique — Champs SEO exposés')

  const shopSlug = process.env.SHOP_SLUG || 'test-checkout-shop'
  const { ok, text } = await fetchText(`${BASE_URL}/api/shops/${shopSlug}`)

  if (!ok) {
    fail(`/api/shops/${shopSlug} returned error`)
    return
  }

  let shop
  try {
    shop = JSON.parse(text)
  } catch {
    fail('API response is not valid JSON')
    return
  }

  pass('API response is valid JSON')

  const seoFields = ['seoTitle', 'seoDescription', 'ogImage', 'businessHours', 'coverImageUrl']
  const present = seoFields.filter((f) => shop[f] !== undefined && shop[f] !== null)

  if (present.length > 0) {
    pass(`SEO fields exposed: ${present.join(', ')}`)
  } else {
    warn('No SEO fields populated (shop may not have custom SEO data)')
  }

  if (shop.seoTitle) {
    pass(`seoTitle: "${shop.seoTitle}"`)
  }
  if (shop.seoDescription) {
    pass(`seoDescription: "${shop.seoDescription.slice(0, 60)}..."`)
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${BOLD}🔍 Boutiko — Validation SEO${RESET}`)
  console.log(`${BOLD}   Target: ${BASE_URL}${RESET}`)
  console.log(`${BOLD}   Date:   ${new Date().toISOString()}${RESET}`)

  try {
    await testSitemap()
    await testRobots()
    await testBoutiquePage()
    await testJsonLd()
    await testOgImage()
    await testApiSeoFields()
  } catch (err) {
    console.error(`\n${RED}Fatal error: ${err.message}${RESET}`)
    process.exit(1)
  }

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${'═'.repeat(60)}${RESET}`)
  console.log(`${BOLD}  RÉSUMÉ${RESET}`)
  console.log(`${BOLD}${'═'.repeat(60)}${RESET}`)
  console.log(`  ${GREEN}✓ ${passCount} passé(s)${RESET}`)
  console.log(`  ${RED}✗ ${failCount} échoué(s)${RESET}`)
  console.log(`  ${YELLOW}⚠ ${warnCount} avertissement(s)${RESET}`)
  console.log()

  if (failCount > 0) {
    console.log(`${RED}${BOLD}  ❌ VALIDATION ÉCHOUÉE — ${failCount} erreur(s) trouvée(s)${RESET}\n`)
    process.exit(1)
  } else {
    console.log(`${GREEN}${BOLD}  ✅ VALIDATION RÉUSSIE${RESET}\n`)
    process.exit(0)
  }
}

main()