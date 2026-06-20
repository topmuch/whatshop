'use client'

/**
 * Modern Store 2 Template — Video Hero variant.
 * Re-uses ModernStoreTemplate with forceVideoHero=true so the
 * YouTube video hero is active by default (shows a dark placeholder
 * with overlay text until a YouTube URL is configured in the dashboard).
 */
import { ModernStoreTemplate } from './modern-store-template'

export function ModernStore2Template() {
  return <ModernStoreTemplate videoHero />
}