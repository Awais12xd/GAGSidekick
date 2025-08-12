// src/components/RarityBadge.jsx
import React from "react";

/**
 * RarityBadge
 * Props:
 *  - label: string (e.g. "Rare")
 *  - variant: string (used to pick background classes; e.g. "rare", "prismatic")
 *  - strokeWidth: number (outer stroke thickness in px) - default 2.4
 *  - fontSize: number (px) - default 12
 *  - className: extra wrapper classes
 *
 * Renders a rounded badge with background (Tailwind classes) and an SVG text.
 * The SVG draws a stroked text first (fill="none") then a white-filled text on top,
 * which creates an outer-stroke effect that doesn't fill the glyph.
 */

const rarityClass = (name) => {
  if (!name) return "bg-gray-200 text-white border-gray-300";
  const n = name.toString().toLowerCase();
  switch (n) {
    case "common":
      return "bg-gray-300 text-white border-gray-200";
    case "uncommon":
      return "bg-green-300 text-white border-green-300";
    case "rare":
      return "bg-sky-500 text-white border-sky-400";
    case "legendary":
      return "bg-yellow-400 text-white border-amber-500";
    case "mythical":
      return "bg-violet-400 text-white border-violet-500";
    case "divine":
      return "bg-orange-500 text-white border-teal-500";
    case "prismatic":
      return "bg-gradient-to-r from-pink-500 via-yellow-400 to-indigo-500 text-white border-transparent shadow-md ring-1 ring-white/20";
    default:
      return "bg-gray-300 text-white border-gray-300";
  }
};

const RarityBadge = ({
  label = "Common",
  variant = "common",
  strokeWidth = 2.4,
  fontSize = 12,
  res = "",
  className = "",
}) => {
  const text = String(label || "");
  // compute approximate width for viewBox (simple heuristic)
  const approxCharWidth = fontSize * 0.6;
  let padding, width, height;
  if (res === "sm") {
    padding = 2;
    width = Math.max(30, text.length * approxCharWidth + padding * 2);
    height = Math.max(20, fontSize + padding);
  } else if (res === "lg") {
    padding = 12;
    width = Math.max(80, text.length * approxCharWidth + padding * 2);
    height = Math.max(28, fontSize + padding);
  } else {
    padding = 12;
    width = Math.max(80, text.length * approxCharWidth + padding * 2);
    height = Math.max(28, fontSize + padding);
  }

  // choose stroke color (dark) — you can tune per-variant if desired
  const strokeColor = "rgb(50, 50, 50)";

  const wrapperClasses = `inline-flex items-center p-1 rounded-md ${rarityClass(
    label
  )} ${variant === "prismatic" ? "prismatic-badge" : ""} ${className}`;

  return (
    <div className={wrapperClasses} role="status" aria-label={`rarity ${text}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        {/* stroke text first (no fill) */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="700"
          fontSize={fontSize}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke"
        >
          {text}
        </text>

        {/* white fill text (over the stroke) */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="700"
          fontSize={fontSize}
          fill="white"
          paintOrder="fill"
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default RarityBadge;
