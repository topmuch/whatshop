import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { UPLOADS_DIR } from '@/lib/storage'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
])

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const RESIZE_WIDTH = 800
const RESIZE_HEIGHT = 800

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const { success } = rateLimit(ip, RATE_LIMITS.upload)
    if (!success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans un instant.' },
        { status: 429 },
      )
    }

    // Parse FormData
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo)' },
        { status: 400 },
      )
    }

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Extension non autorisée. Autorisé : ${[...ALLOWED_EXTENSIONS].join(', ')}` },
        { status: 400 },
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIMES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé' },
        { status: 400 },
      )
    }

    // Ensure uploads directory exists
    await mkdir(UPLOADS_DIR, { recursive: true })

    // Generate unique filename — always output WebP for best quality/size ratio
    // (SVG and ICO are passed through as-is)
    const isPassthrough = file.type === 'image/svg+xml' || file.type === 'image/x-icon'
    const uniqueId = crypto.randomBytes(8).toString('hex')
    const filename = isPassthrough
      ? `${Date.now()}-${uniqueId}.${ext}`
      : `${Date.now()}-${uniqueId}.webp`
    const filePath = path.join(UPLOADS_DIR, filename)

    // Read raw file
    const rawBuffer = Buffer.from(await file.arrayBuffer())

    let finalBuffer: Buffer

    if (isPassthrough) {
      // SVG and ICO: store as-is (no sharp processing)
      finalBuffer = rawBuffer
    } else {
      // Resize and convert to WebP
      try {
        finalBuffer = await sharp(rawBuffer)
          .resize(RESIZE_WIDTH, RESIZE_HEIGHT, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 85 })
          .toBuffer()
      } catch (sharpErr) {
        // If sharp fails (corrupted image?), save original
        console.error('Sharp processing failed, saving original:', sharpErr)
        finalBuffer = rawBuffer
      }
    }

    // Write file to disk with 644 permissions (rw-r--r--)
    await writeFile(filePath, finalBuffer, { mode: 0o644 })

    // Return the API serving URL (NOT public/uploads — that path isn't persisted in Docker)
    const url = `/api/uploads/${filename}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors du téléchargement' },
      { status: 500 },
    )
  }
}