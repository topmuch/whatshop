"use client";

import { useEffect, useRef } from "react";

interface ServiceWorkerRegistrarProps {
  /** Optional shop slug for shop-specific PWA context */
  shopSlug?: string;
}

/**
 * Renderless component that registers the /sw.js service worker.
 * Mount once in the shop layout to enable offline support and PWA features.
 */
export function ServiceWorkerRegistrar({
  shopSlug: _shopSlug,
}: ServiceWorkerRegistrarProps) {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    function doRegister() {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Listen for controller change (new SW activated) — optionally reload
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "activated" &&
                navigator.serviceWorker.controller
              ) {
                // A new service worker took over — could reload if desired.
                // For now we let the new SW serve requests naturally.
              }
            });
          });
        })
        .catch((err) => {
          // SW registration failed — non-critical for shop functionality
          console.warn("[SW] Registration failed:", err);
        });
    }

    // Register after window load to avoid blocking first paint
    if (document.readyState === "complete") {
      doRegister();
    } else {
      window.addEventListener("load", doRegister, { once: true });
    }
  }, []);

  return null;
}