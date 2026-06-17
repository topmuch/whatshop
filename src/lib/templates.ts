export type TemplateId = 'xstore-electro' | 'cosmika-beauty' | 'elegance-plus' | 'modern-store' | 'cosmika-dark' | 'single-product'

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
    categoryStyle: 'pill' | 'circle-image' | 'rectangle-card'
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
  'modern-store': {
    id: 'modern-store',
    name: 'Modern Store',
    description: 'E-commerce moderne avec panier, checkout et WhatsApp direct',
    emoji: '🛒',
    colors: {
      primary: '#3B82F6',
      primaryFg: '#ffffff',
      accent: '#10B981',
      bg: '#ffffff',
      card: '#ffffff',
      cardHover: '#f8fafc',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      badgeNew: '#3B82F6',
      badgePromo: '#ef4444',
      cartBg: '#ffffff',
      headerBg: '#ffffff',
      filterActive: '#3B82F6',
      filterActiveFg: '#ffffff',
      priceColor: '#10B981',
      ctaBg: '#10B981',
      ctaFg: '#ffffff',
      heroOverlay: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(16,185,129,0.7) 100%)',
      heroBadge: 'rgba(59,130,246,0.2)',
      heroText: '#ffffff',
    },
    cardStyle: {
      rounded: '12px',
      shadow: '0 1px 8px rgba(59,130,246,0.08)',
      imageRounded: '12px 12px 0 0',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      hoverBorder: '1px solid #3B82F6',
      hoverScale: 'scale(1.02)',
      hoverY: -2,
    },
    layout: {
      gridCols: 'grid-cols-2 md:grid-cols-4',
      headerStyle: 'electro-tech',
      cardLayout: 'electro-card',
      showCardBorder: true,
      cardPadding: 'p-0',
      imageSize: 'aspect-square',
      badgePosition: 'top-left',
      badgeStyle: 'pill',
      categoryStyle: 'pill',
      heroStyle: 'full-image',
      priceStyle: 'electro-highlight',
      buttonStyle: 'rounded',
      footerStyle: 'standard',
      showSearch: true,
      showSort: false,
      showCart: true,
    },
    decorative: {
      pattern: 'none',
      gradientBg: null,
      divider: 'line',
      headerDecoration: null,
    },
  },
  'cosmika-dark': {
    id: 'cosmika-dark',
    name: 'Cosmika Dark',
    description: 'E-commerce dark luxe avec accents dorés, marquee animé et design premium',
    emoji: '💎',
    colors: {
      primary: '#ffd21d',
      primaryFg: '#000000',
      accent: '#e7ba0a',
      bg: '#181818',
      card: '#212121',
      cardHover: '#2a2a2a',
      text: '#f8f9fb',
      textMuted: '#999999',
      border: '#333333',
      badgeNew: '#22C55E',
      badgePromo: '#EF4444',
      cartBg: '#181818',
      headerBg: '#181818',
      filterActive: '#ffd21d',
      filterActiveFg: '#000000',
      priceColor: '#ffd21d',
      ctaBg: '#ffd21d',
      ctaFg: '#000000',
      heroOverlay: 'rgba(0,0,0,0.3)',
      heroBadge: '#ffd21d',
      heroText: '#ffffff',
    },
    cardStyle: {
      rounded: '1rem',
      shadow: '0 2px 12px rgba(0,0,0,0.3)',
      imageRounded: '1rem 1rem 0 0',
      overflow: 'hidden',
      border: '1px solid #333333',
      hoverBorder: '1px solid rgba(255,210,29,0.3)',
      hoverScale: 'scale(1.02)',
    },
    layout: {
      gridCols: 'grid-cols-2 md:grid-cols-4',
      headerStyle: 'luxury-dark',
      cardLayout: 'beauty',
      showCardBorder: true,
      cardPadding: 'p-0',
      imageSize: 'aspect-square',
      badgePosition: 'top-right',
      badgeStyle: 'pill',
      categoryStyle: 'pill',
      heroStyle: 'full-image',
      priceStyle: 'beauty-elegant',
      buttonStyle: 'rounded',
      footerStyle: 'dark',
      showSearch: false,
      showSort: false,
      showCart: true,
    },
    decorative: {
      pattern: 'none',
      gradientBg: null,
      divider: 'line',
      headerDecoration: null,
    },
  },
  'single-product': {
    id: 'single-product',
    name: 'Single Produit',
    description: 'Landing page optimisée conversion pour un seul produit',
    emoji: '🎯',
    colors: {
      primary: '#EC4899',
      primaryFg: '#ffffff',
      accent: '#F59E0B',
      bg: '#ffffff',
      card: '#ffffff',
      cardHover: '#fdf2f8',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      badgeNew: '#EC4899',
      badgePromo: '#ef4444',
      cartBg: '#ffffff',
      headerBg: '#ffffff',
      filterActive: '#EC4899',
      filterActiveFg: '#ffffff',
      priceColor: '#EC4899',
      ctaBg: '#22C55E',
      ctaFg: '#ffffff',
      heroOverlay: 'linear-gradient(135deg, rgba(236,72,153,0.85) 0%, rgba(245,158,11,0.7) 100%)',
      heroBadge: 'rgba(236,72,153,0.2)',
      heroText: '#ffffff',
    },
    cardStyle: {
      rounded: '16px',
      shadow: '0 4px 16px rgba(236,72,153,0.1)',
      imageRounded: '16px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      hoverBorder: '1px solid #EC4899',
      hoverScale: 'scale(1.02)',
      hoverY: -2,
    },
    layout: {
      gridCols: 'grid-cols-1',
      headerStyle: 'luxury-dark',
      cardLayout: 'beauty',
      showCardBorder: false,
      cardPadding: 'p-6',
      imageSize: 'aspect-square',
      badgePosition: 'top-left',
      badgeStyle: 'pill',
      categoryStyle: 'pill',
      heroStyle: 'full-image',
      priceStyle: 'beauty-elegant',
      buttonStyle: 'rounded',
      footerStyle: 'dark',
    },
    decorative: {
      pattern: 'gradient',
      gradientBg: 'linear-gradient(180deg, #ffffff 0%, #fdf2f8 50%, #ffffff 100%)',
      divider: 'gradient',
      headerDecoration: null,
    },
  },
}

export const templateList = Object.values(templates)