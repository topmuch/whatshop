import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'

// Prevent Next.js from caching this route at the server level.
// Without this, a 404 response gets cached and served even after the file is created.
export const dynamic = 'force-dynamic'

// MIME type map
const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
}

// GET /api/uploads/[...path] — serve uploaded files
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await params
    const relativePath = segments.join('/')

    if (!relativePath) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    // ─── Path traversal protection (strict) ──────────────────────
    // Reject any path containing .. or absolute paths
    if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    const resolved = path.resolve(UPLOADS_DIR, relativePath)
    const normalizedUploadsDir = path.resolve(UPLOADS_DIR)

    if (!resolved.startsWith(normalizedUploadsDir + path.sep) && resolved !== normalizedUploadsDir) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    // ─── Check file exists ──────────────────────────────────────
    const fileStat = await stat(resolved).catch(() => null)
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    const buffer = await readFile(resolved)
    const ext = resolved.split('.').pop()?.toLowerCase() ?? ''
    const contentType = MIME_MAP[ext] || 'application/octet-stream'

    // ─── Cache headers ──────────────────────────────────────────
    // Use ETag based on file size + mtime for cache validation
    // NOT immutable — allows revalidation if needed
    const etag = `"${fileStat.size}-${fileStat.mtimeMs}"`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        // 1 day cache with 7 day stale-while-revalidate
        // Browser caches for 1 day, then revalidates in background for 7 days
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'ETag': etag,
        'Content-Disposition': `inline; filename="${path.basename(resolved)}"`,
      },
    })
  } catch (error) {
    console.error('Serve upload error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}