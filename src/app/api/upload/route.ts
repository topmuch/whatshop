import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { UPLOADS_DIR } from '@/lib/storage'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
])

// Max file size: 5 MB
const MAX_SIZE = 5 * 1024 * 1024

// MIME → extension
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé (${file.type}). Utilisez JPG, PNG, GIF ou WebP.` },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum 5 MB.` },
        { status: 400 },
      )
    }

    // Validate minimum size (not empty)
    if (file.size === 0) {
      return NextResponse.json({ error: 'Fichier vide' }, { status: 400 })
    }

    // Generate unique filename: {randomId}.{ext}
    const ext = EXT_MAP[file.type] || 'jpg'
    const randomId = crypto.randomBytes(12).toString('hex')
    const filename = `${randomId}.${ext}`

    // Organize by month/year subfolder to avoid too many files in one dir
    const now = new Date()
    const subfolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const relativeDir = path.join(subfolder)
    const absoluteDir = path.join(UPLOADS_DIR, relativeDir)

    // Ensure directory exists
    await mkdir(absoluteDir, { recursive: true })

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(absoluteDir, filename)
    await writeFile(filePath, buffer)

    // Build the public URL (served by /api/uploads/[...path] via rewrite)
    const url = `/uploads/${relativeDir}/${filename}`

    logger.info(`File uploaded: ${url} (${(file.size / 1024).toFixed(1)} KB)`, 'Upload')

    return NextResponse.json({ url })
  } catch (error) {
    logger.error('Upload failed', 'Upload', error)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}