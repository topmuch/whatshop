import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const relativePath = pathSegments.join('/')
    const filePath = path.join(UPLOADS_DIR, relativePath)

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath)
    const resolvedUploads = path.resolve(UPLOADS_DIR)
    if (!resolvedPath.startsWith(resolvedUploads)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Check file exists
    const fileStat = await stat(filePath).catch(() => null)
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Read file
    const buffer = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (err) {
    console.error('[/api/uploads] Error:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}