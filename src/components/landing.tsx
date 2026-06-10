'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useAppStore } from '@/lib/store'
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
  Star,
  MessageCircle,
  Store,
  BarChart3,
  Globe,
  CreditCard,
  Radio,
  PackagePlus,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react'

/* ── ANIMATION VARIANTS ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] },
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
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
        <ShoppingBag className="w-4 h-4 text-white" />
      </div>
      <span
        className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}
      >
        Bouti<span className="text-pink-500">ko</span>
      </span>
    </div>
  )
}

/* ── HEADER ── */
function Header() {
  const { setView } = useAppStore()
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100/80">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('login')}
            className="text-gray-600"
          >
            Se connecter
          </Button>
          <Button
            size="sm"
            onClick={() => setView('register')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 rounded-full px-5"
          >
            Commencer gratuitement
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="mb-6">
              <Logo />
            </SheetTitle>
            <nav className="flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-gray-600 py-2"
                >
                  {l.label}
                </a>
              ))}
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false)
                  setView('login')
                }}
              >
                Se connecter
              </Button>
              <Button
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                onClick={() => {
                  setOpen(false)
                  setView('register')
                }}
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

/* ── HERO ── */
function Hero() {
  const { setView } = useAppStore()
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
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
                className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-1.5 text-sm font-medium mb-6 inline-flex items-center gap-2"
              >
                🚀 La plateforme #1 en Afrique
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={0.1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]"
            >
              Vendez sur WhatsApp
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                comme un pro
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed"
            >
              Créez votre boutique en ligne en 2 minutes. Recevez des commandes
              directement sur WhatsApp et développez votre activité.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={() => setView('register')}
                className="text-base px-8 py-6 h-auto font-semibold rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xl shadow-pink-500/30"
              >
                Commencer gratuitement{' '}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 h-auto font-semibold rounded-full border-gray-300 hover:bg-gray-50"
                >
                  Voir la démo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-3xl blur-2xl" />
              <div className="relative rotate-2 rounded-2xl overflow-hidden shadow-2xl shadow-pink-900/10">
                <Image
                  src="/landing/hero-main.png"
                  alt="Femme entrepreneur africaine avec smartphone"
                  width={1344}
                  height={768}
                  className="w-full h-auto max-w-[600px] lg:max-w-none"
                  priority
                />
              </div>
            </div>
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
    icon: Store,
  },
  {
    num: 2,
    title: 'Ajoutez vos produits',
    desc: 'Importez vos produits avec photos, prix et descriptions. Organisez-les par catégories.',
    icon: PackagePlus,
  },
  {
    num: 3,
    title: 'Recevez des commandes sur WhatsApp',
    desc: 'Partagez votre lien et recevez automatiquement des commandes via WhatsApp.',
    icon: ShoppingCart,
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
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
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Comment ça marche ?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-4 text-gray-500 text-lg max-w-xl mx-auto"
          >
            Lancez votre boutique en ligne en 3 étapes simples
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200" />

          {steps.map((step, i) => {
            const IconComp = step.icon
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
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 flex items-center justify-center mb-6 relative z-10">
                    <IconComp className="w-8 h-8 text-pink-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 md:right-auto md:-top-1 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-bold flex items-center justify-center z-20">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
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
    <section className="py-20 md:py-28 bg-gray-50/80">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
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

          {/* Text */}
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
              className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight"
            >
              Vendez partout,{' '}
              <span className="text-pink-500">sur WhatsApp</span>, Instagram,
              TikTok...
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mt-5 text-gray-600 text-lg leading-relaxed"
            >
              Partagez vos produits en un clic sur tous vos canaux de vente.
              Vos clients commandent directement et vous recevez les commandes
              sur WhatsApp, automatiquement.
            </motion.p>
            <motion.ul
              variants={fadeUp}
              custom={0.2}
              className="mt-8 space-y-4"
            >
              {[
                'Partagez vos liens produit partout',
                'Commandes automatiques sur WhatsApp',
                'Compatible Instagram, TikTok, Facebook',
                'Catalogue en ligne professionnel',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
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
    icon: Store,
    title: 'Multi-Boutiques',
    desc: 'Gérez jusqu\'à 10 boutiques avec un seul compte',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: MessageCircle,
    title: 'Commandes WhatsApp',
    desc: 'Recevez et gérez vos commandes directement sur WhatsApp',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Radio,
    title: 'Mode Live',
    desc: 'Vendez en direct avec le mode TikTok Live',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: CreditCard,
    title: 'Mobile Money',
    desc: 'Acceptez Orange Money, MTN Mobile Money, Wave',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Statistiques',
    desc: 'Suivez vos ventes et performances en temps réel',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Globe,
    title: 'Domaine personnalisé',
    desc: 'Votre propre nom de domaine professionnel',
    color: 'bg-violet-100 text-violet-600',
  },
]

function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
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
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Tout ce qu&apos;il vous faut pour vendre en ligne
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-4 text-gray-500 text-lg max-w-xl mx-auto"
          >
            Des outils puissants conçus spécialement pour les vendeurs africains
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => {
            const IconComp = f.icon
            return (
              <motion.div key={i} variants={fadeUp} custom={i * 0.08}>
                <Card className="h-full rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-pink-100 transition-all duration-300 bg-white group">
                  <CardContent className="p-6 flex flex-col items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1.5 text-base">
                        {f.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ── DASHBOARD PREVIEW ── */
function DashboardPreview() {
  return (
    <section className="py-20 md:py-28 bg-gray-50/80">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Un tableau de bord{' '}
            <span className="text-pink-500">puissant</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
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

/* ── PRICING ── */
const plans = [
  {
    name: 'STARTER',
    price: '5 000',
    desc: 'Idéal pour démarrer',
    popular: false,
    features: [
      '1 boutique',
      '10 produits',
      'Commandes WhatsApp',
      'Design responsive',
    ],
  },
  {
    name: 'PRO',
    price: '8 000',
    desc: 'Pour les vendeurs ambitieux',
    popular: true,
    features: [
      '3 boutiques',
      '100 produits',
      'Statistiques avancées',
      '12 thèmes premium',
      'Support prioritaire',
      'Logo personnalisé',
    ],
  },
  {
    name: 'BUSINESS',
    price: '20 000',
    desc: 'Pour les professionnels',
    popular: false,
    features: [
      '10 boutiques',
      'Produits illimités',
      'Domaine personnalisé',
      'Support 24/7',
      'API & intégrations',
      'Marque blanche',
    ],
  },
]

function Pricing() {
  const { setView } = useAppStore()
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
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
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Des tarifs adaptés à vos ambitions
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-4 text-gray-500 text-lg max-w-xl mx-auto"
          >
            Choisissez le plan qui correspond à votre activité. Changez à tout
            moment.
          </motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
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
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg shadow-pink-500/25 text-xs font-bold px-4 py-1">
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
                <CardContent className="pt-8 pb-8 px-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {p.price}
                    </span>
                    <span className="text-gray-400 font-medium ml-1">
                      FCFA/mois
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-pink-500" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={p.popular ? 'default' : 'outline'}
                    onClick={() => setView('register')}
                    className={`w-full rounded-full h-11 font-semibold ${
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

/* ── SOCIAL PROOF / TESTIMONIAL ── */
const stats = [
  { value: 500, suffix: '+', label: 'vendeurs actifs' },
  { value: 4.9, suffix: '/5', label: 'étoiles' },
  { value: 10, suffix: '+', label: 'pays africains' },
]

function SocialProof() {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
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

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight"
            >
              Rejoignez une communauté de{' '}
              <span className="text-pink-500">vendeurs passionnés</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mt-5 text-gray-600 text-lg leading-relaxed"
            >
              Des centaines de marchands africains font confiance à Boutiko
              pour développer leur activité en ligne. Rejoignez-les !
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={0.2}
              className="mt-10 grid grid-cols-3 gap-6"
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {s.value % 1 === 0 ? (
                      <Counter value={s.value} />
                    ) : (
                      <>{s.value}</>
                    )}
                    <span className="text-pink-500">{s.suffix}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1.5 font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── FAQ SECTION ── */
const faqItems = [
  {
    q: "Qu'est-ce que Boutiko ?",
    a: "Boutiko est une plateforme e-commerce conçue spécialement pour les vendeurs africains. Elle vous permet de créer une boutique en ligne en quelques minutes et de recevoir des commandes directement sur WhatsApp. Pas besoin de compétences techniques.",
  },
  {
    q: 'Comment fonctionne la commande sur WhatsApp ?',
    a: "Vos clients parcourent votre boutique en ligne, ajoutent des produits au panier et passent commande. La commande est automatiquement envoyée sur votre WhatsApp avec tous les détails : produits, quantités, prix et informations de livraison.",
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
    <section id="faq" className="py-20 md:py-28 bg-gray-50/80">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Questions fréquentes
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-4 text-gray-500 text-lg"
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
                <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:text-pink-500 hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed text-base">
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

/* ── FINAL CTA ── */
function FinalCTA() {
  const { setView } = useAppStore()
  return (
    <section className="py-20 md:py-28 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 relative overflow-hidden">
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
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight"
        >
          Prêt à lancer votre boutique
          <br className="hidden sm:block" /> en ligne ?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={0.1}
          className="mt-5 text-lg text-white/80 max-w-xl mx-auto"
        >
          Rejoignez des centaines de vendeurs africains qui font confiance à
          Boutiko pour développer leur activité.
        </motion.p>
        <motion.div variants={fadeUp} custom={0.2} className="mt-10">
          <Button
            size="lg"
            onClick={() => setView('register')}
            className="text-base px-10 py-6 h-auto font-semibold rounded-full bg-white text-pink-600 hover:bg-white/90 shadow-2xl shadow-black/20"
          >
            Créer ma boutique gratuitement{' '}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── FOOTER ── */
function Footer() {
  const { setView } = useAppStore()
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
              La plateforme e-commerce #1 pour les vendeurs africains. Vendez
              sur WhatsApp comme un pro.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
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
                    onClick={() => setView(l.view)}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              Entreprise
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'À propos', view: 'about' as const },
                { label: 'Contact', view: 'contact' as const },
              ].map((l) => (
                <li key={l.view}>
                  <button
                    onClick={() => setView(l.view)}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Paiements */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              Paiements
            </h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>Orange Money</li>
              <li>MTN Mobile Money</li>
              <li>Wave</li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Boutiko. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <button
              onClick={() => setView('privacy')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Confidentialité
            </button>
            <button
              onClick={() => setView('terms')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
        <HowItWorks />
        <SocialSelling />
        <Features />
        <DashboardPreview />
        <Pricing />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}