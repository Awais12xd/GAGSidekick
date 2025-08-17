import React from "react";

/**
 * Re-usable heading used across the site.
 * Keeps a compact gradient dot, title and divider rule.
 */
export default function Heading({ headingText }) {
  return (
    <div className="flex items-center gap-4 w-full">
      {/* gradient dot */}
      <span
        aria-hidden
        className="w-3 h-3 rounded-full bg-gradient-to-r from-[#64ffda] to-[#9effe0] shadow-[0_10px_30px_rgba(100,255,218,0.12)]"
      />
      <h2 className="text-xl md:text-2xl font-extrabold text-[#ccd6f6] leading-tight">
        {headingText}
      </h2>

      {/* rule that stretches to the end */}
      <span className="flex-1 h-px bg-[#ccd6f6]/20 ml-4" />
    </div>
  );
}
