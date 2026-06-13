import { mkdir } from 'fs/promises'
import path from 'path'
import { UPLOADS_DIR } from '@/lib/storage'

/**
 * Ensures the uploads directory exists on server startup.
 * Call this once from instrumentation.ts or the upload route.
 */
export async function ensureUploadsDir(): Promise<void> {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true })
  } catch (err) {
    console.error('[ensureUploadsDir] Failed to create uploads dir:', UPLOADS_DIR, err)
  }
}

/**
 * Ensures a specific subdirectory under uploads exists.
 */
export async function ensureUploadsSubdir(subdir: string): Promise<void> {
  try {
    await mkdir(path.join(UPLOADS_DIR, subdir), { recursive: true })
  } catch (err) {
    console.error(`[ensureUploadsDir] Failed to create subdir: ${subdir}`, err)
  }
}