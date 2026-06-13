'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SessionInit } from '@/components/session-init'
import { getTemplateForSector, type BusinessType } from '@/lib/sector-config'
import { Step1BusinessType } from '@/components/onboarding/step-1-business-type'
import { Step2Sector } from '@/components/onboarding/step-2-sector'
import { Step3Template } from '@/components/onboarding/step-3-template'
import { Step4Customization } from '@/components/onboarding/step-4-customization'
import Step5Offer from '@/components/onboarding/step-5-offer'

/* ──────────────────────── TYPES ──────────────────────── */

type Plan = 'TRIAL' | 'PRO'

interface OnboardingState {
  businessType: BusinessType | null
  sector: string | null
  template: string | null
  name: string
  whatsapp: string
  description: string
  logo: string | null
  plan: Plan | null
}

const TOTAL_STEPS = 5

/* ──────────────────────── ANIMATION ──────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
}

/* ──────────────────────── MAIN COMPONENT ──────────────────────── */

export default function OnboardingPage() {
  const { user, setShop, setShops, setView } = useAppStore()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState<OnboardingState>({
    businessType: null,
    sector: null,
    template: null,
    name: '',
    whatsapp: '',
    description: '',
    logo: null,
    plan: null,
  })

  /* ──────── Navigation ──────── */

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  /* ──────── Step validation ──────── */

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return form.businessType !== null
      case 2: return form.sector !== null
      case 3: return form.template !== null
      case 4: return form.name.trim().length > 0 && form.whatsapp.replace(/\s/g, '').length >= 8
      case 5: return form.plan !== null
      default: return false
    }
  }

  /* ──────── Step-specific handlers ──────── */

  const handleBusinessTypeSelect = useCallback((type: BusinessType) => {
    setForm((prev) => ({ ...prev, businessType: type, sector: null, template: null }))
  }, [])

  const handleSectorSelect = useCallback((sector: string) => {
    setForm((prev) => {
      const template = getTemplateForSector(sector)
      return { ...prev, sector, template }
    })
  }, [])

  const handleTemplateConfirm = useCallback(() => {
    if (form.sector) {
      const template = getTemplateForSector(form.sector)
      setForm((prev) => ({ ...prev, template }))
    }
    goNext()
  }, [form.sector, goNext])

  const handlePlanSelect = useCallback((plan: Plan) => {
    setForm((prev) => ({ ...prev, plan }))
  }, [])

  /* ──────── Submit ──────── */

  const handleSubmit = useCallback(async () => {
    if (!form.businessType || !form.name.trim() || !form.whatsapp.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: form.businessType,
          sector: form.sector,
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          description: form.description.trim() || undefined,
          logo: form.logo || undefined,
          plan: form.plan || 'TRIAL',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur serveur' }))
        throw new Error(data.error || 'Erreur lors de la création')
      }

      const shopData = await res.json()
      const shop = shopData.shop || shopData

      setShop(shop)
      setShops([shop])
      toast.success(`Boutique "${shop.name}" créée avec succès !`)
      setView('dashboard')
      window.history.replaceState(null, '', '/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur serveur'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [form, setShop, setShops, setView])

  /* ──────── Progress calculation ──────── */

  const progressPercent = (step / TOTAL_STEPS) * 100

  /* ──────── Step 4 validation ──────── */

  const step4Valid = form.name.trim().length > 0 && form.whatsapp.replace(/\s/g, '').length >= 8

  /* ──────── Render ──────── */

  return (
    <SessionInit>
      <div className="min-h-screen bg-background flex flex-col">
        {/* ── Top bar with progress ── */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-4">
            {step > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                className="shrink-0 h-9 w-9"
                aria-label="Étape précédente"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">
                  Étape {step} sur {TOTAL_STEPS}
                </span>
                <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {step === 1 && (
                  <Step1BusinessType
                    businessType={form.businessType}
                    onSelect={handleBusinessTypeSelect}
                  />
                )}

                {step === 2 && form.businessType && (
                  <Step2Sector
                    businessType={form.businessType}
                    selectedSector={form.sector}
                    onSelect={handleSectorSelect}
                  />
                )}

                {step === 3 && form.sector && (
                  <Step3Template
                    sector={form.sector}
                    businessType={form.businessType!}
                    template={form.template}
                    onConfirm={handleTemplateConfirm}
                  />
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        PERSONNALISATION DE LA BOUTIQUE
                      </h2>
                      <p className="mt-2 text-muted-foreground">
                        Donnez un nom à votre activité et configurez votre contact
                      </p>
                    </div>
                    <Step4Customization
                      name={form.name}
                      whatsapp={form.whatsapp}
                      description={form.description}
                      logo={form.logo}
                      onNameChange={(v) => setForm((p) => ({ ...p, name: v }))}
                      onWhatsappChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))}
                      onDescriptionChange={(v) => setForm((p) => ({ ...p, description: v }))}
                      onLogoChange={(v) => setForm((p) => ({ ...p, logo: v }))}
                      isValid={step4Valid}
                    />
                  </div>
                )}

                {step === 5 && (
                  <Step5Offer
                    shopName={form.name}
                    sector={form.sector || ''}
                    template={form.template || 'cosmika-beauty'}
                    selectedPlan={form.plan}
                    onPlanSelect={handlePlanSelect}
                    onConfirm={handleSubmit}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ── Bottom navigation (steps 1–4 only; step 5 has its own confirm) ── */}
        {step < 5 && (
          <footer className="sticky bottom-0 z-50 border-t bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl px-4 py-4 flex justify-end">
              <Button
                size="lg"
                onClick={goNext}
                disabled={!canProceed()}
                className="gap-2 min-w-[160px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Continuer
              </Button>
            </div>
          </footer>
        )}
      </div>
    </SessionInit>
  )
}