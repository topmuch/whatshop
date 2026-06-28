import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { requireShopOwner } from '@/lib/auth'
import { UPLOADS_DIR } from '@/lib/storage'
import { ensureUploadsDir } from '@/lib/ensure-uploads'

export const dynamic = 'force-dynamic'

// Allowed mime types for product images
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// ─── POST /api/upload ────────────────────────────────────────────────────────
// Auth required — shop owner only. Uploads a file and returns its URL.
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé : ${file.type}. Types acceptés : image/jpeg, image/png, image/webp, image/gif, image/svg+xml` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum : 5 MB` },
        { status: 400 }
      )
    }

    // Ensure uploads directory exists
    await ensureUploadsDir()

    // Generate a unique filename to avoid collisions
    const ext = path.extname(file.name) || getExtFromMime(file.type)
    const uniqueName = `${crypto.randomUUID()}${ext}`
    const filePath = path.join(UPLOADS_DIR, uniqueName)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Return the URL that can be used to access the file
    // The rewrite in next.config.ts maps /uploads/* → /api/uploads/*
    const url = `/uploads/${uniqueName}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur serveur lors du téléchargement' }, { status: 500 })
  }
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
  }
  return map[mime] || '.bin'
}