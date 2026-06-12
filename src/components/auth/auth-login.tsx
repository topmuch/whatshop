'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Check,
  MessageCircle,
  Smartphone,
  Sparkles,
  BarChart3,
} from 'lucide-react'

const features = [
  { icon: MessageCircle, label: 'WhatsApp Commandes' },
  { icon: Smartphone, label: '100% Mobile' },
  { icon: Sparkles, label: '12 Thèmes Premium' },
  { icon: BarChart3, label: 'Statistiques Temps Réel' },
]

export function AuthLogin() {
  const { setUser, setShop, setView } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Identifiants incorrects')
        return
      }
      setUser(data.user)
      if (data.shop) setShop(data.shop)

      // Check for redirect param (set by middleware when user tried to access a protected route)
      const params = new URLSearchParams(window.location.search)
      const redirectUrl = params.get('redirect')

      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        setView('admin')
        window.history.replaceState(null, '', '/admin')
      } else if (!data.shop) {
        // New seller without a shop → go to onboarding
        setView('onboarding')
        window.history.replaceState(null, '', '/onboarding')
      } else if (redirectUrl && !redirectUrl.startsWith('/login') && !redirectUrl.startsWith('/register')) {
        // Redirect to the page the user originally tried to access
        setView('dashboard')
        window.location.replace(redirectUrl)
        return
      } else {
        setView('dashboard')
        window.history.replaceState(null, '', '/dashboard')
      }
      toast.success('Connexion réussie !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ───── Left Panel (hidden on mobile) ───── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B1426 0%, #122042 50%, #1a1a3e 100%)' }}>
        {/* Decorative blur glows */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-5%] w-[450px] h-[450px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #EC4899, #F59E0B)' }}
              >
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Boutiko
              </span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
                Votre boutique en ligne,
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #EC4899, #F59E0B)' }}
                >
                  en quelques minutes.
                </span>
              </h1>
              <p className="mt-4 text-lg text-white/60 max-w-md">
                Créez et gérez votre boutique e-commerce professionnelle sans compétences techniques.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                  className="flex items-center gap-4"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                    style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.25)' }}
                  >
                    <feature.icon className="h-5 w-5" style={{ color: '#EC4899' }} />
                  </div>
                  <span className="text-white/90 font-medium text-base">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            className="flex items-center gap-2"
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full"
              style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-white/70 text-sm">
              <span className="text-white font-semibold">2 000+</span> marchands actifs
            </span>
          </motion.div>
        </div>
      </div>

      {/* ───── Right Panel (Form) ───── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #EC4899, #F59E0B)' }}
            >
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#0B1426' }}>
              Boutiko
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#0B1426' }}>
              Connexion
            </h2>
            <p className="mt-2 text-muted-foreground">
              Connectez-vous à votre compte Boutiko
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@boutiko.pro"
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 h-11"
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

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox id="remember-me" className="rounded" />
                <span htmlFor="remember-me" className="text-sm text-muted-foreground select-none">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: '#EC4899' }}
              >
                Mot de passe oublié?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{
                background: loading ? undefined : 'linear-gradient(135deg, #EC4899, #d63a8a)',
              }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{' '}
              <button
                type="button"
                className="font-semibold hover:underline transition-colors cursor-pointer"
                style={{ color: '#EC4899' }}
                onClick={() => setView('register')}
              >
                Créer un compte
              </button>
            </p>

            {/* Demo accounts banner — only visible in development */}
            {process.env.NODE_ENV === 'development' && (
            <div
              className="rounded-xl p-4 space-y-2.5"
              style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.06), rgba(245, 158, 11, 0.06))', border: '1px solid rgba(236, 72, 153, 0.15)' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: '#EC4899' }} />
                <span className="text-xs font-semibold" style={{ color: '#0B1426' }}>
                  Comptes démo (dev only)
                </span>
              </div>
              <div className="space-y-1.5 pl-6">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground mt-0.5 shrink-0 w-12">Vendeur</span>
                  <span className="text-xs text-muted-foreground">electro@demo.com / demo1234</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground mt-0.5 shrink-0 w-12">Admin</span>
                  <span className="text-xs text-muted-foreground">admin@terangaflow.app / admin123</span>
                </div>
              </div>
            </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}
