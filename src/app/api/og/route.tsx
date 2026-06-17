import { db } from '@/lib/db'
import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Dynamic OG image generation for social sharing.
 *
 * Usage: /api/og?shop=ma-boutique
 * Returns a 1200×630 PNG with the shop name, description, and branding.
 *
 * Critical for WhatsApp/Facebook/Twitter link previews.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shopSlug = searchParams.get('shop')

  if (!shopSlug) {
    return NextResponse.json({ error: 'Missing ?shop= parameter' }, { status: 400 })
  }

  const shop = await db.shop.findUnique({
    where: { slug: shopSlug, isActive: true },
    select: {
      name: true,
      description: true,
      ogImage: true,
      primaryColor: true,
      sector: true,
    },
  })

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  // If the shop has a dedicated OG image, redirect to it
  if (shop.ogImage) {
    return new Response(null, {
      status: 302,
      headers: { Location: shop.ogImage },
    })
  }

  const accent = shop.primaryColor || '#EC4899'
  const description = (shop.description || 'Boutique en ligne sur Boutiko').slice(0, 100)
  const sectorLabel =
    shop.sector === 'restaurant' ? '🍽️ Restaurant'
      : shop.sector === 'beaute-service' ? '💄 Beauté & Services'
        : shop.sector === 'mode' ? '👗 Mode'
          : '🛍️ Boutique en ligne'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: `linear-gradient(135deg, ${accent}15 0%, ${accent}08 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top bar with Boutiko branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 20, fontWeight: 700,
          }}>
            B
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>Boutiko</span>
          <span style={{ fontSize: 14, color: '#9CA3AF', marginLeft: 'auto' }}>{sectorLabel}</span>
        </div>

        {/* Shop name */}
        <div style={{
          fontSize: 56, fontWeight: 800, color: '#111827', lineHeight: 1.1,
          marginBottom: 20, maxWidth: 900,
        }}>
          {shop.name}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 22, color: '#6B7280', lineHeight: 1.4,
          maxWidth: 700, marginBottom: 40,
        }}>
          {description}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            padding: '14px 32px', background: accent, color: 'white',
            borderRadius: 12, fontSize: 18, fontWeight: 600,
          }}>
            Commander sur WhatsApp →
          </div>
        </div>

        {/* Bottom decoration */}
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          width: 200, height: 200, borderRadius: '50%',
          background: `${accent}10`, filter: 'blur(40px)',
        }} />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}