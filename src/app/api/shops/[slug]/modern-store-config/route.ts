import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import { parseModernStoreConfig, type ModernStoreConfig } from '@/lib/modern-store-types'

export const dynamic = 'force-dynamic'

// GET /api/shops/[slug]/modern-store-config — public, return parsed config + templateType
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { templateType: true, modernStoreConfig: true },
    })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }
    return NextResponse.json({
      templateType: shop.templateType,
      config: parseModernStoreConfig(shop.modernStoreConfig),
    })
  } catch (error) {
    console.error('Modern store config GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/shops/[slug]/modern-store-config — owner only, updates templateType and/or config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    if (shop.slug !== slug) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { templateType, config } = body
    const data: Record<string, unknown> = {}

    if (templateType !== undefined) {
      if (!['STANDARD', 'SINGLE_PRODUCT', 'MODERN_STORE'].includes(templateType)) {
        return NextResponse.json({ error: 'templateType invalide' }, { status: 400 })
      }
      data.templateType = templateType
    }

    if (config !== undefined) {
      if (config === null || typeof config !== 'object' || Array.isArray(config)) {
        return NextResponse.json({ error: 'config doit être un objet' }, { status: 400 })
      }
      data.modernStoreConfig = JSON.stringify(config as ModernStoreConfig)
    }

    if (Object.keys(data).length === 0) {
      const current = await db.shop.findUnique({
        where: { id: shop.id },
        select: { templateType: true, modernStoreConfig: true },
      })
      return NextResponse.json({
        templateType: current?.templateType ?? 'STANDARD',
        config: parseModernStoreConfig(current?.modernStoreConfig),
      })
    }

    const updated = await db.shop.update({
      where: { id: shop.id },
      data,
      select: { templateType: true, modernStoreConfig: true },
    })

    return NextResponse.json({
      templateType: updated.templateType,
      config: parseModernStoreConfig(updated.modernStoreConfig),
    })
  } catch (error) {
    console.error('Modern store config PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
