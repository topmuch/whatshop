import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'

export const dynamic = 'force-dynamic'

// Common MIME types for uploaded images
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

/**
 * Serves uploaded files from UPLOADS_DIR.
 *
 * Route: /api/uploads/[...path]  (rewritten from /uploads/[...path])
 *
 * Security: path traversal is prevented by resolving and checking
 * that the requested file stays within UPLOADS_DIR.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await params

    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: 'Chemin manquant' }, { status: 400 })
    }

    // Build the file path safely
    const relativePath = pathSegments.join('/')
    const absolutePath = path.resolve(UPLOADS_DIR, relativePath)
    const resolvedUploadsDir = path.resolve(UPLOADS_DIR)

    // Prevent path traversal attacks
    if (!absolutePath.startsWith(resolvedUploadsDir + path.sep) && absolutePath !== resolvedUploadsDir) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Check file exists and is a file (not a directory)
    const fileStat = await stat(absolutePath).catch(() => null)
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Read the file
    const buffer = await readFile(absolutePath)

    // Determine content type from extension
    const ext = path.extname(absolutePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    // Return with caching headers (1 day, stale-while-revalidate 7 days)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'ETag': `"${fileStat.size}-${fileStat.mtimeMs}"`,
      },
    })
  } catch (error) {
    console.error('[uploads] Error serving file:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}