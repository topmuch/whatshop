'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig, ApproachStep } from '@/lib/theme-config'

interface ElectroApproachProps {
  steps: ApproachStep[]
  theme: ThemeConfig
}

export default function ElectroApproach({ steps, theme }: ElectroApproachProps) {
  const { colors } = theme

  if (steps.length === 0) return null

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-4 text-white"
            style={{ backgroundColor: colors.primary }}
          >
            NOTRE PROCESSUS
          </span>
          <h2 className="font-bold text-2xl md:text-4xl" style={{ color: colors.text }}>
            Comment ça marche ?
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Un processus simple et transparent en {steps.length} étapes.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-12 left-0 right-0 h-1 rounded-full"
            style={{ backgroundColor: colors.primary + '20' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                {/* Number circle */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 relative z-10 shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div className="text-center">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="font-bold text-xl mb-3" style={{ color: colors.text }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}