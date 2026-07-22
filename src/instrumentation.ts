/**
 * Next.js instrumentation hook — runs once on server startup.
 *
 * Ensures the runtime uploads directory exists before the first request
 * lands. Previously the directory was only created lazily inside the
 * /api/upload route handler, which left a small race window and produced
 * confusing errors if the mkdir failed mid-request.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  // Only run on the server (not during edge / client build).
  if (typeof window !== 'undefined') return

  try {
    const { ensureUploadsDir } = await import('@/lib/ensure-uploads')
    await ensureUploadsDir()
    // Also pre-create the common subdirs used by the upload route.
    const { ensureUploadsSubdir } = await import('@/lib/ensure-uploads')
    await ensureUploadsSubdir('images')
    await ensureUploadsSubdir('logos')
    await ensureUploadsSubdir('banners')
    console.log('[instrumentation] uploads dir ready')
  } catch (err) {
    console.error('[instrumentation] failed to ensure uploads dir:', err)
  }
}
