'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { BusinessType } from '@/lib/sector-config'
import { getSectorsByBusinessType } from '@/lib/sector-config'
import { Card, CardContent } from '@/components/ui/card'

interface Step2SectorProps {
  businessType: BusinessType
  selectedSector: string | null
  onSelect: (sector: string) => void
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function Step2Sector({ businessType, selectedSector, onSelect }: Step2SectorProps) {
  const sectors = useMemo(() => getSectorsByBusinessType(businessType), [businessType])

  return (
    <section aria-labelledby="step2-title" className="w-full space-y-6">
      <div className="text-center">
        <h2 id="step2-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          CHOIX DU SECTEUR D&apos;ACTIVITÉ
        </h2>
        <p className="mt-2 text-muted-foreground">
          Quel est votre domaine d&apos;activité ?
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={businessType}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        {sectors.map((sector) => {
          const isSelected = selectedSector === sector.id

          return (
            <motion.button
              key={sector.id}
              variants={itemVariants}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onSelect(sector.id)}
              aria-label={sector.name}
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
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:gap-3 sm:p-6">
                  {/* Emoji */}
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-3xl sm:h-16 sm:w-16 sm:text-4xl"
                    role="img"
                    aria-hidden="true"
                  >
                    {sector.emoji}
                  </span>

                  {/* Name */}
                  <h3 className="text-sm font-semibold leading-tight sm:text-base">
                    {sector.name}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {sector.subtitle}
                  </p>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}
