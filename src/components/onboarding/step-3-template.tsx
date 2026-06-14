'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getSectorConfig, getTemplateForSector, type BusinessType } from '@/lib/sector-config'
import { getTemplateDisplayInfo } from '@/lib/template-display'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface Step3Props {
  sector: string
  businessType: BusinessType
  template: string | null
  onConfirm: () => void
}

export function Step3Template({ sector, businessType, template, onConfirm }: Step3Props) {
  const sectorConfig = getSectorConfig(sector)
  const sectorName = sectorConfig?.name ?? sector
  const determinedTemplate = getTemplateForSector(sector)

  const displayInfo = useMemo(
    () => getTemplateDisplayInfo(determinedTemplate),
    [determinedTemplate],
  )

  const isCosmika = determinedTemplate === 'cosmika-beauty'

  // Gradient classes derived from displayInfo color
  const isElectro = determinedTemplate === 'xstore-electro'
  const accentFrom = isElectro ? 'from-emerald-500' : 'from-rose-500'
  const accentTo = isElectro ? 'to-teal-500' : 'to-pink-500'
  const accentBg = isElectro ? 'bg-emerald-50' : 'bg-rose-50'
  const accentText = isElectro ? 'text-emerald-600' : 'text-rose-600'
  const accentBorder = isElectro ? 'border-emerald-200' : 'border-rose-200'
  const mockupBg = isElectro
    ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400'
    : 'bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400'

  const features = useMemo(
    () =>
      displayInfo.features.map((f) => {
        if (isCosmika && f === displayInfo.features[0]) {
          return `${f} — optimisé pour ${sectorName}`
        }
        if (!isCosmika && f === displayInfo.features[0]) {
          return `${f} — optimisé pour ${sectorName}`
        }
        return f
      }),
    [displayInfo.features, isCosmika, sectorName],
  )

  return (
    <motion.div
      key="step3-template"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choix du template
        </h2>
        <p className="text-muted-foreground">
          Nous avons sélectionné le template idéal pour votre activité
        </p>
      </div>

      {/* Single large card */}
      <Card className="overflow-hidden border-2 hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left: Info */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Template identity — now uses marketing display name */}
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{displayInfo.style.emoji}</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Template {displayInfo.displayName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`${accentBg} ${accentText} border ${accentBorder}`}
                      >
                        {displayInfo.style.badge}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {businessType === 'SERVICE' ? 'Mode Services' : 'Mode E-commerce'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1" style={{ color: displayInfo.style.primaryColor }}>
                      {displayInfo.tagline}
                    </p>
                  </div>
                </div>

                {/* Optimized for sector callout */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayInfo.description}
                </p>

                {/* Features list */}
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: displayInfo.style.primaryColor }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirm button */}
              <div className="mt-8">
                <Button
                  onClick={onConfirm}
                  size="lg"
                  className="w-full sm:w-auto text-white rounded-xl px-8 font-semibold h-12 transition hover:opacity-90"
                  style={{ backgroundColor: displayInfo.style.primaryColor }}
                >
                  Continuer avec ce template →
                </Button>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div className="hidden md:flex items-center justify-center p-8 bg-gray-50">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-56 h-[420px] rounded-[2.5rem] bg-gray-900 p-2 shadow-2xl">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />

                    {/* Screen content */}
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-white"
                      style={{ background: `linear-gradient(135deg, ${displayInfo.style.primaryColor}80, ${displayInfo.style.primaryColor}50)` }}
                    >
                      {/* Mock header */}
                      <div className="w-full mb-6">
                        <div className="h-3 w-20 bg-white/30 rounded-full mb-2" />
                        <div className="h-2 w-32 bg-white/20 rounded-full" />
                      </div>

                      {/* Mock hero image */}
                      <div className="w-full h-28 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <span className="text-4xl opacity-80">
                          {isCosmika ? '💄' : '📱'}
                        </span>
                      </div>

                      {/* Mock text blocks */}
                      <div className="w-full space-y-2">
                        <div className="h-2.5 w-full bg-white/20 rounded-full" />
                        <div className="h-2.5 w-4/5 bg-white/15 rounded-full" />
                        <div className="h-2.5 w-3/5 bg-white/10 rounded-full" />
                      </div>

                      {/* Mock CTA button */}
                      <div className="mt-6 w-full h-10 bg-white/25 rounded-xl backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-white/80">
                          {isCosmika ? 'Commander' : 'Acheter'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow effect */}
                <div
                  className={`absolute -inset-4 ${mockupBg} opacity-10 blur-3xl rounded-full -z-10`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Bon à savoir</p>
        <p>
          Vous pourrez personnaliser les couleurs, le logo et le contenu de ce template
          après l&apos;inscription, directement depuis votre tableau de bord.
        </p>
      </div>
    </motion.div>
  )
}