import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'

// GET /api/uploads/[...path] — serve uploaded files
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params
    const relativePath = segments.join('/')

    // Path traversal protection
    const resolved = path.resolve(UPLOADS_DIR, relativePath)
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) && resolved !== UPLOADS_DIR) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    const filePath = path.join(UPLOADS_DIR, relativePath)

    // Check file exists
    const fileStat = await stat(filePath).catch(() => null)
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    const buffer = await readFile(filePath)

    // Determine content type
    const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    })
  } catch (error) {
    console.error('Serve upload error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}