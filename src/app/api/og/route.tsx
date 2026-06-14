import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'

// nodejs runtime required — SQLite (via Prisma) is not edge-compatible
export const runtime = 'nodejs'

/** Parse a hex color (#RRGGBB) and darken/lighten it */
function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  let r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  let b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `rgb(${r}, ${g}, ${b})`
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Default OG image when no shop is found */
function DefaultOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #BE185D 0%, #EC4899 50%, #F9A8D4 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-1px',
            }}
          >
            Boutiko
          </h1>
          <p
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}
          >
            Créez votre boutique en ligne en Afrique
          </p>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 32,
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          boutiko.pro
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return DefaultOG()
  }

  let shop: {
    name: string
    description: string | null
    primaryColor: string
    logo: string | null
    banner: string | null
  } | null = null

  try {
    shop = await db.shop.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        primaryColor: true,
        logo: true,
        banner: true,
      },
    })
  } catch {
    return DefaultOG()
  }

  if (!shop) {
    return DefaultOG()
  }

  const primaryColor = shop.primaryColor || '#EC4899'
  const darkerColor = adjustColor(primaryColor, -40)
  const lighterColor = adjustColor(primaryColor, 60)
  const overlayColor = hexToRgba(primaryColor, 0.12)
  const shopDescription = (shop.description || '').slice(0, 80)

  // Try to fetch the shop logo for embedding
  let logoImageData: ArrayBuffer | null = null
  if (shop.logo) {
    try {
      const logoRes = await fetch(shop.logo, { signal: AbortSignal.timeout(3000) })
      if (logoRes.ok) {
        logoImageData = await logoRes.arrayBuffer()
      }
    } catch {
      // Logo fetch failed — continue without it
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: `linear-gradient(135deg, ${darkerColor} 0%, ${primaryColor} 50%, ${lighterColor} 100%)`,
            display: 'flex',
          }}
        />

        {/* Subtle dot pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            display: 'flex',
          }}
        />

        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: overlayColor,
            display: 'flex',
          }}
        />

        {/* Main content area */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: 1200,
            height: 630,
            padding: '60px 80px',
            boxSizing: 'border-box',
          }}
        >
          {/* Left: text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              gap: 20,
            }}
          >
            {/* Shop logo if available */}
            {logoImageData && (
              <div style={{ marginBottom: 8 }}>
                <img
                  src={`data:image/png;base64,${Buffer.from(logoImageData).toString('base64')}`}
                  width={64}
                  height={64}
                  alt={shop.name}
                  style={{
                    borderRadius: 12,
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            <h1
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
                maxWidth: 700,
                wordWrap: 'break-word',
              }}
            >
              {shop.name}
            </h1>

            {shopDescription && (
              <p
                style={{
                  fontSize: 24,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  lineHeight: 1.4,
                  maxWidth: 650,
                }}
              >
                {shopDescription}
              </p>
            )}

            {/* CTA badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 200,
                  height: 44,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    color: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  Visiter la boutique →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom watermark bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 1200,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 32,
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}
          >
            boutiko.pro
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}