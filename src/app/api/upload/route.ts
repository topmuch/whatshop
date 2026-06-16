import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { requireAuth } from '@/lib/auth'
import { UPLOADS_DIR } from '@/lib/storage'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
])

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * POST /api/upload
 * Upload a file to the local uploads directory.
 * Returns { url: "/api/uploads/<subdir>/<filename>" }
 */
export async function POST(request: NextRequest) {
  try {
    // Auth required
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Validate type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé. Formats acceptés : JPG, PNG, GIF, WebP, SVG` },
        { status: 400 },
      )
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_SIZE / 1024 / 1024} Mo)` },
        { status: 400 },
      )
    }

    // Ensure uploads/products directory exists
    const subdir = 'products'
    const dir = path.join(UPLOADS_DIR, subdir)
    await mkdir(dir, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${crypto.randomUUID()}${ext}`
    const filepath = path.join(dir, filename)

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    // Return the URL that will serve the file
    const url = `/api/uploads/${subdir}/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}