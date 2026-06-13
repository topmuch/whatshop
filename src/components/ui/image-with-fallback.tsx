'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Package, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type FallbackIcon = 'package' | 'image' | 'avatar'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  fallbackIcon?: FallbackIcon
  fallbackClassName?: string
  unoptimized?: boolean
  sizes?: string
  priority?: boolean
  style?: React.CSSProperties
}

/**
 * Robust image component that shows a graceful placeholder when the image
 * fails to load (404, network error, etc.).
 *
 * This is the key defense for the "images disappearing" problem:
 * - Root cause: Docker container restarts without a persistent volume wipe /app/uploads
 * - The PWA service worker now uses NetworkFirst for /uploads/ so 404s are immediate
 * - This component catches the 404 and shows a styled placeholder
 *
 * Usage:
 *   <ImageWithFallback src={product.image} alt={product.name} fill className="object-cover" />
 *   <ImageWithFallback src={shop.logo} alt={shop.name} width={40} height={40} />
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  fill,
  width,
  height,
  fallbackIcon = 'package',
  fallbackClassName,
  sizes,
  priority,
  style,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleError = useCallback(() => {
    if (!error) setError(true)
  }, [error])

  // No src at all — show fallback immediately
  if (!src) {
    return <Fallback icon={fallbackIcon} className={cn('bg-muted', className)} style={style} />
  }

  // Image failed to load — show fallback
  if (error) {
    return <Fallback icon={fallbackIcon} className={cn('bg-muted', className, fallbackClassName)} style={style} />
  }

  const imgClassName = cn(
    'transition-opacity duration-200',
    !loaded && 'opacity-0',
    loaded && 'opacity-100',
    className,
  )

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className?.replace(/object-\w+/g, ''))} style={style}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized
          priority={priority}
          className={imgClassName}
          onError={handleError}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>
    )
  }

  return (
    <div className="relative inline-block" style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        priority={priority}
        className={imgClassName}
        style={style}
        onError={handleError}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

/** The placeholder shown when an image fails to load */
function Fallback({
  icon,
  className,
  style,
}: {
  icon: FallbackIcon
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = icon === 'avatar' ? ImageIcon : icon === 'image' ? ImageIcon : Package

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-muted to-muted/60 text-muted-foreground/30',
        className,
      )}
      style={style}
      role="img"
      aria-label="Image non disponible"
    >
      <Icon className="size-8 shrink-0" />
    </div>
  )
}