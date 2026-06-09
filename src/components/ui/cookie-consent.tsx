'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Check, Settings, Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const CONSENT_KEY = 'boutiko-cookie-consent'

/* -------------------------------------------------------------------------- */
/*  External store for consent — avoids setState-in-effect & ref-in-render     */
/* -------------------------------------------------------------------------- */

let consentSnapshot: CookiePreferences | null | undefined = undefined
let consentInitialized = false
const consentListeners = new Set<() => void>()

function readConsentFromStorage(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) return JSON.parse(stored) as CookiePreferences
  } catch {
    /* ignore */
  }
  return null
}

function getConsentSnapshot(): CookiePreferences | null {
  if (!consentInitialized) {
    consentInitialized = true
    consentSnapshot = readConsentFromStorage()
  }
  return consentSnapshot ?? null
}

function subscribeConsent(callback: () => void): () => void {
  consentListeners.add(callback)
  return () => consentListeners.delete(callback)
}

function emitConsentChange(): void {
  consentListeners.forEach((cb) => cb())
}

function updateConsentExternal(prefs: CookiePreferences): void {
  consentSnapshot = prefs
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs))
  emitConsentChange()
}

/* -------------------------------------------------------------------------- */
/*  isClient hook via useSyncExternalStore                                    */
/* -------------------------------------------------------------------------- */

const emptySubscribe = () => () => {}

function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

/* -------------------------------------------------------------------------- */
/*  Types & helpers                                                           */
/* -------------------------------------------------------------------------- */

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

/* -------------------------------------------------------------------------- */
/*  Preference Sheet                                                          */
/* -------------------------------------------------------------------------- */

function PreferenceSheet({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (prefs: CookiePreferences) => void
}) {
  const [essential, setEssential] = useState(true)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  const handleSave = () => {
    onSave({ essential, analytics, marketing })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="z-[60] flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Cookie className="size-5 text-pink-500" />
            Préférences de cookies
          </SheetTitle>
          <SheetDescription>
            Choisissez les types de cookies que vous souhaitez autoriser.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Essential cookies */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/40 p-4">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="cookie-essential"
                  className="text-sm font-medium leading-none"
                >
                  Cookies essentiels
                </label>
                <p className="text-xs text-muted-foreground">
                  Nécessaires au fonctionnement du site
                </p>
              </div>
              <Switch
                id="cookie-essential"
                checked={essential}
                disabled
                aria-label="Cookies essentiels (toujours activés)"
              />
            </div>

            {/* Analytics cookies */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/40 p-4">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="cookie-analytics"
                  className="text-sm font-medium leading-none"
                >
                  Cookies analytiques
                </label>
                <p className="text-xs text-muted-foreground">
                  Nous aident à comprendre comment vous utilisez le site
                </p>
              </div>
              <Switch
                id="cookie-analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
                aria-label="Cookies analytiques"
              />
            </div>

            {/* Marketing cookies */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/40 p-4">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="cookie-marketing"
                  className="text-sm font-medium leading-none"
                >
                  Cookies marketing
                </label>
                <p className="text-xs text-muted-foreground">
                  Utilisés pour les publicités et le suivi
                </p>
              </div>
              <Switch
                id="cookie-marketing"
                checked={marketing}
                onCheckedChange={setMarketing}
                aria-label="Cookies marketing"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border/50 px-6 py-4">
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
          >
            <Check className="size-4" />
            Enregistrer mes préférences
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* -------------------------------------------------------------------------- */
/*  Floating cookie-settings button (visible after consent)                  */
/* -------------------------------------------------------------------------- */

function FloatingCookieButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      onClick={onClick}
      aria-label="Modifier les préférences de cookies"
      className="fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-900 md:h-11 md:w-11"
    >
      <Cookie className="size-4 md:size-[18px]" strokeWidth={2} />
    </motion.button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main CookieConsent component                                              */
/* -------------------------------------------------------------------------- */

export function CookieConsent() {
  const isClient = useIsClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  /* Read consent via useSyncExternalStore — no setState in effects */
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    () => null as CookiePreferences | null
  )

  const showBanner = isClient && consent === null && !dismissed
  const showSettings = isClient && (consent !== null || dismissed) && !showBanner

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    updateConsentExternal(prefs)
    setDismissed(true)
  }, [])

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    updateConsentExternal(prefs)
    setDismissed(true)
  }, [])

  const openPreferences = useCallback(() => {
    setSheetOpen(true)
  }, [])

  /* Don't render on the server to avoid hydration mismatch */
  if (!isClient) return null

  return (
    <>
      {/* ---- Banner ---- */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            role="dialog"
            aria-label="Consentement aux cookies"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 350, damping: 40 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[55]',
              'rounded-t-2xl md:rounded-t-2xl',
              'bg-black/80 px-4 py-4 backdrop-blur-xl md:px-6 md:py-5',
              'shadow-2xl',
              'max-h-[90vh] overflow-y-auto'
            )}
          >
            <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:gap-6">
              {/* Left: icon + text */}
              <div className="flex items-start gap-3 md:flex-1 md:items-center md:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 md:h-12 md:w-12">
                  <Shield className="size-5 text-pink-400 md:size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white md:text-base">
                    Confidentialité &amp; Cookies
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-300 md:text-sm">
                    Nous utilisons des cookies et des technologies similaires
                    pour améliorer votre expérience sur Boutiko. En continuant à
                    naviguer, vous acceptez notre{' '}
                    <span className="underline decoration-pink-400/60 underline-offset-2">
                      Politique de Confidentialité
                    </span>{' '}
                    et nos{' '}
                    <span className="underline decoration-pink-400/60 underline-offset-2">
                      Conditions d&apos;utilisation
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex shrink-0 items-center gap-2 md:gap-3">
                <Button
                  variant="outline"
                  className="h-10 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white md:h-11 md:px-5"
                  onClick={openPreferences}
                >
                  <Settings className="size-4" />
                  <span className="hidden sm:inline">Personnaliser</span>
                </Button>

                <Button
                  className="h-10 gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:from-pink-600 hover:to-rose-600 md:h-11 md:px-5"
                  onClick={acceptAll}
                >
                  <Check className="size-4" />
                  Tout accepter
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Preference Sheet ---- */}
      <PreferenceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={savePreferences}
      />

      {/* ---- Floating cookie button (only after consent given) ---- */}
      <AnimatePresence>
        {showSettings && (
          <FloatingCookieButton onClick={() => setSheetOpen(true)} />
        )}
      </AnimatePresence>
    </>
  )
}
