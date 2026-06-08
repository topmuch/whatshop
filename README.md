# 🛍️ WhatsShop

**Plateforme SaaS de mini-boutiques en ligne pour les marchands africains.** Créez votre boutique en 3 minutes et recevez des commandes via WhatsApp.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2d3748)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Fonctionnalités

### Pour les marchands (Vendeurs)
- **Création de boutique en 3 minutes** - Inscription rapide, configuration minimale
- **Gestion de catalog** - Ajout/modification/suppression de produits avec images
- **Catégories** - Organisation automatique des produits par catégorie
- **8 thèmes de boutique** - Classique, Afrique, Minimaliste, Élégant, Neon, Rose, Océan, Coucher de soleil
- **Gestion des commandes** - Suivi des commandes avec statuts (En attente, Confirmée, Livrée)
- **IA pour le marketing** - Génération de contenu pour Instagram, Facebook, WhatsApp
- **QR Code & Poster** - Génération de QR code pour partager la boutique
- **Statistiques** - Vue d'ensemble des performances (ventes, visites, produits)

### Pour les clients (Visiteurs)
- **Navigation fluide** - Catalogue avec recherche, filtres par catégorie, tri
- **Panier intelligent** - Ajout au panier, gestion des quantités
- **Commande WhatsApp** - Envoi automatique de la commande via WhatsApp
- **Carrousel de bannières** - Présentation visuelle attrayante
- **Badges produits** - Nouveautés, promotions, stock limité
- **Design responsive** - Fonctionne parfaitement sur mobile et desktop

### Administration
- **Super Admin** - Tableau de bord complet pour gérer la plateforme
- **Gestion des utilisateurs** - Vue d'ensemble de tous les vendeurs
- **Gestion des boutiques** - Activation/désactivation, changement de plan
- **Statistiques plateforme** - KPIs globaux (revenus, utilisateurs, commandes)

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework React avec App Router |
| **React 19** | Interface utilisateur |
| **TypeScript 5** | Typage statique |
| **Tailwind CSS 4** | Styles utilitaires |
| **shadcn/ui** | Composants UI (New York style) |
| **Prisma ORM** | Base de données SQLite |
| **Zustand** | State management client-side |
| **Framer Motion** | Animations |
| **Embla Carousel** | Carrousel avec autoplay |
| **Sonner** | Notifications toast |
| **Lucide Icons** | Icônes |

## 📦 Installation

### Prérequis
- Node.js 18+ ou Bun
- Un compte GitHub

### Clonez le dépôt
```bash
git clone https://github.com/topmuch/whatshop.git
cd whatshop
```

### Installez les dépendances
```bash
bun install
```

### Configurez les variables d'environnement
```bash
cp .env.example .env
# Éditez .env avec vos clés
```

### Initialisez la base de données
```bash
bun run db:push
```

### Lancez le serveur de développement
```bash
bun run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000)

### Peuplez la base de données de démo
```bash
bun run scripts/seed.ts
```

## 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Vendeur** | demo@whatsshop.com | demo123 |
| **Admin** | admin@whatsshop.com | admin123 |

## 🎨 Les 8 Thèmes

| Thème | Description | Style |
|-------|-------------|-------|
| 🌿 Classique | Vert WhatsApp, simple et efficace | Standard |
| 🌍 Afrique | Tons chauds, terre cuite et or | Centré + motif Kente |
| ⬛ Minimaliste | Noir et blanc, épuré | Compact |
| ✨ Élégant | Sombre luxe, accents dorés | Premium |
| 💜 Neon | Couleurs vibrantes, style cyber | Cyberpunk |
| 🌸 Rose | Doux et romantique | Mode & Beauté |
| 🌊 Océan | Bleu profond, professionnel | Frais |
| 🌅 Coucher de soleil | Dégradé chaud, vibrant | Énergie |

## 📁 Structure du projet

```
whatshop/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── db/
│   └── custom.db              # Base de données SQLite (non versionnée)
├── public/
│   ├── products/              # Images des produits
│   └── banners/               # Bannières du carrousel
├── scripts/
│   └── seed.ts                # Données de démonstration
├── src/
│   ├── app/
│   │   ├── page.tsx           # Route principale (SPA router)
│   │   ├── layout.tsx         # Layout global
│   │   ├── globals.css        # Styles globaux
│   │   └── api/               # API Routes
│   │       ├── admin/         # API Admin (stats, users, shops, orders)
│   │       ├── auth/          # API Auth (login, register, session)
│   │       ├── ai/            # API IA (content, qr-code)
│   │       └── shops/         # API Boutiques
│   ├── components/
│   │   ├── admin/             # Dashboard Admin
│   │   ├── auth/              # Login / Register
│   │   ├── dashboard/         # Dashboard Vendeur
│   │   ├── shop/              # Boutique publique
│   │   ├── landing.tsx        # Page d'accueil
│   │   └── ui/                # Composants shadcn/ui
│   ├── hooks/                 # Custom hooks
│   ├── lib/
│   │   ├── templates.ts       # 8 définitions de thèmes
│   │   ├── store.ts           # Zustand store
│   │   ├── db.ts              # Client Prisma
│   │   └── utils.ts           # Utilitaires
│   └── middleware.ts          # Rewriting des URLs boutique
├── .gitignore
├── package.json
└── tsconfig.json
```

## 📜 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

---

**WhatsShop** - Créez votre boutique africaine en ligne en 3 minutes. ⚡
