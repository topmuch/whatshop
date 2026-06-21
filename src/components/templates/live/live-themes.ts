'use client'

import { createContext, useContext } from 'react'

export interface LiveThemeColors {
  // Marquee
  marqueeBg: string
  marqueeText: string
  marqueeSeparator: string

  // Badges (OFFRE FLASH, STOCK LIMITÉ)
  badgeFlashBg: string
  badgeFlashText: string
  badgeFlashIcon: string
  badgeStockBg: string
  badgeStockText: string
  badgeStockIcon: string

  // EN DIRECT badge (in spotlight)
  enDirectBg: string
  enDirectText: string
  enDirectIcon: string

  // LIVE SHOWROOM sidebar
  showroomBg: string
  showroomText: string
  showroomBorder: string

  // Trust badges
  trustBadgeBg: string
  trustBadgeText: string
  trustBadgeIcon: string

  // Countdown
  countdownBannerBg: string
  countdownBannerText: string
  countdownBannerIcon: string
  countdownBlockBg: string

  // Livraison banner
  livraisonBg: string
  livraisonText: string

  // Page background
  pageBg: string

  // Product name second line color
  productNameAccent: string

  // Price color
  priceColor: string
}

export type LiveThemeId = 'live-1' | 'live-2' | 'live-3'

export const liveThemes: Record<LiveThemeId, LiveThemeColors> = {
  'live-1': {
    // Theme 1: Jaune/Rouge (current warm energetic)
    marqueeBg: 'bg-yellow-400',
    marqueeText: 'text-red-600',
    marqueeSeparator: 'text-red-400',
    badgeFlashBg: 'bg-yellow-400',
    badgeFlashText: 'text-red-600',
    badgeFlashIcon: 'text-red-600',
    badgeStockBg: 'bg-yellow-400',
    badgeStockText: 'text-red-600',
    badgeStockIcon: 'text-red-600',
    enDirectBg: 'bg-red-600',
    enDirectText: 'text-white',
    enDirectIcon: 'text-white',
    showroomBg: 'bg-yellow-400',
    showroomText: 'text-red-600',
    showroomBorder: 'border-red-500',
    trustBadgeBg: 'bg-red-600',
    trustBadgeText: 'text-yellow-400',
    trustBadgeIcon: 'text-yellow-400',
    countdownBannerBg: 'bg-red-600',
    countdownBannerText: 'text-white',
    countdownBannerIcon: 'text-yellow-400',
    countdownBlockBg: 'bg-[#1A1A2E]',
    livraisonBg: 'bg-red-600',
    livraisonText: 'text-white',
    pageBg: '#FFF0F3',
    productNameAccent: 'text-red-600',
    priceColor: 'text-blue-600',
  },
  'live-2': {
    // Theme 2: Violet/Rose (flashy nightlife)
    marqueeBg: 'bg-purple-600',
    marqueeText: 'text-pink-200',
    marqueeSeparator: 'text-pink-300',
    badgeFlashBg: 'bg-pink-400',
    badgeFlashText: 'text-purple-900',
    badgeFlashIcon: 'text-purple-900',
    badgeStockBg: 'bg-pink-400',
    badgeStockText: 'text-purple-900',
    badgeStockIcon: 'text-purple-900',
    enDirectBg: 'bg-purple-600',
    enDirectText: 'text-white',
    enDirectIcon: 'text-white',
    showroomBg: 'bg-purple-600',
    showroomText: 'text-pink-200',
    showroomBorder: 'border-pink-400',
    trustBadgeBg: 'bg-purple-700',
    trustBadgeText: 'text-pink-300',
    trustBadgeIcon: 'text-pink-300',
    countdownBannerBg: 'bg-purple-700',
    countdownBannerText: 'text-white',
    countdownBannerIcon: 'text-pink-300',
    countdownBlockBg: 'bg-[#1A1033]',
    livraisonBg: 'bg-purple-700',
    livraisonText: 'text-white',
    pageBg: '#F3E8FF',
    productNameAccent: 'text-purple-600',
    priceColor: 'text-purple-600',
  },
  'live-3': {
    // Theme 3: Cyan/Orange (electric tech)
    marqueeBg: 'bg-cyan-400',
    marqueeText: 'text-orange-700',
    marqueeSeparator: 'text-orange-400',
    badgeFlashBg: 'bg-orange-400',
    badgeFlashText: 'text-cyan-900',
    badgeFlashIcon: 'text-cyan-900',
    badgeStockBg: 'bg-orange-400',
    badgeStockText: 'text-cyan-900',
    badgeStockIcon: 'text-cyan-900',
    enDirectBg: 'bg-orange-500',
    enDirectText: 'text-white',
    enDirectIcon: 'text-white',
    showroomBg: 'bg-cyan-400',
    showroomText: 'text-orange-700',
    showroomBorder: 'border-orange-500',
    trustBadgeBg: 'bg-orange-500',
    trustBadgeText: 'text-white',
    trustBadgeIcon: 'text-white',
    countdownBannerBg: 'bg-orange-500',
    countdownBannerText: 'text-white',
    countdownBannerIcon: 'text-white',
    countdownBlockBg: 'bg-[#0C1A2E]',
    livraisonBg: 'bg-orange-500',
    livraisonText: 'text-white',
    pageBg: '#ECFEFF',
    productNameAccent: 'text-cyan-600',
    priceColor: 'text-cyan-600',
  },
}

// Helper: map template ID to theme ID
export function getLiveTheme(templateId: string): LiveThemeColors {
  if (templateId === 'live-2') return liveThemes['live-2']
  if (templateId === 'live-3') return liveThemes['live-3']
  // Default: live-1 (also handles 'live-template' and 'live-1')
  return liveThemes['live-1']
}

// ─── React Context ───
export const LiveThemeContext = createContext<LiveThemeColors>(liveThemes['live-1'])

export function useLiveTheme() {
  return useContext(LiveThemeContext)
}