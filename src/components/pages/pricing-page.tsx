'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { PLATFORM_CONFIG } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Check,
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Shield,
  Zap,
  Crown,
  Package,
  Palette,
  BarChart3,
  Headphones,
  Globe2,
  Bot,
  Tag,
  Code2,
  MessageCircle,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
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

/* ──────────────────────────── SECTION & CONTAINER HELPERS ──────────────────────────── */
function Section({
  id,
  children,
  className = '',
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-20 md:py-28 lg:py-32 ${className}`}
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

/* ──────────────────────────── PLANS DATA ──────────────────────────── */
const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: '/mois',
    description: 'Parfait pour commencer',
    popular: false,
    icon: Zap,
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
    icon: ShoppingBag,
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
    icon: Crown,
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

/* ──────────────────────────── COMPARISON TABLE DATA ──────────────────────────── */
const comparisonFeatures = [
  {
    name: 'Nombre de produits',
    icon: Package,
    values: ['10', '100', 'Illimité'],
  },
  {
    name: 'Thèmes',
    icon: Palette,
    values: ['3', '12', '12 + Personnalisés'],
  },
  {
    name: 'Statistiques',
    icon: BarChart3,
    values: ['Basiques', 'Avancées', 'Complètes'],
  },
  {
    name: 'Support',
    icon: Headphones,
    values: ['Email', 'Prioritaire', 'Dédié 24/7'],
  },
  {
    name: 'Domaine personnalisé',
    icon: Globe2,
    values: [false, false, true],
  },
  {
    name: 'IA descriptions',
    icon: Bot,
    values: [false, true, true],
  },
  {
    name: 'Marque blanche',
    icon: Tag,
    values: [false, false, true],
  },
  {
    name: 'API intégrations',
    icon: Code2,
    values: [false, false, true],
  },
]

/* ──────────────────────────── FAQ DATA ──────────────────────────── */
const faqItems = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      'Oui, absolument ! Vous pouvez passer à un plan supérieur à tout moment et la différence sera calculée au prorata. Si vous souhaitez passer à un plan inférieur, le changement prendra effet à la fin de votre période de facturation en cours.',
  },
  {
    question: 'Y a-t-il des frais cachés ?',
    answer:
      'Non, aucun frais cachés. Le prix affiché est le prix que vous payez. Pas de frais de configuration, pas de frais de transaction supplémentaires. Vous ne payez que votre abonnement mensuel.',
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer:
      'Nous acceptons les paiements via Mobile Money (Orange Money, MTN Mobile Money, Wave), cartes bancaires et virements. Le paiement est débité automatiquement chaque mois. Vous pouvez gérer votre abonnement depuis votre tableau de bord.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer:
      'Oui, vous pouvez annuler votre abonnement à tout moment sans pénalité. Votre boutique restera active jusqu\'à la fin de votre période de facturation. Après l\'expiration, votre boutique passera automatiquement au plan Gratuit.',
  },
  {
    question: 'Que se passe-t-il si je dépasse la limite de mon plan ?',
    answer:
      'Si vous atteignez la limite de produits de votre plan, vous serez notifié et invité à passer à un plan supérieur. Vos produits existants resteront visibles, mais vous ne pourrez pas en ajouter de nouveaux tant que vous n\'avez pas mis à niveau.',
  },
]

/* ──────────────────────────── HERO BANNER ──────────────────────────── */
function HeroBanner() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36" style={{ backgroundColor: DARK_BG }}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1426] via-[#111c38] to-[#1a1f3a]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-10 left-[15%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-[15%] w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[150px]" />
      </div>

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-8 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2">
              <span className="text-base">💎</span>
              Offre spéciale
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-[52px] lg:text-[56px] font-bold tracking-tight leading-[1.08] text-white"
          >
            Nos{' '}
            <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
              Tarifs
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Des prix simples et transparents. Commencez gratuitement.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── PRICING CARDS ──────────────────────────── */
function PricingCards() {
  const { setView } = useAppStore()

  return (
    <Section id="plans" className="bg-white">
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
              Nos plans
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            Choisissez le plan qui vous{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              correspond
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Pas de frais cachés. Changez de plan à tout moment.
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

                <CardContent className="pt-8 pb-8 flex-1 flex flex-col px-7 bg-white text-gray-900">
                  <div className="mb-7">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: plan.popular ? 'rgba(236,72,153,0.1)' : 'rgba(107,114,128,0.08)',
                        }}
                      >
                        <plan.icon
                          className="w-5 h-5"
                          style={{ color: plan.popular ? PRIMARY : '#6b7280' }}
                        />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 font-medium text-base">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-gray-600">{feature}</span>
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
                        const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par l'abonnement ${plan.name} à ${plan.price} FCFA/mois sur Boutiko. Merci de me renseigner.`)
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

/* ──────────────────────────── COMPARISON TABLE ──────────────────────────── */
function ComparisonTable() {
  return (
    <Section id="comparaison" className="bg-white">
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
              Comparaison
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            Comparaison des{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              plans
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Découvrez ce qui est inclus dans chaque plan
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative z-10"
        >
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#EC4899]/5 via-[#F59E0B]/5 to-[#EC4899]/5">
                    <th className="text-left py-5 px-6 text-sm font-semibold text-gray-900 w-[35%]">
                      Fonctionnalité
                    </th>
                    <th className="text-center py-5 px-4 text-sm font-semibold text-gray-900 w-[21.6%]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base">Gratuit</span>
                        <span className="text-xs text-gray-400 font-normal">0 FCFA/mois</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-4 text-sm font-semibold w-[21.6%]" style={{ color: PRIMARY }}>
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-primary to-amber-500 text-white border-0 mb-0.5">
                          Populaire
                        </Badge>
                        <span className="text-base">Standard</span>
                        <span className="text-xs text-gray-400 font-normal">5 000 FCFA/mois</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-4 text-sm font-semibold text-gray-900 w-[21.6%]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base">Premium</span>
                        <span className="text-xs text-gray-400 font-normal">15 000 FCFA/mois</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr
                      key={i}
                      className={`border-t border-gray-100 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      } hover:bg-primary/[0.02] transition-colors`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <feature.icon className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                        </div>
                      </td>
                      {feature.values.map((value, j) => (
                        <td key={j} className="py-4 px-4 text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <div className="flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-primary" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                  <X className="w-4 h-4 text-gray-300" />
                                </div>
                              </div>
                            )
                          ) : (
                            <span className={`text-sm font-medium ${j === 1 ? 'text-primary' : 'text-gray-600'}`}>
                              {value}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile accordion-style comparison */}
          <div className="md:hidden space-y-4">
            {comparisonFeatures.map((feature, i) => (
              <Card key={i} className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-3 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{feature.name}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="py-3 px-3 text-center">
                    {typeof feature.values[0] === 'boolean' ? (
                      feature.values[0] ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <X className="w-3.5 h-3.5 text-gray-300" />
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-xs font-medium text-gray-600">{feature.values[0] as string}</span>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">Gratuit</p>
                  </div>
                  <div className="py-3 px-3 text-center bg-primary/[0.02]">
                    {typeof feature.values[1] === 'boolean' ? (
                      feature.values[1] ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <X className="w-3.5 h-3.5 text-gray-300" />
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-xs font-semibold text-primary">{feature.values[1] as string}</span>
                    )}
                    <p className="text-[10px] text-primary/50 mt-1">Standard</p>
                  </div>
                  <div className="py-3 px-3 text-center">
                    {typeof feature.values[2] === 'boolean' ? (
                      feature.values[2] ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <X className="w-3.5 h-3.5 text-gray-300" />
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-xs font-medium text-gray-600">{feature.values[2] as string}</span>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">Premium</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}

/* ──────────────────────────── FAQ SECTION ──────────────────────────── */
function FAQSection() {
  return (
    <Section id="faq" style={{ backgroundColor: WARM_PEACH }}>
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
              FAQ
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            Questions{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              fréquentes
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur nos tarifs et abonnements
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-3xl mx-auto"
        >
          <Card className="rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-primary/[0.06] last:border-b-0"
                  >
                    <AccordionTrigger className="px-6 py-5 text-left text-[15px] font-semibold text-gray-800 hover:text-primary hover:no-underline transition-colors">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Section>
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
          className="text-center"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold bg-white/10 text-white/80 border-white/15 hover:bg-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Rejoignez-nous
            </Badge>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            Prêt à{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
              commencer
            </span>
            <span className="text-white"> ?</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Créez votre boutique en ligne gratuitement et commencez à vendre dès aujourd&apos;hui.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-base px-8 py-6 h-auto font-bold rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300"
              onClick={() => setView('register')}
            >
              Créer ma boutique gratuitement
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Pas de carte requise</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Configuration en 2 min</span>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── PRICING PAGE ──────────────────────────── */
export function PricingPage() {
  return (
    <main>
      <HeroBanner />
      <PricingCards />
      <ComparisonTable />
      <FAQSection />
      <CTASection />
    </main>
  )
}
