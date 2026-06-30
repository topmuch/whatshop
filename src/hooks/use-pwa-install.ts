"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Platform = "ios" | "android" | "desktop";

interface UsePWAInstallReturn {
  canInstall: boolean;
  install: () => Promise<void>;
  isInstalled: boolean;
  isIOS: boolean;
  isSafari: boolean;
  platform: Platform;
}

// ─── Platform Detection (exported for reuse) ─────────────────────────────────

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Safari on iOS or desktop — no Chrome/Edge/Firefox indicators
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebKit = /WebKit/.test(ua);
  const isNotChrome = !/CriOS|FxiOS|OPiOS/.test(ua);
  const isDesktopSafari =
    !isIOS && /Safari/.test(ua) && !/Chrome|Edge|Firefox|OPR/.test(ua);
  return (isIOS && isWebKit && isNotChrome) || isDesktopSafari;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePWAInstall(shopSlug?: string): UsePWAInstallReturn {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(display-mode: standalone)").matches
      : false,
  );
  const platform = useRef<Platform>("desktop");
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Detect platform once on mount (SSR-safe)
  useEffect(() => {
    platform.current = detectPlatform();
  }, []);

  // Listen for beforeinstallprompt & appinstalled
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Keep isInstalled in sync with the media query
  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Install action
  const install = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setCanInstall(false);
      }

      // Track installation event
      if (shopSlug) {
        try {
          await fetch("/api/track/pwa-install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shopSlug,
              platform: platform.current,
            }),
          });
        } catch {
          // Tracking failure is non-critical — silently ignore
        }
      }
    } finally {
      deferredPromptRef.current = null;
    }
  }, [shopSlug]);

  const currentPlatform = typeof window !== "undefined" ? detectPlatform() : "desktop";

  return {
    canInstall,
    install,
    isInstalled,
    isIOS: currentPlatform === "ios",
    isSafari: isSafariBrowser(),
    platform: currentPlatform,
  };
}