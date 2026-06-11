import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Boutiko est la plateforme N°1 pour créer votre boutique en ligne en Côte d'Ivoire, Sénégal et Cameroun. Simple, rapide et abordable. Essai gratuit.";

export const metadata: Metadata = {
  title: {
    default: "Boutiko — Créez votre boutique en ligne en Afrique",
    template: "%s | Boutiko",
  },
  description: siteDescription,
  keywords: [
    "boutique en ligne",
    "créer boutique afrique",
    "e-commerce côte d'ivoire",
    "e-commerce sénégal",
    "boutiko",
    "linktree boutique",
    "vente en ligne afrique",
  ],
  authors: [{ name: "Boutiko" }],
  creator: "Boutiko",
  metadataBase: new URL("https://boutiko.pro"),
  openGraph: {
    type: "website",
    locale: "fr_CI",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Boutiko",
  url: "https://boutiko.pro",
  logo: "https://boutiko.pro/favicon.ico",
  description:
    "Plateforme de création de boutiques en ligne en Afrique",
  areaServed: ["CI", "SN", "CM"],
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('ws-theme') === 'dark') {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}