import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { getDefaultCategories, getTemplateForSector, SECTORS, type Sector } from '@/lib/sector-config'
import { generateSlug } from '@/lib/utils'

// ─── VALID SETS ─────────────────────────────────────────────────────────

const VALID_BUSINESS_TYPES = new Set(['ECOMMERCE', 'SERVICE'])
const VALID_SECTORS = new Set(SECTORS.map((s) => s.id))
const VALID_PLANS = new Set(['TRIAL', 'PRO'])

// ─── WHATSAPP VALIDATION ─────────────────────────────────────────────────

/**
 * Validate a WhatsApp number.
 * Accepts formats: +22507..., 0022507..., 0707..., 07 07 07 07
 * Returns a cleaned version or null if invalid.
 */
function validateWhatsapp(raw: string): string | null {
  const digits = raw.replace(/[\s\-\.\(\)]/g, '')

  // Must be 8-15 digits after stripping non-digit chars
  if (!/^\+?\d{8,15}$/.test(digits)) return null

  // If starts with 00, treat as country code (remove the 00)
  // If starts with 0 (local), prepend +225
  if (digits.startsWith('00')) {
    return '+' + digits.slice(2)
  }
  if (digits.startsWith('0') && !digits.startsWith('+')) {
    return '+225' + digits
  }

  return digits.startsWith('+') ? digits : '+225' + digits
}

// ─── ERROR HELPERS ───────────────────────────────────────────────────────

function badRequest(message: string, field?: string) {
  return NextResponse.json(
    { error: message, field: field ?? null },
    { status: 400 },
  )
}

function conflict(message: string, field?: string) {
  return NextResponse.json(
    { error: message, field: field ?? null },
    { status: 409 },
  )
}

// ─── POST HANDLER ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // ── Parse body with explicit typing ──
    const body = await request.json()
    const {
      businessType,
      sector,
      name,
      whatsapp,
      description,
      logo,
      plan,
    } = body as {
      businessType?: string
      sector?: string
      name?: string
      whatsapp?: string
      description?: string
      logo?: string
      plan?: string
    }

    // ── Validation: businessType ──
    if (!businessType || !VALID_BUSINESS_TYPES.has(businessType)) {
      return badRequest(
        "Type d'activité invalide. Choisissez ECOMMERCE ou SERVICE.",
        'businessType',
      )
    }

    // ── Validation: sector (if provided, must be a known sector) ──
    if (sector && !VALID_SECTORS.has(sector as Sector)) {
      return badRequest(
        'Secteur non reconnu. Veuillez choisir un secteur valide.',
        'sector',
      )
    }

    // ── Validation: sector/businessType consistency ──
    if (sector) {
      const sectorDef = SECTORS.find((s) => s.id === sector)
      if (sectorDef && sectorDef.businessType !== businessType) {
        return badRequest(
          `Le secteur "${sectorDef.name}" ne correspond pas au type d'activité "${businessType}".`,
          'sector',
        )
      }
    }

    // ── Validation: name ──
    if (!name || typeof name !== 'string') {
      return badRequest('Le nom de votre activité est requis.', 'name')
    }
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      return badRequest('Le nom doit contenir au moins 2 caractères.', 'name')
    }
    if (trimmedName.length > 100) {
      return badRequest('Le nom ne doit pas dépasser 100 caractères.', 'name')
    }

    // ── Validation: whatsapp ──
    if (!whatsapp || typeof whatsapp !== 'string') {
      return badRequest('Le numéro WhatsApp est requis.', 'whatsapp')
    }
    const cleanedWhatsapp = validateWhatsapp(whatsapp.trim())
    if (!cleanedWhatsapp) {
      return badRequest(
        'Numéro WhatsApp invalide. Format accepté : 0707070707 ou +2250707070707.',
        'whatsapp',
      )
    }

    // ── Validation: plan (if provided) ──
    if (plan && !VALID_PLANS.has(plan)) {
      return badRequest('Plan invalide. Choisissez TRIAL ou PRO.', 'plan')
    }

    // ── Validation: logo format (if provided) ──
    if (logo && typeof logo === 'string') {
      if (logo.length > 1000) {
        return badRequest("L'URL du logo est trop longue.", 'logo')
      }
    }

    // ── Duplicate shop check ──
    const existingShop = await db.shop.findFirst({ where: { ownerId: user.id } })
    if (existingShop) {
      return conflict('Vous avez déjà une boutique. Chaque compte est limité à une boutique lors de l\'onboarding.')
    }

    // ── Slug generation (ensure uniqueness with retry) ──
    let slug = generateSlug(trimmedName)
    if (!slug) {
      slug = `boutique-${Date.now().toString(36)}`
    }

    // Check if the base slug already exists
    const slugExists = await db.shop.findUnique({ where: { slug } })
    if (slugExists) {
      // Try up to 3 variations before giving up
      let found = false
      for (let i = 2; i <= 5; i++) {
        const candidate = `${slug}-${i}`
        const candidateExists = await db.shop.findUnique({ where: { slug: candidate } })
        if (!candidateExists) {
          slug = candidate
          found = true
          break
        }
      }
      if (!found) {
        // Final fallback: use timestamp suffix
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    // ── Template from sector-config ──
    const template = getTemplateForSector(sector)

    // ── Trial end date ──
    const finalPlan = plan || 'TRIAL'
    const trialEndDate = finalPlan === 'TRIAL'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null

    // ── Create shop ──
    const shop = await db.shop.create({
      data: {
        name: trimmedName,
        slug,
        whatsapp: cleanedWhatsapp,
        description: typeof description === 'string' ? description.trim() || null : null,
        logo: logo || null,
        plan: finalPlan,
        trialEndDate,
        businessType,
        sector: sector || null,
        template,
        ownerId: user.id,
        isActive: true,
      },
    })

    // ── Auto-create default categories from sector-config ──
    const categories = getDefaultCategories(sector)
    await db.category.createMany({
      data: categories.map((catName) => ({
        name: catName,
        shopId: shop.id,
      })),
    })

    // ── Fire-and-forget notification ──
    try {
      await createNotification(
        'NEW_SHOP',
        'Nouvelle boutique créée',
        `La boutique "${shop.name}" (${businessType}/${sector || 'sans secteur'}) a été créée par ${user.name}.`,
        { shopId: shop.id, shopName: shop.name, ownerId: user.id, ownerName: user.name },
      )
    } catch {
      // Notification failure must not break onboarding
    }

    return NextResponse.json(shop, { status: 201 })
  } catch (error: unknown) {
    // Handle Prisma unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return conflict('Ce nom de boutique est déjà utilisé. Essayez un autre nom.', 'name')
    }

    const message = error instanceof Error ? error.message : 'Erreur serveur'
    console.error('[onboarding/complete] POST error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}