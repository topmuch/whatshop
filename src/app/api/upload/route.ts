import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'
import { ensureUploadsDir, ensureUploadsSubdir } from '@/lib/ensure-uploads'

export const runtime = 'nodejs'

// Allowed image MIME types
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/bmp',
])

// Max file size: 5 MB
const MAX_SIZE = 5 * 1024 * 1024

// Extension map for MIME types
const EXT_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'image/bmp': '.bmp',
}

/**
 * POST /api/upload — Upload a file (multipart/form-data).
 *
 * Accepts a single `file` field. Returns `{ url: "/uploads/<subdir>/<filename>" }`.
 *
 * Auth: required (iron-session). The `subdir` query param controls the
 * sub-directory under uploads/ (defaults to "logos").
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé. Formats acceptés : JPG, PNG, GIF, WebP, SVG, ICO.` },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo).' },
        { status: 400 },
      )
    }

    // Determine subdirectory from query param
    const { searchParams } = new URL(request.url)
    const subdir = searchParams.get('subdir') || 'logos'

    // Ensure directories exist
    await ensureUploadsDir()
    await ensureUploadsSubdir(subdir)

    // Generate a unique filename to avoid collisions
    const ext = EXT_MAP[file.type] || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const relativePath = `${subdir}/${filename}`
    const absolutePath = path.join(UPLOADS_DIR, relativePath)

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(absolutePath, buffer)

    // Return the public URL (served by /api/uploads/[...path] route)
    const url = `/uploads/${relativePath}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('[upload] Error:', error)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}