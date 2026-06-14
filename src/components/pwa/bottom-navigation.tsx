"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Package, ShoppingCart, Radio, LayoutDashboard } from "lucide-react";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  query?: string;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    {
      label: "Accueil",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Produits",
      icon: Package,
      href: "/dashboard",
      query: "products",
    },
    {
      label: "Commandes",
      icon: ShoppingCart,
      href: "/dashboard",
      query: "orders",
    },
    {
      label: "Live",
      icon: Radio,
      href: "/dashboard",
      query: "live",
    },
  ];

  const getActiveIndex = useCallback((): number => {
    if (!pathname.startsWith("/dashboard")) return -1;
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab") || "";
    if (tab === "products") return 1;
    if (tab === "orders") return 2;
    if (tab === "live") return 3;
    return 0;
  }, [pathname]);

  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Track mobile breakpoint via resize listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize(); // Initial check via callback (not direct setState in effect body)
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync active index when pathname changes
  useEffect(() => {
    setActiveIndex(getActiveIndex());
  }, [getActiveIndex]);

  // Derive visibility from pathname + mobile state
  useEffect(() => {
    setVisible(pathname.startsWith("/dashboard") && isMobile);
  }, [pathname, isMobile]);

  const handleNav = useCallback(
    (item: NavItem, index: number) => {
      if (item.query) {
        router.push(`${item.href}?tab=${item.query}`);
      } else {
        router.push(item.href);
      }
      setActiveIndex(index);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [router]
  );

  if (!visible) return null;

  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {items.map((item, index) => {
          const active = activeIndex === index;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item, index)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
                active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
              style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
            >
              <div
                className={`absolute -top-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-black dark:bg-white transition-all ${
                  active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                }`}
              />
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}