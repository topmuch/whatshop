'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { navigateTo } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  ShoppingBag,
  ArrowRight,
  Menu,
  Check,
  Store,
  PackagePlus,
  ShoppingCart,
  ChevronRight,
  X,
  Sun,
  Moon,
  MessageCircle,
} from 'lucide-react'
import { useThemeMode } from '@/lib/use-theme'

/* ── ANIMATION VARIANTS ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const vp = { once: true, margin: '-80px' }

/* ── COUNTER HOOK ── */
function useCounter(target: number, duration = 2) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  useEffect(() => {
    const ctrl = animate(count, target, { duration, ease: 'easeOut' })
    return () => ctrl.stop()
  }, [count, target, duration])
  return rounded
}

function Counter({
  value,
  suffix = '',
}: {
  value: number
  suffix?: string
}) {
  const display = useCounter(value)
  const [text, setText] = useState('0')
  useEffect(() => {
    const unsub = display.on('change', (v) => setText(String(v)))
    return unsub
  }, [display])
  return (
    <>
      {text}
      {suffix}
    </>
  )
}

/* ── LOGO ── */
function Logo({ light = false, size = 'default' }: { light?: boolean; size?: 'default' | 'large' }) {
  const isLarge = size === 'large'
  return (
    <div className="flex items-center gap-3">
      <div className={`${isLarge ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25`}>
        <ShoppingBag className={`${isLarge ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
      </div>
      <span
        className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}
      >
        Bouti<span className="text-pink-500">ko</span>
      </span>
    </div>
  )
}

/* ── HEADER (Linktree-style minimal) ── */
function Header() {
  const { isDark, toggleTheme } = useThemeMode()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl flex h-18 items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop nav - minimal pills */}
        <nav className="hidden lg:flex items-center gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-lg font-medium text-gray-900 hover:text-pink-500 px-4 py-2 rounded-full transition-all duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-gray-100 text-gray-700"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('login')}
            className="text-gray-900 hover:text-pink-500 text-lg"
          >
            Connexion
          </Button>
          <Button
            size="sm"
            onClick={() => navigateTo('register')}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 text-lg font-medium shadow-lg shadow-gray-900/20"
          >
            Commencer
          </Button>
        </div>

        {/* Mobile sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <div className="flex items-center justify-between p-6">
              <Logo size="large" />
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-xl font-medium text-gray-700 py-3.5 px-4 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="my-4" />
              <Button
                variant="outline"
                className="w-full justify-center rounded-2xl h-13 text-lg font-medium mb-3"
                onClick={() => { setOpen(false); navigateTo('login') }}
              >
                Connexion
              </Button>
              <Button
                className="w-full justify-center rounded-2xl bg-gray-900 hover:bg-gray-800 text-white h-13 text-lg font-medium"
                onClick={() => { setOpen(false); navigateTo('register') }}
              >
                Commencer gratuitement
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

/* ── STORY CARDS (6 cards interactives sous le hero) ── */
const storyCards = [
  {
    label: 'Boutiques',
    desc: 'Multi-boutiques en un clic',
    image: '/landing/story-boutique.png',
    target: 'features',
  },
  {
    label: 'Clients',
    desc: 'Des milliers de clients satisfaits',
    image: '/landing/story-cliente.png',
    target: 'testimonials',
  },
  {
    label: 'Vendeuses',
    desc: 'Rejoignez notre communauté',
    image: '/landing/story-vendeuse.png',
    target: 'testimonials',
  },
  {
    label: 'Paiements',
    desc: 'Orange Money, Wave, MTN',
    image: '/landing/story-paiement.png',
    target: 'features',
  },
  {
    label: 'Produits',
    desc: 'Gérez votre catalogue facilement',
    image: '/landing/story-produits.png',
    target: 'how-it-works',
  },
  {
    label: 'Live',
    desc: 'Vendez en direct partout',
    image: '/landing/story-live.png',
    target: 'features',
  },
]

function StoryCards() {
  const [activeStory, setActiveStory] = useState<number | null>(null)

  const handleCardClick = (index: number) => {
    setActiveStory(index)
  }

  const handleStoryClose = () => {
    setActiveStory(null)
  }

  const handleStoryCTA = () => {
    setActiveStory(null)
    navigateTo('register')
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {storyCards.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              onClick={() => handleCardClick(i)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 aspect-[3/4]"
            >
              <Image
                src={story.image}
                alt={story.label}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />
              {/* Instagram-style ring border */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-pink-500/40 group-hover:ring-pink-500 transition-all duration-300" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p className="text-white font-bold text-sm sm:text-base leading-tight">{story.label}</p>
                <p className="text-white/70 text-xs sm:text-sm mt-1 line-clamp-2 leading-snug">{story.desc}</p>
              </div>
              {/* Hover arrow */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-75">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story overlay viewer */}
      <AnimatePresence>
        {activeStory !== null && (
          <StoryViewer
            story={storyCards[activeStory]}
            onClose={handleStoryClose}
            onCTA={handleStoryCTA}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function StoryViewer({
  story,
  onClose,
  onCTA,
}: {
  story: typeof storyCards[number]
  onClose: () => void
  onCTA: () => void
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Story card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-[3/4]">
          <Image
            src={story.image}
            alt={story.label}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
            priority
          />
          {/* Progress bar (story-style) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
          <h3 className="text-2xl font-bold text-white mb-2">{story.label}</h3>
          <p className="text-white/80 text-base leading-relaxed mb-6">{story.desc}</p>
          <Button
            onClick={onCTA}
            className="w-full rounded-full bg-white text-gray-900 hover:bg-gray-100 font-semibold text-base h-12 shadow-lg"
          >
            Commencer avec Boutiko
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── HERO FORM (Linktree-style boutique name input) ── */
function HeroForm() {
  const [boutiqueName, setBoutiqueName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = boutiqueName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (!slug) {
      setError('Entrez un nom de boutique')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/shops/check-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.available) {
          // Slug available → redirect to register with pre-filled shop name
          navigateTo('register')
          // Store the chosen slug so onboarding can pick it up
          sessionStorage.setItem('preferred-slug', slug)
        } else {
          setError('Ce nom est déjà pris')
        }
      } else {
        setError('Erreur, réessayez')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full max-w-lg gap-3 mb-6">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 text-base font-semibold pointer-events-none select-none">
          boutiko.pro/
        </div>
        <input
          type="text"
          value={boutiqueName}
          onChange={(e) => { setBoutiqueName(e.target.value); setError('') }}
          placeholder="votre-boutique"
          className={`w-full h-14 pl-[calc(7.5rem+1rem)] pr-4 rounded-2xl border-2 bg-white text-gray-900 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'}`}
        />
        {error && (
          <p className="absolute -bottom-6 left-1 text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-14 px-7 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-base font-semibold shadow-lg shadow-pink-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Vérification...
          </span>
        ) : (
          'Commencer gratuitement'
        )}
      </button>
    </form>
  )
}

/* ── HERO ── */
const heroSlides = [
  { image: '/landing/hero-influencer-1.png', alt: 'Influenceuse avec smartphone' },
  { image: '/landing/hero-influencer-2.png', alt: 'Influenceur avec smartphone' },
  { image: '/landing/hero-influencer-3.png', alt: 'Influenceuse trendy' },
]

function Hero() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-18">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50/40 to-rose-50/60" />
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text side */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="order-2 lg:order-1"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-5 py-2 text-base font-medium mb-8 inline-flex items-center gap-2"
              >
                🚀 La plateforme #1 en Afrique
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={0.1}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05]"
            >
              Vendez partout
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                en ligne comme un pro
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-lg leading-relaxed"
            >
              Créez votre boutique en ligne en 2 minutes. Vendez sur WhatsApp,
              Facebook, Instagram, en Live et bien plus. Développez votre activité
              sur tous les canaux.
            </motion.p>
            {/* Boutique name form — Linktree style */}
            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="mt-12"
            >
              <HeroForm />
            </motion.div>
          </motion.div>

          {/* Image side — slideshow */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="order-1 lg:order-2 flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-pink-900/10">
                <div className="relative w-[340px] sm:w-[400px] lg:w-[420px] aspect-[768/1344]">
                  {heroSlides.map((s, i) => (
                    <motion.div
                      key={s.image}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={i === slide ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      style={{ pointerEvents: i === slide ? 'auto' : 'none' }}
                    >
                      <Image
                        src={s.image}
                        alt={s.alt}
                        fill
                        className="object-cover"
                        priority={i === 0}
                        sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 420px"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide dots */}
            <div className="flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slide
                      ? 'w-8 h-2.5 bg-gradient-to-r from-pink-500 to-rose-500'
                      : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Social icons row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-6"
            >
              {[
                { name: 'Instagram', brandColor: 'text-[#E4405F]', hoverBg: 'hover:bg-[#E4405F]/10', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { name: 'Facebook', brandColor: 'text-[#1877F2]', hoverBg: 'hover:bg-[#1877F2]/10', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { name: 'TikTok', brandColor: 'text-[#000000]', hoverBg: 'hover:bg-gray-100', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18 1.9 1.12 3.72 2.58 4.96 1.11.95 2.54 1.5 4.03 1.54 1.43.04 2.88-.32 4.06-1.18 1.28-.88 2.18-2.27 2.47-3.81.13-.68.12-1.37.12-2.06V6.04c.78.47 1.6.88 2.47 1.19' },
                { name: 'WhatsApp', brandColor: 'text-[#25D366]', hoverBg: 'hover:bg-[#25D366]/10', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
              ].map((social) => (
                <div
                  key={social.name}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${social.brandColor} transition-all duration-200 ${social.hoverBg} hover:shadow-lg hover:scale-110 cursor-pointer`}
                  title={social.name}
                >
                  <svg viewBox="0 0 24 24" className="w-9 h-9" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── HOW IT WORKS ── */
const steps = [
  {
    num: 1,
    title: 'Créez votre boutique',
    desc: 'Inscrivez-vous et configurez votre boutique en quelques clics. Pas de compétences techniques requises.',
    image: '/landing/step-create-shop.png',
  },
  {
    num: 2,
    title: 'Ajoutez vos produits',
    desc: 'Importez vos produits avec photos, prix et descriptions. Organisez-les par catégories.',
    image: '/landing/step-add-products.png',
  },
  {
    num: 3,
    title: 'Recevez des commandes sur WhatsApp',
    desc: 'Partagez votre lien et recevez automatiquement des commandes via WhatsApp.',
    image: '/landing/step-whatsapp-orders.png',
  },
]

/* ── SCROLLING BANNER ── */
const bannerWords = [
  'Multi-Boutiques',
  'Commandes WhatsApp',
  'Live Shopping',
  'Posts Facebook automatiques',
  'IA pour vos produits',
  'Statistiques',
  'Domaine personnalisé',
  'Analytics',
]

function ScrollingBanner() {
  const items = [...bannerWords, ...bannerWords]
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 py-12">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((word, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 mx-8 text-2xl sm:text-4xl font-bold text-white/90"
          >
            {word}
            <span className="text-white/40 text-3xl sm:text-5xl">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900"
          >
            Comment ça marche ?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-5 text-gray-500 text-xl sm:text-2xl max-w-2xl mx-auto"
          >
            Lancez votre boutique en ligne en 3 étapes simples
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-14 relative">
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200" />

          {steps.map((step, i) => {
            return (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={vp}
                variants={fadeUp}
                custom={i * 0.15}
                className="text-center relative"
              >
                <div className="inline-flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-pink-200 mb-8 relative z-10 shadow-md">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 md:right-auto md:-top-1 w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-base font-bold flex items-center justify-center z-20">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── SOCIAL SELLING SHOWCASE ── */
function SocialSelling() {
  return (
    <section className="py-24 md:py-32 bg-gray-50/80">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fadeUp}
            custom={0}
            className="order-1"
          >
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-pink-100/50 to-rose-100/50 rounded-2xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-pink-900/5">
                <Image
                  src="/landing/social-selling.png"
                  alt="Vente sociale sur WhatsApp et réseaux"
                  width={1344}
                  height={768}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={stagger}
            className="order-2"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight"
            >
              Vendez partout,{' '}
              <span className="text-pink-500">en ligne</span>, sur WhatsApp,
              Facebook, Instagram...
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mt-6 text-gray-600 text-xl leading-relaxed"
            >
              Partagez vos produits en un clic sur tous vos canaux de vente.
              Créez des posts Facebook automatiques, vendez en Live Shopping
              et recevez les commandes sur WhatsApp, automatiquement.
            </motion.p>
            <motion.ul
              variants={fadeUp}
              custom={0.2}
              className="mt-10 space-y-5"
            >
              {[
                'Partagez vos liens produit partout',
                'Commandes automatiques sur WhatsApp',
                'Posts Facebook automatiques avec vos produits',
                'Live Shopping : vendez en direct',
                'Catalogue en ligne professionnel',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-gray-700 text-lg font-medium">{item}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── FEATURES SECTION ── */
const features = [
  {
    title: 'Multi-Boutiques',
    desc: 'Gérez jusqu\'à 10 boutiques avec un seul compte.',
    bullets: [
      'Créez des boutiques pour chaque activité',
      'Tableau de bord unique pour tout gérer',
      'Changez de boutique en un clic',
    ],
    detail: 'Avec Boutiko, un seul compte vous donne accès à plusieurs boutiques. Que vous vendiez des vêtements, de l\'électronique ou des produits de beauté — chaque boutique a son propre catalogue, ses propres commandes et sa propre personnalisation. Basculez d\'une boutique à l\'autre en un seul clic depuis votre tableau de bord.',
    image: '/landing/feature-multi-boutiques.png',
    icon: Store,
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Commandes WhatsApp',
    desc: 'Recevez et gérez vos commandes directement sur WhatsApp.',
    bullets: [
      'Message auto avec détails de commande',
      'Zone de livraison & frais calculés',
      'Aucune formation technique requise',
    ],
    detail: 'Dès qu\'un client passe commande sur votre boutique, un message WhatsApp automatique est envoyé avec tous les détails : produits, quantités, prix total, adresse de livraison et frais. Vous recevez la commande, vous confirmez, c\'est tout. Plus besoin de suivre manuellement vos messages.',
    image: '/landing/feature-whatsapp-orders.png',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Live Shopping',
    desc: 'Vendez en direct pendant vos lives sur toutes les plateformes.',
    bullets: [
      'Affichez vos produits en temps réel',
      'Vos viewers commandent instantanément',
      'Compatible TikTok, Facebook, Instagram Live',
    ],
    detail: 'Lancez un live shopping et vos produits s\'affichent en temps réel. Vos viewers cliquent, ajoutent au panier et commandent — tout pendant que vous présentez vos articles. Compatible TikTok, Facebook Live, Instagram Live. Augmentez vos ventes de 300% pendant vos lives.',
    image: '/landing/feature-live-mode.png',
    icon: ShoppingBag,
    color: 'from-purple-500 to-violet-500',
  },
  {
    title: 'Mobile Money',
    desc: 'Acceptez Orange Money, MTN Mobile Money, Wave.',
    bullets: [
      'Paiements locaux sécurisés',
      'Confirmation instantanée de paiement',
      'Compatible tous opérateurs africains',
    ],
    detail: 'Vos clients paient avec leur méthode préférée : Orange Money, MTN Mobile Money, Wave, ou virement bancaire. Les paiements sont sécurisés et les confirmations sont instantanées. Pas de compte bancaire nécessaire pour commencer à vendre.',
    image: '/landing/feature-mobile-money.png',
    icon: ShoppingCart,
    color: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Statistiques',
    desc: 'Suivez vos ventes et performances en temps réel.',
    bullets: [
      'Chiffre d\'affaires & commandes du jour',
      'Produits les plus vendus',
      'Tableaux de bord visuels clairs',
    ],
    detail: 'Votre tableau de bord vous montre tout : chiffre d\'affaires du jour, nombre de commandes, produits les plus vendus, taux de conversion, et bien plus. Prenez des décisions éclairées grâce à des données claires et visuelles. Exportez vos rapports en un clic.',
    image: '/landing/feature-statistiques.png',
    icon: PackagePlus,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'IA & Automatisation',
    desc: "Générez des descriptions, du texte marketing et optimisez vos produits avec l'IA.",
    bullets: [
      "Descriptions de produits auto-générées",
      'Textes marketing optimisés',
      'Gagnez des heures de travail',
    ],
    detail: "L'intelligence artificielle de Boutiko génère automatiquement des descriptions de produits, des textes marketing, et optimise vos fiches pour plus de ventes. Prenez une photo de votre produit, l'IA fait le reste. Gagnez des heures de travail chaque semaine.",
    image: '/landing/feature-ia.png',
    icon: Check,
    color: 'from-rose-500 to-pink-500',
  },
]

/* ── FEATURE DETAIL MODAL ── */
function FeatureDetail({
  feature,
  onClose,
}: {
  feature: typeof features[number]
  onClose: () => void
}) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-3`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {feature.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {feature.detail}
          </p>

          {/* Feature bullets */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {feature.bullets.map((b, j) => (
              <div key={j} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <svg className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 font-medium text-sm leading-snug">{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            size="lg"
            onClick={() => { onClose(); navigateTo('register') }}
            className="w-full sm:w-auto text-base font-semibold rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg shadow-pink-500/25 px-8 h-12"
          >
            Essayer {feature.title} gratuitement
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Features() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <section id="features" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900"
          >
            Tout ce qu&apos;il vous faut pour vendre en ligne
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-5 text-gray-500 text-xl sm:text-2xl max-w-2xl mx-auto"
          >
            Des outils puissants conçus spécialement pour les vendeurs africains
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4"
        >
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={i} variants={fadeUp} custom={i * 0.06}>
                <div
                  onClick={() => setSelected(i)}
                  className="sm:aspect-[510/937] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white group flex flex-col sm:flex-col cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative sm:flex-[3] overflow-hidden h-44 sm:h-auto shrink-0 sm:shrink">
                    <Image
                      src={f.image}
                      alt={f.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {/* Icon badge overlay */}
                    <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {/* Text block */}
                  <div className="flex-1 sm:flex-[2] flex flex-col justify-center px-4 sm:px-5 py-4 sm:py-5 gap-2 sm:gap-3">
                    <h3 className="font-bold text-gray-900 text-base sm:text-base lg:text-lg leading-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm sm:text-sm text-gray-500 leading-snug">
                      {f.desc}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 mt-1">
                      {f.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-1.5 sm:gap-2">
                          <svg className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          <span className="text-sm sm:text-xs text-gray-600 leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-2 ml-auto w-fit">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Feature detail modal */}
      <AnimatePresence>
        {selected !== null && (
          <FeatureDetail
            feature={features[selected]}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

/* ── DASHBOARD PREVIEW ── */
function DashboardPreview() {
  return (
    <section className="py-24 md:py-32 bg-gray-50/80">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900"
          >
            Un tableau de bord{' '}
            <span className="text-pink-500">puissant</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-5 text-gray-500 text-xl sm:text-2xl max-w-3xl mx-auto"
          >
            Gérez vos produits, suivez vos ventes et analysez vos performances
            depuis une interface claire et intuitive.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={fadeUp}
          custom={0.1}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-pink-100/40 to-rose-100/40 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-pink-900/10 border border-gray-100">
              <Image
                src="/landing/dashboard-feature.png"
                alt="Tableau de bord Boutiko"
                width={1344}
                height={768}
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── ENCART 1 : Partagez votre boutique ── */
function ShareYourShop() {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — platform collage image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fadeUp}
            custom={0}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-100/40 to-orange-100/40 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-pink-900/5">
                <Image
                  src="/landing/share-platforms.png"
                  alt="Partagez votre boutique sur toutes les plateformes"
                  width={1024}
                  height={1024}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>

          {/* Right — text + CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={stagger}
            className="order-1 lg:order-2"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight"
            >
              Partagez votre boutique{' '}
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                où vous le souhaitez
              </span>{' '}
              !
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mt-6 text-gray-600 text-lg sm:text-xl leading-relaxed"
            >
              Ajoutez votre URL Boutiko unique à toutes les plateformes —
              WhatsApp, Facebook, Instagram, TikTok — et tous les endroits où
              vous trouvez votre public. Créez des posts Facebook avec vos produits,
              partagez en stories et redirigez votre trafic hors ligne grâce au QR code.
            </motion.p>
            <motion.div variants={fadeUp} custom={0.2} className="mt-10">
              <Button
                size="lg"
                onClick={() => navigateTo('register')}
                className="text-lg px-10 py-6 h-auto font-semibold rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg shadow-pink-500/25"
              >
                Commencer gratuitement{' '}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── ENCART 2 : Créez et personnalisez ── */
function CustomizeYourShop() {
  return (
    <section className="py-20 md:py-28 bg-gray-50/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — phone mockup image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fadeUp}
            custom={0}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-100/40 to-rose-100/40 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-pink-900/5">
                <Image
                  src="/landing/customize-shop.png"
                  alt="Créez et personnalisez votre boutique Boutiko"
                  width={1024}
                  height={1024}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>

          {/* Right — text + CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={stagger}
            className="order-1 lg:order-2"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight"
            >
              Créez et personnalisez votre boutique{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                en quelques minutes
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mt-6 text-gray-600 text-lg sm:text-xl leading-relaxed"
            >
              Regroupez tous vos contenus — réseaux sociaux, sites web,
              boutiques en ligne, etc. — dans un seul lien en bio. Personnalisez
              chaque détail ou laissez Boutiko l&apos;optimiser automatiquement
              pour qu&apos;il corresponde à votre marque et génère plus de clics.
            </motion.p>
            <motion.div variants={fadeUp} custom={0.2} className="mt-10">
              <Button
                size="lg"
                onClick={() => navigateTo('register')}
                className="text-lg px-10 py-6 h-auto font-semibold rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg shadow-pink-500/25"
              >
                Commencer gratuitement{' '}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── PRICING ── */
const plans = [
  {
    name: 'LIVE',
    emoji: '🔴',
    price: '20 000',
    period: 'FCFA / an',
    desc: 'Idéal pour les vendeurs en live',
    popular: false,
    features: [
      '1 boutique',
      '20 produits',
      'Live TikTok',
      'Posts Facebook',
      'Commandes WhatsApp',
      '1 thème inclus',
      'Dashboard simplifié',
    ],
  },
  {
    name: 'BOUTIQUE PRO',
    emoji: '🟣',
    price: '30 000',
    period: 'FCFA / an',
    desc: 'Toutes les fonctionnalités',
    popular: true,
    features: [
      '1 boutique',
      '40 produits',
      'Toutes les fonctionnalités',
      'Live TikTok + Facebook',
      'Tous les thèmes premium',
      'Domaine personnalisé',
      'Statistiques avancées',
      'Outils IA',
      'Dashboard complet',
    ],
  },
  {
    name: 'LIVE PRO',
    emoji: '🔵',
    price: '35 000',
    period: 'FCFA / an',
    desc: 'Pour les vendeurs multi-activités',
    popular: false,
    features: [
      '2 boutiques',
      '25 produits / boutique',
      'Live TikTok',
      'Posts Facebook',
      'Commandes WhatsApp',
      '1 thème inclus',
      'Dashboard simplifié',
    ],
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900"
          >
            Des tarifs adaptés à vos ambitions
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-5 text-gray-500 text-xl sm:text-2xl max-w-2xl mx-auto"
          >
            Choisissez l'offre qui correspond à vos besoins. Facturation annuelle. 7 jours d&apos;essai inclus.
          </motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              variants={fadeUp}
              custom={i * 0.1}
              className="relative"
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg shadow-pink-500/25 text-sm font-bold px-5 py-1.5">
                    Plus Populaire
                  </Badge>
                </div>
              )}
              <Card
                className={`h-full flex flex-col rounded-2xl ${
                  p.popular
                    ? 'border-2 border-pink-500 shadow-xl shadow-pink-500/15 scale-[1.02]'
                    : 'border border-gray-200 shadow-sm hover:shadow-md'
                } transition-shadow bg-white`}
              >
                <CardContent className="pt-10 pb-10 px-7 flex flex-col flex-1">
                  <div className="mb-8">
                    <h3 className="text-base font-bold tracking-wider text-gray-400 uppercase">
                      {p.emoji} {p.name}
                    </h3>
                    <p className="text-base text-gray-500 mt-1.5">{p.desc}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-5xl font-extrabold text-gray-900">
                      {p.price}
                    </span>
                    <span className="text-gray-400 font-medium text-lg ml-1.5">
                      {p.period}
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold px-3.5 py-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      7 jours d&apos;essai inclus
                    </span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-3 text-base text-gray-600"
                      >
                        <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-pink-500" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={p.popular ? 'default' : 'outline'}
                    onClick={() => navigateTo('register')}
                    className={`w-full rounded-full h-13 text-lg font-semibold ${
                      p.popular
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/25 text-white'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Choisir {p.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── SHOP LOGOS SLIDER ── */
interface ShopLogoItem {
  name: string
  slug: string
  logo: string | null
}

function ShopLogosSlider() {
  const [shops, setShops] = useState<ShopLogoItem[]>([])

  useEffect(() => {
    fetch('/api/shops/logos')
      .then((r) => r.json())
      .then((data) => setShops(data))
      .catch(() => {})
  }, [])

  if (shops.length === 0) return null

  // Duplicate for infinite loop effect
  const items = [...shops, ...shops]
  const speed = Math.max(20, shops.length * 3)

  return (
    <div className="mt-14 overflow-hidden">
      <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">
        Leurs boutiques sur Boutiko
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-logos-slide">
          {items.map((shop, i) => {
            const initial = (shop.name || '?')[0].toUpperCase()
            return (
              <a
                key={`${shop.slug}-${i}`}
                href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 mx-6 group"
                title={shop.name}
              >
                <div className="w-60 h-60 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-gray-100 bg-white shadow-sm group-hover:shadow-md group-hover:border-pink-200 transition-all duration-300 group-hover:scale-105 flex items-center justify-center p-4">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-6xl sm:text-7xl font-bold text-pink-500 select-none">
                      {initial}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-center text-gray-500 group-hover:text-pink-500 font-medium truncate w-60 sm:w-72 transition-colors">
                  {shop.name}
                </p>
              </a>
            )
          })}
        </div>
      </div>
      <style>{`
        @keyframes logos-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-logos-slide {
          animation: logos-slide ${speed}s linear infinite;
        }
        .animate-logos-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

/* ── SOCIAL PROOF / TESTIMONIAL ── */
const stats = [
  { value: 500, suffix: '+', label: 'vendeurs actifs' },
  { value: 4.9, suffix: '/5', label: 'étoiles' },
  { value: 10, suffix: '+', label: 'pays africains' },
]

function SocialProof() {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fadeUp}
            custom={0}
          >
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-pink-100/50 to-rose-100/50 rounded-2xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-pink-900/5">
                <Image
                  src="/landing/community.png"
                  alt="Communauté d'entrepreneurs africains"
                  width={1344}
                  height={768}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight"
            >
              Rejoignez une communauté de{' '}
              <span className="text-pink-500">vendeurs passionnés</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mt-6 text-gray-600 text-xl leading-relaxed"
            >
              Des centaines de marchands africains font confiance à Boutiko
              pour développer leur activité en ligne. Rejoignez-les !
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={0.2}
              className="mt-12 grid grid-cols-3 gap-8"
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                    {s.value % 1 === 0 ? (
                      <Counter value={s.value} />
                    ) : (
                      <>{s.value}</>
                    )}
                    <span className="text-pink-500">{s.suffix}</span>
                  </p>
                  <p className="text-base text-gray-500 mt-2 font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Shop logos carousel */}
        <ShopLogosSlider />
      </div>
    </section>
  )
}

/* ── FAQ SECTION ── */
const faqItems = [
  {
    q: "Qu'est-ce que Boutiko ?",
    a: "Boutiko est la plateforme tout-en-un pour les vendeurs africains. Créez votre boutique en ligne, vendez sur WhatsApp, Facebook, Instagram, faites du Live Shopping et automatisez vos posts sur les réseaux sociaux. Pas besoin de compétences techniques.",
  },
  {
    q: 'Comment fonctionne la commande sur WhatsApp ?',
    a: "Vos clients parcourent votre boutique en ligne, ajoutent des produits au panier et passent commande. La commande est automatiquement envoyée sur votre WhatsApp avec tous les détails : produits, quantités, prix et informations de livraison. Vous pouvez aussi recevoir des commandes pendant vos lives.",
  },
  {
    q: 'Puis-je avoir plusieurs boutiques ?',
    a: "Oui ! Avec les plans PRO et BUSINESS, vous pouvez gérer plusieurs boutiques depuis un seul compte. Le plan PRO vous donne accès à 3 boutiques, et le plan BUSINESS jusqu'à 10 boutiques.",
  },
  {
    q: 'Quels moyens de paiement sont acceptés ?',
    a: "Boutiko supporte les principaux moyens de paiement mobile en Afrique : Orange Money, MTN Mobile Money, Wave, et bien d'autres. Vous pouvez également accepter les paiements par virement bancaire.",
  },
  {
    q: 'Comment fonctionne l\'essai gratuit ?',
    a: "Commencez gratuitement avec le plan STARTER. Créez votre boutique, ajoutez vos produits et recevez vos premières commandes. Quand vous êtes prêt à évoluer, passez simplement à un plan supérieur.",
  },
]

function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-gray-50/80">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900"
          >
            Questions fréquentes
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-5 text-gray-500 text-xl"
          >
            Tout ce que vous devez savoir pour commencer
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={fadeUp}
          custom={0.1}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-gray-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-pink-500 hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed text-lg">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

/* ── TESTIMONIALS ── */
const testimonials = [
  {
    name: 'Mariama Ba',
    role: 'Vendeuse de mode, Dakar',
    image: '/landing/testimonials/mariama.png',
    text: "Boutiko a transformé mon business. Je reçois maintenant 3x plus de commandes grâce au mode Live. Mes clientes adorent !",
    rating: 5,
    plan: 'LIVE PRO',
  },
  {
    name: 'Ibrahim Diop',
    role: 'Propriétaire boutique électronique',
    image: '/landing/testimonials/ibrahima.png',
    text: "L'intégration WhatsApp est parfaite. Chaque commande arrive directement sur mon téléphone. Plus besoin de gérer un site complexe.",
    rating: 5,
    plan: 'BOUTIQUE PRO',
  },
  {
    name: 'Adja Fall',
    role: 'Marchande de produits beauté',
    image: '/landing/testimonials/ady.png',
    text: "En 2 minutes j'avais ma boutique en ligne. L'IA génère mes descriptions de produits automatiquement. Un gain de temps incroyable !",
    rating: 5,
    plan: 'LIVE',
  },
]

function Testimonials() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={stagger}
      className="py-20 sm:py-28 bg-white"
      id="testimonials"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section header */}
        <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
          <Badge variant="secondary" className="bg-pink-50 text-pink-600 border border-pink-200/60 px-5 py-2 text-base font-medium mb-6 inline-flex items-center gap-2">
            ⭐ Témoignages
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Ce qu&apos;ils disent de{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Boutiko</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
            Des milliers de vendeurs à travers l&apos;Afrique font confiance à Boutiko pour développer leur activité en ligne.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              custom={0.1 + i * 0.15}
              className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 group"
            >
              {/* Plan badge */}
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg shadow-pink-500/20">
                  {t.plan}
                </Badge>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-pink-100 shrink-0">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ── FINAL CTA ── */
function FinalCTA() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        variants={stagger}
        className="relative mx-auto max-w-7xl px-5 sm:px-8 text-center"
      >
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight"
        >
          Prêt à lancer votre boutique
          <br className="hidden sm:block" /> en ligne ?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={0.1}
          className="mt-6 text-xl text-white/80 max-w-2xl mx-auto"
        >
          Rejoignez des centaines de vendeurs africains qui font confiance à
          Boutiko pour développer leur activité.
        </motion.p>
        <motion.div variants={fadeUp} custom={0.2} className="mt-12">
          <Button
            size="lg"
            onClick={() => navigateTo('register')}
            className="text-lg px-12 py-7 h-auto font-semibold rounded-full bg-white text-pink-600 hover:bg-white/90 shadow-2xl shadow-black/20"
          >
            Créer ma boutique gratuitement{' '}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-14 pb-24 mt-auto">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-5 text-base text-gray-500 leading-relaxed max-w-xs">
              La plateforme tout-en-un pour vendre en ligne en Afrique.
              WhatsApp, Facebook, Live Shopping, IA — tout est inclus.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 text-base uppercase tracking-wider">
              Produit
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Fonctionnalités', view: 'about' as const },
                { label: 'Tarifs', view: 'pricing' as const },
                { label: 'FAQ', view: 'faq' as const },
              ].map((l) => (
                <li key={l.view}>
                  <button
                    onClick={() => navigateTo(l.view)}
                    className="text-base text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 text-base uppercase tracking-wider">
              Entreprise
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'À propos', view: 'about' as const },
                { label: 'Contact', view: 'contact' as const },
              ].map((l) => (
                <li key={l.view}>
                  <button
                    onClick={() => navigateTo(l.view)}
                    className="text-base text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Paiements */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 text-base uppercase tracking-wider">
              Paiements
            </h4>
            <ul className="space-y-3 text-base text-gray-500">
              <li>Orange Money</li>
              <li>MTN Mobile Money</li>
              <li>Wave</li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-base text-gray-400">
            © {new Date().getFullYear()} Boutiko. Tous droits réservés.
          </p>
          <div className="flex gap-8">
            <button
              onClick={() => navigateTo('privacy')}
              className="text-base text-gray-400 hover:text-gray-600 transition-colors"
            >
              Confidentialité
            </button>
            <button
              onClick={() => navigateTo('terms')}
              className="text-base text-gray-400 hover:text-gray-600 transition-colors"
            >
              Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── MAIN EXPORT ── */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <StoryCards />
        <ScrollingBanner />
        <HowItWorks />
        <SocialSelling />
        <Features />
        <DashboardPreview />
        <ShareYourShop />
        <CustomizeYourShop />
        <Pricing />
        <SocialProof />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}