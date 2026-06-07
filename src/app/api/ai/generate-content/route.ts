import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { productName, price, description, shopName, shopSlug } = await request.json()

    if (!productName || !price) {
      return NextResponse.json({ error: 'Nom du produit et prix requis' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `Tu es un expert en marketing pour les commerçants africains. Tu crées du contenu publicitaire engageant pour les produits vendus en Afrique de l'Ouest. Les prix sont en FCFA. Tu parles français. Tu crées du contenu court, percutant et adapté aux réseaux sociaux. Réponds UNIQUEMENT en JSON valide avec cette structure exacte (pas de markdown, pas de backticks) :
{
  "instagram": "Publication Instagram avec emojis, hashtags et CTA",
  "facebook": "Description Facebook détaillée et engageante",  
  "whatsapp": "Message WhatsApp court et convivial pour partage",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`
        },
        {
          role: 'user',
          content: `Produit: ${productName}, Prix: ${price} FCFA${description ? ', Description: ' + description : ''}${shopName ? ', Boutique: ' + shopName : ''}${shopSlug ? ', URL: whatsshop.com/' + shopSlug : ''}. Génère le contenu marketing.`
        }
      ],
      thinking: { type: 'disabled' }
    })

    const response = completion.choices[0]?.message?.content

    let content: {
      instagram: string
      facebook: string
      whatsapp: string
      hashtags: string[]
    }

    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      content = JSON.parse(cleaned)
    } catch {
      content = { instagram: response, facebook: response, whatsapp: response, hashtags: [] }
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('AI content generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du contenu' }, { status: 500 })
  }
}
