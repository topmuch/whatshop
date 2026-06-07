'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Store, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AuthLogin() {
  const { setUser, setShop, setView } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setView('dashboard')
      toast.success('Connexion réussie !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre compte WhatsShop</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@whatsshop.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setView('register')}>
                Créer un compte
              </button>
            </p>
            <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Démo :</p>
              <p className="text-xs font-mono">demo@whatsshop.com / demo123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
