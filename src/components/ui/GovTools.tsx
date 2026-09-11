"use client";
import { useEffect, useState } from "react";

/**
 * Government-portal utility controls: text-size scaling, high-contrast mode and
 * an English / हिन्दी language toggle. All preferences persist in localStorage
 * and are applied to <html> so the whole interface responds (rem-based spacing
 * scales with the font size).
 */
const STEPS = [0.9, 1, 1.1, 1.25];

export function GovTools() {
  const [fs, setFs] = useState(1);
  const [hc, setHc] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    try {
      const s = parseFloat(localStorage.getItem("ms_fs") || "1") || 1;
      const c = localStorage.getItem("ms_hc") === "1";
      const l = (localStorage.getItem("ms_lang") as "en" | "hi") || "en";
      applyFs(s);
      applyHc(c);
      applyLang(l);
      setFs(s);
      setHc(c);
      setLang(l);
    } catch {}
  }, []);

  const applyFs = (v: number) => document.documentElement.style.setProperty("--fs", String(v));
  const applyHc = (v: boolean) =>
    document.documentElement.setAttribute("data-contrast", v ? "high" : "normal");
  const applyLang = (v: "en" | "hi") => document.documentElement.setAttribute("data-lang", v);

  const save = (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };

  const bump = (dir: number) => {
    const idx = STEPS.indexOf(fs);
    const next = STEPS[Math.min(STEPS.length - 1, Math.max(0, (idx < 0 ? 1 : idx) + dir))];
    setFs(next);
    applyFs(next);
    save("ms_fs", String(next));
  };

  const toggleHc = () => {
    const v = !hc;
    setHc(v);
    applyHc(v);
    save("ms_hc", v ? "1" : "0");
  };

  const toggleLang = () => {
    const v = lang === "en" ? "hi" : "en";
    setLang(v);
    applyLang(v);
    save("ms_lang", v);
  };

  const ctl =
    "grid h-6 min-w-[24px] place-items-center rounded border border-white/20 bg-white/5 px-1.5 text-white/90 transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white";

  return (
    <div className="flex items-center gap-1.5">
      <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="Text size">
        <button className={ctl} onClick={() => bump(-1)} aria-label="Decrease text size" title="Smaller text">
          A<span className="text-[9px]">-</span>
        </button>
        <button className={ctl} onClick={() => bump(1)} aria-label="Increase text size" title="Larger text">
          A<span className="text-[9px]">+</span>
        </button>
      </div>
      <button
        className={ctl}
        onClick={toggleHc}
        aria-pressed={hc}
        aria-label="Toggle high contrast"
        title="High contrast"
      >
        {/* contrast glyph */}
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
        </svg>
      </button>
      <button
        className="h-6 rounded border border-white/25 bg-white/10 px-2 text-[11px] font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        onClick={toggleLang}
        aria-label={lang === "en" ? "हिन्दी में देखें" : "View in English"}
        title="Language"
      >
        {lang === "en" ? "हिन्दी" : "English"}
      </button>
    </div>
  );
}
