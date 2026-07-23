/**
 * Next.js instrumentation hook — runs once on server startup.
 *
 * Ensures the runtime uploads directory exists before the first request
 * lands. The actual work is delegated to `instrumentation-node.ts`,
 * which is only dynamically imported when running in the Node.js runtime.
 * This split prevents Turbopack from bundling Node-only modules
 * (`fs/promises`, `path`) into the Edge runtime bundle.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  // Only run in the Node.js server runtime — skip Edge runtime and client.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Dynamic import so Turbopack can drop this from the Edge bundle.
  const { registerNodeInstrumentation } = await import('./instrumentation-node')
  await registerNodeInstrumentation()
}
