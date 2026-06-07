export type TemplateId = 'classic' | 'africa' | 'minimal' | 'elegant' | 'neon'

export interface ShopTemplate {
  id: TemplateId
  name: string
  description: string
  emoji: string
  colors: {
    primary: string
    primaryFg: string
    accent: string
    bg: string
    card: string
    cardHover: string
    text: string
    textMuted: string
    border: string
    badgeNew: string
    badgePromo: string
    cartBg: string
    headerBg: string
    filterActive: string
    filterActiveFg: string
    priceColor: string
    ctaBg: string
    ctaFg: string
  }
  cardStyle: {
    rounded: string
    shadow: string
    imageRounded: string
    overflow: string
  }
}

export const templates: Record<TemplateId, ShopTemplate> = {
  classic: {
    id: 'classic',
    name: 'Classique',
    description: 'Thème vert WhatsApp, simple et efficace',
    emoji: '🌿',
    colors: {
      primary: '#25D366',
      primaryFg: '#ffffff',
      accent: '#128C7E',
      bg: '#ffffff',
      card: '#ffffff',
      cardHover: '#f0fdf4',
      text: '#1a1a1a',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      badgeNew: '#10b981',
      badgePromo: '#f97316',
      cartBg: '#ffffff',
      headerBg: 'rgba(255,255,255,0.95)',
      filterActive: '#25D366',
      filterActiveFg: '#ffffff',
      priceColor: '#16a34a',
      ctaBg: '#25D366',
      ctaFg: '#ffffff',
    },
    cardStyle: {
      rounded: '12px',
      shadow: '0 1px 3px rgba(0,0,0,0.08)',
      imageRounded: '12px 12px 0 0',
      overflow: 'hidden',
    },
  },
  africa: {
    id: 'africa',
    name: 'Afrique',
    description: 'Tons chauds, terre cuite et or',
    emoji: '🌍',
    colors: {
      primary: '#C45D2C',
      primaryFg: '#ffffff',
      accent: '#D4A843',
      bg: '#FFF8F0',
      card: '#ffffff',
      cardHover: '#FEF3E2',
      text: '#2D1B0E',
      textMuted: '#8B6914',
      border: '#E8D5B7',
      badgeNew: '#D4A843',
      badgePromo: '#C45D2C',
      cartBg: '#FFF8F0',
      headerBg: 'rgba(255,248,240,0.95)',
      filterActive: '#C45D2C',
      filterActiveFg: '#ffffff',
      priceColor: '#C45D2C',
      ctaBg: '#C45D2C',
      ctaFg: '#ffffff',
    },
    cardStyle: {
      rounded: '16px',
      shadow: '0 2px 8px rgba(196,93,44,0.1)',
      imageRounded: '16px 16px 0 0',
      overflow: 'hidden',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Noir et blanc, épuré et moderne',
    emoji: '⬛',
    colors: {
      primary: '#18181b',
      primaryFg: '#ffffff',
      accent: '#52525b',
      bg: '#ffffff',
      card: '#fafafa',
      cardHover: '#f4f4f5',
      text: '#09090b',
      textMuted: '#a1a1aa',
      border: '#e4e4e7',
      badgeNew: '#18181b',
      badgePromo: '#71717a',
      cartBg: '#fafafa',
      headerBg: 'rgba(250,250,250,0.95)',
      filterActive: '#18181b',
      filterActiveFg: '#ffffff',
      priceColor: '#09090b',
      ctaBg: '#18181b',
      ctaFg: '#ffffff',
    },
    cardStyle: {
      rounded: '8px',
      shadow: 'none',
      imageRounded: '8px 8px 0 0',
      overflow: 'hidden',
    },
  },
  elegant: {
    id: 'elegant',
    name: 'Élégant',
    description: 'Thème sombre luxe, accents dorés',
    emoji: '✨',
    colors: {
      primary: '#D4A843',
      primaryFg: '#1a1a1a',
      accent: '#B8860B',
      bg: '#0f0f0f',
      card: '#1a1a1a',
      cardHover: '#222222',
      text: '#f5f5f5',
      textMuted: '#a3a3a3',
      border: '#2a2a2a',
      badgeNew: '#D4A843',
      badgePromo: '#B8860B',
      cartBg: '#1a1a1a',
      headerBg: 'rgba(15,15,15,0.95)',
      filterActive: '#D4A843',
      filterActiveFg: '#1a1a1a',
      priceColor: '#D4A843',
      ctaBg: '#D4A843',
      ctaFg: '#1a1a1a',
    },
    cardStyle: {
      rounded: '12px',
      shadow: '0 4px 12px rgba(212,168,67,0.15)',
      imageRounded: '12px 12px 0 0',
      overflow: 'hidden',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Foncé avec couleurs vibrantes, style cyber',
    emoji: '💜',
    colors: {
      primary: '#A855F7',
      primaryFg: '#ffffff',
      accent: '#06B6D4',
      bg: '#09090b',
      card: '#18181b',
      cardHover: '#1c1c22',
      text: '#f5f5f5',
      textMuted: '#a1a1aa',
      border: '#27272a',
      badgeNew: '#06B6D4',
      badgePromo: '#A855F7',
      cartBg: '#18181b',
      headerBg: 'rgba(9,9,11,0.95)',
      filterActive: 'linear-gradient(135deg, #A855F7, #06B6D4)',
      filterActiveFg: '#ffffff',
      priceColor: '#A855F7',
      ctaBg: 'linear-gradient(135deg, #A855F7, #06B6D4)',
      ctaFg: '#ffffff',
    },
    cardStyle: {
      rounded: '16px',
      shadow: '0 0 20px rgba(168,85,247,0.1)',
      imageRounded: '16px 16px 0 0',
      overflow: 'hidden',
    },
  },
}

export const templateList = Object.values(templates)
