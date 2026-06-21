'use client'

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { generateSlug } from '@/lib/utils'
import { templateList, type TemplateId } from '@/lib/templates'
import { getTemplateDisplayInfo } from '@/lib/template-display'
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Sparkles,
  Phone,
  ImageIcon,
  Loader2,
  ShoppingCart,
  ConciergeBell,
  Clock,
  AlertTriangle,
} from 'lucide-react'

/* ──────────────────────── TYPES ──────────────────────── */

type BusinessType = 'ECOMMERCE' | 'SERVICE'
type Sector =
  | 'beaute'
  | 'mode'
  | 'electronique'
  | 'alimentation'
  | 'autre'
  | 'beaute-service'
  | 'restaurant'
  | 'consulting'
  | 'artisanat'
  | 'sante'
type Plan = 'LIVE' | 'LIVE_PRO' | 'BOUTIQUE_PRO'

interface OnboardingFormData {
  businessType: BusinessType | null
  sector: Sector | null
  template: TemplateId | null
  name: string
  whatsapp: string
  countryCode: string
  description: string
  logo: string | null
  plan: Plan | null
}

/* ──────────────────────── CONSTANTS ──────────────────────── */

const ECOMMERCE_SECTORS: { id: Sector; emoji: string; name: string; subtitle: string }[] = [
  { id: 'beaute', emoji: '💄', name: 'Beauté', subtitle: 'Maquillage, soins, parfums' },
  { id: 'mode', emoji: '👗', name: 'Mode', subtitle: 'Vêtements, accessoires, chaussures' },
  { id: 'electronique', emoji: '📱', name: 'Tech', subtitle: 'Téléphones, accessoires, audio' },
  { id: 'alimentation', emoji: '🍔', name: 'Alimentation', subtitle: 'Boissons, snacks, épices' },
  { id: 'autre', emoji: '🛍️', name: 'Autre', subtitle: 'Autres produits' },
]

const SERVICE_SECTORS: { id: Sector; emoji: string; name: string; subtitle: string }[] = [
  { id: 'beaute-service', emoji: '💇', name: 'Beauté', subtitle: 'Salon, coiffure, esthétique' },
  { id: 'restaurant', emoji: '🍽️', name: 'Restaurant', subtitle: 'Restaurant, bar, traiteur' },
  { id: 'consulting', emoji: '💼', name: 'Consulting', subtitle: 'Conseil, formation, coaching' },
  { id: 'artisanat', emoji: '🔧', name: 'Artisan/BTP', subtitle: 'Plomberie, électricité, menuiserie' },
  { id: 'sante', emoji: '🏥', name: 'Santé', subtitle: 'Pharmacie, clinique, bien-être' },
]

/* Suggested template per sector (used as pre-selection, not filter) */
const SECTOR_SUGGESTION: Partial<Record<Sector, TemplateId>> = {
  beaute: 'cosmika-dark',
  mode: 'cosmika-dark',
  electronique: 'xstore-electro',
  alimentation: 'modern-store',
  autre: 'modern-store',
  'beaute-service': 'cosmika-dark',
  restaurant: 'modern-store',
  consulting: 'xstore-electro',
  artisanat: 'xstore-electro',
  sante: 'cosmika-dark',
}

const TOTAL_STEPS = 5

/* ──────────────────────── HELPERS ──────────────────────── */

const COUNTRY_CODES = [
  { code: '+225', label: 'Côte d\'Ivoire' },
  { code: '+228', label: 'Togo' },
  { code: '+229', label: 'Bénin' },
  { code: '+226', label: 'Burkina Faso' },
  { code: '+221', label: 'Sénégal' },
  { code: '+223', label: 'Mali' },
  { code: '+237', label: 'Cameroun' },
  { code: '+243', label: 'RDC' },
  { code: '+233', label: 'Ghana' },
  { code: '+33', label: 'France' },
  { code: '+1', label: 'USA/Canada' },
  { code: '+44', label: 'Royaume-Uni' },
] as const

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
}

/* ──────────────────────── COMPONENT ──────────────────────── */

