'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
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
  countryCode: string
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

  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem('boutiko-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved)
        const s = parsed.step
        if (typeof s === 'number' && s >= 1 && s <= TOTAL_STEPS) return s
      }
    } catch { /* ignore */ }
    return 1
  })
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [form, setForm] = useState<OnboardingState>(() => {
    if (typeof window === 'undefined') {
      return {
        businessType: null, sector: null, template: null,
        name: '', whatsapp: '', countryCode: '+225',
        description: '', logo: null, plan: null,
      }
    }
    try {
      const saved = localStorage.getItem('boutiko-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          businessType: parsed.businessType ?? null,
          sector: parsed.sector ?? null,
          template: parsed.template ?? null,
          name: parsed.name ?? '',
          whatsapp: parsed.whatsapp ?? '',
          countryCode: parsed.countryCode ?? '+225',
          description: parsed.description ?? '',
          logo: parsed.logo ?? null,
          plan: parsed.plan ?? null,
        }
      }
    } catch { /* ignore */ }
    return {
      businessType: null, sector: null, template: null,
      name: '', whatsapp: '', countryCode: '+225',
      description: '', logo: null, plan: null,
    }
  })

  /* ──────── localStorage persistence ──────── */

  useEffect(() => {
    try {
      localStorage.setItem('boutiko-onboarding', JSON.stringify({ step, form }))
    } catch { /* ignore */ }
  }, [step, form])

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

  const handleTemplateSelect = useCallback((templateId: string) => {
    setForm((prev) => ({ ...prev, template: templateId }))
  }, [])

  const handlePlanSelect = useCallback((plan: Plan) => {
    setForm((prev) => ({ ...prev, plan }))
  }, [])

  /* ──────── Submit ──────── */

  const handleSubmit = useCallback(async () => {
    if (!form.businessType || !form.name.trim() || !form.whatsapp.trim()) return

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: form.businessType,
          sector: form.sector,
          name: form.name.trim(),
          whatsapp: `${form.countryCode}${form.whatsapp.trim()}`,
          description: form.description.trim() || undefined,
          logo: form.logo || undefined,
          plan: form.plan || 'TRIAL',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur serveur', field: null }))
        const errorCode = res.status
        const errorMsg = data.error || 'Erreur lors de la création'
        const errorField = data.field

        // Handle specific error cases with actionable messages
        if (errorCode === 409) {
          // Conflict: shop already exists or slug taken
          setSubmitError('Ce nom de boutique est déjà utilisé. Essayez un autre nom.')
          toast.error('Nom déjà pris — modifiez le nom de votre activité')
          // Go back to step 4 so user can change the name
          setDirection(-1)
          setStep(4)
        } else if (errorField === 'whatsapp') {
          setSubmitError(errorMsg)
          toast.error(errorMsg)
          setDirection(-1)
          setStep(4)
        } else if (errorField === 'name') {
          setSubmitError(errorMsg)
          toast.error(errorMsg)
          setDirection(-1)
          setStep(4)
        } else {
          setSubmitError(errorMsg)
          toast.error(errorMsg)
        }
        return
      }

      const shopData = await res.json()
      const shop = shopData.shop || shopData

      setShop(shop)
      setShops([shop])
      toast.success(`Boutique "${shop.name}" créée avec succès !`)
      try { localStorage.removeItem('boutiko-onboarding') } catch { /* ignore */ }
      setView('dashboard')
      window.history.replaceState(null, '', '/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur serveur'
      setSubmitError(message)
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
                    onSelect={handleTemplateSelect}
                    onConfirm={goNext}
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
                      countryCode={form.countryCode}
                      description={form.description}
                      logo={form.logo}
                      onNameChange={(v) => setForm((p) => ({ ...p, name: v }))}
                      onWhatsappChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))}
                      onCountryCodeChange={(v) => setForm((p) => ({ ...p, countryCode: v }))}
                      onDescriptionChange={(v) => setForm((p) => ({ ...p, description: v }))}
                      onLogoChange={(v) => setForm((p) => ({ ...p, logo: v }))}
                      isValid={step4Valid}
                    />
                  </div>
                )}

                {/* ── Inline error banner ── */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Impossible de créer la boutique</p>
                        <p className="mt-1 opacity-90">{submitError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        aria-label="Fermer l'erreur"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <Step5Offer
                    shopName={form.name}
                    sector={form.sector || ''}
                    template={form.template || 'xstore-electro'}
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