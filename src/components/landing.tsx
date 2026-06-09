'use client'

import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { PLATFORM_CONFIG } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  ShoppingBag,
  MessageCircle,
  Zap,
  Smartphone,
  LayoutGrid,
  BarChart3,
  ArrowRight,
  Menu,
  UserPlus,
  Package,
  Link2,
  Star,
  Check,
  Shield,
  TrendingUp,
  Sparkles,
  Globe2,
  SignalHigh,
  Wifi,
  BatteryFull,
  Instagram,
  Mail,
  Phone,
  ChevronRight,
  Play,
  Palmtree,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
const DARK_CARD = '#121b36'
const WARM_PEACH = '#FFF5F0'
const PRIMARY = '#EC4899'
const AMBER = '#F59E0B'

/* ──────────────────────────── ANIMATIONS ──────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

/* ──────────────────────────── LOGO ──────────────────────────── */
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg shadow-primary/25">
        <ShoppingBag className="w-4.5 h-4.5 text-primary-foreground" />
      </div>
      <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : ''}`}>
        Bouti<span className="text-primary">ko</span>
      </span>
    </div>
  )
}

/* ──────────────────────────── SECTION WRAPPER ──────────────────────────── */
function Section({
  id,
  children,
  dark = false,
  className = '',
  noPadding = false,
}: {
  id?: string
  children: React.ReactNode
  dark?: boolean
  className?: string
  noPadding?: boolean
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${noPadding ? '' : 'py-20 md:py-28 lg:py-32'} ${className}`}
      style={dark ? { backgroundColor: DARK_BG } : { backgroundColor: '#FFFFFF' }}
    >
      {children}
    </section>
  )
}

