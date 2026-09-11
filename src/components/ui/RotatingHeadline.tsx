"use client";
import { useEffect, useState } from "react";

/**
 * Rotates the coloured, underlined phrase in the hero headline. Each phrase
 * slides up and fades out, the next slides up and fades in. The underline is
 * part of the animated element, so it always matches the phrase width.
 *
 * Under prefers-reduced-motion it holds the first phrase and does not cycle.
 */
export function RotatingHeadline({ phrases, holdMs = 2600 }: { phrases: string[]; holdMs?: number }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    if (reduced || phrases.length < 2) return;
    const hold = setTimeout(() => setPhase("out"), holdMs);
    return () => clearTimeout(hold);
  }, [i, reduced, phrases.length, holdMs]);

  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(() => {
      setI((v) => (v + 1) % phrases.length);
      setPhase("in");
    }, 380);
    return () => clearTimeout(t);
  }, [phase, phrases.length]);

  return (
    <span
      key={i}
      className={`relative inline-block ${!reduced ? (phase === "out" ? "rot-exit" : "rot-enter") : ""}`}
    >
      <span className="text-saffron">{phrases[i]}</span>
      <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-accent/70 sm:-bottom-2" aria-hidden />
    </span>
  );
}
