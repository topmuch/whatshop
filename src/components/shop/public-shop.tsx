'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ShoppingCart, MessageCircle, Minus, Plus, Trash2, Package } from 'lucide-react'

export function PublicShop() {
  const { shopSlug, setView, publicShop, setPublicShop, publicProducts, setPublicProducts, publicCategories, setPublicCategories, cart, addToCart, removeFromCart, updateCartQuantity, getCartTotal, clearCart } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShop() {
      try {
        const shopRes = await fetch(`/api/shops?slug=${shopSlug}`)
        if (!shopRes.ok) return
        const shopData = await shopRes.json()
        setPublicShop(shopData)

        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?shopId=${shopData.id}`),
          fetch(`/api/categories?shopId=${shopData.id}`),
        ])
        if (prodRes.ok) setPublicProducts(await prodRes.json())
        if (catRes.ok) setPublicCategories(await catRes.json())
      } catch {
        // Error loading
      } finally {
        setLoading(false)
      }
    }
    fetchShop()
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  const total = getCartTotal()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function handleAddToCart(product: { id: string; name: string; price: number; image?: string | null }) {
    addToCart({ productId: product.id, name: product.name, price: product.price, image: product.image || undefined, quantity: 1 })
  }

  function handleWhatsAppCheckout() {
    const items = cart.map((c) => `${c.name} x${c.quantity} = ${(c.price * c.quantity).toLocaleString('fr-FR')} FCFA`).join('%0A')
    const msg = `Bonjour ! Je souhaite commander :%0A${items}%0A%0ATotal : ${total.toLocaleString('fr-FR')} FCFA`
    window.open(`https://wa.me/${publicShop?.whatsapp?.replace(/\D/g, '') || ''}?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
        <Skeleton className="h-48 rounded-xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Boutique introuvable</h2>
          <p className="text-muted-foreground mb-4">Cette boutique n&apos;existe pas ou a été désactivée.</p>
          <Button onClick={() => setView('landing')}>Retour à l&apos;accueil</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {publicShop.banner ? (
        <div className="w-full h-48 md:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${publicShop.banner})` }}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3">
              {publicShop.logo && <img src={publicShop.logo} alt="" className="w-12 h-12 rounded-lg object-cover bg-white" />}
              <div>
                <h1 className="text-2xl font-bold">{publicShop.name}</h1>
                {publicShop.description && <p className="text-sm opacity-90">{publicShop.description}</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-primary/5 p-6">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{publicShop.name}</h1>
              {publicShop.description && <p className="text-sm text-muted-foreground">{publicShop.description}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Categories */}
        {publicCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
            <Badge variant="secondary" className="shrink-0 cursor-pointer">Tous</Badge>
            {publicCategories.map((cat) => (
              <Badge key={cat.id} variant="outline" className="shrink-0 cursor-pointer">{cat.name}</Badge>
            ))}
          </div>
        )}

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicProducts.filter(p => p.isAvailable).map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                {product.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-primary">{product.price.toLocaleString('fr-FR')} FCFA</span>
                  <Button size="sm" onClick={() => handleAddToCart(product)} className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {publicProducts.filter(p => p.isAvailable).length === 0 && (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun produit disponible</p>
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  {itemCount} article{itemCount !== 1 ? 's' : ''}
                </Badge>
                <span className="font-bold text-primary">{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <Button onClick={handleWhatsAppCheckout} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Commander via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
