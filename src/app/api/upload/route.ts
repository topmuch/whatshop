import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { UPLOADS_DIR } from '@/lib/storage'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
]

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  }
  return map[mimeType] || '.jpg'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé (${file.type}). Utilisez JPG, PNG, GIF ou WebP.` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max 5 Mo.` },
        { status: 400 }
      )
    }

    // Generate unique filename to avoid collisions
    const ext = getExtension(file.type)
    const uniqueId = crypto.randomBytes(12).toString('hex')
    const filename = `${uniqueId}${ext}`
    const subDir = 'images' // subdirectory for organization

    // Ensure upload directory exists
    const targetDir = path.join(UPLOADS_DIR, subDir)
    await mkdir(targetDir, { recursive: true })

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(targetDir, filename)
    await writeFile(filePath, buffer)

    // Return the URL path (served via /uploads/ -> /api/uploads/ rewrite)
    const url = `/uploads/${subDir}/${filename}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('[/api/upload] Error:', error)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}