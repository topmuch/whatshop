'use client'

import { motion } from 'framer-motion'
import type { BusinessType } from '@/lib/sector-config'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, ConciergeBell } from 'lucide-react'

interface Step1BusinessTypeProps {
  businessType: BusinessType | null
  onSelect: (type: BusinessType) => void
}

const OPTIONS: {
  type: BusinessType
  icon: typeof ShoppingCart
  emoji: string
  label: string
  title: string
  description: string
  examples: string[]
}[] = [
  {
    type: 'ECOMMERCE',
    icon: ShoppingCart,
    emoji: '🛒',
    label: 'Vendre des produits en ligne',
    title: 'Boutique E-commerce',
    description:
      'Créez votre boutique en ligne et vendez vos produits avec un catalogue professionnel, panier WhatsApp et gestion des commandes.',
    examples: ['Maquillage, vêtements, accessoires', 'Alimentation, boissons, épices', 'Électronique, téléphones, audio'],
  },
  {
    type: 'SERVICE',
    icon: ConciergeBell,
    emoji: '🏢',
    label: 'Présenter mon activité / services',
    title: 'Site Vitrine / Services',
    description:
      'Présentez vos services, prenez des réservations et recevez des demandes de devis via WhatsApp.',
    examples: ['Salon beauté, coiffure, spa', 'Restaurant, traiteur, bar', 'Consulting, formation, artisanat'],
  },
]

export function Step1BusinessType({ businessType, onSelect }: Step1BusinessTypeProps) {
  return (
    <section aria-labelledby="step1-title" className="w-full space-y-6">
      <div className="text-center">
        <h2 id="step1-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          CHOIX DU TYPE D&apos;ACTIVITÉ
        </h2>
        <p className="mt-2 text-muted-foreground">
          Quel type de site souhaitez-vous créer ?
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const IconComponent = option.icon
          const isSelected = businessType === option.type

          return (
            <motion.button
              key={option.type}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onSelect(option.type)}
              aria-label={option.label}
              aria-pressed={isSelected}
              className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Card
                className={`h-full cursor-pointer transition-shadow duration-200 ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  {/* Icon & emoji header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {option.emoji}
                    </span>
                  </div>

                  {/* Title & description */}
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">
                      {option.label}
                    </h3>
                    <p className="mt-1 text-base font-bold text-primary">
                      {option.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  {/* Examples */}
                  <ul className="space-y-1.5">
                    {option.examples.map((example) => (
                      <li
                        key={example}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                        {example}
                      </li>
                    ))}
                  </ul>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        ✓
                      </span>
                      Sélectionné
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
