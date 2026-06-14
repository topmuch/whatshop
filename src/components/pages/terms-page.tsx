'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Shield,
  UserCheck,
  CreditCard,
  Scale,
  AlertTriangle,
  Gavel,
  Mail,
  ChevronUp,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
const PRIMARY = '#EC4899'
const AMBER = '#F59E0B'

/* ──────────────────────────── ANIMATIONS ──────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

/* ──────────────────────────── TABLE OF CONTENTS DATA ──────────────────────────── */
interface TOCItem {
  id: string
  number: string
  title: string
  icon: React.ElementType
  color: string
}

const tocItems: TOCItem[] = [
  { id: 'acceptation', number: '1', title: 'Acceptation des conditions', icon: FileText, color: PRIMARY },
  { id: 'service', number: '2', title: 'Description du service', icon: FileText, color: AMBER },
  { id: 'comptes', number: '3', title: 'Inscription et comptes', icon: UserCheck, color: PRIMARY },
  { id: 'utilisation', number: '4', title: 'Utilisation de la plateforme', icon: Shield, color: AMBER },
  { id: 'contenu', number: '5', title: 'Contenu utilisateur', icon: FileText, color: PRIMARY },
  { id: 'abonnements', number: '6', title: 'Abonnements et paiements', icon: CreditCard, color: AMBER },
  { id: 'propriete', number: '7', title: 'Propriété intellectuelle', icon: Scale, color: PRIMARY },
  { id: 'responsabilite', number: '8', title: 'Limitation de responsabilité', icon: AlertTriangle, color: AMBER },
  { id: 'resiliation', number: '9', title: 'Résiliation', icon: AlertTriangle, color: PRIMARY },
  { id: 'modifications', number: '10', title: 'Modifications', icon: FileText, color: AMBER },
  { id: 'loi', number: '11', title: 'Loi applicable', icon: Gavel, color: PRIMARY },
  { id: 'contact', number: '12', title: 'Contact', icon: Mail, color: AMBER },
]

/* ──────────────────────────── HERO BANNER ──────────────────────────── */
function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ backgroundColor: DARK_BG }}
    >
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
        <div className="absolute top-10 right-[20%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-[10%] w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={fadeInUp}>
            <Badge
              className="mb-6 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Documents légaux
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-[48px] font-bold tracking-tight leading-[1.1] text-white"
          >
            Conditions Générales{' '}
            <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
              d&apos;Utilisation
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Dernière mise à jour : Janvier 2025
          </motion.p>

          {/* Decorative dots */}
          <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-2">
            {[PRIMARY, AMBER, PRIMARY].map((color, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color, opacity: 0.6 - i * 0.15 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────── TABLE OF CONTENTS SIDEBAR ──────────────────────────── */
function TableOfContents({
  activeSection,
  onNavigate,
}: {
  activeSection: string
  onNavigate: (id: string) => void
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          Sommaire
        </h2>
        <p className="text-xs text-gray-500 mt-1">Navigation rapide</p>
      </div>

      <nav className="flex flex-row flex-wrap lg:flex-col gap-1.5" aria-label="Table des matières">
        {tocItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 w-full text-left ${
                isActive
                  ? 'bg-white text-gray-900 shadow-md border-2'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
              }`}
              style={
                isActive
                  ? {
                      borderColor: item.color,
                      boxShadow: `0 4px 14px ${item.color}15`,
                    }
                  : undefined
              }
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 text-[10px] font-bold ${
                  isActive ? 'shadow-sm' : 'bg-gray-200/60'
                }`}
                style={
                  isActive
                    ? { backgroundColor: `${item.color}15`, color: item.color }
                    : undefined
                }
              >
                {item.number}
              </div>
              <span className="truncate">{item.title}</span>
              <Icon
                className="w-3.5 h-3.5 ml-auto shrink-0 transition-colors duration-300"
                style={{ color: isActive ? item.color : undefined }}
              />
            </button>
          )
        })}
      </nav>

      {/* Quick contact card */}
      <Card className="mt-5 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Questions légales ?</p>
              <p className="text-[11px] text-gray-500">Contactez-nous</p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full rounded-full text-xs font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90"
            onClick={() => onNavigate('contact')}
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Voir nos coordonnées
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}