function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 ${className}`}>
      {children}
    </div>
  )
}

/* ──────────────────────────── HEADER ──────────────────────────── */
function Header() {
  const { setView } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-[1400px] flex h-18 items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {[
            { label: 'Fonctionnalités', href: '#fonctionnalites', view: undefined },
            { label: 'Comment ça marche', href: '#etapes', view: undefined },
            { label: 'Tarifs', href: null, view: 'pricing' as const },
            { label: 'À propos', href: null, view: 'about' as const },
            { label: 'Contact', href: null, view: 'contact' as const },
          ].map((item) => (
            item.view ? (
              <button
                key={item.view}
                onClick={() => setView(item.view!)}
                className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </a>
            )
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('login')} className="font-medium text-gray-600 hover:text-gray-900">
            Se connecter
          </Button>
          <Button
            size="sm"
            onClick={() => setView('register')}
            className="font-medium shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            Créer ma boutique
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="mb-6">
              <Logo />
            </SheetTitle>
            <nav className="flex flex-col gap-4">
              {[
                { label: 'Fonctionnalités', href: '#fonctionnalites', view: undefined },
                { label: 'Comment ça marche', href: '#etapes', view: undefined },
                { label: 'Tarifs', href: null, view: 'pricing' as const },
                { label: 'À propos', href: null, view: 'about' as const },
                { label: 'Contact', href: null, view: 'contact' as const },
              ].map((item) => (
                item.view ? (
                  <button
                    key={item.view}
                    onClick={() => { setMobileOpen(false); setView(item.view!) }}
                    className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2 text-left"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                  >
                    {item.label}
                  </a>
                )
              ))}
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { setMobileOpen(false); setView('login') }}
              >
                Se connecter
              </Button>
              <Button
                className="w-full"
                onClick={() => { setMobileOpen(false); setView('register') }}
              >
                Créer ma boutique
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

/* ──────────────────────────── HERO ──────────────────────────── */
function HeroSection() {
  const { setView, setShopSlug } = useAppStore()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center" style={{ backgroundColor: DARK_BG }}>
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1426] via-[#111c38] to-[#1a1f3a]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow effects */}
        <div className="absolute top-20 right-[20%] w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/4 rounded-full blur-[150px]" />
      </div>

      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp}>
              <Badge
                className="mb-8 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2"
              >
                <span className="text-base">🚀</span>
                La plateforme N°1 des vendeurs africains
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-[52px] lg:text-[56px] font-bold tracking-tight leading-[1.08] text-white"
            >
              Créez votre boutique{' '}
              <br className="hidden sm:block" />
              en ligne{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
                  en quelques minutes
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-7 text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Vendez sur WhatsApp, TikTok, Instagram. Pas besoin de compétences techniques.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="text-base px-8 py-6 h-auto font-bold rounded-full bg-white text-gray-900 hover:bg-white/90 shadow-2xl shadow-black/30 transition-all duration-300"
                onClick={() => setView('register')}
              >
                COMMENCER MAINTENANT
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 h-auto font-semibold rounded-full bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
                onClick={() => setShopSlug('jameela-beauty')}
              >
                <Play className="w-4 h-4 mr-2" />
                Voir une démo
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-5 justify-center lg:justify-start">
              {/* Avatar stack */}
              <div className="flex -space-x-2.5">
                {['AM', 'FK', 'SD', 'LB'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EC4899] to-[#F59E0B] flex items-center justify-center text-white text-xs font-bold border-2 border-[#0B1426]"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/80 border-2 border-[#0B1426] backdrop-blur-sm">
                  +2k
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-white">4.8/5</span>
                </div>
                <p className="text-sm text-white/50 mt-0.5">
                  +2 000 marchands satisfaits
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-amber-400/15 to-orange-400/20 blur-3xl rounded-full scale-110" />

              {/* Phone frame */}
              <div className="relative w-[280px] sm:w-[300px] rounded-[2.8rem] bg-gradient-to-b from-gray-700 to-gray-900 p-[3px] shadow-2xl shadow-black/40">
                <div className="rounded-[2.6rem] bg-gray-900 p-3">
                  <div className="rounded-[2.2rem] bg-white overflow-hidden">
                    {/* Notch */}
                    <div className="flex justify-center pt-2">
                      <div className="w-24 h-6 rounded-full bg-gray-900" />
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-1 text-[10px] text-gray-500">
                      <span className="font-semibold">9:41</span>
                      <div className="flex items-center gap-1">
                        <SignalHigh className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <BatteryFull className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Shop header */}
                    <div className="bg-gradient-to-r from-primary via-amber-600 to-orange-500 px-4 py-5 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold ring-2 ring-white/30">
                          AM
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Amina Mode ✨</p>
                          <p className="text-[11px] text-white/80">
                            Dakar · Vêtements & Accessoires
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2 px-3 py-2.5 overflow-hidden">
                      {['Tous', 'Robes', 'Accessoires'].map((cat, i) => (
                        <span
                          key={cat}
                          className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                            i === 0
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Product grid */}
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Robe Wax Élégante', price: '15 000', emoji: '👗' },
                          { name: 'Boubou Grand', price: '12 000', emoji: '👔' },
                          { name: 'Tunique Kente', price: '8 500', emoji: '👘' },
                          { name: 'Pagne Premium', price: '5 000', emoji: '🧵' },
                        ].map((product, i) => (
                          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden group">
                            <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-2xl">
                              {product.emoji}
                            </div>
                            <div className="p-2">
                              <p className="text-[10px] font-semibold truncate">{product.name}</p>
                              <p className="text-[11px] font-bold text-primary">
                                {product.price} <span className="text-[9px] font-normal">FCFA</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* WhatsApp bar */}
                    <div className="mx-3 mb-3 rounded-xl bg-[#25D366] px-4 py-3 flex items-center justify-center gap-2 text-white text-xs font-semibold shadow-lg shadow-green-500/20">
                      <MessageCircle className="w-4 h-4" />
                      Commander sur WhatsApp
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card: order notification */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -top-2 -right-6 sm:-right-8 bg-white rounded-2xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md shadow-primary/20">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">+2 commandes</p>
                  <p className="text-[10px] text-gray-500">via WhatsApp</p>
                </div>
              </motion.div>

              {/* Floating card: stats */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -bottom-2 -left-6 sm:-left-10 bg-white rounded-2xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">+45% ventes</p>
                  <p className="text-[10px] text-gray-500">ce mois-ci</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────── STATS / SOCIAL PROOF ──────────────────────────── */
function StatsSection() {
  const stats = [
    { value: '2 000+', label: 'Marchands actifs', icon: ShoppingBag },
    { value: '50 000+', label: 'Commandes traitées', icon: Package },
    { value: '15+', label: 'Pays couverts', icon: Globe2 },
    { value: '4.8/5', label: 'Satisfaction client', icon: Star },
  ]

  return (
    <section className="py-14 md:py-16 relative" style={{ backgroundColor: WARM_PEACH }}>
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary">
                {stat.value}
              </p>
              <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── FEATURES ──────────────────────────── */
const features = [
  {
    icon: Zap,
    title: 'Création rapide',
    description: 'Votre boutique en ligne en moins de 3 minutes. Aucune compétence technique requise.',
    color: '#F59E0B',
  },
  {
    icon: MessageCircle,
    title: 'Commandes WhatsApp',
    description: "Vos clients commandent et paient directement via WhatsApp. Le canal qu'ils préfèrent.",
    color: '#25D366',
  },
  {
    icon: Smartphone,
    title: '100% Mobile',
    description: "Optimisé pour tous les téléphones. Vos clients achètent depuis n'importe où.",
    color: '#EC4899',
  },
  {
    icon: LayoutGrid,
    title: 'Catalogue intelligent',
    description: 'Organisez vos produits avec des catégories, filtres et recherche instantanée.',
    color: '#F59E0B',
  },
  {
    icon: BarChart3,
    title: 'Statistiques',
    description: 'Suivez vos ventes, visites et performances avec des tableaux de bord en temps réel.',
    color: '#EC4899',
  },
  {
    icon: Sparkles,
    title: '12 Thèmes premium',
    description: 'Choisissez parmi 12 thèmes élégants pour une boutique qui reflète votre marque.',
    color: '#25D366',
  },
]

function FeaturesSection() {
  return (
    <Section id="fonctionnalites" dark>
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px]" />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20 relative z-10"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold bg-white/10 text-white/80 border-white/15 hover:bg-white/15 backdrop-blur-sm">
              Fonctionnalités
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            POURQUOI{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              BOUTIKO
            </span>
            <span className="text-white"> ?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Des outils puissants conçus spécialement pour les vendeurs africains
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 relative z-10"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full bg-[#121b36]/80 border border-white/[0.06] hover:border-white/[0.15] backdrop-blur-sm transition-all duration-500 group overflow-hidden rounded-2xl">
                <CardContent className="pt-7 pb-7 relative">
                  {/* Hover gradient line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                  />

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2.5 text-white">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}

/* ──────────────────────────── HOW IT WORKS ──────────────────────────── */
const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Créez votre compte',
    description: 'Inscrivez-vous gratuitement en 30 secondes avec votre email et numéro WhatsApp.',
  },
  {
    number: '02',
    icon: Package,
    title: 'Ajoutez vos produits',
    description: 'Ajoutez vos produits avec photos, prix et descriptions. Votre catalogue est prêt.',
  },
  {
    number: '03',
    icon: Link2,
    title: 'Partagez et vendez',
    description: 'Partagez votre lien sur WhatsApp, Instagram, TikTok et recevez des commandes.',
  },
]

function HowItWorksSection() {
  return (
    <Section id="etapes">
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
              Comment ça marche
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            3 étapes pour lancer votre{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              boutique
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Un processus simple et rapide pour démarrer votre activité en ligne
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 relative"
        >
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/20 via-amber-400/20 to-primary/20" />

          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeInUp} className="relative text-center group">
              <div className="relative inline-flex mb-8">
                {/* Circle */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-amber-100/30 flex items-center justify-center group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-amber-200/40 transition-all duration-500 border-2 border-primary/10 group-hover:border-primary/20">
                  <step.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                </div>
                {/* Number badge */}
                <div className="absolute -top-2 -right-2 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-500 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/30 border-3 border-white">
                  {step.number}
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>

              {/* Arrow on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-20 -right-5 lg:-right-8 translate-x-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}

/* ──────────────────────────── TESTIMONIALS ──────────────────────────── */
const testimonials = [
  {
    name: 'Aminata Diallo',
    location: 'Dakar, Sénégal',
    text: "Boutiko a transformé mes ventes Instagram. Je reçois maintenant 3x plus de commandes et mes clientes adorent l'expérience d'achat.",
    initials: 'AD',
    rating: 5,
  },
  {
    name: 'Fatou Sow',
    location: "Abidjan, Côte d'Ivoire",
    text: "En 5 minutes j'avais ma boutique en ligne. Maintenant je vends même la nuit sans être sur mon téléphone ! Incroyable.",
    initials: 'FS',
    rating: 5,
  },
  {
    name: 'Moussa Traoré',
    location: 'Bamako, Mali',
    text: "L'intégration WhatsApp est parfaite. Mes clients commandent directement, je n'ai plus besoin de gérer les commandes manuellement.",
    initials: 'MT',
    rating: 5,
  },
]

function TestimonialSection() {
  return (
    <Section id="temoignages" dark>
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20 relative z-10"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold bg-white/10 text-white/80 border-white/15 hover:bg-white/15 backdrop-blur-sm">
              Témoignages
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            Ce qu'en disent nos{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              marchands
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Plus de 2 000 vendeurs font confiance à Boutiko pour développer leur business
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 relative z-10"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full bg-[#121b36]/80 border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-500 group rounded-2xl">
                <CardContent className="pt-7 pb-7">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-white/70 mb-7">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3.5 pt-5 border-t border-white/[0.06]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EC4899] to-[#F59E0B] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{testimonial.name}</p>
                      <p className="text-xs text-white/50 mt-0.5">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}

/* ──────────────────────────── PRICING ──────────────────────────── */
const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: '/mois',
    description: 'Parfait pour commencer',
    popular: false,
    features: [
      '10 produits maximum',
      'Boutique publique en ligne',
      'Commandes via WhatsApp',
      'Design responsive mobile',
      'QR code de boutique',
    ],
  },
  {
    name: 'Standard',
    price: '5 000',
    period: ' FCFA/mois',
    description: 'Le choix des vendeurs',
    popular: true,
    features: [
      '100 produits',
      '12 thèmes premium',
      'Statistiques avancées',
      'Support prioritaire',
      'Logo personnalisé',
      'IA pour descriptions',
    ],
  },
  {
    name: 'Premium',
    price: '15 000',
    period: ' FCFA/mois',
    description: 'Pour les pros',
    popular: false,
    features: [
      'Produits illimités',
      'Domaine personnalisé',
      'Support dédié 24/7',
      'API & intégrations',
      'Marque blanche',
      'Formation offerte',
    ],
  },
]

function PricingSection() {
  const { setView } = useAppStore()

  return (
    <Section id="tarifs">
      {/* Subtle accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20 relative z-10"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
              Nos Tarifs
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ color: '#111827' }}
          >
            Des prix{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              simples et justes
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
            Pas de frais cachés. Changez de plan à tout moment. Commencez gratuitement.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start relative z-10"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card
                className={`relative h-full flex flex-col overflow-hidden rounded-2xl bg-white ${
                  plan.popular
                    ? 'border-2 border-primary shadow-2xl shadow-primary/15 scale-[1.04] md:scale-[1.06]'
                    : 'border border-gray-200 hover:border-primary/20 hover:shadow-xl'
                } transition-all duration-500`}
              >
                {/* Popular gradient top */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899]" />
                )}

                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-5 py-1.5 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-amber-500 text-white border-0 text-xs font-bold">
                      ⭐ Le plus populaire
                    </Badge>
                  </div>
                )}

                <CardContent className="pt-8 pb-8 flex-1 flex flex-col px-7 bg-white" style={{ color: '#111827' }}>
                  <div className="mb-7">
                    <h3 className="font-bold text-xl" style={{ color: '#111827' }}>{plan.name}</h3>
                    <p className="text-sm mt-1.5" style={{ color: '#6B7280' }}>{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-bold tracking-tight" style={{ color: '#111827' }}>{plan.price}</span>
                    <span className="font-medium text-base" style={{ color: '#9CA3AF' }}>{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span style={{ color: '#4B5563' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-semibold h-12 rounded-full ${
                      plan.popular
                        ? 'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => {
                      if (plan.price === '0') {
                        setView('register')
                      } else {
                        const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par l'abonnement ${plan.name} à ${plan.price} FCFA/mois sur Boutiko.`)
                        window.open(`https://wa.me/${PLATFORM_CONFIG.DEFAULT_WHATSAPP}?text=${message}`, '_blank')
                      }
                    }}
                  >
                    {plan.price === '0' ? 'Commencer gratuitement' : `S'abonner via WhatsApp`}
                    {plan.price !== '0' && <MessageCircle className="w-4 h-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}

/* ──────────────────────────── CTA ──────────────────────────── */
function CTASection() {
  const { setView } = useAppStore()

  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: DARK_BG }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center relative z-10"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-8 px-5 py-2 text-sm font-semibold bg-white/10 text-white/80 border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Gratuit pour toujours
            </Badge>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-[52px] font-bold text-white leading-tight"
          >
            Prêt à développer
            <br />
            votre business ?
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
            Rejoignez +2 000 marchands qui font confiance à Boutiko.
            <br className="hidden sm:block" />
            Créez votre boutique en 30 secondes.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-base px-10 py-6 h-auto font-bold rounded-full bg-white text-gray-900 hover:bg-white/90 shadow-2xl shadow-black/30 transition-all duration-300"
              onClick={() => setView('register')}
            >
              Commencer gratuitement
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 h-auto font-semibold rounded-full bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
              onClick={() => setView('login')}
            >
              Se connecter
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── FOOTER ──────────────────────────── */
function Footer() {
  const { setView } = useAppStore()

  return (
    <footer className="mt-auto" style={{ backgroundColor: DARK_BG }}>
      {/* Top border accent */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo light />
            <p className="text-sm text-white/50 mt-4 max-w-[280px] leading-relaxed">
              La plateforme e-commerce N°1 pour les vendeurs africains.
              Créez votre boutique, vendez sur WhatsApp, développez votre business.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-white/60" />
              </a>
              <a href="https://wa.me/${PLATFORM_CONFIG.DEFAULT_WHATSAPP}" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                <MessageCircle className="w-4 h-4 text-white/60" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                <Globe2 className="w-4 h-4 text-white/60" />
              </a>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5">PRODUIT</h4>
            <ul className="space-y-3">
              {[
                { label: 'Fonctionnalités', action: () => setView('landing') },
                { label: 'Tarifs', action: () => setView('pricing') },
                { label: 'FAQ', action: () => setView('faq') },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={item.action} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5">ENTREPRISE</h4>
            <ul className="space-y-3">
              {[
                { label: 'À propos', action: () => setView('about') },
                { label: 'Contact', action: () => setView('contact') },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={item.action} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5">CONTACT</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                <a href="https://wa.me/${PLATFORM_CONFIG.DEFAULT_WHATSAPP}" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white/80 transition-colors">+221 78 485 82 26</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:contact@boutiko.com" className="text-sm text-white/50 hover:text-white/80 transition-colors">contact@boutiko.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-white/50">Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <Separator className="my-10 bg-white/[0.06]" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Boutiko. Tous droits réservés.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setView('privacy')} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Confidentialité
              </button>
              <span className="text-white/20">·</span>
              <button onClick={() => setView('terms')} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Conditions
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/40">
              <Palmtree className="w-4 h-4 text-primary/60" />
              <span className="text-sm">Made in Africa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────────────── LANDING PAGE ──────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
