'use client'

import { useState, useEffect, useCallback } from 'react'
import { Share2, CheckCircle, XCircle, Image, Loader2, ExternalLink, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface ShopProduct {
  id: string
  name: string
  slug: string | null
  price: number
  image: string | null
  isFeatured: boolean
  isAvailable: boolean
}

interface SocialPostRecord {
  id: string
  content: string
  imageUrl: string | null
  status: string
  errorMessage: string | null
  createdAt: string
  product: { id: string; name: string; image: string | null; price: number } | null
}

interface SocialPublishProps {
  shopId: string
  shopSlug: string
  facebookConnected: boolean
  facebookPageName: string | null
}

export function SocialPublish({ shopId, shopSlug, facebookConnected, facebookPageName }: SocialPublishProps) {
  const [content, setContent] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [posts, setPosts] = useState<SocialPostRecord[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)

  // Smart Link URL
  const smartLinkUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/go/${shopSlug}`
    : ''

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/shops/${shopId}/products?limit=50`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch {
      // Silent
    } finally {
      setLoadingProducts(false)
    }
  }, [shopId])

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/social/posts?shopId=${shopId}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch {
      // Silent
    } finally {
      setLoadingPosts(false)
    }
  }, [shopId])

  useEffect(() => {
    loadProducts()
    loadPosts()
  }, [loadProducts, loadPosts])

  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error('Écrivez un message pour la publication')
      return
    }
    setPublishing(true)
    try {
      const body: Record<string, string> = {
        shopId,
        content,
      }
      if (selectedProductId) body.productId = selectedProductId
      if (customImageUrl) body.imageUrl = customImageUrl

      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Post publié sur Facebook !')
        setContent('')
        setSelectedProductId('')
        setCustomImageUrl('')
        loadPosts()
      } else {
        toast.error(data.error || 'Échec de la publication')
      }
    } catch {
      toast.error('Erreur lors de la publication')
    } finally {
      setPublishing(false)
    }
  }

  const toggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/shops/${shopId}/products/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isFeatured: !currentFeatured }),
      })
      if (res.ok) {
        toast.success(!currentFeatured ? 'Produit mis en avant' : 'Produit retiré de la mise en avant')
        loadProducts()
      } else {
        toast.error('Erreur')
      }
    } catch {
      toast.error('Erreur')
    }
  }

  if (!facebookConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Share2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground mb-2">Facebook n'est pas connecté</p>
          <p className="text-xs text-muted-foreground mb-4">
            Connectez votre page Facebook pour publier vos produits directement.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Smart Link Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Smart Link (Lien Bio)
          </CardTitle>
          <CardDescription className="text-xs">
            Partagez ce lien unique qui redirige vers votre produit mis en avant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={smartLinkUrl}
              className="h-9 text-sm font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(smartLinkUrl)
                toast.success('Lien copié !')
              }}
            >
              Copier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publish Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Publier sur {facebookPageName || 'Facebook'}
          </CardTitle>
          <CardDescription className="text-xs">
            Créez une publication pour votre page Facebook directement depuis le dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Décrivez votre produit ou partagez une info..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <div className="space-y-2">
            <Label className="text-xs">Produit à lier (optionnel)</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">— Aucun produit —</option>
              {products.filter(p => p.isAvailable).map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString('fr-FR')} FCFA</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Image (optionnel)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="URL de l'image"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="h-9 text-sm"
              />
              {selectedProductId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={() => {
                    const product = products.find(p => p.id === selectedProductId)
                    if (product?.image) {
                      setCustomImageUrl(product.image)
                      toast.success('Image du produit sélectionnée')
                    }
                  }}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Image produit
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={handlePublish}
            disabled={publishing || !content.trim()}
            className="w-full gap-2"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Publier sur Facebook
          </Button>
        </CardContent>
      </Card>

      {/* Featured Product / Published Posts */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Featured Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Produit mis en avant
            </CardTitle>
            <CardDescription className="text-xs">
              Sélectionnez le produit qui s'affichera via votre Smart Link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {loadingProducts ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Chargement...</div>
                ) : products.filter(p => p.isAvailable).length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Aucun produit disponible</div>
                ) : (
                  products.filter(p => p.isAvailable).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {p.image && (
                          <img src={p.image} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                        )}
                        <span className="text-sm truncate">{p.name}</span>
                      </div>
                      <Switch
                        checked={p.isFeatured}
                        onCheckedChange={() => toggleFeatured(p.id, p.isFeatured)}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Publications récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {loadingPosts ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Chargement...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Aucune publication</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="p-2 rounded-lg border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {post.status === 'PUBLISHED' ? (
                          <Badge variant="secondary" className="text-[10px] gap-1 text-emerald-700 bg-emerald-50">
                            <CheckCircle className="h-3 w-3" /> Publié
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] gap-1 text-red-700 bg-red-50">
                            <XCircle className="h-3 w-3" /> Échoué
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      {post.product && (
                        <p className="text-xs text-muted-foreground">Produit : {post.product.name}</p>
                      )}
                      {post.status === 'FAILED' && post.errorMessage && (
                        <p className="text-xs text-red-500">{post.errorMessage}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}