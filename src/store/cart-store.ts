'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/lib/modern-store-types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  shopId: string | null
  // Actions
  addItem: (item: CartItem, shopId: string) => void
  removeItem: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  // Sélecteurs calculés (à appeler dans les composants)
  getSubtotal: () => number
  getItemCount: () => number
}

/**
 * Store panier pour le template Modern Store.
 * Persisté en localStorage (par navigateur). Le shopId permet d'isoler
 * les paniers entre différentes boutiques visitées par le même utilisateur.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shopId: null,

      addItem: (item, shopId) =>
        set((state) => {
          // Si on change de boutique, on vide le panier
          if (state.shopId && state.shopId !== shopId) {
            return {
              items: [item],
              shopId,
              isOpen: true,
            }
          }
          // Chercher un item existant (même produit + même variante)
          const existingIdx = state.items.findIndex(
            (i) => i.productId === item.productId && (i.variantId || null) === (item.variantId || null),
          )
          if (existingIdx >= 0) {
            const newItems = [...state.items]
            newItems[existingIdx] = {
              ...newItems[existingIdx],
              quantity: newItems[existingIdx].quantity + item.quantity,
            }
            return { items: newItems, shopId, isOpen: true }
          }
          return { items: [...state.items, item], shopId, isOpen: true }
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (i.variantId || null) === (variantId || null)),
          ),
        })),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.productId === productId && (i.variantId || null) === (variantId || null)) {
                return { ...i, quantity: Math.max(1, quantity) }
              }
              return i
            })
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [], shopId: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'boutiko-modern-cart',
      // On ne persiste pas isOpen (le drawer doit s'ouvrir sur action)
      partialize: (state) => ({ items: state.items, shopId: state.shopId }),
    },
  ),
)
