"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppFloatProps {
  visible?: boolean;
}

export function WhatsAppFloat({ visible = true }: WhatsAppFloatProps) {
  const [hovered, setHovered] = useState(false);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip label — desktop only, slides in from the right */}
      <span
        className={`
          hidden md:inline-flex items-center rounded-lg bg-white px-3 py-1.5
          text-sm font-medium text-gray-700 shadow-md
          transition-all duration-300 ease-out
          ${hovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"}
        `}
        aria-hidden="true"
      >
        Besoin d&apos;aide&nbsp;?
        {/* Small caret pointing right */}
        <svg
          className="ml-1 h-3 w-3 text-gray-300"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4 2 l6 4 -6 4 Z" />
        </svg>
      </span>

      {/* Pulse ring */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute
          h-14 w-14 rounded-full md:h-16 md:w-16
          animate-ping
          bg-[#25D366]/30
        "
      />

      {/* Main button */}
      <a
        href="https://wa.me/2217848582226?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20Boutiko"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactez-nous sur WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="
          relative flex h-14 w-14 items-center justify-center
          rounded-full bg-[#25D366] text-white
          shadow-lg shadow-[#25D366]/40
          transition-transform duration-200 ease-out
          hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/50
          active:scale-95
          md:h-16 md:w-16
        "
      >
        <MessageCircle className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.2} />
      </a>
    </div>
  );
}
