"use client";

import { useSyncExternalStore, useCallback, useRef, useReducer, useEffect } from "react";
import { WifiOff, WifiLow, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ConnectionStatus = "online" | "offline" | "slow";

const LATENCY_THRESHOLD_SLOW = 3000;

/* ---- Online/Offline external store (useSyncExternalStore) ---- */

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}
function snapOnline() { return navigator.onLine; }
function snapOnlineSSR() { return true; }

/* ---- Reducer for async connection state updates ---- */

interface ConnState {
  status: ConnectionStatus;
  latency: number | null;
}

type ConnAction =
  | { type: "MEASURE_RESULT"; latency: number }
  | { type: "OFFLINE" }
  | { type: "FETCH_FAILED" };

function connReducer(state: ConnState, action: ConnAction): ConnState {
  switch (action.type) {
    case "MEASURE_RESULT":
      return {
        latency: action.latency,
        status: action.latency > LATENCY_THRESHOLD_SLOW ? "slow" : "online",
      };
    case "OFFLINE":
    case "FETCH_FAILED":
      return { status: "offline", latency: null };
    default:
      return state;
  }
}

const initialState: ConnState = { status: "online", latency: null };

/* ---- Component ---- */

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribeOnline, snapOnline, snapOnlineSSR);
  const [conn, dispatch] = useReducer(connReducer, initialState);
  const [dismissed, setDismissed] = useReducer((d: boolean, action: boolean | "reset") => {
    if (action === "reset") return false;
    return action;
  }, false);

  // Measure latency — dispatches to reducer, never calls setState directly
  const measureLatency = useCallback(() => {
    if (!navigator.onLine) {
      dispatch({ type: "OFFLINE" });
      return;
    }
    const start = performance.now();
    fetch("/api/route", { method: "HEAD", cache: "no-store" })
      .then(() => {
        const ms = performance.now() - start;
        dispatch({ type: "MEASURE_RESULT", latency: Math.round(ms) });
      })
      .catch(() => {
        dispatch({ type: "FETCH_FAILED" });
      });
  }, []);

  // Set up monitoring: periodic + event-driven
  useEffect(() => {
    // Initial measurement
    measureLatency();

    // Periodic
    const id = setInterval(measureLatency, 30_000);

    // Event-driven re-measurement
    const handleOnline = () => {
      setTimeout(measureLatency, 500);
    };
    const handleOffline = () => {
      dispatch({ type: "OFFLINE" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(id);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [measureLatency]);

  // Reset dismissed state when coming back online
  const prevOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (isOnline && !prevOnlineRef.current) {
      setDismissed("reset");
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const status: ConnectionStatus = isOnline ? conn.status : "offline";

  if (status === "online" || dismissed) return null;

  const config = {
    offline: {
      icon: WifiOff,
      bg: "bg-gray-900",
      text: "Vous êtes hors ligne",
      subtext: "Les données affichées peuvent ne pas être à jour",
      subColor: "text-gray-300",
    },
    slow: {
      icon: WifiLow,
      bg: "bg-amber-600",
      text: "Connexion lente",
      subtext: conn.latency ? `Latence: ${conn.latency}ms` : "Chargement plus long que d'habitude",
      subColor: "text-amber-100",
    },
  };

  const { icon: Icon, bg, text, subtext, subColor } = config[status];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className={`${bg} text-white relative flex items-center justify-center gap-2 px-4 py-2 text-center`}>
          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{text}</span>
            {subtext && (
              <span className={`hidden sm:inline text-xs ${subColor}`}>&mdash; {subtext}</span>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}