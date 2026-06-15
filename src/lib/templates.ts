export type TemplateId = 'xstore-electro' | 'cosmika-beauty' | 'elegance-plus'

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
    heroOverlay: string
    heroBadge: string
    heroText: string
  }
  cardStyle: {
    rounded: string
    shadow: string
    imageRounded: string
    overflow: string
    border: string
    hoverBorder: string
    hoverScale: string
    hoverY?: number
  }
  layout: {
    gridCols: string
    headerStyle: 'electro-tech' | 'luxury-dark'
    cardLayout: 'electro-card' | 'beauty'
    showCardBorder: boolean
    cardPadding: string
    imageSize: string
    badgePosition: 'top-left' | 'top-right'
    badgeStyle: 'pill' | 'rounded'
    categoryStyle: 'pill' | 'circle-image'
    heroStyle: 'contained' | 'full-image'
    priceStyle: 'electro-highlight' | 'beauty-elegant'
    buttonStyle: 'filled' | 'rounded'
    footerStyle: 'standard' | 'dark'
    showSearch?: boolean
    showSort?: boolean
    showCart?: boolean
  }
  decorative: {
    pattern: 'none' | 'gradient'
    gradientBg: string | null
    divider: 'line' | 'gradient'
    headerDecoration: string | null
  }
}

export const templates: Record<TemplateId, ShopTemplate> = {
  'xstore-electro': {
    id: 'xstore-electro',
    name: 'Electro Store',
    description: 'Tech moderne, accents teal, étoiles et compte à rebours',
    emoji: '📱',
    colors: {
      primary: '#10B981',
      primaryFg: '#ffffff',
      accent: '#059669',
      bg: '#f8fafc',
      card: '#ffffff',
      cardHover: '#f0fdf4',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
      badgeNew: '#10B981',
      badgePromo: '#ef4444',
      cartBg: '#ffffff',
      headerBg: '#ffffff',
      filterActive: '#10B981',
      filterActiveFg: '#ffffff',
      priceColor: '#10B981',
      ctaBg: '#10B981',
      ctaFg: '#ffffff',
      heroOverlay: 'linear-gradient(135deg, rgba(16,185,129,0.85) 0%, rgba(5,150,105,0.7) 100%)',
      heroBadge: 'rgba(16,185,129,0.2)',
      heroText: '#ffffff',
    },
    cardStyle: {
      rounded: '8px',
      shadow: '0 1px 6px rgba(16,185,129,0.08)',
      imageRounded: '8px 8px 0 0',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      hoverBorder: '1px solid #10B981',
      hoverScale: 'scale(1)',
      hoverY: 0,
    },
    layout: {
      gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      headerStyle: 'electro-tech',
      cardLayout: 'electro-card',
      showCardBorder: true,
      cardPadding: 'p-3',
      imageSize: 'aspect-square',
      badgePosition: 'top-left',
      badgeStyle: 'pill',
      categoryStyle: 'pill',
      heroStyle: 'contained',
      priceStyle: 'electro-highlight',
      buttonStyle: 'filled',
      footerStyle: 'standard',
    },
    decorative: {
      pattern: 'none',
      gradientBg: 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 50%, #f8fafc 100%)',
      divider: 'line',
      headerDecoration: null,
    },
  },
  'cosmika-beauty': {
    id: 'cosmika-beauty',
    name: 'Cosmika Beauty',
    description: 'Élégance et glamour pour les boutiques de cosmétiques',
    emoji: '💎',
    colors: {
      primary: '#E11D48',
      primaryFg: '#fff',
      accent: '#F59E0B',
      bg: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#FDF2F8',
      text: '#1F2937',
      textMuted: '#6B7280',
      border: '#FCE7F3',
      badgeNew: '#E11D48',
      badgePromo: '#F59E0B',
      cartBg: '#1F2937',
      headerBg: '#111827',
      filterActive: '#E11D48',
      filterActiveFg: '#fff',
      priceColor: '#E11D48',
      ctaBg: '#111827',
      ctaFg: '#FFFFFF',
      heroOverlay: 'rgba(0,0,0,0.5)',
      heroBadge: '#F59E0B',
      heroText: '#FFFFFF',
    },
    cardStyle: {
      rounded: '1rem',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
      imageRounded: '0.75rem',
      overflow: 'hidden',
      border: '1px solid #FCE7F3',
      hoverBorder: '1px solid #E11D48',
      hoverScale: '1.02',
    },
    layout: {
      gridCols: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
      headerStyle: 'luxury-dark',
      cardLayout: 'beauty',
      showCardBorder: true,
      cardPadding: 'p-0',
      imageSize: 'aspect-square',
      badgePosition: 'top-left',
      badgeStyle: 'pill',
      categoryStyle: 'circle-image',
      heroStyle: 'full-image',
      priceStyle: 'beauty-elegant',
      buttonStyle: 'rounded',
      footerStyle: 'dark',
      showSearch: true,
      showSort: true,
      showCart: true,
    },
    decorative: {
      pattern: 'none',
      gradientBg: null,
      divider: 'gradient',
      headerDecoration: null,
    },
  },
  'elegance-plus': {
    id: 'elegance-plus',
    name: 'Elegance Plus',
    description: 'Design premium enrichi : barre promo, catégories cartes, newsletter, scroll-to-top',
    emoji: '👑',
    colors: {
      primary: '#9333EA',
      primaryFg: '#fff',
      accent: '#F59E0B',
      bg: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#FAF5FF',
      text: '#1F2937',
      textMuted: '#6B7280',
      border: '#F3E8FF',
      badgeNew: '#9333EA',
      badgePromo: '#F59E0B',
      cartBg: '#1F2937',
      headerBg: '#111827',
      filterActive: '#9333EA',
      filterActiveFg: '#fff',
      priceColor: '#9333EA',
      ctaBg: '#9333EA',
      ctaFg: '#FFFFFF',
      heroOverlay: 'rgba(0,0,0,0.45)',
      heroBadge: '#F59E0B',
      heroText: '#FFFFFF',
    },
    cardStyle: {
      rounded: '1rem',
      shadow: '0 4px 20px rgba(147,51,234,0.08)',
      imageRounded: '1rem 1rem 0 0',
      overflow: 'hidden',
      border: '1px solid #F3E8FF',
      hoverBorder: '1px solid #9333EA',
      hoverScale: '1.03',
    },
    layout: {
      gridCols: 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6',
      headerStyle: 'luxury-dark',
      cardLayout: 'beauty',
      showCardBorder: true,
      cardPadding: 'p-0',
      imageSize: 'aspect-square',
      badgePosition: 'top-left',
      badgeStyle: 'pill',
      categoryStyle: 'rectangle-card',
      heroStyle: 'full-image',
      priceStyle: 'beauty-elegant',
      buttonStyle: 'rounded',
      footerStyle: 'dark',
      showSearch: true,
      showSort: true,
      showCart: true,
    },
    decorative: {
      pattern: 'gradient',
      gradientBg: 'linear-gradient(180deg, #ffffff 0%, #faf5ff 50%, #ffffff 100%)',
      divider: 'gradient',
      headerDecoration: null,
    },
  },
}

export const templateList = Object.values(templates)