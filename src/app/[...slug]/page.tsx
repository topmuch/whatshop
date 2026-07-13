// Required catch-all route: handles all paths without a dedicated page file.
// Re-exports the root Home component so the SPA router resolves the view.
// Next.js matches explicit routes (/dashboard, /login, /custom-domain/xxx, etc.)
// first; this catch-all only fires for unmatched paths like /cereales-de-anta.
export { default } from '../page'