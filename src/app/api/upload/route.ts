import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { UPLOADS_DIR } from '@/lib/storage'
import { ensureUploadsSubdir } from '@/lib/ensure-uploads'

// ─── Config ──────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]

// ─── POST /api/upload ───────────────────────────────────────────────────────
// Accepts FormData with a "file" field.
// Optional query param: ?dir=products|categories|logos|pwa (default: "products")
// Returns: { url: "/uploads/<dir>/<filename>" }

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP ou SVG.' },
        { status: 400 }
      )
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)` },
        { status: 400 }
      )
    }

    // Determine subdirectory from query param
    const url = new URL(request.url)
    const dir = ['products', 'categories', 'logos', 'pwa'].includes(url.searchParams.get('dir') || '')
      ? url.searchParams.get('dir')!
      : 'products'

    // Ensure directory exists
    await ensureUploadsSubdir(dir)

    // Generate unique filename: timestamp + random hex + original extension
    const ext = path.extname(file.name) || '.jpg'
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
    const relativePath = path.join(dir, uniqueName)
    const absolutePath = path.join(UPLOADS_DIR, relativePath)

    // Write file to disk
    const bytes = new Uint8Array(await file.arrayBuffer())
    await writeFile(absolutePath, bytes)

    // Return the public URL (served by /api/uploads/[...path] or /uploads/ rewrite)
    const publicUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`

    console.log(`[Upload] Saved ${file.name} → ${publicUrl} (${(file.size / 1024).toFixed(1)} KB)`)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[/api/upload] Error:', err)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}