export function OnboardingWizard() {
  const { user, setShop, setPublicShop, setShops, setView } = useAppStore()

  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [form, setForm] = useState<OnboardingFormData>(() => {
    if (typeof window === 'undefined') {
      return {
        businessType: null,
        sector: null,
        template: null,
        name: '',
        whatsapp: '',
        countryCode: '+225',
        description: '',
        logo: null,
        plan: null,
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
    } catch {
      // Ignore parse errors
    }
    return {
      businessType: null,
      sector: null,
      template: null,
      name: '',
      whatsapp: '',
      countryCode: '+225',
      description: '',
      logo: null,
      plan: null,
    }
  })

  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem('boutiko-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved)
        const s = parsed.step
        if (typeof s === 'number' && s >= 1 && s <= TOTAL_STEPS) return s
      }
    } catch {
      // Ignore parse errors
    }
    return 1
  })

  /* ──────── localStorage persistence ──────── */

  useEffect(() => {
    try {
      localStorage.setItem('boutiko-onboarding', JSON.stringify({ step, form }))
    } catch {
      // Ignore storage errors
    }
  }, [step, form])

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  /* ──────── Step 1: Business Type ──────── */

  const canProceedStep1 = form.businessType !== null

  /* ──────── Step 2: Sector ──────── */

  const sectors = form.businessType === 'SERVICE' ? SERVICE_SECTORS : ECOMMERCE_SECTORS
  const canProceedStep2 = form.sector !== null

  /* ──────── Step 3: Template ──────── */

  const canProceedStep3 = form.template !== null

  /* ──────── Step 4: Customization ──────── */

  const slug = generateSlug(form.name)
  const canProceedStep4 = form.name.trim().length > 0 && form.whatsapp.trim().length >= 8

  /* ──────── Step 5: Plan ──────── */

  const templateEmoji = form.template ? getTemplateDisplayInfo(form.template).style.emoji : '🏪'
  const templateName = form.template ? getTemplateDisplayInfo(form.template).displayName : 'Template'

  /* ──────── File Upload ──────── */

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo')
      return
    }

    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) throw new Error('Erreur lors du téléchargement')

      const data = await res.json()
      setForm((prev) => ({ ...prev, logo: data.url }))
      toast.success('Logo ajouté !')
    } catch {
      toast.error('Impossible de télécharger le logo')
    } finally {
      setIsUploading(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  /* ──────── Submit ──────── */

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault()
      if (!form.plan || !form.businessType || !form.sector || !form.template || !form.name) return

      setIsSubmitting(true)

      try {
        const payload = {
          businessType: form.businessType,
          sector: form.sector,
          template: form.template,
          name: form.name.trim(),
          whatsapp: `${form.countryCode}${form.whatsapp.trim()}`,
          description: form.description.trim() || undefined,
          logo: form.logo || undefined,
          plan: form.plan,
        }

        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Erreur lors de la création')
        }

        const shopData = await res.json()
        const shop = shopData.shop || shopData

        setShop(shop)
        setPublicShop(shop)

        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData.user?.shops) {
              setShops(sessionData.user.shops)
            }
          }
        } catch {
          // Non-critical: shops list will be refreshed later
        }

        // Clear onboarding data from localStorage
        try { localStorage.removeItem('boutiko-onboarding') } catch { /* ignore */ }

        // Show trial success message
        toast.success('Votre boutique est active ! Vous avez 7 jours d\'essai pour valider votre offre. 🎉', {
          description: 'Contactez le support pour valider votre abonnement et éviter la désactivation.',
          duration: 8000,
        })

        // Redirect to dashboard
        setView('dashboard')
        window.history.replaceState(null, '', '/dashboard')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, setShop, setPublicShop, setShops, setView],
  )

  /* ──────── Progress Bar ──────── */

  function ProgressBar() {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-rose-600">
            Étape {step} sur {TOTAL_STEPS}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                i < step ? 'bg-rose-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  /* ──────── Step Renderers ──────── */

  function renderStep1() {
    return (
      <motion.div
        key="step1"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4"
          >
            <Sparkles className="w-8 h-8 text-rose-600" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''} ! Que voulez-vous faire avec
            Boutiko ?
          </h2>
          <p className="text-muted-foreground">Choisissez votre type d&apos;activité</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                form.businessType === 'ECOMMERCE'
                  ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                  : 'hover:border-rose-300'
              }`}
              onClick={() => {
                setForm((prev) => ({ ...prev, businessType: 'ECOMMERCE' }))
              }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="text-5xl mb-1">🛒</div>
                <ShoppingCart
                  className={`w-6 h-6 ${
                    form.businessType === 'ECOMMERCE' ? 'text-rose-600' : 'text-muted-foreground'
                  }`}
                />
                <h3 className="text-lg font-bold text-gray-900">VENDRE DES PRODUITS</h3>
                <p className="text-sm text-muted-foreground">
                  Boutique en ligne avec prix, stock, WhatsApp
                </p>
                {form.businessType === 'ECOMMERCE' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-rose-600 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Sélectionné
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                form.businessType === 'SERVICE'
                  ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                  : 'hover:border-rose-300'
              }`}
              onClick={() => {
                setForm((prev) => ({ ...prev, businessType: 'SERVICE' }))
              }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="text-5xl mb-1">🛎️</div>
                <ConciergeBell
                  className={`w-6 h-6 ${
                    form.businessType === 'SERVICE' ? 'text-rose-600' : 'text-muted-foreground'
                  }`}
                />
                <h3 className="text-lg font-bold text-gray-900">PROPOSER DES SERVICES</h3>
                <p className="text-sm text-muted-foreground">
                  Présentation d&apos;activité, devis, réservation
                </p>
                {form.businessType === 'SERVICE' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-rose-600 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Sélectionné
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={goNext}
            disabled={!canProceedStep1}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep2() {
    return (
      <motion.div
        key="step2"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Quel est votre domaine ?
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez le secteur qui correspond le mieux à votre activité
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  form.sector === sector.id
                    ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                    : 'hover:border-rose-300'
                }`}
                onClick={() => {
                  const suggestedTemplate = SECTOR_SUGGESTION[sector.id] ?? null
                  setForm((prev) => ({
                    ...prev,
                    sector: sector.id,
                    template: suggestedTemplate,
                  }))
                }}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                  <span className="text-3xl sm:text-4xl">{sector.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{sector.name}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{sector.subtitle}</p>
                  {form.sector === sector.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1"
                    >
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={goNext}
            disabled={!canProceedStep2}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep3() {
    const suggestedId = form.sector ? SECTOR_SUGGESTION[form.sector] : null

    return (
      <motion.div
        key="step3"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Choisissez votre design
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez le template qui correspond le mieux à votre activité
          </p>
        </div>

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {templateList.map((tpl, index) => {
            const display = getTemplateDisplayInfo(tpl.id)
            const isSuggested = suggestedId === tpl.id
            const isSelected = form.template === tpl.id

            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    isSelected
                      ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                      : 'hover:border-rose-300'
                  }`}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, template: tpl.id }))
                  }}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl shrink-0">{display.style.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{display.displayName}</h3>
                          {isSuggested && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                              Recommandé
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                            {display.style.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full ml-auto">
                              ✓ Sélectionné
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{display.tagline}</p>
                        <ul className="mt-2 space-y-1">
                          {display.features.slice(0, 3).map((f, fi) => (
                            <li key={fi} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
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

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={goNext}
            disabled={!canProceedStep3}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep4() {
    return (
      <motion.div
        key="step4"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Personnalisez votre site en 2 minutes
          </h2>
          <p className="text-muted-foreground">
            Ces informations seront utilisées pour créer votre boutique
          </p>
        </div>

        <div className="space-y-5">
          {/* Shop Name */}
          <div className="space-y-2">
            <Label htmlFor="shop-name" className="text-sm font-semibold text-gray-700">
              Nom de votre activité <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="shop-name"
              type="text"
              placeholder="Ex: Beauty Glow, Tech Store..."
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="h-12 rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20"
            />
            {slug && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                <span className="text-gray-400">Votre URL :</span>
                <span className="font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">
                  boutiko.pro/{slug}
                </span>
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Numéro WhatsApp <span className="text-rose-500">*</span>
              </span>
            </Label>
            <div className="flex items-center">
              <select
                value={form.countryCode}
                onChange={(e) => setForm((prev) => ({ ...prev, countryCode: e.target.value }))}
                className="h-12 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-sm font-medium text-gray-600 appearance-none pr-7 cursor-pointer focus:outline-none focus:border-rose-500"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.label}
                  </option>
                ))}
              </select>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="07 07 07 07"
                value={form.whatsapp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9\s]/g, '')
                  setForm((prev) => ({ ...prev, whatsapp: val }))
                }}
                className="h-12 rounded-l-none rounded-r-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Vos clients pourront vous contacter directement via WhatsApp
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Logo
              </span>
              <span className="text-xs font-normal text-muted-foreground ml-2">(optionnel)</span>
            </Label>

            <div className="flex items-center gap-4">
              {form.logo ? (
                <div className="relative">
                  <ImageWithFallback
                    src={form.logo}
                    alt="Logo de votre activité"
                    width={72}
                    height={72}
                    className="rounded-xl object-cover border border-gray-200"
                    fallbackIcon="image"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logo: null }))}
                    className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors shadow-sm"
                    aria-label="Supprimer le logo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Télécharger un logo"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-xl border-gray-300 hover:border-rose-300 hover:text-rose-600"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 w-4 h-4" />
                      Télécharger
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG — Max 5 Mo</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description courte
              <span className="text-xs font-normal text-muted-foreground ml-2">(optionnel)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Les meilleurs cosmétiques d'Afrique"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20 resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={goNext}
            disabled={!canProceedStep4}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep5() {
    const LIVE_ALLOWED_TEMPLATES = new Set(['live-template', 'live-1', 'live-2', 'live-3', 'xstore-electro'])

    const selectPlan = (plan: Plan) => {
      setForm((prev) => {
        // LIVE/LIVE_PRO plans only allow live-template and xstore-electro
        if ((plan === 'LIVE' || plan === 'LIVE_PRO') && prev.template && !LIVE_ALLOWED_TEMPLATES.has(prev.template)) {
          return { ...prev, plan, template: 'live-template' as TemplateId }
        }
        return { ...prev, plan }
      })
    }

    const plans: { id: Plan; emoji: string; name: string; price: string; priceNote: string; recommended?: boolean; features: string[]; btnClass: string; selectedClass: string; btnText: string }[] = [
      {
        id: 'LIVE',
        emoji: '🔴',
        name: 'LIVE',
        price: '20 000',
        priceNote: 'FCFA / an',
        features: [
          '1 boutique',
          '20 produits',
          'Live TikTok',
          'Posts Facebook',
          'Commandes WhatsApp',
          '2 thèmes (Live + Moderne)',
          'Dashboard simplifié',
        ],
        btnClass: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700',
        selectedClass: 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50 border-rose-600',
        btnText: 'Commencer avec Live',
      },
      {
        id: 'BOUTIQUE_PRO',
        emoji: '🟣',
        name: 'BOUTIQUE PRO',
        price: '30 000',
        priceNote: 'FCFA / an',
        recommended: true,
        features: [
          '1 boutique',
          '40 produits',
          'Toutes les fonctionnalités',
          'Live TikTok + Facebook',
          'Tous les thèmes premium',
          'Domaine personnalisé',
          'Statistiques avancées',
          'Outils IA',
          'Dashboard complet',
        ],
        btnClass: 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:from-purple-800 hover:to-indigo-800',
        selectedClass: 'ring-2 ring-purple-700 shadow-lg bg-purple-50/50 border-purple-700',
        btnText: 'Choisir Boutique Pro',
      },
      {
        id: 'LIVE_PRO',
        emoji: '🔵',
        name: 'LIVE PRO',
        price: '35 000',
        priceNote: 'FCFA / an',
        features: [
          '2 boutiques',
          '25 produits / boutique',
          'Live TikTok',
          'Posts Facebook',
          'Commandes WhatsApp',
          '2 thèmes (Live + Moderne)',
          'Dashboard simplifié',
        ],
        btnClass: 'bg-gray-900 text-white hover:bg-gray-800',
        selectedClass: 'ring-2 ring-gray-900 shadow-lg bg-gray-50 border-gray-900',
        btnText: 'Choisir Live Pro',
      },
    ]

    return (
      <motion.div
        key="step5"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
            <Sparkles className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Votre boutique est prête ! Choisissez votre offre
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez l'offre qui correspond à vos besoins
          </p>
        </div>

        {/* Preview Card */}
        <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                {form.logo ? (
                  <ImageWithFallback
                    src={form.logo}
                    alt={form.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                    fallbackIcon="image"
                  />
                ) : (
                  templateEmoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{form.name || 'Votre boutique'}</h3>
                <p className="text-sm text-gray-300 font-mono truncate">
                  boutiko.pro/{slug || 'votre-boutique'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">
                  {templateName}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Warning Banner */}
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              ⏰ Période d&apos;essai de 7 jours
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Vous avez <strong>7 jours</strong> pour valider votre offre auprès de notre équipe. Au-delà de ce délai, votre site sera désactivé.
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => selectPlan(p.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectPlan(p.id) }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl h-full relative overflow-hidden ${
                  form.plan === p.id ? p.selectedClass : 'hover:border-gray-300'
                }`}
              >
                {form.plan === p.id && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                      ✓ Sélectionné
                    </span>
                  </div>
                )}
                {p.recommended && form.plan !== p.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-purple-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{p.emoji}</span>
                    <h3 className="font-bold text-base text-gray-900">{p.name}</h3>
                    <span className="ml-auto text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      7 jours essai
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900">{p.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">{p.priceNote}</span>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {p.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    onClick={() => selectPlan(p.id)}
                    className={`w-full mt-4 rounded-xl font-semibold ${p.btnClass}`}
                    size="sm"
                  >
                    {form.plan === p.id ? `✓ ${p.name} choisi` : `${p.btnText} →`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!form.plan || isSubmitting}
            className={`rounded-xl px-8 font-semibold transition-all duration-200 ${
              !form.plan
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : form.plan === 'BOUTIQUE_PRO'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white'
                  : form.plan === 'LIVE_PRO'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white'
            }`}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                {form.plan === 'LIVE' ? 'Créer avec Live' : form.plan === 'BOUTIQUE_PRO' ? 'Créer avec Boutique Pro' : 'Créer avec Live Pro'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    )
  }

  /* ──────── Main Render ──────── */

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <ProgressBar />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </AnimatePresence>
      </main>
    </div>
  )
}