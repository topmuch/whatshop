import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { UPLOADS_DIR } from '@/lib/storage'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
])

/**
 * POST /api/upload
 * Accepts multipart FormData with a "file" field.
 * Returns { url: "/uploads/<subdir>/<filename>" } on success.
 * No auth required — onboarding users don't have a shop yet.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.' },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum ${MAX_FILE_SIZE / (1024 * 1024)} Mo.` },
        { status: 400 },
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename to avoid collisions
    const ext = getExtensionFromMime(file.type) || 'jpg'
    const uniqueId = crypto.randomBytes(12).toString('hex')
    const timestamp = Date.now().toString(36)
    const filename = `${timestamp}-${uniqueId}.${ext}`

    // Organize uploads by date: uploads/2025/01/15/filename.ext
    const now = new Date()
    const subDir = path.join(
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    )
    const fullDir = path.join(UPLOADS_DIR, subDir)

    // Ensure directory exists
    await mkdir(fullDir, { recursive: true })

    // Write file
    const filePath = path.join(fullDir, filename)
    await writeFile(filePath, buffer)

    // Return the public URL (rewrites in next.config map /uploads → /api/uploads)
    const publicUrl = `/uploads/${subDir}/${filename}`

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('[/api/upload] Error:', error)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}

function getExtensionFromMime(mime: string): string | null {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  }
  return map[mime] || null
}