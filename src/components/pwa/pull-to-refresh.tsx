"use client";

import { useRef, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

const DEFAULT_THRESHOLD = 80;

export function PullToRefresh({
  onRefresh,
  children,
  threshold = DEFAULT_THRESHOLD,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only trigger at the top of the scroll
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 5) return;

    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);

      // Apply resistance — the further you pull, the harder it gets
      const resistedDistance = Math.pow(distance, 0.7);

      if (distance > 10) {
        setIsPulling(true);
        setPullDistance(Math.min(resistedDistance, threshold * 1.5));
      }
    },
    [isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const distance = Math.max(0, currentY.current - startY.current);

    if (distance >= threshold && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true);
      setIsPulling(false);
      setPullDistance(50);

      try {
        await onRefresh();
      } catch {
        // Refresh failed silently
      }

      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      // Snap back
      setIsPulling(false);
      setPullDistance(0);
    }

    startY.current = 0;
    currentY.current = 0;
  }, [isRefreshing, onRefresh, threshold]);

  const progress = Math.min(pullDistance / threshold, 1);
  const arrowRotation = isRefreshing ? 360 : progress * 180;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
      style={{ touchAction: "pan-y" }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isRefreshing ? 50 : pullDistance,
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <div
              className="flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5"
              style={{
                width: isRefreshing ? 36 : 28 + progress * 12,
                height: isRefreshing ? 36 : 28 + progress * 12,
              }}
            >
              <RefreshCw
                className="h-4 w-4 text-black dark:text-white"
                style={{
                  transform: `rotate(${arrowRotation}deg)`,
                  transition: isRefreshing ? "transform 1s linear infinite" : "none",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}