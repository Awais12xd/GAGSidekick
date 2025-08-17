// ContactBanner.jsx
import React from "react";

/**
 * ContactBanner
 * Plain React + Tailwind CSS (no Next.js, no Framer Motion, no TypeScript)
 *
 * Place <ContactBanner /> where you want the banner to appear.
 * The CTA uses mailto: — change the address as needed.
 */

export default function PageBanner({
  title = "Get In Touch",
  pretitle = "Trading Calculator",
  subtitle = "I’m currently looking for new opportunities — my inbox is always open. Whether you have a question or just want to say hi, I’ll try my best to get back to you!",
  buttonText = "Try It Now",
  lastUpdated="",
}) {
  return (
    <section id="contact" className="w-full py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden  shadow-2xl p-8 sm:p-12">
          {/* subtle decorative accent */}
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 20% 20%, rgba(100,255,218,0.14), rgba(6,20,34,0.0) 45%)",
            }}
          />

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* left: small badge/icon */}
            {/* <div className="flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center bg-[#0b2a33]/40 border border-white/4">
              <svg className="w-10 h-10 text-[#64ffda]" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2l3 6 6 .5-4.5 4 1.5 6L12 16l-6 3 1.5-6L3 8.5 9 8 12 2z" fill="#64ffda" />
              </svg>
            </div> */}

            {/* center: text */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {/* <div className="flex items-center justify-center md:justify-start gap-3">
                <p className="text-xs font-semibold text-[#64ffda] tracking-widest">Home / {pretitle}</p>
              </div> */}

              <h2
                className="mt-3 font-extrabold leading-tight text-2xl sm:text-4xl md:text-5xl truncate text-center"
                style={{
                  background: "linear-gradient(90deg, #64ffda 0%, #9effe0 45%, rgba(255,255,255,0.9) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 8px 28px rgba(2,6,23,0.6)",
                }}
              >
                {title}
              </h2>

              <p className="mt-4 text-center max-w-2xl mx-auto md:mx-0 text-sm sm:text-base text-[#bcd4ea]">
                {subtitle}
              </p>

              <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
                {/* <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-md bg-gradient-to-r from-[#064d3e] to-[#0a6b55] text-sm font-semibold text-[#e7fff9] shadow-lg hover:translate-y-[-2px] transition-transform focus:outline-none focus:ring-2 focus:ring-[#64ffda]/40"
                  aria-label="Send email"
                >
                
                  {buttonText}
                </a> */}

                {/* <a
                  href="#stock"
                  className="inline-flex items-center px-3 py-2 rounded-md bg-[#06202b] border border-white/6 text-sm text-[#9fb0c8] hover:bg-[#07303a] transition-colors"
                >
                  View Stock
                </a> */}
              </div>
            </div>

            {/* right: small live indicator */}
            {/* <div className="flex-shrink-0 hidden md:flex flex-col items-end">
              <div className="text-xs text-[#9fb0c8]">Live</div>
              <div className="mt-1 text-sm font-semibold text-[#64ffda]">WebSocket</div>
            </div> */}
          </div>

          {/* bottom small note */}
          <div className="mt-6 md:text-left text-xs flex justify-end w-full text-[#9fb0c8] opacity-90">
            Pets values last updated on : {lastUpdated}
          </div>
        </div>
      </div>
    </section>
  );
}
