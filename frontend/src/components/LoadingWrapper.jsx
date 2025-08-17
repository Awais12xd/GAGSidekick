// LoadingWrapper.jsx
import React, { useEffect, useState } from "react";

/**
 * LoadingWrapper
 * - Wrap your app with <LoadingWrapper duration={2500}> ... </LoadingWrapper>
 * - duration in milliseconds (default 2500)
 */
export default function LoadingWrapper({
  children,
  duration = 2500,
  title = "Garden Side",
  subtitle = "Live Stock Info , Weather and Merchant uodates and also a trading fair calculator!",
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0); // 0..100 for loading bar

  useEffect(() => {
    // start progress animation shortly after mount
    const start = setTimeout(() => setProgress(6), 60);

    // animate to 100% just before the overlay hides (so transition looks natural)
    const finishTime = Math.max(200, duration - 300);
    const to100 = setTimeout(() => setProgress(100), finishTime);

    // hide overlay after duration
    const t = setTimeout(() => setIsLoading(false), duration);

    return () => {
      clearTimeout(start);
      clearTimeout(to100);
      clearTimeout(t);
    };
  }, [duration]);

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-500000 transform transition-all duration-700 ease-in-out`}
        style={{
          pointerEvents: isLoading ? "auto" : "none",
          // overlay background transitions to transparent when done
          backgroundColor: isLoading ? "rgba(0,0,0,0.9)" : "transparent",
          backdropFilter: isLoading ? "blur(8px)" : "none",
          WebkitBackdropFilter: isLoading ? "blur(8px)" : "none",
          opacity: isLoading ? 1 : 0,
          transform: isLoading ? "translateY(0)" : "translateY(-100%)",
        }}
        aria-hidden={!isLoading}
      >
        <div className="flex flex-col items-center w-max px-6 py-6">
          <div className="min-h-[55px] w-full overflow-hidden">
            <h1
              className="text-center lg:text-5xl md:text-4xl text-3xl font-bold text-white"
              style={{
                transform: isLoading ? "translateY(0)" : "translateY(-100%)",
                transition: "transform 700ms cubic-bezier(.2,.9,.2,1)",
                willChange: "transform",
              }}
            >
              {title}
            </h1>
          </div>

          {/* animated loading bar container */}
          <div className="w-full mt-3 h-1 bg-white/10 rounded-full overflow-hidden my-3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, rgba(100,255,218,1) 0%, rgba(6,125,95,1) 60%)",
                transition: `width ${Math.max(300, duration - 200)}ms linear`,
                boxShadow: "0 6px 18px rgba(10,25,35,0.5)",
              }}
            />
          </div>

          <div className="min-h-[30px] w-full overflow-hidden">
            <p
              className="text-center lg:text-xl md:text-lg text-[15px] uppercase text-[#9fb0c8] font-semibold"
              style={{
                transform: isLoading ? "translateY(0)" : "translateY(100%)",
                transition: "transform 700ms cubic-bezier(.2,.9,.2,1)",
                willChange: "transform",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* main content (rendered under the overlay). Keep it in the tree so layout stable */}
      <div style={{ filter: isLoading ? "none" : "none", transition: "filter 300ms" }}>
        {children}
      </div>
    </>
  );
}
