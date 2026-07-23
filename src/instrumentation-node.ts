/**
 * Node.js-only instrumentation logic.
 *
 * This file is only imported when running in the Node.js runtime
 * (see `instrumentation.ts` for the runtime guard). Keeping it in a
 * separate module prevents Turbopack from bundling `fs/promises` and
 * `path` into the Edge runtime — which would otherwise produce
 * "Node.js module loaded in Edge Runtime" warnings during build.
 */
import { ensureUploadsDir, ensureUploadsSubdir } from '@/lib/ensure-uploads'

export async function registerNodeInstrumentation(): Promise<void> {
  try {
    await ensureUploadsDir()
    // Also pre-create the common subdirs used by the upload route.
    await ensureUploadsSubdir('images')
    await ensureUploadsSubdir('logos')
    await ensureUploadsSubdir('banners')
    console.log('[instrumentation] uploads dir ready')
  } catch (err) {
    console.error('[instrumentation] failed to ensure uploads dir:', err)
  }
}
