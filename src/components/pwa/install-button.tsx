"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { IOSInstallInstructions } from "./ios-install-instructions";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InstallButtonProps {
  shopSlug: string;
  shopName: string;
  variant: "banner" | "floating" | "inline";
  /** Shop theme colour (e.g. "#e11d48") — used for accents */
  themeColor?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DISMISS_KEY = (slug: string) => `boutiko-pwa-${slug}-dismissed`;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FLOATING_SHOW_DELAY_MS = 5_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDismissed(slug: string): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY(slug));
  if (!raw) return false;
  try {
    return Date.now() - parseInt(raw, 10) < SEVEN_DAYS_MS;
  } catch {
    return false;
  }
}

function markDismissed(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISS_KEY(slug), Date.now().toString());
}

// ─── Banner Variant ─────────────────────────────────────────────────────────

function BannerVariant({
  shopSlug,
  shopName,
  themeColor,
  onIOSInstruct,
}: {
  shopSlug: string;
  shopName: string;
  themeColor: string;
  onIOSInstruct: () => void;
}) {
  const { canInstall, install, isIOS } = usePWAInstall(shopSlug);
  const [visible, setVisible] = useState(() => !isDismissed(shopSlug));

  const handleDismiss = useCallback(() => {
    setVisible(false);
    markDismissed(shopSlug);
  }, [shopSlug]);

  const handleAction = useCallback(() => {
    if (isIOS) {
      onIOSInstruct();
      handleDismiss();
    } else if (canInstall) {
      install();
      handleDismiss();
    }
  }, [isIOS, canInstall, install, onIOSInstruct, handleDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5 shadow-md sm:px-6"
            style={{
              backgroundColor: themeColor || "var(--background)",
              color:
                themeColor
                  ? "#fff"
                  : "var(--foreground)",
            }}
          >
            {/* Shop icon */}
            <img
              src={`/api/manifest/${shopSlug}/icon/96`}
              alt={shopName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
            />

            <span className="flex-1 truncate text-sm font-medium">
              Installer {shopName}
            </span>

            {isIOS ? (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 gap-1.5 rounded-full px-3 text-xs"
                onClick={handleAction}
              >
                Compris
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 gap-1.5 rounded-full px-3 text-xs"
                onClick={handleAction}
                disabled={!canInstall}
              >
                <Download className="h-3 w-3" />
                Installer
              </Button>
            )}

            <button
              onClick={handleDismiss}
              className="rounded-full p-1 transition-colors hover:bg-white/20"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Floating Variant ────────────────────────────────────────────────────────

function FloatingVariant({
  shopSlug,
  shopName,
  themeColor,
  onIOSInstruct,
}: {
  shopSlug: string;
  shopName: string;
  themeColor: string;
  onIOSInstruct: () => void;
}) {
  const { canInstall, install, isIOS } = usePWAInstall(shopSlug);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), FLOATING_SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useCallback(() => {
    if (isIOS) {
      onIOSInstruct();
    } else if (canInstall) {
      install();
    }
  }, [isIOS, canInstall, install, onIOSInstruct]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          onClick={handleClick}
          className="fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-shadow hover:shadow-xl"
          style={{ backgroundColor: themeColor || "#000000" }}
          aria-label={`Installer l'app ${shopName}`}
        >
          {/* Pulse ring */}
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-20"
            style={{ backgroundColor: themeColor || "#000000" }}
          />

          <Download className="h-4 w-4" />
          <span>Installer l&apos;app</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Inline Variant ──────────────────────────────────────────────────────────

function InlineVariant({
  shopSlug,
  shopName,
  themeColor,
  onIOSInstruct,
}: {
  shopSlug: string;
  shopName: string;
  themeColor: string;
  onIOSInstruct: () => void;
}) {
  const { canInstall, install, isIOS } = usePWAInstall(shopSlug);

  const handleClick = useCallback(() => {
    if (isIOS) {
      onIOSInstruct();
    } else if (canInstall) {
      install();
    }
  }, [isIOS, canInstall, install, onIOSInstruct]);

  return (
    <Button
      size="sm"
      className="gap-2"
      style={
        themeColor
          ? {
              backgroundColor: themeColor,
              color: "#fff",
            }
          : undefined
      }
      onClick={handleClick}
    >
      <Download className="h-4 w-4" />
      Installer l&apos;app
    </Button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function InstallButton({
  shopSlug,
  shopName,
  variant,
  themeColor,
}: InstallButtonProps) {
  const { isInstalled } = usePWAInstall(shopSlug);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);

  const resolvedColor = useMemo(() => themeColor || "#000000", [themeColor]);

  const iosInstruct = useCallback(() => setIosDialogOpen(true), []);

  // Don't render anything if already installed
  if (isInstalled) return null;

  const variantProps = {
    shopSlug,
    shopName,
    themeColor: resolvedColor,
    onIOSInstruct: iosInstruct,
  };

  return (
    <>
      {variant === "banner" && <BannerVariant {...variantProps} />}
      {variant === "floating" && <FloatingVariant {...variantProps} />}
      {variant === "inline" && <InlineVariant {...variantProps} />}

      <IOSInstallInstructions
        shopName={shopName}
        open={iosDialogOpen}
        onOpenChange={setIosDialogOpen}
        themeColor={resolvedColor}
      />
    </>
  );
}