'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Radio, Play, MessageCircle } from 'lucide-react'
import type { Shop } from '@/lib/store'

interface LiveHeroProps {
  shop: Shop | null
}

/** Animated mesh gradient background */
function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Mesh gradient orbs */}
      <div
        className="absolute w-[500px] h-[500px] -top-40 -left-40 rounded-full opacity-30 animate-[meshOrb1_12s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,107,0.8) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] top-1/3 -right-32 rounded-full opacity-25 animate-[meshOrb2_15s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(255,200,87,0.8) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute w-[450px] h-[450px] -bottom-32 left-1/4 rounded-full opacity-20 animate-[meshOrb3_18s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(255,140,50,0.8) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

/** CSS-based shimmer / particle effect */
function ShimmerParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Shimmer sweep */}
      <div className="hero-shimmer-sweep" />
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="hero-particle"
          style={{
            '--particle-x': `${Math.random() * 100}%`,
            '--particle-y': `${Math.random() * 100}%`,
            '--particle-delay': `${Math.random() * 6}s`,
            '--particle-duration': `${4 + Math.random() * 6}s`,
            '--particle-size': `${2 + Math.random() * 4}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/** Decorative floating circles for background */
function DecorativeCircles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 -right-16 w-56 h-56 rounded-full bg-white/8 blur-3xl animate-[pulse_10s_ease-in-out_infinite_2s]" />
      <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-white/6 blur-3xl animate-[pulse_12s_ease-in-out_infinite_4s]" />
    </div>
  )
}

/** Animated countdown-style visual teaser (not a real countdown) */
function CountdownTeaser() {
  return (
    <div className="flex items-center gap-3 mt-2">
      {['--', '--', ':', '--', '--'].map((char, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
          className={`flex items-center justify-center font-extrabold text-xl md:text-2xl tracking-widest ${
            char === ':' ? 'w-4 text-white/50' : 'w-12 md:w-14 h-12 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/20'
          }`}
        >
          {char !== ':' && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              {char}
            </motion.span>
          )}
          {char === ':' && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              :
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/** Floating WhatsApp FAB in hero */
function HeroWhatsAppFab({ whatsapp }: { whatsapp: string }) {
  const href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="absolute bottom-5 right-5 z-20 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_4px_28px_rgba(37,211,102,0.7)] transition-shadow duration-300"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="size-6 text-white" />
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
        <span className="absolute w-3.5 h-3.5 rounded-full bg-[#25D366] animate-ping opacity-40" />
        <span className="w-2 h-2 bg-[#25D366] rounded-full" />
      </span>
    </motion.a>
  )
}

function LiveHero({ shop }: LiveHeroProps) {
  const isLive = shop?.isLiveMode === true
  const hasLiveUrl = !!shop?.liveUrl
  const whatsapp = shop?.whatsapp || ''

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-[#FF6154] via-[#FF7E5F] to-[#FF9A44] ${
        isLive ? 'hero-live-glow' : ''
      }`}
      aria-label="Bannière"
    >
      {/* Shimmer & particle effects */}
      <ShimmerParticles />
      {/* Mesh gradient background */}
      <MeshGradient />
      {/* Original decorative circles */}
      <DecorativeCircles />

      {/* Pulsing red glow border at bottom when live */}
      {isLive && (
        <div className="hero-live-bottom-glow" aria-hidden="true" />
      )}

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 md:py-24 lg:py-28 text-center text-white min-h-[280px] md:min-h-[340px]">
        {isLive ? (
          /* ── LIVE Mode ── */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Pulsing LIVE indicator */}
            <div className="relative flex items-center justify-center">
              {/* Outer ring pulse */}
              <motion.div
                className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-white/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Second ring */}
              <motion.div
                className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              {/* Core circle */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                <Radio className="size-7 md:size-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-lg"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}
            >
              EN DIRECT MAINTENANT
            </motion.h1>

            {/* CTA */}
            {hasLiveUrl ? (
              <motion.a
                href={shop.liveUrl!}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#FF6154] font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 min-h-[56px]"
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
                Rejoindre le Live
                <Play className="size-5 fill-current" />
              </motion.a>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/90 text-sm md:text-base font-medium max-w-md"
              >
                Live en cours sur notre boutique — retrouvez nos offres en direct !
              </motion.p>
            )}
          </motion.div>
        ) : hasLiveUrl ? (
          /* ── Upcoming Live ── */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Play className="size-7 md:size-8 text-white fill-white" />
            </motion.div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg">
              Prochain live bientôt
            </h1>

            <motion.a
              href={shop.liveUrl!}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#FF6154] font-bold text-sm md:text-base shadow-xl hover:shadow-2xl transition-shadow duration-300 min-h-[52px]"
            >
              Rejoindre le live
              <Play className="size-4 fill-current" />
            </motion.a>
          </motion.div>
        ) : (
          /* ── Default: No live — add "prochain live" teaser ── */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 max-w-lg"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-lg">
              {shop?.name ?? 'Bienvenue'}
            </h1>
            <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed">
              {shop?.description ?? 'Découvrez nos produits exclusifs et commandez directement sur WhatsApp.'}
            </p>

            {/* Prochain live teaser */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white/80 tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>
                Prochain live
              </div>
              <CountdownTeaser />
            </motion.div>
          </motion.div>
        )}

        {/* WhatsApp FAB — always visible in hero */}
        {whatsapp && <HeroWhatsAppFab whatsapp={whatsapp} />}
      </div>
    </section>
  )
}

export default memo(LiveHero)