'use client'

import { memo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { Shop } from '@/lib/store'
import { useLiveTheme } from './live-themes'
import { getAppearance } from '@/lib/appearance'

interface LiveHeaderProps {
  shop: Shop | null
}

function LiveHeader({ shop }: LiveHeaderProps) {
  const theme = useLiveTheme()
  const { logoSize } = getAppearance(shop?.customColors)
  const isLive = shop?.isLiveMode === true
  const hasLiveUrl = !!shop?.liveUrl

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm ${
        isLive ? 'header-live-border' : ''
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ── Left: Logo + Shop Name ── */}
          <div className="flex items-center gap-3 min-h-[44px]">
            {shop?.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name ?? 'Logo'}
                width={64}
                height={64}
                className='w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md'
                style={logoSize ? { height: parseInt(logoSize), width: parseInt(logoSize) } : undefined}
                priority
              />
            ) : (
              <div
                className='flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6154] to-[#FF9A44] text-white text-2xl font-bold shadow-md'
                style={logoSize ? { height: parseInt(logoSize), width: parseInt(logoSize) } : undefined}
              >
                {(shop?.name ?? 'L').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-lg md:text-xl font-bold text-[#1A1A2E] truncate max-w-[160px] md:max-w-[240px]">
              {shop?.name ?? 'Ma Boutique'}
            </span>
          </div>

          {/* ── Right: LIVE badge ── */}
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div
                  key="live-badge"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full ${theme.enDirectBg} shadow-[0_0_20px_rgba(220,38,38,0.4),0_0_40px_rgba(220,38,38,0.2),0_0_60px_rgba(220,38,38,0.1)] min-h-[44px] animate-[liveBadgeGlow_2s_ease-in-out_infinite]`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                  <span className={`text-xs md:text-sm font-bold ${theme.enDirectText} tracking-wide`}>
                    EN DIRECT
                  </span>
                </motion.div>
              ) : hasLiveUrl ? (
                <motion.div
                  key="upcoming-badge"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gray-100 text-gray-600 min-h-[44px]"
                >
                  <Calendar className="size-3.5 text-[#FF6154]" />
                  <span className="text-xs md:text-sm font-semibold">
                    Prochain live
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default memo(LiveHeader)