"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Interactive 3D verification scene for the hero banner. Layers float in depth
 * and tilt to the pointer (parallax); a live weight readout ticks over time.
 * All motion is CSS transform based (GPU) and disabled under reduced-motion.
 */
export function HeroScene() {
  const stage = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [w, setW] = useState("500.02");

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  // Pointer parallax
  useEffect(() => {
    if (reduced) return;
    const el = stage.current;
    if (!el) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", String(-py * 9));
        el.style.setProperty("--ry", String(px * 12));
        el.style.setProperty("--mx", String(px));
        el.style.setProperty("--my", String(py));
      });
    };
    const reset = () => {
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Live readout (the "4D" / time element)
  useEffect(() => {
    if (reduced) return;
    const seq = ["499.98", "500.00", "500.01", "500.02", "500.00"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setW(seq[i]);
    }, 1600);
    return () => clearInterval(t);
  }, [reduced]);

  const layer = (depth: number): React.CSSProperties => ({
    transform: `translate3d(calc(var(--mx,0) * ${depth}px), calc(var(--my,0) * ${depth}px), 0)`
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[500px]" style={{ perspective: "1200px" }}>
      <div
        ref={stage}
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
          transition: "transform .25s cubic-bezier(.2,.8,.2,1)"
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(18,163,98,0.5), transparent 65%)" }}
          aria-hidden
        />

        {/* Certificate card — glass */}
        <div
          className={`absolute left-[4%] top-[14%] w-[54%] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur ${reduced ? "" : "gs-float-slow"}`}
          style={layer(26)}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand">LM Certificate</div>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-ink/60">LM-2026-A1B2C3D4</div>
          <div className="mt-3 rounded-lg bg-ink px-3 py-2 text-white">
            <div className="text-[9px] uppercase tracking-wide text-white/50">Live reading</div>
            <div className="font-mono text-2xl font-semibold tabular-nums text-accent" style={{ minWidth: "5ch" }}>
              {w}<span className="ml-1 text-xs text-white/60">kg</span>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-[10px]">
            <dt className="text-ink/45">Class</dt><dd className="text-right font-medium">III</dd>
            <dt className="text-ink/45">Outcome</dt><dd className="text-right font-semibold text-accent">Pass</dd>
            <dt className="text-ink/45">Valid until</dt><dd className="text-right font-medium">13 Mar 2027</dd>
          </dl>
        </div>

        {/* QR sticker */}
        <div
          className={`absolute right-[2%] top-[46%] w-[37%] rounded-2xl border border-white/20 bg-white p-3 shadow-2xl ${reduced ? "" : "gs-float"}`}
          style={layer(46)}
        >
          <QrGlyph />
          <div className="mt-1.5 text-center font-mono text-[9px] text-ink/60">Scan to verify</div>
        </div>

        {/* Verified rosette */}
        <div
          className={`absolute right-[10%] top-[10%] ${reduced ? "" : "gs-float-alt"}`}
          style={layer(60)}
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-white shadow-band ring-4 ring-white/25">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        {/* Offline chip */}
        <div
          className="absolute bottom-[10%] left-[14%] flex items-center gap-2 rounded-full border border-white/25 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-ink shadow-lg"
          style={layer(34)}
        >
          <span className="grid h-4 w-4 place-items-center rounded-full bg-success text-white">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          Validates offline
        </div>
      </div>
    </div>
  );
}

function QrGlyph() {
  const tiles = [
    [4, 32], [10, 32], [16, 32], [28, 32], [40, 32], [46, 32], [58, 32],
    [4, 40], [16, 40], [22, 40], [34, 40], [46, 40], [64, 40], [76, 40],
    [4, 48], [10, 48], [22, 48], [34, 48], [52, 48], [70, 48],
    [10, 56], [22, 56], [28, 56], [40, 56], [52, 56], [58, 56], [70, 56], [82, 56],
    [4, 64], [16, 64], [28, 64], [46, 64], [64, 64], [76, 64],
    [34, 72], [46, 72], [58, 72], [70, 72], [82, 72],
    [40, 80], [52, 80], [64, 80], [76, 80], [88, 80],
    [34, 88], [46, 88], [70, 88], [82, 88]
  ];
  const finder = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="4" y="4" width="24" height="24" fill="#0B1220" />
      <rect x="10" y="10" width="12" height="12" fill="#fff" />
      <rect x="13" y="13" width="6" height="6" fill="#0B1220" />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label="QR code">
      <rect width="100" height="100" fill="#fff" />
      {finder(0, 0)}
      {finder(72, 0)}
      {finder(0, 72)}
      {tiles.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="6" height="6" fill="#0B1220" />
      ))}
    </svg>
  );
}
