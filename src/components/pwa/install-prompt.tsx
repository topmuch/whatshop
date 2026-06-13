"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Download, X, Smartphone, Apple, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

const STORAGE_KEY_DISMISSED = "boutiko-pwa-install-dismissed";
const SHOW_DELAY_MS = 30_000;

export function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize platform detection and check if already installed
  const installed = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
  const p = typeof window !== "undefined" ? detectPlatform() : "unknown";

  // Sync initial state without useEffect
  if (isInstalled !== installed) setIsInstalled(installed);
  if (platform === "unknown" && p !== "unknown") setPlatform(p);

  // Set up the banner show timer
  useEffect(() => {
    if (isInstalled) return;

    const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sevenDays) return;
    }

    if (platform === "ios") {
      timerRef.current = setTimeout(() => {
        setShowBanner(true);
      }, SHOW_DELAY_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isInstalled, platform]);

  // Capture beforeinstallprompt event
  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      if (!timerRef.current || !showBanner) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Track installation
    const installHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener("appinstalled", installHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installHandler);
    };
  }, [isInstalled, showBanner]);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    deferredPromptRef.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
  }, []);

  if (!showBanner || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
      >
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-4 shadow-xl md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-black">
              <img
                src="/pwa-icons/icon-96x96.png"
                alt="Boutiko"
                width={48}
                height={48}
                className="rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                Installer Boutiko
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Accédez rapidement à votre boutique depuis l&apos;écran d&apos;accueil
              </p>
              {platform === "ios" ? (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Apple className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    Appuyez sur <Share2 className="inline h-3 w-3" aria-hidden="true" /> puis
                    &quot;Sur l&apos;écran d&apos;accueil&quot;
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Installation rapide, aucune donnée supplémentaire
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-col gap-1.5">
              <button
                onClick={handleDismiss}
                className="self-end rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
              {platform === "ios" ? (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg bg-black text-white hover:bg-black/90 text-xs px-3"
                  onClick={handleDismiss}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Compris
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg bg-black text-white hover:bg-black/90 text-xs px-3"
                  onClick={handleInstall}
                >
                  <Download className="h-3.5 w-3.5" />
                  Installer
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}