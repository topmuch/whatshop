'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Lock,
  Eye,
  Database,
  FileText,
  Clock,
  Mail,
  ArrowRight,
  Cookie,
  Trash2,
  RefreshCw,
  Users,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
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

/* ──────────────────────────── TABLE OF CONTENTS DATA ──────────────────────────── */
const tocItems = [
  { id: 'introduction', label: 'Introduction', icon: Shield },
  { id: 'informations', label: 'Informations que nous collectons', icon: Database },
  { id: 'utilisation', label: 'Comment nous utilisons vos données', icon: Eye },
  { id: 'partage', label: 'Partage des données', icon: Users },
  { id: 'securite', label: 'Sécurité des données', icon: Lock },
  { id: 'droits', label: 'Vos droits', icon: FileText },
  { id: 'cookies', label: 'Cookies', icon: Cookie },
  { id: 'conservation', label: 'Conservation des données', icon: Clock },
  { id: 'modifications', label: 'Modifications', icon: RefreshCw },
  { id: 'contact', label: 'Contact', icon: Mail },
]

/* ──────────────────────────── CONTAINER ──────────────────────────── */
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1000px] px-5 sm:px-8 md:px-12 ${className}`}>
      {children}
    </div>
  )
}

/* ──────────────────────────── HERO BANNER ──────────────────────────── */
function HeroBanner() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20 lg:py-24" style={{ backgroundColor: DARK_BG }}>
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

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Vos données, notre priorité
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-white"
          >
            Politique de{' '}
            <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
              Confidentialité
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
      </Container>
    </section>
  )
}

/* ──────────────────────────── SIDEBAR (TABLE OF CONTENTS) ──────────────────────────── */
function TableOfContents() {
  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="hidden lg:block" aria-label="Table des matières">
      <div className="sticky top-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Table des matières
        </p>
        <ul className="space-y-1">
          {tocItems.map((item, i) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-primary/5 hover:bg-gray-50 transition-all duration-200 group"
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: i < 5 ? `${PRIMARY}12` : `${AMBER}12`,
                    color: i < 5 ? PRIMARY : AMBER,
                  }}
                >
                  {i + 1}
                </span>
                <span className="truncate group-hover:translate-x-0.5 transition-transform duration-200">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <Separator className="my-6" />

        {/* Quick contact card in sidebar */}
        <Card className="rounded-xl border-primary/10 bg-gradient-to-br from-primary/5 to-amber-500/5 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-gray-900">Une question ?</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Contactez notre équipe pour toute question relative à vos données personnelles.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/10"
              onClick={() => {
                const el = document.getElementById('contact')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Nous contacter
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </nav>
  )
}

/* ──────────────────────────── LEGAL SECTION CARD ──────────────────────────── */
function LegalSection({
  id,
  number,
  icon: Icon,
  title,
  children,
  accentColor,
}: {
  id: string
  number: string
  icon: React.ElementType
  title: string
  children: React.ReactNode
  accentColor: string
}) {
  return (
    <motion.div
      id={id}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="scroll-mt-6"
    >
      <Card className="rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group overflow-hidden">
        {/* Top accent line */}
        <div
          className="h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />

        <CardContent className="p-6 sm:p-8">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500"
              style={{ backgroundColor: `${accentColor}12` }}
            >
              <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                Article {number}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="text-gray-600 text-sm sm:text-[15px] leading-relaxed space-y-4 pl-0 sm:pl-[60px]">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ──────────────────────────── MOBILE TOC (horizontal scroll) ──────────────────────────── */
function MobileToc() {
  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="lg:hidden mb-8">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Sommaire
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {tocItems.map((item, i) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all duration-200"
          >
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: i < 5 ? PRIMARY : AMBER }}
            >
              {i + 1}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────── CONTENT SECTION ──────────────────────────── */
function ContentSection() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-white">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.02] rounded-full blur-[100px]" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
          {/* Sidebar - Table of Contents */}
          <TableOfContents />

          {/* Main content */}
          <div>
            <MobileToc />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* 1. Introduction */}
              <LegalSection
                id="introduction"
                number="1"
                icon={Shield}
                title="Introduction"
                accentColor={PRIMARY}
              >
                <p>
                  Chez <strong className="text-gray-900">Boutiko</strong>, nous prenons la protection de vos
                  données personnelles très au sérieux. La présente Politique de Confidentialité décrit comment
                  nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez
                  notre plateforme.
                </p>
                <p>
                  En vous inscrivant sur Boutiko ou en utilisant nos services, vous acceptez les pratiques
                  décrites dans cette politique. Nous vous encourageons à la lire attentivement afin de
                  comprendre comment nous traitons vos données.
                </p>
                <p>
                  Boutiko est une plateforme e-commerce conçue pour les vendeurs et entrepreneurs africains.
                  Notre mission est de vous fournir les meilleurs outils pour développer votre activité en
                  ligne, tout en respectant votre vie privée.
                </p>
              </LegalSection>

              {/* 2. Informations que nous collectons */}
              <LegalSection
                id="informations"
                number="2"
                icon={Database}
                title="Informations que nous collectons"
                accentColor={AMBER}
              >
                <p>
                  Nous collectons les informations suivantes dans le but de vous fournir nos services :
                </p>

                <div className="space-y-3 mt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">A</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Informations d'identification</p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Nom complet, prénom, adresse email, numéro de téléphone et mot de passe sécurisé.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">B</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Données commerciales</p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Nom de votre boutique, description, logo, produits, catégories, prix et images associées
                        à votre activité.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">C</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Données de transaction</p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Historique des commandes, factures, informations de paiement et communications liées aux
                        transactions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">D</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Données techniques</p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Adresse IP, type de navigateur, système d'exploitation, pages visitées et données de
                        navigation anonymisées.
                      </p>
                    </div>
                  </div>
                </div>
              </LegalSection>

              {/* 3. Comment nous utilisons vos données */}
              <LegalSection
                id="utilisation"
                number="3"
                icon={Eye}
                title="Comment nous utilisons vos données"
                accentColor={PRIMARY}
              >
                <p>
                  Vos données personnelles sont utilisées pour les finalités suivantes :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Fourniture de services :</strong> Création et gestion
                      de votre boutique en ligne, traitement des commandes et des paiements.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Amélioration de la plateforme :</strong> Analyse des
                      données d'utilisation pour améliorer nos fonctionnalités, l'ergonomie et les performances.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Communication :</strong> Envoi de notifications
                      concernant votre boutique, actualités, offres spéciales et mises à jour de nos services.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Sécurité :</strong> Détection et prévention des fraudes,
                      activités non autorisées et violations de nos conditions d'utilisation.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Conformité légale :</strong> Réponse aux obligations
                      légales, réglementaires et aux demandes des autorités compétentes.
                    </div>
                  </li>
                </ul>
              </LegalSection>

              {/* 4. Partage des données */}
              <LegalSection
                id="partage"
                number="4"
                icon={Users}
                title="Partage des données"
                accentColor={AMBER}
              >
                <p>
                  Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos
                  informations uniquement dans les cas suivants :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Prestataires de services :</strong> Des partenaires
                      de confiance qui nous assistent dans l'hébergement, le paiement, l'analyse et
                      l'amélioration de nos services. Ces partenaires sont soumis à des accords de
                      confidentialité stricts.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Intégrations :</strong> Des services tiers tels que
                      WhatsApp, Instagram ou TikTok, lorsque vous choisissez de connecter votre boutique à ces
                      plateformes.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Obligations légales :</strong> Lorsque la loi, un
                      règlement ou une décision de justice l'exige, ou pour protéger les droits et la sécurité
                      de Boutiko et de ses utilisateurs.
                    </div>
                  </li>
                </ul>
                <p className="mt-2">
                  Nous mettons en œuvre des mesures techniques et contractuelles pour garantir que vos données
                  sont protégées lors de tout partage avec des tiers.
                </p>
              </LegalSection>

              {/* 5. Sécurité des données */}
              <LegalSection
                id="securite"
                number="5"
                icon={Lock}
                title="Sécurité des données"
                accentColor={PRIMARY}
              >
                <p>
                  La sécurité de vos données est une priorité absolue pour Boutiko. Nous mettons en œuvre
                  les mesures techniques et organisationnelles suivantes :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Chiffrement :</strong> Toutes les données sensibles
                      sont chiffrées en transit (TLS/SSL) et au repos (AES-256) pour empêcher tout accès
                      non autorisé.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Stockage sécurisé :</strong> Nos serveurs sont hébergés
                      dans des centres de données certifiés avec des contrôles d'accès stricts et une
                      surveillance 24/7.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Authentification :</strong> Mots de passe hashés et
                      salés, authentification à deux facteurs disponible, et sessions sécurisées avec
                      expiration automatique.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Audits réguliers :</strong> Nous effectuons des tests de
                      sécurité et des audits périodiques pour identifier et corriger toute vulnérabilité
                      potentielle.
                    </div>
                  </li>
                </ul>
              </LegalSection>

              {/* 6. Vos droits */}
              <LegalSection
                id="droits"
                number="6"
                icon={FileText}
                title="Vos droits (RGPD)"
                accentColor={AMBER}
              >
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois
                  applicables en matière de protection des données, vous disposez des droits suivants :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Droit d'accès :</strong> Vous pouvez demander une copie
                      de toutes les données personnelles que nous détenons à votre sujet.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Droit de rectification :</strong> Vous pouvez modifier
                      ou corriger vos données inexactes ou incomplètes à tout moment depuis votre tableau de
                      bord.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Droit à l'effacement :</strong> Vous pouvez demander la
                      suppression de vos données personnelles. Nous supprimerons vos informations dans les
                      délais légaux, sauf obligation légale de conservation.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Droit à la portabilité :</strong> Vous pouvez
                      demander à recevoir vos données dans un format structuré et courant, ou leur transfert
                      vers un autre service.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Droit d'opposition :</strong> Vous pouvez vous
                      opposer au traitement de vos données à des fins marketing ou vous opposer à certaines
                      décisions automatisées.
                    </div>
                  </li>
                </ul>
                <p className="mt-2">
                  Pour exercer ces droits, veuillez nous contacter à l'adresse indiquée dans la section{' '}
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="font-semibold hover:underline"
                    style={{ color: PRIMARY }}
                  >
                    Contact
                  </a>
                  . Nous répondrons à votre demande dans un délai de 30 jours.
                </p>
              </LegalSection>

              {/* 7. Cookies */}
              <LegalSection
                id="cookies"
                number="7"
                icon={Cookie}
                title="Cookies"
                accentColor={PRIMARY}
              >
                <p>
                  Boutiko utilise des cookies et technologies similaires pour améliorer votre expérience
                  sur notre plateforme. Voici les types de cookies que nous utilisons :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Cookies essentiels :</strong> Nécessaires au
                      fonctionnement de la plateforme (authentification, sessions, sécurité). Ils ne peuvent
                      pas être désactivés.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Cookies analytiques :</strong> Utilisés pour
                      comprendre comment les visiteurs utilisent notre plateforme et améliorer nos services.
                      Ces données sont anonymisées.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Cookies fonctionnels :</strong> Permettent de
                      mémoriser vos préférences (langue, thème) pour une expérience personnalisée.
                    </div>
                  </li>
                </ul>
                <p className="mt-2">
                  Vous pouvez gérer vos préférences en matière de cookies dans les paramètres de votre
                  navigateur. Veuillez noter que la désactivation de certains cookies peut affecter le
                  fonctionnement de la plateforme.
                </p>
              </LegalSection>

              {/* 8. Conservation des données */}
              <LegalSection
                id="conservation"
                number="8"
                icon={Clock}
                title="Conservation des données"
                accentColor={AMBER}
              >
                <p>
                  Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux
                  finalités décrites dans cette politique :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Compte actif :</strong> Vos données sont conservées
                      tant que votre compte est actif et que vous utilisez nos services.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Après résiliation :</strong> Nous conservons
                      certaines données pendant une durée de 12 mois après la fermeture de votre compte,
                      conformément à nos obligations légales et comptables.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Données anonymisées :</strong> Les données anonymisées
                      (statistiques agrégées) peuvent être conservées indéfiniment à des fins d'analyse.
                    </div>
                  </li>
                </ul>
                <p className="mt-2">
                  À l'expiration de ces délais, vos données sont supprimées de manière sécurisée ou anonymisées
                  de façon irréversible.
                </p>
              </LegalSection>

              {/* 9. Modifications */}
              <LegalSection
                id="modifications"
                number="9"
                icon={RefreshCw}
                title="Modifications de la politique"
                accentColor={PRIMARY}
              >
                <p>
                  Boutiko se réserve le droit de modifier la présente Politique de Confidentialité à tout
                  moment. Les modifications seront appliquées dès leur publication sur notre plateforme.
                </p>
                <p>
                  Nous vous informerons de toute modification significative par :
                </p>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Notification par email :</strong> Envoi d'un email à
                      l'adresse associée à votre compte.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Notification sur la plateforme :</strong> Affichage d'un
                      avis visible lors de votre prochaine connexion à Boutiko.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Mise à jour de la date :</strong> La date de « Dernière
                      mise à jour » en haut de cette page sera actualisée.
                    </div>
                  </li>
                </ul>
                <p className="mt-2">
                  Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos
                  pratiques en matière de protection des données.
                </p>
              </LegalSection>

              {/* 10. Contact */}
              <LegalSection
                id="contact"
                number="10"
                icon={Mail}
                title="Contact"
                accentColor={AMBER}
              >
                <p>
                  Pour toute question, demande ou réclamation concernant la présente Politique de
                  Confidentialité ou le traitement de vos données personnelles, vous pouvez nous contacter
                  par les moyens suivants :
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Email</p>
                      <p className="text-gray-500 text-sm">contact@boutiko.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">DPO (Délégué Protection)</p>
                      <p className="text-gray-500 text-sm">dpo@boutiko.com</p>
                    </div>
                  </div>
                </div>

                <p className="mt-4">
                  Notre équipe s'engage à répondre à toute demande dans un délai de <strong className="text-gray-900">30 jours</strong>{' '}
                  ouvrables, conformément aux exigences du RGPD.
                </p>
                <p>
                  <strong className="text-gray-900">Boutiko</strong> · Dakar, Sénégal
                </p>
              </LegalSection>

              {/* Bottom note */}
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="rounded-2xl bg-gradient-to-br from-[#EC4899]/5 to-[#F59E0B]/5 border border-primary/10 overflow-hidden">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <p className="font-semibold text-gray-900 text-sm">Votre confiance compte</p>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
                      Nous nous engageons à protéger vos données et à respecter votre vie privée. Si vous
                      avez des questions, n'hésitez pas à nous contacter.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── PRIVACY PAGE ──────────────────────────── */
export function PrivacyPage() {
  return (
    <main>
      <HeroBanner />
      <ContentSection />
    </main>
  )
}
