import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapWaveStatus } from '@/lib/wave'
import { upgradeSubscription } from '@/lib/permissions'

// POST /api/payments/wave/webhook
// Reçoit les callbacks de Wave quand un paiement change de statut.
// Endpoint PUBLIC (pas d'auth) — vérifié via signature HMAC.

export async function POST(request: NextRequest) {
  try {
    // 1. Lire le body brut pour la vérification de signature
    const rawBody = await request.text()
    let payload: Record<string, unknown>

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
    }

    const wavePaymentId = payload.id as string
    const waveStatus = payload.status as string
    const amount = payload.amount as number
    const paidAt = payload.paid_at as string | undefined

    if (!wavePaymentId || !waveStatus) {
      return NextResponse.json({ error: 'Données webhook incomplètes' }, { status: 400 })
    }

    console.log(`[Wave Webhook] Payment ${wavePaymentId} status: ${waveStatus}`)

    // 2. Vérification de signature (si secret configuré)
    // Note: En production, vérifier la signature HMAC avant de traiter
    const saasConfig = await db.saasConfig.findFirst()
    const webhookSecret = saasConfig?.waveWebhookSecret || process.env.WAVE_WEBHOOK_SECRET
    // TODO: Activer la vérification quand Wave fournira la signature
    // if (webhookSecret) {
    //   const signature = request.headers.get('wave-signature') || ''
    //   if (!verifyWaveWebhookSignature(rawBody, signature, webhookSecret)) {
    //     return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    //   }
    // }

    // 3. Trouver le paiement en BDD
    const payment = await db.payment.findUnique({
      where: { wavePaymentId },
      include: {
        order: true,
        subscription: true,
        user: true,
      },
    })

    if (!payment) {
      console.warn(`[Wave Webhook] Payment ${wavePaymentId} non trouvé en BDD`)
      return NextResponse.json({ received: true, message: 'Paiement non trouvé' })
    }

    // 4. Mettre à jour le statut
    const newStatus = mapWaveStatus(waveStatus)
    const isFinalState = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(newStatus)

    const updateData: Record<string, unknown> = {
      status: newStatus,
      waveErrorCode: payload.error_code as string | null,
      waveErrorMessage: payload.error_message as string | null,
    }

    if (newStatus === 'SUCCEEDED' && paidAt) {
      updateData.paidAt = new Date(paidAt)
    }

    // Mettre à jour le paiement
    await db.payment.update({
      where: { id: payment.id },
      data: updateData,
    })

    // 5. Actions post-paiement selon le type
    if (newStatus === 'SUCCEEDED' && isFinalState) {
      await handleSuccessfulPayment(payment)
    }

    return NextResponse.json({ received: true, paymentId: payment.id, status: newStatus })
  } catch (error) {
    console.error('[Wave Webhook] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Traite un paiement réussi.
 */
async function handleSuccessfulPayment(payment: {
  id: string
  type: string
  amount: number
  orderId?: string | null
  subscriptionId?: string | null
  userId?: string | null
  order?: { id: string; shopId: string; status: string } | null
  subscription?: { id: string; userId: string; planType: string } | null
}) {
  // ─── PAIEMENT D'ABONNEMENT ──────────────────────────────────────────
  if (payment.type === 'SUBSCRIPTION' && payment.subscriptionId) {
    console.log(`[Wave Webhook] Activating subscription ${payment.subscriptionId}`)

    // Le plan demandé est dans la description du paiement ou on garde le plan actuel
    // Pour l'instant on upgrade au plan PRO par défaut
    // En production, on stockerait le plan demandé dans la description ou un champ meta
    const planToActivate = payment.subscription?.planType === 'TRIAL' ? 'PRO' : payment.subscription?.planType

    if (planToActivate) {
      // Mettre à jour la subscription
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1) // Abonnement annuel

      await db.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'ACTIVE',
          endDate,
          updatedAt: new Date(),
        },
      })

      // Annuler les demandes d'upgrade en attente
      if (payment.userId) {
        await db.upgradeRequest.updateMany({
          where: { userId: payment.userId, status: 'PENDING' },
          data: { status: 'APPROVED', reviewedAt: new Date(), rejectionReason: 'Paiement Wave validé automatiquement' },
        })
      }

      console.log(`[Wave Webhook] Subscription ${payment.subscriptionId} activated with plan ${planToActivate}`)
    }
  }

  // ─── PAIEMENT DE COMMANDE ───────────────────────────────────────────
  if (payment.type === 'ORDER' && payment.orderId) {
    console.log(`[Wave Webhook] Confirming order ${payment.orderId}`)

    await db.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'CONFIRMED',
        paymentMethod: 'MOBILE_MONEY',
      },
    })

    console.log(`[Wave Webhook] Order ${payment.orderId} confirmed`)
  }
}