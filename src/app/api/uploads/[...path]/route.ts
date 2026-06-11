import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params

    // Construire le chemin complet vers l'image
    const imagePath = path.join(UPLOADS_DIR, ...pathSegments)

    // Sécurité : s'assurer qu'on ne sort pas du dossier uploads
    const resolvedPath = path.resolve(imagePath)
    const resolvedUploadsDir = path.resolve(UPLOADS_DIR)
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Lire le fichier
    const imageBuffer = await fs.readFile(resolvedPath)

    // Déterminer le type de contenu
    const contentType = getContentType(resolvedPath)

    // Retourner l'image avec les bons headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'image:', error)
    return NextResponse.json(
      { error: 'Image non trouvée' },
      { status: 404 }
    )
  }
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
  }
  return types[ext] || 'application/octet-stream'
}