'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getSectorConfig, getTemplateForSector, type BusinessType } from '@/lib/sector-config'
import { getTemplateDisplayInfo } from '@/lib/template-display'
import { templateList, type TemplateId } from '@/lib/templates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface Step3Props {
  sector: string
  businessType: BusinessType
  template: string | null
  onSelect: (templateId: TemplateId) => void
  onConfirm: () => void
}

export function Step3Template({ sector, businessType, template, onSelect, onConfirm }: Step3Props) {
  const sectorConfig = getSectorConfig(sector)
  const sectorName = sectorConfig?.name ?? sector
  const suggestedTemplateId = getTemplateForSector(sector) as TemplateId

  return (
    <motion.div
      key="step3-template"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choisissez votre design
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez le template qui correspond le mieux à votre activité
        </p>
      </div>

      {/* Template list */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {templateList.map((tpl, index) => {
          const display = getTemplateDisplayInfo(tpl.id)
          const isSuggested = suggestedTemplateId === tpl.id
          const isSelected = template === tpl.id

          return (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 shadow-lg ring-2 ring-primary/20'
                    : 'border hover:border-primary/40 hover:shadow-md'
                }`}
                onClick={() => onSelect(tpl.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0">{display.style.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{display.displayName}</h3>
                        {isSuggested && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200"
                          >
                            ✨ Recommandé
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                          {display.style.badge}
                        </Badge>
                        {isSelected && (
                          <Badge className="text-[10px] font-semibold px-2 py-0.5 ml-auto">
                            <Check className="w-3 h-3 mr-1" />
                            Sélectionné
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{display.tagline}</p>
                      <ul className="mt-2 space-y-1">
                        {display.features.slice(0, 4).map((f, fi) => (
                          <li key={fi} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: display.style.primaryColor }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Bon à savoir</p>
        <p>
          Vous pourrez changer de template et personnaliser les couleurs, le logo et le contenu
          après l&apos;inscription, directement depuis votre tableau de bord.
        </p>
      </div>
    </motion.div>
  )
}