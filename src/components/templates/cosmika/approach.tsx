'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig, ApproachStep } from '@/lib/theme-config'

/**
 * CosmikaApproach — "Notre approche en 3 étapes" timeline for consulting.
 * Shows Diagnostic → Stratégie → Accompagnement with connecting line.
 */
interface CosmikaApproachProps {
  config: ThemeConfig
}

export function CosmikaApproach({ config }: CosmikaApproachProps) {
  const steps = config.approachSteps
  if (!steps || steps.length === 0) return null

  const primary = config.colors.primary

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Heading ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: primary }}
          >
            NOTRE MÉTHODOLOGIE
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-gray-900">
            Notre approche en {steps.length} étapes
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Une méthode éprouvée pour garantir votre réussite.
          </p>
        </div>

        {/* ── Timeline ── */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden lg:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5"
            style={{ backgroundColor: primary + '20' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step: ApproachStep, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: 0.15 * index, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Numbered circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-6 relative z-10 shadow-lg"
                  style={{ backgroundColor: primary }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4">{step.icon}</div>

                {/* Content */}
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}