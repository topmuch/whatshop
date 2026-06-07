'use client'

import { useState, useMemo } from 'react'
import { type Product, type Category, useAppStore } from '@/lib/store'
import { ProductCard } from '@/components/shop/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Package } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  categories: Category[]
  isLoading: boolean
}

export function ProductGrid({ products, categories, isLoading }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { cart, addToCart, updateCartQuantity } = useAppStore()

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory)
    }

    return filtered
  }, [products, searchQuery, selectedCategory])

  const getCartQuantity = (productId: string) => {
    const item = cart.find((c) => c.productId === productId)
    return item ? item.quantity : 0
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Search skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        </div>
        {/* Category pills skeleton */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0 rounded-full"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0 rounded-full"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
            >
              {cat.name}
              {cat.productCount !== undefined && cat.productCount > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({cat.productCount})</span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Aucun produit trouvé</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? `Aucun résultat pour "${searchQuery}"`
              : 'Cette boutique n\'a pas encore de produits.'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              cartQuantity={getCartQuantity(product.id)}
              onUpdateQuantity={updateCartQuantity}
            />
          ))}
        </div>
      )}
    </div>
  )
}
