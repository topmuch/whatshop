'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, ArrowRight, Menu, Check, Star, MessageCircle, Eye, Store, BarChart3, Globe, CreditCard, Headphones } from 'lucide-react'

/* ── ANIMATION VARIANTS ── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] } }) }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const vp = { once: true, margin: '-80px' }

/* ── COUNTER HOOK ── */
function useCounter(target: number, duration = 2) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  useEffect(() => { const ctrl = animate(count, target, { duration, ease: 'easeOut' }); return () => ctrl.stop() }, [count, target, duration])
  return rounded
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const display = useCounter(value)
  const [text, setText] = useState('0')
  useEffect(() => { const unsub = display.on('change', (v) => setText(String(v))); return unsub }, [display])
  return <>{text}{suffix}</>
}

/* ── LOGO ── */
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
        <ShoppingBag className="w-4 h-4 text-white" />
      </div>
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
        Bouti<span className="text-pink-500">ko</span>
      </span>
    </div>
  )
}

/* ── HEADER ── */
function Header() {
  const { setView } = useAppStore()
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'Templates', href: '#templates' }, { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
  ]
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100/80">
      <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{l.label}</a>)}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('login')} className="text-gray-600">Se connecter</Button>
          <Button size="sm" onClick={() => setView('register')} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 rounded-full">
            Commencer <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="mb-6"><Logo /></SheetTitle>
            <nav className="flex flex-col gap-4">
              {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base font-medium text-gray-600 py-2">{l.label}</a>)}
              <Separator />
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); setView('login') }}>Se connecter</Button>
              <Button className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500" onClick={() => { setOpen(false); setView('register') }}>Commencer</Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

