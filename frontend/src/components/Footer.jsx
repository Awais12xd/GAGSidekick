import React from "react";

/**
 * Footer.jsx
 * Single-line professional footer that matches your site's palette.
 * Usage: <Footer />
 * Props:
 *  - text: optional override for the single line copy
 */

export default function Footer({
  text = "Built for Grow A Garden players — data is proxied. Live updates powered by WebSocket.",
}) {
  return (
    <footer className="w-full bg-[#071226]">
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <p className="mx-auto flex items-center justify-center gap-2 text-xs text-[#9fb0c8] leading-tight">
          {/* accent icon */}
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="flex-shrink-0"
          >
            <path
              d="M12 2v6l4-4-4 10v6l-4-10-4 4 4-10V2h4z"
              fill="#64ffda"
              opacity="0.95"
            />
          </svg>

          <span className="text-center">{text}</span>
        </p>
      </div>
    </footer>
  );
}
