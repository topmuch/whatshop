'use client'

import { useCallback, useSyncExternalStore } from 'react'

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(() => {
    callback(document.documentElement.classList.contains('dark'))
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function toggleThemeStorage() {
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('ws-theme', 'light')
  } else {
    document.documentElement.classList.add('dark')
    localStorage.setItem('ws-theme', 'dark')
  }
}

export function useThemeMode() {
  // Correct order: subscribe first, getSnapshot second
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false)

  const toggleTheme = useCallback(() => {
    toggleThemeStorage()
  }, [])

  return { isDark, toggleTheme }
}