/* ── HERO ── */
function Hero() {
  const { setView } = useAppStore()
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <style>{`@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}.gradient-mesh{background:linear-gradient(-45deg,#fdf2f8,#fce7f3,#fff1f2,#fef3c7,#fdf2f8,#f5f3ff);background-size:400% 400%;animation:gradientShift 15s ease infinite}`}</style>
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-rose-300/20 rounded-full blur-[100px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-20 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.h1 variants={fadeUp} custom={0} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Créez Votre Boutique WhatsApp<br className="hidden sm:block" /> en 2 Minutes
          </motion.h1>
          <motion.p variants={fadeUp} custom={0.1} className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme N°1 des vendeurs africains. Simple, rapide, professionnel.
          </motion.p>
          <motion.div variants={fadeUp} custom={0.2} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setView('register')} className="text-base px-8 py-6 h-auto font-semibold rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xl shadow-pink-500/30">
              Commencer Gratuitement <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a href="#templates">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto font-semibold rounded-full border-gray-300 hover:bg-gray-50">
                Voir les Templates <Eye className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── TEMPLATE SHOWCASE ── */
const templates = [
  { name: 'Luxe Fashion', emoji: '✨', desc: 'Glassmorphism, or champagne, Instagram Stories', gradient: 'from-[#D4AF37] to-[#FFE5E5]' },
  { name: 'TikTok Live', emoji: '🔴', desc: 'LIVE en direct, urgence, conversion maximale', gradient: 'from-[#FF0050] to-[#0a0a0a]' },
  { name: 'Beauty Premium', emoji: '💖', desc: 'Rose gold, éditorial, confiance totale', gradient: 'from-[#B76E79] to-[#DCAE96]' },
]

function Templates() {
  const { setView, setShopSlug } = useAppStore()
  const slugs = ['luxe-fashion', 'tiktok-live', 'beauty-premium']
  return (
    <section id="templates" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold text-gray-900">3 Nouveaux Templates Premium</motion.h2>
        </motion.div>
        <div className="flex gap-5 md:grid md:grid-cols-3 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide">
          {templates.map((t, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} custom={i * 0.1} className="min-w-[280px] md:min-w-0 snap-center">
              <Card className={`overflow-hidden rounded-2xl border-0 bg-gradient-to-br ${t.gradient} p-6 sm:p-8 text-white h-full`}>
                <CardContent className="p-0 flex flex-col h-full">
                  <span className="text-5xl mb-4">{t.emoji}</span>
                  <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 flex-1">{t.desc}</p>
                  <button onClick={() => setShopSlug(slugs[i])} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-4">
                    Voir le template <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── FEATURES GRID ── */
const features = [
  { emoji: '🏪', title: 'Multi-Boutiques', desc: 'Créez jusqu\'à 10 boutiques avec un seul compte', color: 'bg-pink-100 text-pink-600' },
  { emoji: '🔴', title: 'TikTok Live', desc: 'Vendez en direct avec le mode Live', color: 'bg-red-100 text-red-600' },
  { emoji: '💳', title: 'Mobile Money', desc: 'Paiement Orange Money, MTN, Wave', color: 'bg-amber-100 text-amber-600' },
  { emoji: '🌐', title: 'Domaine Personalisé', desc: 'Votre propre nom de domaine', color: 'bg-violet-100 text-violet-600' },
  { emoji: '📊', title: 'Statistiques', desc: 'Suivez vos ventes en temps réel', color: 'bg-emerald-100 text-emerald-600' },
  { emoji: '💬', title: 'Support WhatsApp', desc: 'Assistance dédiée via WhatsApp', color: 'bg-green-100 text-green-600' },
]

function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50/80">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold text-gray-900">Tout ce qu&apos;il vous faut pour vendre en ligne</motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} custom={i * 0.08}>
              <Card className="h-full rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${f.color}`}>{f.emoji}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── PRICING ── */
const plans = [
  { name: 'STARTER', price: '5 000', desc: 'Idéal pour démarrer', popular: false, features: ['1 boutique', '10 produits', 'Commandes WhatsApp', 'Design responsive'] },
  { name: 'PRO', price: '8 000', desc: 'Plus Populaire', popular: true, features: ['3 boutiques', '100 produits', 'Statistiques avancées', '12 thèmes premium', 'Support prioritaire', 'Logo personnalisé'] },
  { name: 'BUSINESS', price: '20 000', desc: 'Pour les pros', popular: false, features: ['10 boutiques', 'Produits illimités', 'Domaine personnalisé', 'Support dédié 24/7', 'API & intégrations', 'Marque blanche'] },
]

function Pricing() {
  const { setView } = useAppStore()
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold text-gray-900">Tarifs Adaptés à Vos Besoins</motion.h2>
        </motion.div>
        <div className="flex gap-5 md:grid md:grid-cols-3 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide">
          {plans.map((p, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} custom={i * 0.1} className="min-w-[280px] md:min-w-0 snap-center">
              <Card className={`h-full flex flex-col rounded-2xl ${p.popular ? 'border-2 border-pink-500 shadow-xl shadow-pink-500/15' : 'border border-gray-200 shadow-sm hover:shadow-md'} transition-shadow bg-white`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg shadow-pink-500/25 text-xs font-bold px-4 py-1">
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-8 pb-8 px-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                    <span className="text-gray-400 font-medium ml-1">FCFA/mois</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-pink-500" /></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={p.popular ? 'default' : 'outline'}
                    onClick={() => setView('register')}
                    className={`w-full rounded-full h-11 font-semibold ${p.popular ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/25 text-white' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    Choisir {p.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── SOCIAL PROOF ── */
const stats = [
  { value: 500, suffix: '+', label: 'vendeurs actifs' },
  { value: 4.9, suffix: '/5', label: 'étoiles' },
  { value: 10, suffix: '+', label: 'pays africains' },
]

function SocialProof() {
  return (
    <section className="py-16 md:py-20 bg-gray-50/80">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="grid grid-cols-3 gap-6 text-center">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} custom={i * 0.1}>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                <span className="text-pink-500">+</span>
                {s.value % 1 === 0 ? (
                  <><Counter value={s.value} />{s.suffix}</>
                ) : (
                  <>{s.value}{s.suffix}</>
                )}
              </p>
              <p className="text-sm sm:text-base text-gray-500 mt-2 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── FINAL CTA ── */
function FinalCTA() {
  const { setView } = useAppStore()
  return (
    <section className="py-20 md:py-28 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center">
        <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Prêt à Lancer Votre Boutique ?
        </motion.h2>
        <motion.p variants={fadeUp} custom={0.1} className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
          Rejoignez des centaines de vendeurs africains qui font confiance à Boutiko.
        </motion.p>
        <motion.div variants={fadeUp} custom={0.2} className="mt-10">
          <Button size="lg" onClick={() => setView('register')} className="text-base px-10 py-6 h-auto font-semibold rounded-full bg-white text-pink-600 hover:bg-white/90 shadow-2xl shadow-black/20">
            Créer Ma Boutique Gratuitement <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── FOOTER ── */
function Footer() {
  const { setView } = useAppStore()
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <Logo />
          <nav className="flex flex-wrap gap-6">
            {[
              { label: 'À propos', view: 'about' as const },
              { label: 'Tarifs', view: 'pricing' as const },
              { label: 'Contact', view: 'contact' as const },
              { label: 'Confidentialité', view: 'privacy' as const },
            ].map((l) => (
              <button key={l.view} onClick={() => setView(l.view)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.label}</button>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-400">Orange Money • MTN • Wave</p>
          <p className="text-sm text-gray-400">© 2025 Boutiko. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

/* ── MAIN EXPORT ── */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <Templates />
        <Features />
        <Pricing />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}