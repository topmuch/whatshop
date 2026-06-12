'use client'

import { useAppStore, type Product } from '@/lib/store'
import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Radio,
  Square,
  Pin,
  Tag,
  Clock,
  MessageCircle,
  Volume2,
  VolumeX,
  Plus,
  AlertTriangle,
  Star,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/shared'

// ─── Sound Helper ─────────────────────────────────────────────────────────────

function playDingSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 830
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    // Audio not supported
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardLive() {
  const { shop } = useAppStore()

  // ── Socket ──
  const socketRef = useRef<Socket | null>(null)

  // ── State ──
  const [isLive, setIsLive] = useState(false)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState('00:00')
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  const [pinnedProductId, setPinnedProductId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState<{ code: string; discountPercent: number } | null>(null)
  const [whatsappClicks, setWhatsappClicks] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [connectedViewers, setConnectedViewers] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [promoDiscount, setPromoDiscount] = useState('')

  // ── Callbacks to latest state (for socket listeners) ──
  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  const pinnedProductIdRef = useRef(pinnedProductId)
  pinnedProductIdRef.current = pinnedProductId

  const promoCodeRef = useRef(promoCode)
  promoCodeRef.current = promoCode

  const endTimeRef = useRef(endTime)
  endTimeRef.current = endTime

  const productsRef = useRef(products)
  productsRef.current = products

  // ── Fetch Products ──
  useEffect(() => {
    if (!shop) return
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/shops/${shop.slug}/products`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch {
        toast.error('Erreur lors du chargement des produits')
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [shop])

  // ── Socket.IO Connection ──
  useEffect(() => {
    if (!shop) return

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('seller:join', { shopId: shop.id, shopSlug: shop.slug })
    })

    // Receive click updates from viewers
    socket.on('live:clickUpdate', (data: { total: number }) => {
      setWhatsappClicks(data.total)
      if (soundEnabledRef.current) {
        playDingSound()
      }
    })

    // Receive live state from server
    socket.on('live:stateUpdate', (data: {
      isLive: boolean
      endTime?: number
      startTime?: number
      pinnedProductId?: string | null
      promoCode?: { code: string; discountPercent: number } | null
      viewers?: number
    }) => {
      setIsLive(data.isLive)
      if (data.endTime) setEndTime(data.endTime)
      else setEndTime(null)
      if (data.startTime) setStartTime(data.startTime)
      else setStartTime(null)
      if (data.pinnedProductId !== undefined) setPinnedProductId(data.pinnedProductId)
      if (data.promoCode !== undefined) setPromoCode(data.promoCode)
      if (data.viewers !== undefined) setConnectedViewers(data.viewers)
    })

    // Receive viewer count updates
    socket.on('live:viewers', (data: { count: number }) => {
      setConnectedViewers(data.count)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [shop])

  // ── Countdown Timer & Elapsed Timer ──
  useEffect(() => {
    if (!isLive) {
      setTimeLeft('00:00')
      setElapsedTime('00:00:00')
      return
    }

    function tick() {
      // Elapsed time
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const h = Math.floor(elapsed / 3600)
        const m = Math.floor((elapsed % 3600) / 60)
        const s = elapsed % 60
        setElapsedTime(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        )
      }

      // Remaining time
      if (endTime) {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        const minutes = Math.floor(remaining / 60)
        const seconds = remaining % 60
        setTimeLeft(
          `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        )
        if (remaining <= 0) {
          setIsLive(false)
          setEndTime(null)
          setStartTime(null)
          setPinnedProductId(null)
          setPromoCode(null)
          toast.info('Le live est terminé !')
        }
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isLive, endTime, startTime])

  // ── Actions ──
  function handleToggleLive() {
    if (!socketRef.current) return
    if (!isLive) {
      // Start live for 30 minutes
      const newEnd = Date.now() + 30 * 60 * 1000
      const newStart = Date.now()
      socketRef.current.emit('live:toggle', { isLive: true, endTime: newEnd, startTime: newStart })
      setEndTime(newEnd)
      setStartTime(newStart)
      setIsLive(true)
      setWhatsappClicks(0)
      setPinnedProductId(null)
      setPromoCode(null)
      // Auto-pin first available product
      const firstAvailable = productsRef.current.find((p) => p.isAvailable && (p.image || (p.images && p.images[0])))
      if (firstAvailable) {
        setPinnedProductId(firstAvailable.id)
        socketRef.current.emit('live:pin', { productId: firstAvailable.id })
      }
      toast.success('Live démarré !')
    } else {
      socketRef.current.emit('live:toggle', { isLive: false })
      setIsLive(false)
      setEndTime(null)
      setStartTime(null)
      setPinnedProductId(null)
      setPromoCode(null)
      toast.info('Live arrêté.')
    }
  }

  function handleExtend(minutes: number) {
    if (!socketRef.current || !endTimeRef.current) return
    const newEnd = endTimeRef.current + minutes * 60 * 1000
    socketRef.current.emit('live:extend', { endTime: newEnd })
    setEndTime(newEnd)
    toast.success(`+${minutes} min ajoutées`)
  }

  function handlePinProduct(productId: string) {
    if (!socketRef.current) return
    const newPinned = pinnedProductIdRef.current === productId ? null : productId
    socketRef.current.emit('live:pin', { productId: newPinned })
    setPinnedProductId(newPinned)
  }

  function handleOutOfStock(productId: string) {
    if (!socketRef.current) return
    socketRef.current.emit('live:outOfStock', { productId })
    toast.info('Produit marqué comme épuisé')
  }

  function handleActivatePromo() {
    if (!socketRef.current) return
    const code = promoInput.trim().toUpperCase()
    const discount = parseInt(promoDiscount, 10)
    if (!code || isNaN(discount) || discount <= 0 || discount > 100) {
      toast.error('Veuillez entrer un code valide et un pourcentage entre 1 et 100')
      return
    }
    const promo = { code, discountPercent: discount }
    socketRef.current.emit('live:promo', promo)
    setPromoCode(promo)
    setPromoInput('')
    setPromoDiscount('')
    toast.success(`Promo "${code}" activée ! -${discount}%`)
  }

  // ── Render ──

  if (!shop) {
    return (
      <div className="bg-gray-950 text-white flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <p className="text-gray-400 text-lg">Aucune boutique configurée</p>
          <p className="text-gray-500 text-sm">Veuillez créer une boutique avant de lancer un live.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 text-white">
      {/* ─── Header Bar ─── */}
      <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              🎙️ Contrôle Live
            </h1>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-sm">
              {shop.name}
            </Badge>
            {isLive && (
              <Badge className="bg-red-600 text-white animate-pulse">EN DIRECT</Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Elapsed timer */}
            {isLive && (
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                <Clock className="h-4 w-4 text-red-400" />
                <span className="font-mono text-sm text-red-400 tabular-nums">{elapsedTime}</span>
              </div>
            )}

            {/* WhatsApp clicks */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">{whatsappClicks}</span>
              <span className="text-xs text-emerald-400/80 hidden sm:inline">commandes envoyées</span>
            </div>

            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        {/* ─── Pinned Product (prominently at top when live) ─── */}
        {isLive && pinnedProductId && (() => {
          const pinnedProduct = products.find((p) => p.id === pinnedProductId)
          if (!pinnedProduct) return null
          const pinnedImage = pinnedProduct.image || (pinnedProduct.images && pinnedProduct.images[0])
          return (
            <section className="bg-gradient-to-br from-yellow-500/10 via-gray-900 to-gray-900 border-2 border-yellow-500/40 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-yellow-300">Produit épinglé</h2>
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 gap-1 ml-auto">
                  <Star className="h-3 w-3" /> En vedette
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800 border border-yellow-500/30">
                  {pinnedImage ? (
                    <img src={pinnedImage} alt={pinnedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">📦</div>
                  )}
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black p-0.5 rounded-bl-lg">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{pinnedProduct.name}</p>
                  <p className="text-xl font-bold text-yellow-400">{formatPrice(pinnedProduct.price)}</p>
                  {pinnedProduct.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{pinnedProduct.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOutOfStock(pinnedProduct.id)}
                    className="text-xs gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    ÉPUISÉ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePinProduct(pinnedProduct.id)}
                    className="text-xs gap-1 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Pin className="h-3 w-3" />
                    Désépingler
                  </Button>
                </div>
              </div>
            </section>
          )
        })()}

        {/* ─── Live Status Controller ─── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Big toggle button */}
            <Button
              onClick={handleToggleLive}
              className={`
                h-14 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl font-bold rounded-xl
                transition-all duration-300 w-full sm:w-auto
                ${isLive
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }
              `}
            >
              {isLive ? (
                <>
                  <Square className="h-6 w-6" />
                  🔴 ARRÊTER LE LIVE
                </>
              ) : (
                <>
                  <Radio className="h-6 w-6" />
                  ▶️ DÉMARRER LE LIVE
                </>
              )}
            </Button>

            {/* Countdown + extend (only when live) */}
            {isLive && endTime && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Durée</span>
                    <span className="font-mono text-lg text-white tabular-nums">{elapsedTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">Temps restant</span>
                </div>
                <p className="text-4xl sm:text-5xl font-mono font-bold text-red-500 tabular-nums tracking-wider">
                  {timeLeft}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExtend(5)}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> +5 min
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExtend(10)}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> +10 min
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column: Product Pin + Stats ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Produit épinglé selector */}
            {isLive && (
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Pin className="h-5 w-5 text-yellow-400" />
                    📌 Produit épinglé
                  </h2>
                </div>

                {loadingProducts ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-28 rounded-lg bg-gray-800" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Aucun produit disponible</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                    {products.map((product) => {
                      const isPinned = pinnedProductId === product.id
                      return (
                        <button
                          key={product.id}
                          onClick={() => handlePinProduct(product.id)}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200
                            bg-gray-800/50 border
                            ${isPinned
                              ? 'border-yellow-500/60 bg-yellow-500/10 shadow-lg shadow-yellow-500/10'
                              : 'border-gray-700/50 hover:border-gray-600 hover:bg-gray-800'
                            }
                          `}
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                            {product.image || (product.images && product.images.length > 0) ? (
                              <img
                                src={product.image || product.images![0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                📦
                              </div>
                            )}
                            {isPinned && (
                              <div className="absolute top-0 right-0 bg-yellow-500 text-black p-0.5 rounded-bl-md">
                                <Star className="h-3 w-3 fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isPinned ? 'text-yellow-300' : 'text-white'}`}>
                              {product.name}
                            </p>
                            <p className={`text-sm font-bold ${isPinned ? 'text-yellow-400' : 'text-emerald-400'}`}>
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {!isLive && (
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                    <Radio className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-300">Live non démarré</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Appuyez sur &quot;Démarrer le Live&quot; pour commencer votre session
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Stats Panel */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                📊 Statistiques en Direct
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                  <MessageCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{whatsappClicks}</p>
                  <p className="text-xs text-gray-400 mt-1">Clics WhatsApp</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                  <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-400 font-mono tabular-nums">
                    {isLive ? elapsedTime : '00:00:00'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Durée du live</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50 col-span-2 sm:col-span-1">
                  <Radio className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold text-purple-400">{connectedViewers}</p>
                  <p className="text-xs text-gray-400 mt-1">Spectateurs connectés</p>
                </div>
              </div>
            </section>
          </div>

          {/* ─── Right Column: Promo Code ─── */}
          <div className="space-y-6">
            {/* Promo Code Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-pink-400" />
                🏷️ Code Promo
              </h2>

              {/* Active promo display */}
              {promoCode && (
                <div className="mb-4 bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-pink-400/70 mb-1">Code actif</p>
                  <p className="text-xl font-bold text-pink-400 tracking-wider">{promoCode.code}</p>
                  <Badge className="mt-2 bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    -{promoCode.discountPercent}%
                  </Badge>
                </div>
              )}

              {/* Promo form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nom du code</label>
                  <Input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER24"
                    maxLength={20}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    disabled={!isLive}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Réduction (%)</label>
                  <Input
                    type="number"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(e.target.value)}
                    placeholder="e.g. 15"
                    min={1}
                    max={100}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    disabled={!isLive}
                  />
                </div>
                <Button
                  onClick={handleActivatePromo}
                  disabled={!isLive || !promoInput.trim() || !promoDiscount}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2"
                >
                  <Check className="h-4 w-4" />
                  Activer
                </Button>
                {!isLive && (
                  <p className="text-xs text-gray-500 text-center">
                    Démarrez le live pour activer un code promo
                  </p>
                )}
              </div>
            </section>

            {/* Quick Info */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Volume2 className="h-5 w-5 text-orange-400" />
                🔔 Notifications
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Son &quot;Ding&quot; WhatsApp</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`gap-1.5 text-xs ${
                      soundEnabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    {soundEnabled ? (
                      <><Volume2 className="h-3.5 w-3.5" /> Activé</>
                    ) : (
                      <><VolumeX className="h-3.5 w-3.5" /> Désactivé</>
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Boutique</span>
                  <span className="text-sm text-gray-300 font-medium">{shop.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">WhatsApp</span>
                  <span className="text-sm text-gray-300 font-medium">{shop.whatsapp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Produits</span>
                  <span className="text-sm text-gray-300 font-medium">{products.length}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  )
}
