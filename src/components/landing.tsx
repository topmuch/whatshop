'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  MousePointerClick,
  ArrowRight,
  Menu,
  UserPlus,
  Package,
  Link2,
  Star,
  Check,
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
        <ShoppingBag className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold tracking-tight">
        Whats<span className="text-primary">Shop</span>
      </span>
    </div>
  )
}

/* ──────────────────────────── HEADER ──────────────────────────── */
function Header() {
  const { setView } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#fonctionnalites"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="#tarifs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </a>
          <a
            href="#apropos"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            À propos
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('login')}>
            Connexion
          </Button>
          <Button size="sm" onClick={() => setView('register')}>
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
              <a
                href="#fonctionnalites"
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Fonctionnalités
              </a>
              <a
                href="#tarifs"
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Tarifs
              </a>
              <a
                href="#apropos"
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                À propos
              </a>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setMobileOpen(false)
                  setView('login')
                }}
              >
                Connexion
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setMobileOpen(false)
                  setView('register')
                }}
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
  const { setView } = useAppStore()

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                Nouveau : Commandes WhatsApp
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            >
              Votre boutique en ligne{' '}
              <span className="text-primary">en 3 minutes</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              Créez une boutique professionnelle pour vos produits Facebook,
              Instagram et TikTok. Vos clients commandent directement sur
              WhatsApp.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" className="text-base px-8 py-6" onClick={() => setView('register')}>
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6" onClick={() => setShopSlug('amina-shop')}>
                Voir une démo
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <span>Utilisé par +2 000 marchands</span>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] sm:w-[300px] rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl shadow-primary/20">
                <div className="rounded-[2rem] bg-white overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-2 bg-primary text-primary-foreground text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2 rounded-sm bg-primary-foreground/60" />
                      <div className="w-3 h-2 rounded-sm bg-primary-foreground/60" />
                      <div className="w-5 h-2.5 rounded-sm bg-primary-foreground/60" />
                    </div>
                  </div>

                  {/* Shop header */}
                  <div className="bg-primary px-4 py-4 text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        AM
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Amina Mode</p>
                        <p className="text-xs text-primary-foreground/80">
                          Vêtements & Accessoires
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product grid */}
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Robe Wax', price: '15 000' },
                        { name: 'Boubou Grand', price: '12 000' },
                        { name: 'Tunique Kente', price: '8 500' },
                        { name: 'Pagne Wax', price: '5 000' },
                      ].map((product, i) => (
                        <div key={i} className="rounded-lg border overflow-hidden">
                          <div className="aspect-square bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <p className="text-xs font-semibold text-primary">
                              {product.price} FCFA
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp bar */}
                  <div className="mx-3 mb-3 rounded-lg bg-[#25D366] px-4 py-2.5 flex items-center justify-center gap-2 text-white text-sm font-medium">
                    <MessageCircle className="w-4 h-4" />
                    Commander sur WhatsApp
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Nouvelle commande</p>
                  <p className="text-[10px] text-muted-foreground">via WhatsApp</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">+45% ventes</p>
                  <p className="text-[10px] text-muted-foreground">ce mois-ci</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────── FEATURES ──────────────────────────── */
const features = [
  {
    icon: Zap,
    title: 'Création rapide',
    description: 'Boutique en ligne en moins de 3 minutes. Pas besoin de compétences techniques.',
  },
  {
    icon: MessageCircle,
    title: 'Commande WhatsApp',
    description: 'Vos clients commandent directement sur WhatsApp. Simple et naturel.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first',
    description: 'Optimisé pour les téléphones. Vos clients achètent depuis leur mobile.',
  },
  {
    icon: LayoutGrid,
    title: 'Catégories & Produits',
    description: 'Organisez votre catalogue avec des catégories et des produits illimités.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques',
    description: 'Suivez vos ventes et comprenez vos clients avec des tableaux de bord clairs.',
  },
  {
    icon: MousePointerClick,
    title: 'Sans compétence technique',
    description: 'Aucune connaissance requise. Si vous savez utiliser WhatsApp, vous savez utiliser WhatsShop.',
  },
]

function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Tout ce dont vous avez{' '}
            <span className="text-primary">besoin</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Les outils essentiels pour vendre vos produits en ligne en Afrique
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
              <Card className="h-full hover:shadow-md transition-shadow duration-300 border-border/50 hover:border-primary/20 group">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
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
    description: 'Inscrivez-vous gratuitement en 30 secondes. Pas de carte bancaire requise.',
  },
  {
    number: '02',
    icon: Package,
    title: 'Ajoutez vos produits',
    description: 'Photos, prix, descriptions — c\'est tout ! Votre catalogue est en ligne.',
  },
  {
    number: '03',
    icon: Link2,
    title: 'Partagez votre lien',
    description: 'Collez le lien dans votre bio et recevez des commandes WhatsApp automatiquement.',
  },
]

function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Comment ça <span className="text-primary">marche</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour lancer votre boutique en ligne
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeInUp} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-primary/20" />
              )}
              <div className="relative inline-flex mb-6">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {step.number}
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
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
    description: 'Parfait pour débuter',
    popular: false,
    features: [
      '10 produits max',
      'Boutique publique',
      'Commande WhatsApp',
      'Design responsive',
    ],
  },
  {
    name: 'Standard',
    price: '5 000',
    period: ' FCFA/mois',
    description: 'Le plus populaire',
    popular: true,
    features: [
      '100 produits',
      'Statistiques avancées',
      'Priorité support',
      'Thèmes personnalisables',
      'Domaine personnalisé',
    ],
  },
  {
    name: 'Premium',
    price: '10 000',
    period: ' FCFA/mois',
    description: 'Pour les professionnels',
    popular: false,
    features: [
      'Produits illimités',
      'Domaine personnalisé',
      'Support dédié',
      'Tableau de bord avancé',
      'API & intégrations',
      'Marque blanche',
    ],
  },
]

function PricingSection() {
  const { setView } = useAppStore()

  return (
    <section id="tarifs" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Tarifs simples et{' '}
            <span className="text-primary">transparents</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pas de frais cachés. Changez de plan à tout moment.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card
                className={`relative h-full flex flex-col ${
                  plan.popular
                    ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                    : 'border-border/50 hover:border-primary/20'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-1">Populaire</Badge>
                  </div>
                )}
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => setView('register')}
                  >
                    Choisir ce plan
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

/* ──────────────────────────── TESTIMONIAL ──────────────────────────── */
function TestimonialSection() {
  return (
    <section id="apropos" className="py-20 md:py-28 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed">
              &ldquo;WhatsShop a transformé mes ventes Instagram. Je reçois
              maintenant 3x plus de commandes ! C&apos;est l&apos;outil que
              chaque vendeur africain devrait avoir.&rdquo;
            </blockquote>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              A
            </div>
            <div className="text-left">
              <p className="font-semibold">Aminata D.</p>
              <p className="text-sm text-muted-foreground">
                Vendeuse de vêtements à Dakar
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── CTA ──────────────────────────── */
function CTASection() {
  const { setView } = useAppStore()

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 sm:px-16 sm:py-20 text-center"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                Prêt à créer votre boutique ?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Créez votre compte en 30 secondes et commencez à vendre dès
                aujourd&apos;hui.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 py-6"
                  onClick={() => setView('register')}
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── FOOTER ──────────────────────────── */
function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              La solution e-commerce pour les marchands africains
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#apropos" className="hover:text-foreground transition-colors">
              À propos
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Conditions
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          © 2025 WhatsShop. Tous droits réservés.
        </p>
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
