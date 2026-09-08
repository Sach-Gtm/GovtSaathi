"use client";
import { useEffect, useState } from "react";
import { LogoMark } from "./LogoMark";

/**
 * Full-viewport splash shown once per browser session on cold load.
 *
 * - Uses sessionStorage so route changes and refreshes within the same tab
 *   don't re-trigger the animation.
 * - Respects prefers-reduced-motion by exiting immediately.
 * - Never blocks the underlying page: after 1.7s it fades out and unmounts.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "enter" | "leaving" | "done">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem("govtsaathi:splash") === "1";
    } catch {}

    if (alreadyShown) {
      setPhase("done");
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      try { sessionStorage.setItem("govtsaathi:splash", "1"); } catch {}
      setPhase("done");
      return;
    }

    setPhase("enter");
    const t1 = setTimeout(() => setPhase("leaving"), 750);
    const t2 = setTimeout(() => {
      try { sessionStorage.setItem("govtsaathi:splash", "1"); } catch {}
      setPhase("done");
    }, 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "done" || phase === "hidden") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] grid place-items-center bg-paper transition-opacity duration-500 ${
        phase === "leaving" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 tricolor-bar" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 tricolor-bar" />

      <div className="flex flex-col items-center gap-5">
        <div className="splash-mark">
          <LogoMark size={128} />
        </div>
        <div className="splash-word text-2xl sm:text-3xl font-display font-semibold tracking-tight">
          <span className="text-ink">MAAP</span><span className="text-brand">SETU</span>
        </div>
        <div className="splash-tag mt-1 text-xs uppercase tracking-[0.24em] text-ink/50">
          Verified · Signed · Traceable
        </div>
      </div>

      <style>{`
        @keyframes splashPop {
          0%   { opacity: 0; transform: scale(0.85); }
          60%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashRise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-mark { animation: splashPop 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .splash-word { animation: splashRise 0.6s ease-out 0.3s both; }
        .splash-tag  { animation: splashRise 0.6s ease-out 0.5s both; }
      `}</style>
    </div>
  );
}
