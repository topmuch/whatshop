"use client";

import { WifiOff, RefreshCw, Package, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <WifiOff className="h-10 w-10 text-gray-400" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">Vous êtes hors ligne</h1>

      {/* Description */}
      <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Vérifiez votre connexion internet et réessayez. Vos données sont en sécurité et seront synchronisées automatiquement.
      </p>

      {/* Retry Button */}
      <Button
        onClick={handleRetry}
        className="mt-8 h-12 gap-2 rounded-xl bg-black px-8 text-base font-medium text-white hover:bg-black/90"
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>

      {/* Tips */}
      <div className="mt-12 w-full max-w-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ce que vous pouvez faire hors ligne
        </h2>

        <div className="space-y-2">
          {[
            {
              icon: LayoutDashboard,
              title: "Consulter votre dashboard",
              desc: "Les données récentes sont en cache",
            },
            {
              icon: Package,
              title: "Parcourir vos produits",
              desc: "La liste est disponible en local",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <tip.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to home */}
      <Button
        variant="ghost"
        onClick={() => {
          window.location.href = "/";
        }}
        className="mt-6 gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Button>
    </div>
  );
}