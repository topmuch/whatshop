/**
 * POST /api/social/publish — Publish a product post to Facebook Page
 *
 * Flow:
 *  1. Auth + shop ownership check
 *  2. Decrypt stored Facebook page access token
 *  3. Call Facebook Graph API to publish (with image if provided)
 *  4. Save SocialPost to DB
 *  5. Create notification for the seller
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { decryptToken } from '@/lib/facebook-capi'
import { createNotification } from '@/lib/notifications'
import { logger } from '@/lib/logger'

const FB_GRAPH = 'https://graph.facebook.com/v21.0'

interface PublishBody {
  shopId: string
  productId?: string
  content: string
  imageUrl?: string
}

async function publishToFacebook(
  pageId: string,
  accessToken: string,
  message: string,
  photoUrl?: string
): Promise<{ postId: string; error?: string }> {
  if (photoUrl) {
    // Post with photo: first upload photo, then post with attached photo
    const photoRes = await fetch(
      `${FB_GRAPH}/${pageId}/photos?url=${encodeURIComponent(photoUrl)}&access_token=${encodeURIComponent(accessToken)}&published=false`,
      { method: 'POST' }
    )
    const photoData = await photoRes.json()
    if (!photoRes.ok || !photoData.id) {
      return { postId: '', error: photoData.error?.message || 'Failed to upload photo to Facebook' }
    }

    // Now create post with the uploaded photo attached
    const postRes = await fetch(`${FB_GRAPH}/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        attached_media: JSON.stringify([{ media_fbid: photoData.id }]),
        access_token: accessToken,
      }),
    })
    const postData = await postRes.json()
    if (!postRes.ok || !postData.id) {
      return { postId: '', error: postData.error?.message || 'Failed to create post on Facebook' }
    }
    return { postId: postData.id }
  }

  // Text-only post
  const postRes = await fetch(`${FB_GRAPH}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: accessToken }),
  })
  const postData = await postRes.json()
  if (!postRes.ok || !postData.id) {
    return { postId: '', error: postData.error?.message || 'Failed to create post on Facebook' }
  }
  return { postId: postData.id }
}

async function publishWithRetry(
  pageId: string,
  accessToken: string,
  message: string,
  photoUrl?: string,
  retries = 2
): Promise<{ postId: string; error?: string }> {
  let lastError = ''
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await publishToFacebook(pageId, accessToken, message, photoUrl)
    if (result.postId) return result
    lastError = result.error || 'Unknown error'
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      logger.warn(`Facebook publish retry ${attempt + 1}/${retries}: ${lastError}`, 'SocialPublish')
    }
  }
  return { postId: '', error: lastError }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError

    const body = (await request.json()) as PublishBody
    const { shopId, productId, content, imageUrl } = body

    if (!shopId || !content?.trim()) {
      return NextResponse.json(
        { error: 'shopId et content sont requis' },
        { status: 400 }
      )
    }

    // Verify shop ownership
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        facebookConnected: true,
        facebookPageId: true,
        facebookPageName: true,
        facebookAccessToken: true,
      },
    })

    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    if (!shop.facebookConnected || !shop.facebookPageId || !shop.facebookAccessToken) {
      return NextResponse.json(
        { error: 'Facebook n\'est pas connecté. Connectez votre page Facebook d\'abord.' },
        { status: 400 }
      )
    }

    // Resolve product info if referenced
    let productName = ''
    let productSlug = ''
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, slug: true, shopId: true },
      })
      if (!product || product.shopId !== shopId) {
        return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
      }
      productName = product.name
      productSlug = product.slug || product.id
    }

    // Decrypt access token
    let accessToken: string
    try {
      accessToken = decryptToken(shop.facebookAccessToken)
    } catch {
      return NextResponse.json(
        { error: 'Token Facebook invalide. Reconnectez votre page.' },
        { status: 400 }
      )
    }

    // Build post message with product link
    const shopUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/${shop.slug}`
      : `https://boutiko.pro/${shop.slug}`

    let fullMessage = content
    if (productId) {
      const productUrl = `${shopUrl}/p/${productSlug}`
      fullMessage = `${content}\n\n${productName}\n${productUrl}`
    }

    // Publish to Facebook with retry
    const result = await publishWithRetry(
      shop.facebookPageId,
      accessToken,
      fullMessage,
      imageUrl
    )

    // Save post to DB
    const socialPost = await db.socialPost.create({
      data: {
        shopId,
        productId: productId || null,
        content: fullMessage,
        imageUrl: imageUrl || null,
        facebookPostId: result.postId || null,
        status: result.postId ? 'PUBLISHED' : 'FAILED',
        errorMessage: result.error || null,
      },
    })

    // Create notification
    if (result.postId) {
      await createNotification(
        'SOCIAL_POST_PUBLISHED',
        'Publication Facebook réussie',
        `Votre post sur "${productName || shop.name}" a été publié sur ${shop.facebookPageName || 'votre page Facebook'}.`,
        { shopId, socialPostId: socialPost.id, facebookPostId: result.postId, platform: 'FACEBOOK' },
        user.id
      )
    } else {
      await createNotification(
        'SOCIAL_POST_FAILED',
        'Échec de la publication Facebook',
        `La publication a échoué : ${result.error}`,
        { shopId, socialPostId: socialPost.id, error: result.error },
        user.id
      )
    }

    const status = result.postId ? 200 : 207
    return NextResponse.json({
      success: !!result.postId,
      postId: socialPost.id,
      facebookPostId: result.postId || null,
      error: result.error || null,
      status: result.postId ? 'PUBLISHED' : 'FAILED',
    }, { status })
  } catch (error) {
    logger.error(`Social publish error: ${error instanceof Error ? error.message : error}`, 'SocialPublish')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la publication' },
      { status: 500 }
    )
  }
}