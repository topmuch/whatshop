import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkWavePaymentStatus, getBoutikoWaveApiKey, mapWaveStatus } from '@/lib/wave'

// GET /api/payments/wave/[paymentId]/status
// Vérifie le statut d'un paiement (polling pour le client).
// Public endpoint — utilisé par les clients non authentifiés pour les commandes.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId requis' }, { status: 400 })
    }

    // Trouver le paiement en BDD
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        wavePaymentId: true,
        type: true,
        expiresAt: true,
        paidAt: true,
        waveErrorMessage: true,
        // Inclure le statut de la commande si c'est un paiement de commande
        order: {
          select: { id: true, status: true },
        },
        subscription: {
          select: { id: true, status: true, planType: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    // Si le paiement est encore en attente, interroger l'API Wave
    if (payment.status === 'PENDING' && payment.wavePaymentId) {
      // Déterminer quelle clé API utiliser
      let apiKey = getBoutikoWaveApiKey()

      // Pour les paiements de commande, utiliser la clé du marchand
      if (payment.type === 'ORDER') {
        const paymentWithShop = await db.payment.findUnique({
          where: { id: paymentId },
          include: {
            user: {
              include: { waveConfig: true },
            },
          },
        })
        if (paymentWithShop?.user?.waveConfig?.waveApiKey) {
          apiKey = paymentWithShop.user.waveConfig.waveApiKey
        }
      }

      const waveStatus = await checkWavePaymentStatus(payment.wavePaymentId, apiKey || undefined)

      if (waveStatus) {
        const newStatus = mapWaveStatus(waveStatus.status)

        // Mettre à jour en BDD si le statut a changé
        if (newStatus !== payment.status) {
          const updateData: Record<string, unknown> = {
            status: newStatus,
            waveErrorCode: waveStatus.error_code,
            waveErrorMessage: waveStatus.error_message,
          }

          if (newStatus === 'SUCCEEDED' && waveStatus.paid_at) {
            updateData.paidAt = new Date(waveStatus.paid_at)
          }

          await db.payment.update({
            where: { id: paymentId },
            data: updateData,
          })

          // Si le paiement a réussi, déclencher les actions
          if (newStatus === 'SUCCEEDED') {
            // Import dynamique pour éviter la dépendance circulaire
            const { handleSuccessfulPayment } = await import('@/app/api/payments/wave/webhook/route')
            await handleSuccessfulPayment({
              id: paymentId,
              type: payment.type,
              amount: payment.amount,
              orderId: payment.order?.id,
              subscriptionId: payment.subscription?.id,
              order: payment.order,
              subscription: payment.subscription,
            })
          }

          return NextResponse.json({
            ...payment,
            status: newStatus,
            waveStatus: waveStatus.status,
          })
        }
      }

      // Vérifier l'expiration
      if (payment.expiresAt && new Date() > payment.expiresAt) {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: 'EXPIRED' },
        })
        return NextResponse.json({ ...payment, status: 'EXPIRED' })
      }
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('[Wave Check Status] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}