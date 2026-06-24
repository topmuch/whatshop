import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { UPLOADS_DIR } from '@/lib/storage'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé. Formats acceptés : JPEG, PNG, GIF, WebP, SVG, AVIF` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 })
    }

    // Determine subdirectory based on file type
    let subdir = 'images'
    if (file.type === 'image/svg+xml') subdir = 'svg'

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`
    const filename = `${randomUUID()}${ext}`

    // Ensure directory exists
    const targetDir = path.join(UPLOADS_DIR, subdir)
    await mkdir(targetDir, { recursive: true })

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(targetDir, filename)
    await writeFile(filePath, buffer)

    // Return the URL (will be served via /uploads rewrite -> /api/uploads)
    const url = `/uploads/${subdir}/${filename}`

    return NextResponse.json({ url, filename, size: file.size, type: file.type })
  } catch (err) {
    console.error('[/api/upload] Error:', err)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}