/* ──────────────────────────── SCROLL TO TOP ──────────────────────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-[#EC4899] to-[#F59E0B] text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:shadow-2xl hover:shadow-primary/40 transition-shadow duration-300"
      aria-label="Retour en haut"
    >
      <ChevronUp className="w-5 h-5" />
    </motion.button>
  )
}

/* ──────────────────────────── TERMS CONTENT ──────────────────────────── */
function TermsContent() {
  const [activeSection, setActiveSection] = useState('acceptation')

  /* ── Intersection Observer for active section tracking ── */
  useEffect(() => {
    const sectionElements = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    sectionElements.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 100
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full">
      <HeroBanner />

      <section className="relative overflow-hidden py-12 md:py-16 lg:py-20 bg-white">
        {/* Subtle accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.02] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
            {/* ── Sidebar ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="hidden lg:block"
            >
              <TableOfContents activeSection={activeSection} onNavigate={handleNavigate} />
            </motion.div>

            {/* ── Main content ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mx-auto w-full"
              style={{ maxWidth: '1000px' }}
            >
              {/* Mobile TOC */}
              <motion.div variants={fadeIn} className="lg:hidden mb-8">
                <Card className="rounded-2xl border-gray-200 overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Sommaire
                    </p>
                    <nav className="flex flex-wrap gap-2" aria-label="Table des matières mobile">
                      {tocItems.map((item) => {
                        const isActive = activeSection === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                              isActive
                                ? 'bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white shadow-md shadow-primary/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {item.number}. {item.title}
                          </button>
                        )
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── Preamble ── */}
              <motion.div variants={fadeIn}>
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-8">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F59E0B] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Informations importantes
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Veuillez lire attentivement les présentes Conditions Générales d&apos;Utilisation
                          (&laquo; CGU &raquo;) avant d&apos;utiliser la plateforme Boutiko. En vous
                          inscrivant ou en utilisant notre service, vous acceptez d&apos;être lié par ces
                          conditions. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser
                          la plateforme.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 1 : Acceptation des conditions
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="acceptation">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <span className="text-sm font-bold" style={{ color: PRIMARY }}>1</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Acceptation des conditions</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${PRIMARY}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        En accédant à la plateforme Boutiko, en créant un compte ou en utilisant
                        nos services, vous reconnaissez avoir lu, compris et accepté d&apos;être lié par
                        les présentes Conditions Générales d&apos;Utilisation, y compris toute
                        modification future.
                      </p>
                      <p>
                        Si vous n&apos;acceptez pas l&apos;intégralité de ces conditions, vous devez
                        cesser immédiatement toute utilisation de la plateforme Boutiko et de ses
                        services.
                      </p>
                      <p>
                        L&apos;utilisation continue de la plateforme après la publication de modifications
                        des CGU constitue votre acceptation de ces modifications.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 2 : Description du service
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="service">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${AMBER}15` }}
                      >
                        <span className="text-sm font-bold" style={{ color: AMBER }}>2</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Description du service</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${AMBER}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Boutiko est une plateforme SaaS (Software as a Service) de création de
                        boutiques en ligne, spécialement conçue pour les vendeurs et commerçants
                        en Afrique. Notre service vous permet de créer une vitrine e-commerce
                        professionnelle et de recevoir des commandes de clients via WhatsApp, Instagram
                        et d&apos;autres canaux numériques.
                      </p>
                      <p>
                        La plateforme comprend, sans s&apos;y limiter, les fonctionnalités suivantes :
                        création de boutique en ligne avec catalogue de produits, intégration WhatsApp
                        pour la réception de commandes, personnalisation de thèmes et designs,
                        tableaux de bord de statistiques, et outils de gestion des produits et des
                        catégories.
                      </p>
                      <p>
                        Boutiko se réserve le droit de modifier, suspendre ou interrompre tout
                        ou partie du service, temporairement ou de manière permanente, avec ou sans
                        préavis, pour des raisons de maintenance, de mise à jour ou pour toute
                        autre raison jugée nécessaire.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 3 : Inscription et comptes
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="comptes">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <UserCheck className="w-5 h-5" style={{ color: PRIMARY }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Inscription et comptes</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${PRIMARY}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Pour utiliser les services de Boutiko, vous devez créer un compte en
                        fournissant des informations exactes, complètes et à jour, notamment votre
                        nom, votre adresse e-mail et votre numéro de téléphone WhatsApp.
                      </p>
                      <p>
                        Vous êtes responsable de la confidentialité de vos identifiants de connexion
                        et de toutes les activités réalisées sous votre compte. Vous vous engagez
                        à ne pas partager votre mot de passe avec des tiers et à notifier
                        immédiatement Boutiko de toute utilisation non autorisée de votre compte.
                      </p>
                      <p>
                        Vous devez avoir au moins 18 ans pour créer un compte et utiliser les
                        services de Boutiko. En créant un compte, vous déclarez et garantissez
                        que les informations fournies sont véridiques et que vous avez l&apos;autorisation
                        nécessaire pour utiliser le service.
                      </p>
                      <p>
                        Boutiko se réserve le droit de suspendre ou de résilier tout compte qui
                        enfreint les présentes conditions, qui a fourni des informations fausses ou
                        trompeuses, ou qui est utilisé à des fins illégales ou non autorisées.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 4 : Utilisation de la plateforme
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="utilisation">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${AMBER}15` }}
                      >
                        <Shield className="w-5 h-5" style={{ color: AMBER }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Utilisation de la plateforme</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${AMBER}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Vous vous engagez à utiliser la plateforme Boutiko conformément à toutes
                        les lois et réglementations applicables et de manière responsable. Vous
                        acceptez de ne pas utiliser la plateforme à des fins illégales ou non
                        autorisées.
                      </p>
                      <p className="font-semibold text-gray-800">Activités interdites :</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Vendre des produits illégaux, contrefaits ou dangereux</li>
                        <li>Proposer des services frauduleux ou trompeurs</li>
                        <li>Utiliser la plateforme pour du spam, du harcèlement ou des abus</li>
                        <li>Tenter de pirater, compromettre ou interférer avec les systèmes de Boutiko</li>
                        <li>Créer plusieurs comptes pour abuser des offres gratuites</li>
                        <li>Reproduire, copier ou redistribuer le code ou le design de la plateforme</li>
                        <li>Utiliser des robots, scripts ou outils automatisés pour scraper le contenu</li>
                      </ul>
                      <p>
                        Boutiko se réserve le droit de supprimer tout contenu et de suspendre
                        tout compte qui enfreint ces règles, sans préavis ni indemnité.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 5 : Contenu utilisateur
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="contenu">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <span className="text-sm font-bold" style={{ color: PRIMARY }}>5</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Contenu utilisateur</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${PRIMARY}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        En tant qu&apos;utilisateur de Boutiko, vous êtes l&apos;unique responsable du
                        contenu que vous publiez sur la plateforme, y compris mais sans s&apos;y limiter :
                        les descriptions de produits, les images, les prix, les informations de votre
                        boutique et tout autre contenu que vous téléchargez.
                      </p>
                      <p>
                        Vous garantissez que tout contenu publié sur votre boutique respecte les
                        droits de propriété intellectuelle de tiers, ne contient pas de matériel
                        diffamatoire, obscène, illégal ou otherwise inapproprié, et est conforme
                        aux lois applicables dans votre juridiction.
                      </p>
                      <p>
                        Vous accordez à Boutiko une licence mondiale, non exclusive, gratuite
                        et transférable pour utiliser, reproduire, modifier, adapter, publier,
                        traduire et distribuer votre contenu dans le cadre du fonctionnement
                        de la plateforme et de la promotion de nos services.
                      </p>
                      <p>
                        Boutiko se réserve le droit de retirer tout contenu jugé inapproprié
                        ou en violation des présentes conditions, à tout moment et sans préavis.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 6 : Abonnements et paiements
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="abonnements">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${AMBER}15` }}
                      >
                        <CreditCard className="w-5 h-5" style={{ color: AMBER }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Abonnements et paiements</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${AMBER}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Boutiko propose différents plans d&apos;abonnement, incluant un plan gratuit
                        et des plans payants (Standard et Premium). Les détails des fonctionnalités,
                        des prix et des conditions de chaque plan sont disponibles sur notre page
                        de tarifs et peuvent être modifiés à tout moment.
                      </p>
                      <p>
                        Les abonnements payants sont facturés mensuellement et sont prélevés
                        automatiquement à la date d&apos;échéance. Les paiements peuvent être effectués
                        par Mobile Money (Orange Money, MTN Mobile Money, Wave, M-Pesa, etc.) ou
                        par carte bancaire.
                      </p>
                      <p>
                        Vous pouvez résilier votre abonnement payant à tout moment. La résiliation
                        prendra effet à la fin de la période de facturation en cours. Aucun
                        remboursement ne sera effectué pour la période en cours après la
                        résiliation.
                      </p>
                      <p>
                        Boutiko se réserve le droit de modifier les prix de ses abonnements avec
                        un préavis de 30 jours. En cas de refus du nouveau tarif, vous pouvez
                        résilier votre abonnement avant la date d&apos;entrée en vigueur du
                        changement.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 7 : Propriété intellectuelle
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="propriete">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <Scale className="w-5 h-5" style={{ color: PRIMARY }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Propriété intellectuelle</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${PRIMARY}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        La plateforme Boutiko, y compris mais sans s&apos;y limiter le design,
                        le code source, les logos, les marques commerciales, les thèmes, les
                        templates et toute autre propriété intellectuelle, est la propriété
                        exclusive de Boutiko et est protégée par les lois applicables en
                        matière de propriété intellectuelle.
                      </p>
                      <p>
                        Vous ne pouvez pas copier, modifier, distribuer, vendre ou exploiter
                        de quelque manière que ce soit tout élément de la plateforme Boutiko
                        sans notre autorisation écrite préalable et expresse.
                      </p>
                      <p>
                        Vous conservez tous les droits de propriété intellectuelle sur le contenu
                        que vous publiez sur votre boutique (images, descriptions, logo de votre
                        marque, etc.). La licence accordée à Boutiko (voir section 5) est
                        limitée au fonctionnement de la plateforme.
                      </p>
                      <p>
                        Les noms &laquo; Boutiko &raquo; et les logos associés sont
                        des marques commerciales déposées de Boutiko. Leur utilisation sans
                        autorisation est strictement interdite.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 8 : Limitation de responsabilité
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="responsabilite">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${AMBER}15` }}
                      >
                        <AlertTriangle className="w-5 h-5" style={{ color: AMBER }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Limitation de responsabilité</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${AMBER}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        La plateforme Boutiko est fournie &laquo; en l&apos;état &raquo; (&laquo; as is &raquo;) et
                        &laquo; selon sa disponibilité &raquo;. Boutiko ne garantit pas que la plateforme
                        sera disponible en permanence, sans interruption, sans erreur ou sécurisée
                        à 100 %.
                      </p>
                      <p>
                        Dans la mesure maximale permise par la loi applicable, Boutiko décline
                        toute responsabilité pour les dommages directs, indirects, accessoires,
                        spéciaux ou consécutifs découlant de l&apos;utilisation ou de l&apos;incapacité
                        d&apos;utiliser la plateforme.
                      </p>
                      <p>
                        Boutiko n&apos;est pas responsable des transactions entre vendeurs et acheteurs,
                        de la qualité des produits vendus sur la plateforme, ni du contenu publié
                        par les utilisateurs. Les vendeurs sont seuls responsables de leurs
                        activités commerciales.
                      </p>
                      <p>
                        Boutiko ne saurait être tenu responsable en cas de force majeure,
                        interruption de service, panne de réseau, problèmes techniques ou toute
                        autre circonstance indépendante de sa volonté.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 9 : Résiliation
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="resiliation">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <AlertTriangle className="w-5 h-5" style={{ color: PRIMARY }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Résiliation</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${PRIMARY}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Vous pouvez résilier votre compte Boutiko à tout moment en contactant
                        notre support client ou depuis les paramètres de votre compte. La
                        résiliation entraînera la suppression de votre boutique et de toutes les
                        données associées dans un délai de 30 jours.
                      </p>
                      <p>
                        Boutiko se réserve le droit de suspendre ou de résilier votre compte
                        à tout moment, sans préavis, en cas de violation des présentes CGU,
                        d&apos;activité frauduleuse, d&apos;utilisation abusive de la plateforme ou
                        pour toute autre raison justifiée.
                      </p>
                      <p>
                        En cas de résiliation, vous conservez la responsabilité du contenu
                        publié et des transactions effectuées pendant la durée de votre
                        abonnement. Les frais payés ne sont pas remboursables, sauf disposition
                        contraire expressément prévue.
                      </p>
                      <p>
                        Les dispositions relatives à la propriété intellectuelle, la limitation
                        de responsabilité et la loi applicable continueront de s&apos;appliquer après
                        la résiliation de votre compte.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 10 : Modifications
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="modifications">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${AMBER}15` }}
                      >
                        <span className="text-sm font-bold" style={{ color: AMBER }}>10</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Modifications</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${AMBER}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Boutiko se réserve le droit de modifier les présentes Conditions
                        Générales d&apos;Utilisation à tout moment. Toute modification sera publiée
                        sur cette page avec la date de mise à jour.
                      </p>
                      <p>
                        En cas de modification substantielle des CGU, Boutiko s&apos;efforcera
                        d&apos;en informer les utilisateurs par e-mail ou par notification sur la
                        plateforme au moins 15 jours avant l&apos;entrée en vigueur des changements.
                      </p>
                      <p>
                        Votre utilisation continue de la plateforme après la publication des
                        modifications constitue votre acceptation des nouvelles conditions.
                        Si vous n&apos;acceptez pas les modifications, vous devez cesser d&apos;utiliser
                        la plateforme et résilier votre compte.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 11 : Loi applicable
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="loi">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <Gavel className="w-5 h-5" style={{ color: PRIMARY }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Loi applicable</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${PRIMARY}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Les présentes Conditions Générales d&apos;Utilisation sont régies et
                        interprétées conformément aux lois de la République du Sénégal, sans
                        égard à ses principes de conflits de lois.
                      </p>
                      <p>
                        Tout litige découlant de ou en relation avec les présentes CGU sera
                        soumis à la compétence exclusive des tribunaux de Dakar, République du
                        Sénégal. Les parties s&apos;engagent à rechercher d&apos;abord une solution amiable
                        avant toute action en justice.
                      </p>
                      <p>
                        Si une disposition des présentes CGU est jugée invalide ou inapplicable
                        par un tribunal compétent, les autres dispositions demeureront pleinement
                        en vigueur et applicables.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ══════════════════════════════════════════════════
                  SECTION 12 : Contact
                  ══════════════════════════════════════════════════ */}
              <motion.div variants={fadeIn} id="contact">
                <Card className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${AMBER}15` }}
                      >
                        <Mail className="w-5 h-5" style={{ color: AMBER }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Contact</h2>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[100px]"
                        style={{ background: `linear-gradient(90deg, ${AMBER}40, transparent)` }}
                      />
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>
                        Pour toute question relative aux présentes Conditions Générales
                        d&apos;Utilisation, ou pour toute demande d&apos;ordre juridique, veuillez
                        nous contacter via l&apos;un des moyens suivants :
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            E-mail
                          </p>
                          <p className="text-sm text-gray-600">legal@boutiko.pro</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            Support client
                          </p>
                          <p className="text-sm text-gray-600">support@boutiko.pro</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            WhatsApp
                          </p>
                          <p className="text-sm text-gray-600">+221 77 000 00 00</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            Adresse
                          </p>
                          <p className="text-sm text-gray-600">Dakar, Sénégal</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 italic">
                        Nous nous efforçons de répondre à toutes les demandes dans un délai
                        de 48 heures ouvrées.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── Last updated footer ── */}
              <motion.div variants={fadeIn}>
                <Card className="rounded-2xl border border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-6 text-center">
                    <Separator className="mb-5" />
                    <p className="text-sm text-gray-500">
                      Document mis à jour en <span className="font-semibold text-gray-700">Janvier 2025</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Boutiko — La plateforme e-commerce pour les vendeurs africains
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <ScrollToTop />
    </div>
  )
}

/* ──────────────────────────── EXPORT ──────────────────────────── */
export function TermsPage() {
  return <TermsContent />
}
