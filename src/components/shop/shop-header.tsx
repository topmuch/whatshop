'use client'

import { useAppStore, type Shop } from '@/lib/store'
import { MessageCircle, MapPin, Phone } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

interface ShopHeaderProps {
  shop: Shop
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const initial = shop.name.charAt(0).toUpperCase()

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/80 via-primary to-primary/60">
        {shop.banner ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${shop.banner})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-white/30">{initial}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Logo & Info */}
      <div className="relative flex flex-col items-center px-4 -mt-12 pb-4">
        {/* Logo */}
        <div className="w-24 h-24 rounded-full border-4 border-background bg-card shadow-lg overflow-hidden">
          <ImageWithFallback
            src={shop.logo}
            alt={shop.name}
            fill
            className="w-full h-full object-cover"
            fallbackIcon="image"
          />
        </div>

        {/* Shop Name */}
        <h1 className="mt-3 text-2xl font-bold text-center">{shop.name}</h1>

        {/* Description */}
        {shop.description && (
          <p className="mt-1.5 text-muted-foreground text-center text-sm max-w-md">
            {shop.description}
          </p>
        )}

        {/* Contact Info */}
        <div className="mt-3 flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
          {shop.whatsapp && (
            <a
              href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
            >
              <MessageCircle className="size-4" />
              <span>{shop.whatsapp}</span>
            </a>
          )}
          {shop.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="size-4" />
              <span>{shop.phone}</span>
            </div>
          )}
          {shop.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              <span>{shop.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
