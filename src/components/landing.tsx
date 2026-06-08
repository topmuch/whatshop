'use client'

import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore } from '@/lib/store'
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
} from 'lucide-react'

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
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg shadow-primary/25">
        <ShoppingBag className="w-4.5 h-4.5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold tracking-tight">
        Whats<span className="text-primary">Shop</span>
      </span>
    </div>
  )
}

/* ──────────────────────────── HEADER ──────────────────────────── */
function Header() {
  const { setView, setShopSlug } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-border/40">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Fonctionnalités', href: '#fonctionnalites' },
            { label: 'Comment ça marche', href: '#etapes' },
            { label: 'Tarifs', href: '#tarifs' },
            { label: 'Témoignages', href: '#temoignages' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('login')} className="font-medium">
            Connexion
          </Button>
          <Button
            size="sm"
            onClick={() => setView('register')}
            className="font-medium shadow-lg shadow-primary/20"
          >
            Créer ma boutique
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
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
                { label: 'Fonctionnalités', href: '#fonctionnalites' },
                { label: 'Comment ça marche', href: '#etapes' },
                { label: 'Tarifs', href: '#tarifs' },
                { label: 'Témoignages', href: '#temoignages' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </a>
              ))}
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { setMobileOpen(false); setView('login') }}
              >
                Connexion
              </Button>
              <Button
                className="w-full"
                onClick={() => { setMobileOpen(false); setView('register') }}
              >
                Créer ma boutique
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
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-background to-orange-50/60" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/20 via-orange-200/10 to-transparent rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp}>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                La plateforme N°1 pour les vendeurs africains
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]"
            >
              Lancez votre{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-primary via-amber-600 to-orange-500 bg-clip-text text-transparent">
                  boutique en ligne
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/15 rounded-full -z-0" />
              </span>
              <br />
              en quelques minutes
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Créez une boutique élégante, recevez des commandes sur WhatsApp,
              et développez votre activité — sans compétence technique.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="text-base px-8 py-6 h-auto font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
                onClick={() => setView('register')}
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 h-auto font-semibold hover:bg-primary/5 transition-colors"
                onClick={() => setShopSlug('amina-shop')}
              >
                Voir une démo
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {['AM', 'FK', 'SD', 'LB'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white text-xs font-bold border-2 border-background"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground border-2 border-background">
                  +2k
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  +2 000 marchands satisfaits
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Phone mockup - premium version */}
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
              <div className="relative w-[280px] sm:w-[300px] rounded-[2.8rem] bg-gradient-to-b from-gray-800 to-gray-950 p-[3px] shadow-2xl shadow-black/20">
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
                className="absolute -top-2 -right-6 sm:-right-8 bg-white rounded-2xl shadow-xl shadow-black/5 px-4 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md shadow-primary/20">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">+2 commandes</p>
                  <p className="text-[10px] text-muted-foreground">via WhatsApp</p>
                </div>
              </motion.div>

              {/* Floating card: stats */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -bottom-2 -left-6 sm:-left-10 bg-white rounded-2xl shadow-xl shadow-black/5 px-4 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">+45% ventes</p>
                  <p className="text-[10px] text-muted-foreground">ce mois-ci</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────── TRUSTED BY / STATS ──────────────────────────── */
function StatsSection() {
  const stats = [
    { value: '2 000+', label: 'Marchands actifs', icon: ShoppingBag },
    { value: '50 000+', label: 'Commandes traitées', icon: Package },
    { value: '15+', label: 'Pays africains', icon: Globe2 },
    { value: '99.9%', label: 'Disponibilité', icon: Shield },
  ]

  return (
    <section className="py-16 border-y border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── FEATURES ──────────────────────────── */
const features = [
  {
    icon: Zap,
    title: 'Création ultra-rapide',
    description: 'Votre boutique en ligne en moins de 3 minutes. Aucune compétence technique requise.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: MessageCircle,
    title: 'Commandes WhatsApp',
    description: 'Vos clients commandent et paient directement via WhatsApp. Le canal qu\'ils préfèrent.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: Smartphone,
    title: '100% Mobile',
    description: 'Optimisé pour tous les téléphones. Vos clients achètent depuis n\'importe où.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: LayoutGrid,
    title: 'Catalogue intelligent',
    description: 'Organisez vos produits avec des catégories, filtres et recherche instantanée.',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Statistiques avancées',
    description: 'Suivez vos ventes, visites et performances avec des tableaux de bord en temps réel.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: Sparkles,
    title: '8 Thèmes premium',
    description: 'Choisissez parmi 8 thèmes élégants pour une boutique qui reflète votre marque.',
    gradient: 'from-primary to-amber-600',
  },
]

function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Fonctionnalités
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Tout pour{' '}
            <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              développer vos ventes
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Des outils puissants conçus spécialement pour les vendeurs africains
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full hover:shadow-xl hover:shadow-black/5 transition-all duration-500 border-border/40 hover:border-primary/30 group overflow-hidden">
                <CardContent className="pt-6 pb-6 relative">
                  {/* Gradient line top */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
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
    <section id="etapes" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-muted/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Guide rapide
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Comment ça{' '}
            <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              marche ?
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour lancer votre boutique en ligne
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-10 md:gap-8"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeInUp} className="relative text-center group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%]">
                  <div className="border-t-2 border-dashed border-primary/20 w-full" />
                  <ArrowRight className="absolute -right-3 -top-2.5 w-5 h-5 text-primary/30" />
                </div>
              )}

              <div className="relative inline-flex mb-8">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-amber-100/30 flex items-center justify-center group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-amber-200/40 transition-all duration-500">
                  <step.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/25">
                  {step.number}
                </div>
              </div>

              <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
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
      '8 thèmes premium',
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
    <section id="tarifs" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Tarifs
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Des prix{' '}
            <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              simples et justes
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pas de frais cachés. Changez de plan à tout moment. Commencez gratuitement.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card
                className={`relative h-full flex flex-col overflow-hidden ${
                  plan.popular
                    ? 'border-primary shadow-2xl shadow-primary/15 scale-[1.03]'
                    : 'border-border/50 hover:border-primary/20 hover:shadow-lg'
                } transition-all duration-500`}
              >
                {/* Popular gradient top */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                )}

                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-4 py-1 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-amber-600 text-white border-0">
                      Le plus populaire
                    </Badge>
                  </div>
                )}

                <CardContent className="pt-8 pb-8 flex-1 flex flex-col">
                  <div className="mb-8">
                    <h3 className="font-semibold text-xl">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-semibold h-12 ${
                      plan.popular
                        ? 'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => setView('register')}
                  >
                    {plan.price === '0' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                    {plan.price !== '0' && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── TESTIMONIALS ──────────────────────────── */
const testimonials = [
  {
    name: 'Aminata Diallo',
    location: 'Dakar, Sénégal',
    text: "WhatsShop a transformé mes ventes Instagram. Je reçois maintenant 3x plus de commandes et mes clientes adorent l'expérience d'achat.",
    initials: 'AD',
    rating: 5,
  },
  {
    name: 'Fatou Sow',
    location: 'Abidjan, Côte d\'Ivoire',
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
    <section id="temoignages" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-muted/30 to-background" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Témoignages
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Ce qu'en disent{' '}
            <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              nos marchands
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full hover:shadow-xl hover:shadow-black/5 transition-all duration-500 border-border/40">
                <CardContent className="pt-6 pb-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── CTA ──────────────────────────── */
function CTASection() {
  const { setView } = useAppStore()

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-amber-600 to-orange-500 px-6 py-16 sm:px-16 sm:py-24 text-center"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                  backgroundSize: '30px 30px',
                }}
              />
            </div>

            <div className="relative z-10">
              <motion.div variants={fadeInUp}>
                <Badge className="mb-6 px-4 py-1.5 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/25">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Gratuit pour toujours
                </Badge>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
              >
                Prêt à développer
                <br />
                votre business ?
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-5 text-lg text-white/80 max-w-xl mx-auto">
                Rejoignez +2 000 marchands qui font confiance à WhatsShop.
                Créez votre boutique en 30 secondes.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 h-auto font-semibold bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20"
                  onClick={() => setView('register')}
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 h-auto font-semibold bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => setView('login')}
                >
                  Se connecter
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── FOOTER ──────────────────────────── */
function Footer() {
  const { setView } = useAppStore()

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo />
            <p className="text-sm text-muted-foreground mt-4 max-w-sm leading-relaxed">
              La plateforme e-commerce N°1 pour les vendeurs africains.
              Créez votre boutique, vendez sur WhatsApp, développez votre business.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.82a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.23z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#fonctionnalites" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
              <li><a href="#tarifs" className="hover:text-foreground transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Thèmes</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Mises à jour</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Conditions</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 WhatsShop. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground">
            Fait avec <span className="text-primary">♥</span> en Afrique
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────────────── LANDING PAGE ──────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
