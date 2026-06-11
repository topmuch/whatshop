'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  MessageCircle,
  HelpCircle,
  Search,
  ArrowRight,
  ChevronDown,
  Globe2,
  Sparkles,
  Palette,
  Tag,
  CreditCard,
  Zap,
  BarChart3,
  BrainCircuit,
  Headphones,
  Clock,
  Settings,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
const PRIMARY = '#EC4899'
const AMBER = '#F59E0B'
const WARM_PEACH = '#FFF5F0'

/* ──────────────────────────── ANIMATIONS ──────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ──────────────────────────── FAQ DATA ──────────────────────────── */
interface FAQItem {
  question: string
  answer: string
}

interface CategoryData {
  id: string
  label: string
  icon: React.ElementType
  color: string
  faqs: FAQItem[]
}

const categories: CategoryData[] = [
  {
    id: 'general',
    label: 'Général',
    icon: Globe2,
    color: '#EC4899',
    faqs: [
      {
        question: "Qu'est-ce que Boutiko ?",
        answer:
          "Boutiko est une plateforme SaaS qui permet aux vendeurs africains de créer une boutique en ligne en quelques minutes et de recevoir des commandes directement via WhatsApp. Pas besoin de compétences techniques, tout se fait depuis votre téléphone.",
      },
      {
        question: 'Dans quels pays Boutiko est-il disponible ?',
        answer:
          "Boutiko est disponible dans plus de 15 pays africains, dont le Sénégal, la Côte d'Ivoire, le Mali, le Cameroun, le Burkina Faso, le Niger, la Guinée, le Togo, le Bénin, le Ghana, le Congo, la RDC, le Tchad, le Gabon et la République centrafricaine. Nous continuons à nous étendre.",
      },
      {
        question: 'Ai-je besoin de compétences techniques ?',
        answer:
          "Absolument pas ! Boutiko est conçu pour être utilisé par tout le monde. Pas besoin de savoir coder ou d'avoir des connaissances en informatique. L'interface est intuitive et tout se fait en quelques clics depuis votre téléphone ou votre ordinateur.",
      },
      {
        question: 'Combien de temps faut-il pour créer une boutique ?',
        answer:
          "Avec Boutiko, vous pouvez créer votre boutique en ligne en moins de 3 minutes. Il vous suffit de vous inscrire, de choisir un thème, d'ajouter vos produits et votre boutique est prête à recevoir des commandes.",
      },
    ],
  },
  {
    id: 'creation',
    label: 'Création de boutique',
    icon: Palette,
    color: '#F59E0B',
    faqs: [
      {
        question: 'Comment créer ma boutique ?',
        answer:
          'Créer votre boutique est simple : 1) Inscrivez-vous gratuitement avec votre email et numéro WhatsApp. 2) Choisissez un nom pour votre boutique et sélectionnez un thème parmi nos 12 designs premium. 3) Ajoutez vos produits avec photos et prix. 4) Partagez le lien de votre boutique et commencez à vendre !',
      },
      {
        question: 'Puis-je personnaliser le design de ma boutique ?',
        answer:
          "Oui ! Boutiko propose 12 thèmes premium que vous pouvez personnaliser. Vous pouvez modifier les couleurs, ajouter votre logo, personnaliser la bannière et adapter le design pour qu'il reflète l'identité de votre marque. Le plan Standard et Premium offrent encore plus d'options de personnalisation.",
      },
      {
        question: 'Comment ajouter mes produits ?',
        answer:
          "Ajouter des produits est très simple. Depuis votre tableau de bord, cliquez sur « Ajouter un produit », téléchargez une photo, entrez le nom, le prix, la description et la catégorie. Vous pouvez également utiliser notre fonctionnalité IA pour générer automatiquement des descriptions professionnelles pour vos produits.",
      },
      {
        question: 'Puis-je modifier ma boutique après la création ?',
        answer:
          "Bien sûr ! Vous pouvez modifier votre boutique à tout moment. Changez les produits, les prix, les images, le thème, les couleurs et même le nom de votre boutique. Toutes les modifications sont instantanées et se reflètent immédiatement pour vos visiteurs.",
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Tarifs & Abonnement',
    icon: CreditCard,
    color: '#25D366',
    faqs: [
      {
        question: 'Le plan gratuit est-il vraiment gratuit ?',
        answer:
          "Oui, le plan gratuit est 100% gratuit, sans carte bancaire requise et sans engagement. Vous pouvez créer votre boutique, ajouter jusqu'à 10 produits et recevoir des commandes via WhatsApp. C'est idéal pour tester la plateforme et commencer votre activité en ligne sans aucun risque.",
      },
      {
        question: 'Comment fonctionne le paiement ?',
        answer:
          "Le paiement s'effectue par Mobile Money (Orange Money, MTN Mobile Money, Wave, M-Pesa, etc.) et par carte bancaire. Les paiements sont mensuels et vous pouvez annuler à tout moment. Nous utilisons un système de paiement sécurisé pour protéger vos données.",
      },
      {
        question: 'Puis-je changer de plan à tout moment ?',
        answer:
          "Absolument ! Vous pouvez passer d'un plan à un autre à tout moment. Si vous passez à un plan supérieur, la différence sera calculée au prorata. Si vous passez à un plan inférieur, le changement prendra effet à la fin de votre période en cours. Vous pouvez aussi annuler votre abonnement à tout moment.",
      },
      {
        question: 'Y a-t-il des frais cachés ?',
        answer:
          "Non, il n'y a aucun frais caché avec Boutiko. Le prix affiché est le prix que vous payez. Pas de frais de configuration, pas de frais de transaction, pas de frais supplémentaires. Vous pouvez commencer gratuitement et choisir un plan payant uniquement quand vous êtes prêt.",
      },
    ],
  },
  {
    id: 'features',
    label: 'Fonctionnalités',
    icon: Zap,
    color: '#EC4899',
    faqs: [
      {
        question: 'Comment fonctionnent les commandes WhatsApp ?',
        answer:
          "Quand un client veut acheter un produit sur votre boutique, il clique sur le bouton « Commander sur WhatsApp ». Une conversation WhatsApp s'ouvre automatiquement avec votre numéro, pré-remplie avec les détails de la commande (produit, quantité, prix). Vous recevez la commande directement et pouvez finaliser la vente par WhatsApp.",
      },
      {
        question: 'Puis-je utiliser ma propre nom de domaine ?',
        answer:
          "Oui, avec le plan Premium, vous pouvez connecter votre propre nom de domaine (par exemple www.maboutique.com). Votre boutique sera accessible via ce domaine personnalisé, ce qui renforce la crédibilité et la professionnalisme de votre marque. Nous vous accompagnons dans la configuration.",
      },
      {
        question: 'Comment fonctionnent les statistiques ?',
        answer:
          "Boutiko vous offre un tableau de bord de statistiques complet. Vous pouvez suivre le nombre de visites, de commandes, de vues par produit, les revenus générés, et les performances de vos produits les plus vendus. Les statistiques sont en temps réel et accessibles depuis votre téléphone ou votre ordinateur.",
      },
      {
        question: "Qu'est-ce que l'IA pour descriptions ?",
        answer:
          "Notre fonctionnalité IA générative vous permet de créer automatiquement des descriptions de produits professionnelles et attrayantes. Il vous suffit de donner quelques mots-clés ou de décrire brièvement votre produit, et l'IA génère une description complète, optimisée pour convertir les visiteurs en acheteurs.",
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: Headphones,
    color: '#F59E0B',
    faqs: [
      {
        question: 'Comment contacter le support ?',
        answer:
          "Vous pouvez contacter notre support par plusieurs moyens : via le chat en direct sur notre site, par email à support@boutiko.pro, ou directement par WhatsApp. Notre équipe est disponible pour vous aider avec toutes vos questions.",
      },
      {
        question: 'Quel est le délai de réponse ?',
        answer:
          "Notre équipe support répond généralement dans les 2 heures pour les plans Standard et Premium. Pour le plan gratuit, le délai de réponse est de 24 heures maximum. Les urgences sont traitées en priorité. Nous nous efforçons de vous fournir des réponses rapides et utiles.",
      },
      {
        question: 'Puis-je avoir de l\'aide pour configurer ma boutique ?',
        answer:
          "Absolument ! Avec les plans Standard et Premium, vous bénéficiez d'un accompagnement personnalisé pour la configuration de votre boutique. Notre équipe peut vous aider à choisir le bon thème, optimiser vos produits et configurer vos préférences. Pour le plan Premium, vous avez même droit à une formation offerte.",
      },
    ],
  },
]

/* ──────────────────────────── COMPONENT ──────────────────────────── */
export function FAQPage() {
  const { setView } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filteredFAQs =
    activeCategory === 'all'
      ? categories
      : categories.filter((cat) => cat.id === activeCategory)

  return (
    <div className="w-full">
      {/* ───── HERO BANNER ───── */}
      <section
        className="relative overflow-hidden py-20 md:py-28 lg:py-32"
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
          <div className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
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
              <Badge className="mb-6 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Centre d&apos;aide
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-[52px] lg:text-[56px] font-bold tracking-tight leading-[1.08] text-white"
            >
              Questions{' '}
              <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
                Fréquentes
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              Trouvez rapidement les réponses à vos questions
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ CONTENT ───── */}
      <section className="relative overflow-hidden py-16 md:py-20 lg:py-24 bg-white">
        {/* Subtle accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.02] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {/* ── Left Column: Category tabs ── */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  Catégories
                </h2>
              </div>

              <nav className="flex flex-row flex-wrap lg:flex-col gap-2" aria-label="FAQ categories">
                {/* "All" tab */}
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left ${
                    activeCategory === 'all'
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white shadow-lg shadow-primary/20'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Toutes les questions</span>
                  <Badge
                    variant="secondary"
                    className={`ml-auto text-[10px] px-1.5 py-0 ${
                      activeCategory === 'all'
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {categories.reduce((acc, c) => acc + c.faqs.length, 0)}
                  </Badge>
                </button>

                {/* Category tabs */}
                {categories.map((category) => {
                  const Icon = category.icon
                  const isActive = activeCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left group ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-md border-2'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: category.color,
                              boxShadow: `0 4px 14px ${category.color}15`,
                            }
                          : undefined
                      }
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive ? 'shadow-md' : 'bg-gray-200/60'
                        }`}
                        style={
                          isActive
                            ? { backgroundColor: `${category.color}15` }
                            : undefined
                        }
                      >
                        <Icon
                          className="w-4 h-4 transition-colors duration-300"
                          style={{ color: isActive ? category.color : undefined }}
                        />
                      </div>
                      <span className="truncate">{category.label}</span>
                      <Badge
                        variant="secondary"
                        className={`ml-auto text-[10px] px-1.5 py-0 shrink-0 ${
                          isActive
                            ? 'text-gray-500'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {category.faqs.length}
                      </Badge>
                    </button>
                  )
                })}
              </nav>

              {/* Quick stats card */}
              <Card className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Besoin d&apos;aide rapide ?</p>
                      <p className="text-xs text-gray-500">On est là pour vous</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full rounded-full font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90"
                    onClick={() =>
                      window.open('https://wa.me/221770000000', '_blank')
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Écrire sur WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>

            {/* ── Right Column: FAQ items ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              key={activeCategory}
              className="space-y-8"
            >
              {filteredFAQs.map((category) => {
                const Icon = category.icon
                return (
                  <motion.div key={category.id} variants={fadeInUp}>
                    {/* Category header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {category.label}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {category.faqs.length} question
                          {category.faqs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div
                        className="hidden sm:block ml-auto h-[2px] flex-1 max-w-[120px]"
                        style={{
                          background: `linear-gradient(90deg, ${category.color}40, transparent)`,
                        }}
                      />
                    </div>

                    {/* FAQ accordion */}
                    <Card className="rounded-2xl border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                          {category.faqs.map((faq, index) => (
                            <AccordionItem
                              key={index}
                              value={`${category.id}-${index}`}
                              className="border-b last:border-b-0 border-gray-100"
                            >
                              <AccordionTrigger className="px-6 py-5 text-left text-[15px] font-semibold text-gray-900 hover:text-gray-900 hover:no-underline transition-colors duration-200 [&[data-state=open]]:text-gray-900">
                                <span className="flex items-center gap-3">
                                  <span
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                                    style={{
                                      backgroundColor: `${category.color}10`,
                                      color: category.color,
                                    }}
                                  >
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                  {faq.question}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-5 text-[14px] leading-relaxed text-gray-600">
                                <div className="pl-10">
                                  {faq.answer}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── STILL HAVE QUESTIONS CTA ───── */}
      <section
        className="relative overflow-hidden py-16 md:py-20 lg:py-24"
        style={{ backgroundColor: WARM_PEACH }}
      >
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900"
            >
              Vous n&apos;avez pas trouvé{' '}
              <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
                votre réponse
              </span>
              {' '}?
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-gray-600"
            >
              Contactez notre équipe et nous vous répondrons dans les plus brefs délais.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="text-base px-8 py-6 h-auto font-bold rounded-full shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 transition-all duration-300"
                onClick={() => setView('contact')}
              >
                Contactez-nous
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 h-auto font-semibold rounded-full border-gray-300 hover:bg-white hover:border-gray-400 transition-all duration-300"
                onClick={() =>
                  window.open('https://wa.me/221770000000', '_blank')
                }
              >
                <MessageCircle className="w-5 h-5 mr-2 text-[#25D366]" />
                Écrire sur WhatsApp
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
