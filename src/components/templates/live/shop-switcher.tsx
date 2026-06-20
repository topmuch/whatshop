'use client'

import { memo, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Store } from 'lucide-react'

interface MyShop {
  id: string
  name: string
  slug: string
  logo?: string | null
}

interface ShopSwitcherProps {
  currentShopId: string
  ownerId: string
}

function ShopSwitcher({ currentShopId, ownerId }: ShopSwitcherProps) {
  const [shops, setShops] = useState<MyShop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShops = useCallback(async () => {
    try {
      const res = await fetch('/api/shops/my-shops')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.shops)) {
        setShops(data.shops)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  // Don't render if still loading, only 1 shop, or no shops
  if (loading) return null
  if (shops.length <= 1) return null

  const navigateToShop = (slug: string) => {
    window.location.href = `/${slug}`
  }

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {shops.map((s) => {
            const isActive = s.id === currentShopId
            return (
              <motion.button
                key={s.id}
                onClick={() => !isActive && navigateToShop(s.slug)}
                disabled={isActive}
                whileHover={!isActive ? { scale: 1.02 } : undefined}
                whileTap={!isActive ? { scale: 0.98 } : undefined}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-semibold min-h-[40px] transition-colors duration-200 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6154] to-[#FF9A44] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.logo ? (
                  <Image
                    src={s.logo}
                    alt={s.name}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Store className="size-4 shrink-0" />
                )}
                {s.name}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(ShopSwitcher)
