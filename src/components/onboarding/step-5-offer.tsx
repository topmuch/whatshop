'use client'

import { motion } from 'framer-motion'
import { Check, X, Sparkles, Star, Crown, CircleCheck, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSectorConfig } from '@/lib/sector-config'
import { getTemplateDisplayInfo } from '@/lib/template-display'

/* ──────────────────────── TYPES ──────────────────────── */

interface Step5Props {
  shopName: string
  sector: string
  template: string
  selectedPlan: string | null
  isSubmitting?: boolean
  onPlanSelect: (plan: 'TRIAL' | 'PRO') => void
  onConfirm: () => void
}

/* ──────────────────────── HELPERS ──────────────────────── */

function generatePreviewSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

/* ──────────────────────── ANIMATION VARIANTS ──────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

/* ──────────────────────── PLAN DATA ──────────────────────── */

interface PlanFeature {
  text: string
  included: boolean
}

const TRIAL_FEATURES: PlanFeature[] = [
  { text: '7 jours d\'essai complète', included: true },
  { text: '1 boutique', included: true },
  { text: 'Template choisi', included: true },
  { text: 'Toutes les fonctionnalités', included: true },
  { text: 'Domaine personnalisé', included: false },
  { text: 'Logo Boutiko affiché', included: false },
  { text: 'Limité à 10 produits', included: false },
]

const PRO_FEATURES: PlanFeature[] = [
  { text: 'Tout de l\'essai gratuit', included: true },
  { text: 'Produits illimités', included: true },
  { text: 'Domaine personnalisé', included: true },
  { text: 'Sans logo Boutiko', included: true },
  { text: 'Live TikTok', included: true },
  { text: 'Kit Marketing (QR Code, Stories)', included: true },
  { text: 'Support prioritaire', included: true },
]

/* ──────────────────────── PLAN CARD COMPONENT ──────────────────────── */

interface PlanCardProps {
  planId: 'TRIAL' | 'PRO'
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}

function PlanCard({ planId, selected, onSelect, children }: PlanCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`
          relative cursor-pointer transition-all duration-200 overflow-hidden
          ${selected
            ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20'
            : 'border hover:border-primary/40 hover:shadow-md'
          }
        `}
        onClick={onSelect}
      >
        {/* Selected checkmark badge */}
        {selected && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
              <CircleCheck className="h-3.5 w-3.5" />
              Sélectionné
            </div>
          </div>
        )}

        <CardContent className="p-5 sm:p-6 space-y-5">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ──────────────────────── MAIN COMPONENT ──────────────────────── */

export default function Step5Offer({
  shopName,
  sector,
  template,
  selectedPlan,
  isSubmitting = false,
  onPlanSelect,
  onConfirm,
}: Step5Props) {
  const sectorConfig = getSectorConfig(sector)
  const previewSlug = generatePreviewSlug(shopName)
  const templateDisplayName = `Template ${getTemplateDisplayInfo(template).displayName}`
  const sectorDisplayName = sectorConfig ? `${sectorConfig.emoji} ${sectorConfig.name}` : sector

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Congratulations + Preview ── */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-2xl font-bold sm:text-3xl">
          🎉 Félicitations ! Votre site est prêt :
        </h2>

        <Card className="mx-auto max-w-sm border-dashed bg-muted/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-lg">{shopName}</span>
            </div>
            <p className="text-sm text-muted-foreground">{sectorDisplayName}</p>
            <p className="text-sm text-muted-foreground">Template : {templateDisplayName}</p>
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">boutiko.pro/</span>
              <span className="text-sm font-semibold text-primary">{previewSlug}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Instruction text ── */}
      <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
        Choisissez votre formule pour finaliser la création de votre boutique
      </motion.p>

      {/* ── Offer Cards ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* ── Trial Card ── */}
        <PlanCard
          planId="TRIAL"
          selected={selectedPlan === 'TRIAL'}
          onSelect={() => onPlanSelect('TRIAL')}
        >
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-green-500" />
              <span className="text-base font-bold tracking-tight">
                ESSAI GRATUIT
              </span>
            </div>
            <p className="text-2xl font-extrabold">0 FCFA</p>
            <p className="text-xs text-muted-foreground">7 jours d&apos;essai</p>
          </div>

          {/* Features */}
          <ul className="space-y-2.5">
            {TRIAL_FEATURES.map((feat) => (
              <li key={feat.text} className="flex items-start gap-2 text-sm">
                {feat.included ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                )}
                <span className={feat.included ? 'text-foreground' : 'text-muted-foreground/60'}>
                  {feat.text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            className="w-full"
            variant={selectedPlan === 'TRIAL' ? 'default' : 'outline'}
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              onPlanSelect('TRIAL')
            }}
          >
            {selectedPlan === 'TRIAL' ? '✓ Essai gratuit choisi' : 'Commencer l\'essai gratuit'}
          </Button>
        </PlanCard>

        {/* ── Pro Card ── */}
        <PlanCard
          planId="PRO"
          selected={selectedPlan === 'PRO'}
          onSelect={() => onPlanSelect('PRO')}
        >
          {/* Recommended Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="gap-1 bg-primary px-3 py-1 text-xs font-semibold shadow-sm">
              <Crown className="h-3.5 w-3.5" />
              Recommandé
            </Badge>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-base font-bold tracking-tight">
                PRO
                <span className="ml-1">⭐</span>
              </span>
            </div>
            <p className="text-2xl font-extrabold">5 000 FCFA <span className="text-sm font-normal text-muted-foreground">/ mois</span></p>
          </div>

          {/* Features */}
          <ul className="space-y-2.5">
            {PRO_FEATURES.map((feat) => (
              <li key={feat.text} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{feat.text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            className="w-full"
            variant={selectedPlan === 'PRO' ? 'default' : 'outline'}
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              onPlanSelect('PRO')
            }}
          >
            {selectedPlan === 'PRO' ? '✓ Plan Pro choisi' : 'Passer Pro maintenant →'}
          </Button>
        </PlanCard>
      </div>

      {/* ── Confirm Button ── */}
      <motion.div variants={itemVariants} className="flex justify-center pt-2">
        <Button
          size="lg"
          disabled={!selectedPlan || isSubmitting}
          onClick={onConfirm}
          className="min-w-[260px] gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {selectedPlan === 'PRO'
                ? "Demander le plan Pro et créer ma boutique"
                : "Créer ma boutique gratuitement"
              }
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}