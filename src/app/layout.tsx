import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteDescription =
  "Boutiko : créez votre boutique en ligne en Afrique francophone. E-commerce simple et abordable au Sénégal, Côte d'Ivoire, Cameroun, Mali, Togo, Bénin, Burkina Faso, Niger, Tchad, Guinée. Livraison Mobile Money. Essai gratuit.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: "Boutiko — Créez votre boutique en ligne en Afrique",
    template: "%s | Boutiko",
  },
  description: siteDescription,
  keywords: [
    "boutique en ligne",
    "créer boutique en ligne",
    "e-commerce Afrique",
    "e-commerce Sénégal",
    "e-commerce Côte d'Ivoire",
    "e-commerce Cameroun",
    "e-commerce Mali",
    "e-commerce Togo",
    "e-commerce Bénin",
    "e-commerce Burkina Faso",
    "e-commerce Niger",
    "e-commerce Tchad",
    "e-commerce Guinée",
    "boutique en ligne Afrique",
    "vente en ligne Afrique",
    "créer boutique Sénégal",
    "créer boutique Côte d'Ivoire",
    "créer boutique Cameroun",
    "créer boutique Mali",
    "créer boutique Togo",
    "créer boutique Bénin",
    "créer boutique Burkina Faso",
    "créer boutique Niger",
    "créer boutique Tchad",
    "créer boutique Guinée",
    "site e-commerce Afrique",
    "plateforme e-commerce Afrique",
    "boutique en ligne gratuite",
    "vendre en ligne Afrique",
    "vendre sur WhatsApp",
    "Mobile Money Afrique",
    "paiement Mobile Money",
    "boutiko",
    "linktree boutique",
    "boutique WhatsApp",
    "catalogue en ligne",
    "marché en ligne Afrique",
    "shopping en ligne Afrique",
    "magasin en ligne",
    "boutique en ligne francophone",
    "e-commerce francophone Afrique",
  ],
  authors: [{ name: "Boutiko" }],
  creator: "Boutiko",
  metadataBase: new URL("https://boutiko.pro"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://boutiko.pro",
    siteName: "Boutiko",
    title: "Boutiko — Créez votre boutique en ligne en Afrique",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Boutiko — Créez votre boutique en ligne en Afrique",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://boutiko.pro",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Boutiko",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/pwa-icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/pwa-icons/apple-touch-icon.png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Boutiko",
  url: "https://boutiko.pro",
  logo: "https://boutiko.pro/pwa-icons/icon-512x512.png",
  description:
    "Plateforme N°1 de création de boutiques en ligne en Afrique francophone. E-commerce au Sénégal, Côte d'Ivoire, Cameroun, Mali, Togo, Bénin, Burkina Faso, Niger, Tchad, Guinée.",
  areaServed: ["CI", "SN", "CM", "ML", "TG", "BJ", "BF", "NE", "TD", "GN"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["fr"],
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: `
        // Prevent flash of landing page when visiting /shop-slug directly
        // Only hide paths that look like shop slugs (not known app routes)
        (function() {
          var p = window.location.pathname.replace(/\\/$/, '');
          var slug = p.slice(1).toLowerCase();
          var APP_ROUTES = ['login','connexion','inscription','register','onboarding','dashboard','reseller','revendeur','admin','about','a-propos','tarifs','pricing','contact','contactez-nous','faq','aide','privacy','confidentialite','terms','conditions','offline','menu'];
          var isAppRoute = APP_ROUTES.indexOf(slug) !== -1 || slug.startsWith('p/');
          if (p !== '/' && p !== '' && !isAppRoute) {
            document.documentElement.style.visibility = 'hidden';
            document.documentElement.classList.add('ws-loading-shop');
          }
        })();
      `}} />
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('ws-theme') === 'dark') {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
        {/* Service Worker auto-update: force new SW to activate on every page load */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function(reg) {
              reg.addEventListener('updatefound', function() {
                var newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', function() {
                  if (newWorker.state === 'activated') {
                    window.location.reload();
                  }
                });
              });
              // Force check for updates on every page load
              reg.update();
            }).catch(function() {});
          }
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        style={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
          overscrollBehaviorY: "contain",
        }}
      >
        <OfflineIndicator />
        {children}
        <InstallPrompt />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}