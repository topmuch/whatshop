'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  QrCode,
  Download,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  UtensilsCrossed,
  Image as ImageIcon,
  FileCode,
} from 'lucide-react'

interface MenuQRData {
  shopId: string
  shopName: string
  shopSlug: string
  isRestaurant: boolean
  qrCodeUrl: string | null
  menuUrl: string
  accentColor: string
  logo: string | null
}

export function QRCodeDisplay() {
  const { shop } = useAppStore()
  const [qrData, setQrData] = useState<MenuQRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [format, setFormat] = useState<'svg' | 'png'>('svg')
  const [copied, setCopied] = useState(false)

  // Fetch existing QR data
  const fetchQR = useCallback(async () => {
    if (!shop?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/menu-qr?shopId=${shop.id}`)
      if (res.ok) {
        const data = await res.json()
        setQrData(data)
      }
    } catch (err) {
      console.error('Fetch QR error:', err)
    } finally {
      setLoading(false)
    }
  }, [shop?.id])

  useEffect(() => {
    fetchQR()
  }, [fetchQR])

  // Generate QR code
  const handleGenerate = async () => {
    if (!shop?.id) return
    setGenerating(true)
    try {
      const res = await fetch('/api/menu-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          format,
          size: format === 'png' ? 1000 : undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erreur de génération')
        return
      }

      const data = await res.json()
      setQrData((prev) => prev ? { ...prev, qrCodeUrl: data.qrData, isRestaurant: true, menuUrl: data.menuUrl } : null)
      // Refresh full data
      await fetchQR()
      toast.success('QR Code Menu généré avec succès !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setGenerating(false)
    }
  }

  // Download QR code
  const handleDownload = () => {
    if (!qrData?.qrCodeUrl) return
    const link = document.createElement('a')
    link.download = `menu-qr-${qrData.shopSlug}.${format === 'svg' ? 'svg' : 'png'}`
    link.href = qrData.qrCodeUrl
    link.click()
    toast.success('Téléchargement lancé !')
  }

  // Copy menu URL
  const handleCopyUrl = async () => {
    if (!qrData?.menuUrl) return
    try {
      await navigator.clipboard.writeText(qrData.menuUrl)
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Skeleton className="h-64 w-64 rounded-2xl" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    )
  }

  const hasQR = !!qrData?.qrCodeUrl
  const accentColor = qrData?.accentColor || shop?.accentColor || '#10B981'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" style={{ color: accentColor }} />
          QR Code de votre boutique
        </CardTitle>
        <CardDescription>
          Générez un QR code que vos clients peuvent scanner pour accéder directement à votre boutique.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-2">
          {qrData?.isRestaurant ? (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              <UtensilsCrossed className="w-3 h-3 mr-1" />
              Mode Restaurant activé
            </Badge>
          ) : (
            <Badge variant="secondary">
              Mode classique
            </Badge>
          )}
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center gap-4">
          {hasQR ? (
            <div className="relative group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <img
                  src={qrData!.qrCodeUrl!}
                  alt={`QR Code - ${qrData!.shopName}`}
                  className="w-56 h-56 sm:w-64 sm:h-64"
                />
              </div>
              {/* Shop name below QR */}
              <p className="text-center text-sm font-semibold text-gray-900 mt-2 truncate max-w-[256px]">
                {qrData!.shopName}
              </p>
              <p className="text-center text-xs text-gray-500">
                {qrData!.menuUrl}
              </p>
            </div>
          ) : (
            <div className="w-56 h-56 sm:w-64 sm:h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400">
              <QrCode className="w-16 h-16" />
              <p className="text-sm text-center px-4">
                Aucun QR code généré.<br />Cliquez ci-dessous pour créer le vôtre.
              </p>
            </div>
          )}
        </div>

        {/* Format selector */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-gray-500">Format :</span>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setFormat('svg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                format === 'svg'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              SVG (Vectoriel)
            </button>
            <button
              onClick={() => setFormat('png')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l ${
                format === 'png'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              PNG (1000px)
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="min-w-[160px]"
            style={{ backgroundColor: accentColor }}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {hasQR ? 'Regénérer' : 'Générer le QR Code'}
          </Button>

          {hasQR && (
            <>
              <Button variant="outline" onClick={handleDownload} className="min-w-[140px]">
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                {copied ? (
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                )}
                {copied ? 'Copié !' : 'Copier le lien'}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={qrData!.menuUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Voir ma boutique
                </a>
              </Button>
            </>
          )}
        </div>

        {/* Print tip */}
        {hasQR && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Astuce :</strong> Le format SVG est recommandé pour l&apos;impression — il reste net à toute taille.
              Téléchargez le fichier et imprimez-le sur du papier cartonné pour une durabilité optimale.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}