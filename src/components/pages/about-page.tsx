'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  MessageCircle,
  Globe2,
  Users,
  Heart,
  Lightbulb,
  Target,
  Star,
  ArrowRight,
  Check,
  Sparkles,
  Rocket,
  Handshake,
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
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
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

/* ──────────────────────────── CONTAINER ──────────────────────────── */
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 ${className}`}>
      {children}
    </div>
  )
}

/* ──────────────────────────── HERO BANNER ──────────────────────────── */
function HeroBanner() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40" style={{ backgroundColor: DARK_BG }}>
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1426] via-[#111c38] to-[#1a1f3a]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-20 right-[20%] w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/4 rounded-full blur-[150px]" />
      </div>

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <Badge
              className="mb-8 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2"
            >
              <span className="text-base">💡</span>
              Découvrez notre histoire
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-[52px] lg:text-[56px] font-bold tracking-tight leading-[1.08] text-white"
          >
            À propos de{' '}
            <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
              Boutiko
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-7 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            La plateforme e-commerce pensée pour les vendeurs africains
          </motion.p>

          {/* Decorative dots */}
          <motion.div variants={fadeInUp} className="mt-12 flex items-center justify-center gap-2">
            {[PRIMARY, AMBER, PRIMARY].map((color, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color, opacity: 0.6 - i * 0.15 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── NOTRE MISSION ──────────────────────────── */
function MissionSection() {
  const stats = [
    { value: '2 000+', label: 'Marchands actifs', icon: ShoppingBag, color: PRIMARY },
    { value: '15+', label: 'Pays couverts', icon: Globe2, color: AMBER },
    { value: '50 000+', label: 'Commandes traitées', icon: MessageCircle, color: '#25D366' },
  ]

  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Subtle accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Text side */}
          <div>
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
                Notre Mission
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-gray-900"
            >
              Donner aux vendeurs africains les outils pour{' '}
              <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
                réussir en ligne
              </span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 leading-relaxed">
              Boutiko est né d'un constat simple : des millions de vendeurs talentueux en Afrique
              méritent les mêmes outils e-commerce que les grandes marques. Notre mission est de
              démocratiser le commerce en ligne en créant une plateforme simple, accessible et
              adaptée aux réalités du marché africain.
            </motion.p>

            <motion.p variants={fadeInUp} className="mt-5 text-lg text-gray-500 leading-relaxed">
              Nous croyons que chaque vendeur, qu'il soit à Dakar, Abidjan, Kinshasa ou Lagos,
              mérite une boutique en ligne professionnelle. Pas besoin de compétences techniques
              ni de gros investissements — juste la volonté de grandir.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>100% conçu pour l'Afrique</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>Pas de compétences techniques</span>
              </div>
            </motion.div>
          </div>

          {/* Stats side */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-5"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="overflow-hidden rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-500 group">
                  <CardContent className="p-6 flex items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundColor: `${stat.color}12` }}
                    >
                      <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Extra trust card */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F59E0B] border-0 shadow-lg shadow-primary/20">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">4.8/5</p>
                    <p className="text-sm text-white/80 mt-1 font-medium">
                      Satisfaction des marchands
                    </p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-white/90 text-white/90" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── NOTRE HISTOIRE (TIMELINE) ──────────────────────────── */
const milestones = [
  {
    year: '2021',
    title: 'Création de Boutiko',
    description:
      "L'idée naît à Dakar : créer une plateforme e-commerce simple et accessible pour les vendeurs africains qui utilisent WhatsApp comme principal canal de vente.",
  },
  {
    year: '2022',
    title: '1 000 marchands',
    description:
      "En un an, Boutiko dépasse la barre des 1 000 marchands actifs. La plateforme est disponible en français et en anglais, couvrant 5 pays d'Afrique de l'Ouest.",
  },
  {
    year: '2023',
    title: 'Expansion en 15 pays',
    description:
      "Boutiko s'étend à 15 pays africains. Lancement des thèmes premium, des statistiques avancées et de l'intégration avec Instagram et TikTok.",
  },
  {
    year: '2024',
    title: '50 000 commandes',
    description:
      "Cap des 50 000 commandes franchi ! Lancement de l'IA pour générer des descriptions produits et l'outil de marque blanche pour les agences.",
  },
]

function HistorySection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: WARM_PEACH }}>
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
              Notre Histoire
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            Notre{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              parcours
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            De Dakar à toute l'Afrique, découvrez les étapes qui ont fait de Boutiko la plateforme de référence
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Vertical line - desktop */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-primary/30 via-amber-400/30 to-primary/30" />
          {/* Vertical line - mobile */}
          <div className="md:hidden absolute top-0 bottom-0 left-6 w-[2px] bg-gradient-to-b from-primary/30 via-amber-400/30 to-primary/30" />

          {milestones.map((milestone, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`relative flex items-start gap-6 md:gap-0 mb-12 last:mb-0 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} pl-14 md:pl-0`}>
                <Card className="rounded-2xl border border-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 relative">
                    {/* Hover gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-transparent" />

                    <h3 className="font-bold text-lg text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Year badge - center on desktop, left on mobile */}
              <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#EC4899] to-[#F59E0B] flex items-center justify-center text-white text-sm md:text-base font-bold shadow-lg shadow-primary/30 ring-4 ring-white/50">
                  {milestone.year}
                </div>
              </div>

              {/* Spacer for the other side */}
              <div className="hidden md:block flex-1 md:w-1/2" />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── NOS VALEURS ──────────────────────────── */
const values = [
  {
    icon: Sparkles,
    title: 'Simplicité',
    description:
      "Nous rendons le commerce en ligne accessible à tous. Pas besoin de compétences techniques, pas de jargon compliqué. Juste des outils qui marchent.",
    color: PRIMARY,
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      "Nous innovons constamment pour offrir les meilleures fonctionnalités adaptées aux réalités du marché africain : paiement mobile, WhatsApp, réseaux sociaux.",
    color: AMBER,
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      "Boutiko, c'est avant tout une communauté de vendeurs passionnés. Nous apprenons de nos utilisateurs et construisons avec eux, pour eux.",
    color: '#25D366',
  },
  {
    icon: Heart,
    title: 'Accessibilité',
    description:
      "Notre plateforme est conçue pour fonctionner sur tous les téléphones, même les moins puissants. Parce que chaque vendeur mérite les meilleurs outils.",
    color: PRIMARY,
  },
]

function ValuesSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Subtle accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[100px]" />

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
              Nos Valeurs
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            Ce qui nous{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              anime
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Les valeurs fondamentales qui guident chacune de nos décisions
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((value, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-500 group overflow-hidden">
                <CardContent className="pt-7 pb-7 relative">
                  {/* Hover gradient line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, ${value.color}, transparent)` }}
                  />

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: `${value.color}12` }}
                  >
                    <value.icon className="w-6 h-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2.5 text-gray-900">{value.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── NOTRE ÉQUIPE ──────────────────────────── */
const team = [
  {
    initials: 'AD',
    name: 'Aminata Diallo',
    role: 'CEO & Fondatrice',
    description:
      "Entrepreneuse passionnée, Aminata a fondé Boutiko après avoir constaté les difficultés des vendeurs africains à se digitaliser.",
    gradient: 'from-[#EC4899] to-[#F59E0B]',
  },
  {
    initials: 'KM',
    name: 'Kwame Mensah',
    role: 'CTO',
    description:
      "Développeur full-stack avec 10 ans d'expérience, Kwame supervise toute la stack technique et les innovations produit.",
    gradient: 'from-[#F59E0B] to-[#EC4899]',
  },
  {
    initials: 'FN',
    name: 'Fatou Ndiaye',
    role: 'Head of Design',
    description:
      "Designer UX/UI award-winning, Fatou crée des interfaces élégantes et intuitives qui rendent le commerce en ligne accessible à tous.",
    gradient: 'from-[#EC4899] via-[#F59E0B] to-[#EC4899]',
  },
  {
    initials: 'OB',
    name: 'Omar Benjelloun',
    role: 'Head of Growth',
    description:
      "Spécialiste du marketing digital en Afrique, Omar développe les stratégies de croissance qui ont permis d'atteindre 15 pays.",
    gradient: 'from-[#F59E0B] via-[#EC4899] to-[#F59E0B]',
  },
]

function TeamSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: DARK_BG }}>
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute top-20 right-[10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold bg-white/10 text-white/80 border-white/15 hover:bg-white/15 backdrop-blur-sm">
              Notre Équipe
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            L'équipe derrière{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              Boutiko
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Des talents passionnés venus de toute l'Afrique, unis par une même mission
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {team.map((member, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full bg-[#121b36]/80 border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all duration-500 group rounded-2xl">
                <CardContent className="pt-7 pb-7 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 mb-5 group-hover:scale-110 transition-transform duration-500`}
                  >
                    {member.initials}
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-base text-white">{member.name}</h3>
                  <p className="text-xs text-primary font-semibold mt-1 mb-3">{member.role}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── CTA SECTION ──────────────────────────── */
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

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <Badge
              className="mb-8 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2"
            >
              <span className="text-base">🚀</span>
              Prêt à démarrer ?
            </Badge>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            Rejoignez l'aventure{' '}
            <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
              Boutiko
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Créez votre boutique en ligne gratuitement et rejoignez plus de 2 000 marchands qui font confiance à Boutiko pour développer leur business.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-base px-8 py-6 h-auto font-bold rounded-full bg-white text-gray-900 hover:bg-white/90 shadow-2xl shadow-black/30 transition-all duration-300"
              onClick={() => setView('register')}
            >
              CRÉER MA BOUTIQUE GRATUITEMENT
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              Gratuit pour commencer
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              Aucune carte requise
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              Prêt en 3 minutes
            </span>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── ABOUT PAGE ──────────────────────────── */
export function AboutPage() {
  return (
    <main>
      <HeroBanner />
      <MissionSection />
      <HistorySection />
      <ValuesSection />
      <TeamSection />
      <CTASection />
    </main>
  )
}
