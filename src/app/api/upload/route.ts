import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { rateLimit } from '@/lib/rate-limit'

// Taille max : 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Extensions autorisées
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit('upload', request)
    if (rateLimitResult) return rateLimitResult

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo)' },
        { status: 400 }
      )
    }

    // Vérifier l'extension
    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Extension non autorisée. Extensions acceptées : ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 9)
    const fileName = `${timestamp}-${randomString}${ext}`

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = '/app/uploads'
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch {
      // Le dossier existe déjà
    }

    const filePath = path.join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Écrire le fichier
    await writeFile(filePath, buffer)

    // Retourner l'URL pour accéder à l'image
    const imageUrl = `/api/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
      path: fileName,
    })
  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}