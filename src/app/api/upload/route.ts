import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { UPLOADS_DIR } from '@/lib/storage'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const { success } = rateLimit(ip, RATE_LIMITS.upload)
    if (!success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans un instant.' },
        { status: 429 }
      )
    }

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
        { status: 400 }
      )
    }

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Extension non autorisée. Autorisé : ${[...ALLOWED_EXTENSIONS].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate MIME type
    const allowedMimes = new Set([
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon',
    ])
    if (!allowedMimes.has(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    // Generate unique filename
    const uniqueId = crypto.randomBytes(12).toString('hex')
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${Date.now()}-${uniqueId}-${safeName}`

    // Ensure uploads directory exists
    await mkdir(UPLOADS_DIR, { recursive: true })

    // Write file to disk
    const filePath = path.join(UPLOADS_DIR, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Return the URL path (not the filesystem path)
    const url = `/api/uploads/${filename}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur serveur lors du téléchargement' }, { status: 500 })
  }
}