import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createWavePayment, mapWaveStatus } from '@/lib/wave'
import { PLAN_CONFIGS } from '@/lib/permissions'
import { PlanType } from '@prisma/client'

// POST /api/payments/wave/create
// Crée un paiement Wave pour :
//   - type=SUBSCRIPTION : abonnement marchand → compte Wave Boutiko
//   - type=ORDER : commande client → compte Wave du marchand

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, planType, orderId, shopId, clientPhoneNumber } = body as {
      type: 'SUBSCRIPTION' | 'ORDER'
      planType?: PlanType
      orderId?: string
      shopId?: string
      clientPhoneNumber?: string
    }

    if (!type || !['SUBSCRIPTION', 'ORDER'].includes(type)) {
      return NextResponse.json({ error: 'Type de paiement invalide' }, { status: 400 })
    }

    // ─── PAIEMENT ABONNEMENT ─────────────────────────────────────────────
    if (type === 'SUBSCRIPTION') {
      const { user, response: errorResponse } = await requireAuth(request)
      if (errorResponse) return errorResponse
      if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

      if (!planType || !PLAN_CONFIGS[planType]) {
        return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
      }

      const amount = PLAN_CONFIGS[planType].price
      const description = `Abonnement Boutiko - Plan ${PLAN_CONFIGS[planType].label}`

      // Vérifier s'il n'y a pas déjà un paiement en cours pour cet abonnement
      const subscription = await db.subscription.findUnique({ where: { userId: user.id } })
      if (subscription) {
        const existingPayment = await db.payment.findFirst({
          where: {
            subscriptionId: subscription.id,
            status: { in: ['PENDING', 'PROCESSING'] },
          },
        })
        if (existingPayment) {
          // Retourner le paiement existant
          return NextResponse.json({
            paymentId: existingPayment.id,
            wavePaymentId: existingPayment.wavePaymentId,
            checkoutUrl: existingPayment.waveCheckoutUrl,
            status: existingPayment.status,
            amount: existingPayment.amount,
          })
        }
      }

      // Récupérer la clé API Wave de Boutiko
      const saasConfig = await db.saasConfig.findFirst()
      const boutikoApiKey = saasConfig?.waveApiKey || process.env.WAVE_API_KEY

      if (!boutikoApiKey) {
        return NextResponse.json({
          error: 'Le paiement Wave n\'est pas encore configuré par l\'administrateur.',
          error_code: 'WAVE_NOT_CONFIGURED',
        }, { status: 503 })
      }

      // Créer le paiement Wave
      const waveResult = await createWavePayment({
        amount,
        description,
        clientPhoneNumber,
      })

      if (!waveResult.success) {
        return NextResponse.json({
          error: waveResult.error,
          error_code: waveResult.error_code,
        }, { status: 400 })
      }

      // Récupérer ou créer la subscription
      let subId = subscription?.id
      if (!subId) {
        const newSub = await db.subscription.create({
          data: {
            userId: user.id,
            planType: 'LIVE', // temporaire, sera mis à jour au paiement
            status: 'TRIAL',
            maxShops: 1,
          },
        })
        subId = newSub.id
      }

      // Enregistrer le paiement en BDD
      const payment = await db.payment.create({
        data: {
          provider: 'WAVE',
          type: 'SUBSCRIPTION',
          status: 'PENDING',
          amount,
          currency: 'XOF',
          description,
          wavePaymentId: waveResult.paymentId,
          waveCheckoutUrl: waveResult.checkoutUrl,
          wavePhoneNumber: clientPhoneNumber,
          subscriptionId: subId,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        },
      })

      return NextResponse.json({
        paymentId: payment.id,
        wavePaymentId: payment.wavePaymentId,
        checkoutUrl: payment.waveCheckoutUrl,
        status: payment.status,
        amount: payment.amount,
        description: payment.description,
      })
    }

    // ─── PAIEMENT COMMANDE ───────────────────────────────────────────────
    if (type === 'ORDER') {
      if (!orderId || !shopId) {
        return NextResponse.json({ error: 'orderId et shopId requis' }, { status: 400 })
      }

      // Vérifier que la commande existe et est en attente
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { shop: true },
      })

      if (!order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
      }

      if (order.paymentId) {
        return NextResponse.json({ error: 'Cette commande a déjà un paiement associé' }, { status: 409 })
      }

      if (!['PENDING'].includes(order.status)) {
        return NextResponse.json({ error: 'Cette commande ne peut plus être payée' }, { status: 400 })
      }

      // Récupérer la config Wave du marchand (propriétaire de la boutique)
      const shopOwner = await db.user.findUnique({
        where: { id: order.shop.ownerId },
        include: { waveConfig: true },
      })

      if (!shopOwner?.waveConfig?.isActive) {
        return NextResponse.json({
          error: 'Le marchand n\'a pas configuré Wave pour recevoir les paiements.',
          error_code: 'MERCHANT_WAVE_NOT_CONFIGURED',
        }, { status: 503 })
      }

      const amount = order.total
      const description = `Commande ${order.id.slice(-8).toUpperCase()} - ${order.shop.name}`

      // Créer le paiement Wave vers le compte du marchand
      const waveResult = await createWavePayment({
        amount,
        description,
        clientPhoneNumber: clientPhoneNumber || order.customerPhone || undefined,
        merchantWavePhone: shopOwner.waveConfig.wavePhoneNumber,
        merchantWaveApiKey: shopOwner.waveConfig.waveApiKey || undefined,
      })

      if (!waveResult.success) {
        return NextResponse.json({
          error: waveResult.error,
          error_code: waveResult.error_code,
        }, { status: 400 })
      }

      // Enregistrer le paiement
      const payment = await db.payment.create({
        data: {
          provider: 'WAVE',
          type: 'ORDER',
          status: 'PENDING',
          amount,
          currency: 'XOF',
          description,
          wavePaymentId: waveResult.paymentId,
          waveCheckoutUrl: waveResult.checkoutUrl,
          wavePhoneNumber: clientPhoneNumber || order.customerPhone,
          orderId: order.id,
          shopId: order.shopId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      })

      return NextResponse.json({
        paymentId: payment.id,
        wavePaymentId: payment.wavePaymentId,
        checkoutUrl: payment.waveCheckoutUrl,
        status: payment.status,
        amount: payment.amount,
        description: payment.description,
      })
    }

  } catch (error) {
    console.error('[Wave Create Payment] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}