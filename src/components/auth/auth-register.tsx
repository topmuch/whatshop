'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShoppingBag, ArrowRight, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const features = [
  'Créez votre boutique en 2 minutes',
  'Templates premium personnalisables',
  'Commandes via WhatsApp intégrées',
  'Statistiques en temps réel',
]

export function AuthRegister() {
  const { setUser, setView } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        return
      }
      setUser(data.user)
      setView('onboarding')
      window.history.replaceState(null, '', '/onboarding')
      toast.success('Compte créé avec succès !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ═══════ MOBILE: Header + Banner ═══════ */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-50 bg-gradient-to-r from-pink-500 to-pink-600 shadow-md">
          <div className="flex items-center px-4 py-3">
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-400 via-pink-500 to-pink-600 px-5 pb-8 pt-5">
          <h1 className="text-2xl font-bold text-white">Rejoins Boutiko</h1>
          <p className="text-white/80 text-sm mt-1">Inscris-toi gratuitement !</p>
        </div>
      </div>

      {/* ═══════ LEFT PANEL (Form) — on desktop left, on mobile below banner ═══════ */}
      <div className="flex-1 lg:w-[45%] flex items-center justify-center bg-[#FAFAFA] p-6 sm:p-8 lg:p-12 pt-8 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px]"
        >
          {/* Spacer */}
          <div className="hidden lg:flex items-center justify-center mb-10 h-[75px]"></div>

          {/* Heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#0B1426' }}>
              Rejoins Boutiko
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Inscris-toi gratuitement !
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-sm font-medium">
                Nom complet
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="pl-10 h-12 rounded-lg bg-white border-gray-200 focus-visible:border-pink-400 focus-visible:ring-pink-400/20"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="pl-10 h-12 rounded-lg bg-white border-gray-200 focus-visible:border-pink-400 focus-visible:ring-pink-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 pr-10 h-12 rounded-lg bg-white border-gray-200 focus-visible:border-pink-400 focus-visible:ring-pink-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25 cursor-pointer mt-2"
              style={{
                background: loading ? undefined : 'linear-gradient(135deg, #EC4899, #d63a8a)',
              }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground leading-relaxed px-2">
              En créant un compte, vous acceptez les{' '}
              <span className="underline cursor-pointer hover:text-foreground">Conditions d&apos;utilisation</span>
              {' '}et la{' '}
              <span className="underline cursor-pointer hover:text-foreground">Politique de confidentialité</span>
              {' '}de Boutiko.
            </p>

            {/* Divider */}
            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-4 text-sm text-muted-foreground font-medium">OU</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            {/* Social login buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 h-12 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer font-medium text-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuer avec Google
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 h-12 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer font-medium text-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continuer avec Apple
              </button>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Tu as déjà un compte ?{' '}
              <button
                type="button"
                className="font-semibold hover:underline transition-colors cursor-pointer"
                style={{ color: '#EC4899' }}
                onClick={() => {
                  setView('login')
                  window.history.replaceState(null, '', '/connexion')
                }}
              >
                Connecte-toi
              </button>
            </p>
          </form>
        </motion.div>
      </div>

      {/* ═══════ RIGHT PANEL (Visual) — desktop only ═══════ */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #d63a8a 100%)' }}
      >
        {/* Decorative glows */}
        <div
          className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FBBF24 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FDF2F8 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full flex-1">
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                2 000+ boutiques actives
              </span>
            </div>
          </motion.div>

          {/* Center: Phone mockup + features */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Phone mockup */}
            <div className="relative mb-10">
              <div className="absolute inset-4 bg-black/20 rounded-[3rem] blur-2xl" />
              <div className="relative w-[260px] h-[520px] bg-[#0B1426] rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col">
                  {/* Notch */}
                  <div className="h-10 bg-gradient-to-r from-pink-500 to-pink-600 flex items-end justify-center pb-1 shrink-0">
                    <div className="w-20 h-5 bg-[#0B1426] rounded-b-2xl" />
                  </div>
                  {/* Shop header */}
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-4 pb-4 pt-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">Ma Boutique</p>
                        <p className="text-white/70 text-[10px]">boutiko.pro/ma-boutique</p>
                      </div>
                    </div>
                  </div>
                  {/* Products grid */}
                  <div className="flex-1 p-3 grid grid-cols-2 gap-2">
                    {[
                      { bg: 'bg-amber-100', label: 'Produit 1', price: '15 000' },
                      { bg: 'bg-pink-100', label: 'Produit 2', price: '25 000' },
                      { bg: 'bg-purple-100', label: 'Produit 3', price: '8 500' },
                      { bg: 'bg-green-100', label: 'Produit 4', price: '12 000' },
                    ].map((product) => (
                      <div key={product.label} className="space-y-1.5">
                        <div className={`${product.bg} w-full aspect-square rounded-lg`} />
                        <p className="text-[10px] font-medium text-gray-800 leading-tight">{product.label}</p>
                        <p className="text-[10px] font-bold text-pink-600">{product.price} FCFA</p>
                      </div>
                    ))}
                  </div>
                  {/* WhatsApp bar */}
                  <div className="bg-green-500 px-4 py-3 flex items-center justify-center gap-2 shrink-0">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-white text-xs font-semibold">Commander sur WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature checklist */}
            <div className="space-y-3 max-w-xs">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 border border-white/30 shrink-0">
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/95 font-medium text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
          >
            <p className="text-white/70 text-sm">
              Rejoins la communauté de vendeurs passionnés
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}