'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, Truck, HandCoins, ShieldCheck, Star, Zap, Clock, Radio, Eye } from 'lucide-react'
import type { Product, Shop } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'

interface ProductSpotlightProps {
  product: Product
  shop: Shop
}

function getDiscount(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price || oldPrice <= 0) return null
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

function ProductSpotlight({ product, shop }: ProductSpotlightProps) {
  const whatsapp = shop?.whatsapp || ''
  const discount = getDiscount(product.price, product.oldPrice)
  const savings = product.oldPrice ? product.oldPrice - product.price : 0

  const handleCommander = () => {
    if (!whatsapp) return
    openWhatsApp(product, whatsapp)
  }

  // Stagger children
  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
      },
    }),
    [],
  )

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    }),
    [],
  )

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden bg-white"
      aria-label="Produit en vedette"
    >
      {/* ─── LEFT VERTICAL BAR — "LIVE SHOWROOM" ─── */}
      <div className="flex">
        {/* White sidebar with red accent */}
        <motion.div
          variants={itemVariants}
          className="hidden sm:flex flex-col items-center justify-between py-8 px-3 bg-yellow-400 min-h-[500px] lg:min-h-[600px] relative shrink-0"
          style={{ width: 'clamp(48px, 10vw, 100px)' }}
        >
          {/* Red glowing dot */}
          <div className="relative">
            <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.8)]" />
          </div>

          {/* Vertical text — bigger, yellow bg, red text */}
          <div
            className="text-red-600 font-black tracking-[0.3em] uppercase select-none"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: 'clamp(18px, 3vw, 32px)' }}
          >
            LIVE SHOWROOM
          </div>

          {/* Red star */}
          <div className="text-red-500 text-2xl">★</div>
        </motion.div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 min-w-0">
          {/* ── TOP: Badges ── */}
          <div className="flex flex-wrap items-center gap-2.5 px-4 sm:px-6 pt-5 pb-3">
            {/* EN DIRECT badge — 2x bigger */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-red-600 shadow-[0_0_24px_rgba(220,38,38,0.4)]">
              <Radio className="size-6 sm:size-7 text-white" />
              <span className="text-base sm:text-lg lg:text-xl font-black text-white tracking-wide">EN DIRECT</span>
            </motion.div>

            {/* OFFRE FLASH badge — yellow bg, red text */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-yellow-400">
              <Zap className="size-6 sm:size-7 text-red-600" />
              <span className="text-base sm:text-lg lg:text-xl font-black text-red-600 tracking-wide">OFFRE FLASH</span>
            </motion.div>

            {/* STOCK LIMITÉ badge — yellow bg, red text */}
            <motion.div variants={itemVariants} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-yellow-400">
              <Clock className="size-4 text-red-600" />
              <span className="text-xs sm:text-sm font-black text-red-600 tracking-wide">STOCK LIMITÉ</span>
            </motion.div>
          </div>

          {/* ── CENTER: Product Image + Info ── */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 px-4 sm:px-6 lg:px-10 py-4">
            {/* Product Image */}
            <motion.div
              variants={itemVariants}
              className="relative w-full max-w-[320px] md:max-w-[380px] lg:max-w-[420px] aspect-square shrink-0"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-50 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 420px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Discount badge on image */}
              {discount !== null && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                  className="absolute -top-3 -right-3 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.4)] rotate-12"
                >
                  <span className="text-white font-black text-lg sm:text-xl leading-none">-{discount}%</span>
                </motion.div>
              )}
            </motion.div>

            {/* Product Info */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {/* Product Name — HUGE */}
              <motion.h2
                variants={itemVariants}
                className="font-black text-[#1A1A2E] leading-[0.95] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
              >
                {product.name.toUpperCase().split(' ').slice(0, 1).join(' ')}
              </motion.h2>
              <motion.h3
                variants={itemVariants}
                className="font-black text-red-600 leading-[0.95] tracking-tight mt-1"
                style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3rem)' }}
              >
                {product.name.toUpperCase().split(' ').slice(1).join(' ')}
              </motion.h3>

              {/* Rating */}
              <motion.div variants={itemVariants} className="flex items-center justify-center md:justify-start gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 sm:size-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-600">4.8/5</span>
                <span className="text-xs text-gray-400">(120 avis)</span>
              </motion.div>

              {/* Prices */}
              <motion.div variants={itemVariants} className="mt-4 flex flex-col items-center md:items-start gap-2">
                {/* Old price */}
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}

                {/* Savings badge */}
                {savings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <span className="text-sm">🔥</span>
                    <span className="text-sm font-bold text-red-600">
                      ÉCONOMISEZ {savings.toLocaleString('fr-FR')} FCFA
                    </span>
                  </motion.div>
                )}

                {/* New price — GIANT BLUE */}
                <motion.div
                  variants={itemVariants}
                  className="text-blue-600 font-black leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
                >
                  {formatPrice(product.price)}
                </motion.div>
              </motion.div>

              {/* Service icons — red bg buttons, yellow/red text, bigger */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mt-5">
                {[
                  { icon: Truck, label: 'LIVRAISON RAPIDE' },
                  { icon: HandCoins, label: 'PAIEMENT À LA LIVRAISON' },
                  { icon: ShieldCheck, label: 'GARANTIE 6 MOIS' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600">
                    <Icon className="size-5 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-black text-yellow-400 tracking-wide">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* ── VIEWER COUNT — above WhatsApp button ── */}
          <motion.div variants={itemVariants} className="px-4 sm:px-6 lg:px-10 pt-4">
            <div className="flex items-center justify-center gap-2.5 py-2 px-4 rounded-full bg-red-50 border border-red-200 inline-flex mx-auto">
              <Eye className="size-5 text-red-500" />
              <span className="text-base sm:text-lg font-black text-red-600">
                <span className="live-viewer-count">130</span> personnes regardent ce live
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </div>
          </motion.div>

          {/* ── BOTTOM: Giant WhatsApp Button ── */}
          <motion.div variants={itemVariants} className="px-4 sm:px-6 lg:px-10 pb-5 pt-3">
            <motion.button
              type="button"
              onClick={handleCommander}
              disabled={!whatsapp}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="spotlight-wa-btn w-full flex items-center justify-center gap-3 sm:gap-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-4 sm:py-5 shadow-[0_6px_30px_rgba(37,211,102,0.4)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px] sm:min-h-[68px]"
            >
              <MessageCircle className="size-6 sm:size-7 shrink-0" />
              <span
                className="font-black tracking-wide uppercase"
                style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.4rem)' }}
              >
                Commander par WhatsApp
              </span>
              <svg className="size-5 sm:size-6 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ─── BOTTOM BANNER: "LIVRAISON PARTOUT AU SÉNÉGAL" ─── */}
      <motion.div
        variants={itemVariants}
        className="bg-red-600 flex items-center justify-center gap-3 px-4 py-3"
      >
        <Truck className="size-5 text-white shrink-0" />
        <span className="text-sm sm:text-base font-bold text-white tracking-wide">
          LIVRAISON PARTOUT AU <span className="font-black">SÉNÉGAL</span>
        </span>
        <span className="text-lg leading-none">🇸🇳</span>
      </motion.div>
    </motion.section>
  )
}

export default memo(ProductSpotlight)