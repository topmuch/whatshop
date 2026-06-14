'use client'

import { useAppStore } from '@/lib/store'
import { CheckCircle2, XCircle, ExternalLink, Unplug } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

/**
 * Compact Facebook connection status indicator.
 *
 * Shows "✅ Connecté" or "❌ Non connecté" with action buttons.
 * Used in the integrations hub and settings pages.
 */
export function FacebookStatus() {
  const shop = useAppStore((s) => s.shop)

  if (!shop) return null

  const isConnected = !!shop.facebookConnected
  const catalogActive = !!shop.catalogEnabled

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/integrations/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogEnabled: false,
          pixelId: '',
          accessToken: '',
        }),
      })
      if (res.ok) {
        toast.success('Facebook déconnecté')
        window.location.reload()
      }
    } catch {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  if (isConnected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-green-500" />
          <span className="font-medium text-sm">Facebook connecté</span>
        </div>

        {shop.facebookPageName && (
          <p className="text-sm text-muted-foreground pl-7">
            Page : <span className="font-medium text-foreground">{shop.facebookPageName}</span>
          </p>
        )}

        {catalogActive && (
          <p className="text-sm text-muted-foreground pl-7">
            Catalogue : <span className="font-medium text-foreground">{shop.catalogProductCount ?? 0} produits synchronisés</span>
          </p>
        )}

        <div className="flex items-center gap-2 pl-7">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const catalogUrl = `${BASE_URL}/api/catalog/${shop.id}`
              navigator.clipboard.writeText(catalogUrl)
              toast.success('URL du flux copiée !')
            }}
          >
            Copier le flux XML
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDisconnect}
          >
            <Unplug className="size-3.5 mr-1" />
            Déconnecter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <XCircle className="size-5 text-gray-400" />
        <span className="font-medium text-sm text-muted-foreground">Facebook non connecté</span>
      </div>
      <p className="text-sm text-muted-foreground pl-7">
        Connectez votre page Facebook pour synchroniser vos produits.
      </p>
    </div>
  )
}