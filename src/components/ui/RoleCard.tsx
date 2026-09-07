"use client";
import { useState } from "react";

export interface Role {
  tag: string;
  title: string;
  body: string;
  backTitle: string;
  steps: string[];
  icon: React.ReactNode;
  accent: string;
}

export function RoleCard({ role, index }: { role: Role; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-card group h-[236px] ${flipped ? "is-flipped" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`${role.tag}: ${role.title}. Tap to see how it works.`}
      onClick={() => setFlipped((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((v) => !v);
        }
      }}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flip-inner">
        {/* FRONT */}
        <div className="flip-face relative overflow-hidden rounded-2xl border border-border bg-canvas p-6 shadow-card">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100"
            style={{ background: `radial-gradient(circle at center, ${role.accent} 0%, transparent 70%)` }}
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${role.accent}22`, color: role.accent }}>
              {role.icon}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: role.accent }}>
              {role.tag}
            </div>
          </div>
          <div className="mt-4 font-display text-lg font-semibold leading-tight">{role.title}</div>
          <p className="mt-2 text-sm leading-snug text-ink/70">{role.body}</p>
          <div className="absolute bottom-4 left-6 flex items-center gap-1.5 text-xs font-medium" style={{ color: role.accent }}>
            <span>How it works</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 9 A5 5 0 1 1 10 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d="M10 2 L10 5 L7 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* BACK */}
        <div
          className="flip-back flip-face flex flex-col rounded-2xl border p-6 text-white shadow-card"
          style={{ background: `linear-gradient(150deg, ${role.accent}, ${shade(role.accent)})` }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-white/80">{role.tag}</div>
          <div className="mt-1 font-display text-lg font-semibold leading-snug">{role.backTitle}</div>
          <ol className="mt-4 space-y-2.5">
            {role.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/25 text-[11px] font-semibold">
                  {i + 1}
                </span>
                <span className="leading-snug text-white/95">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// Darken a hex colour for the back gradient
function shade(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = Math.max(0, ((n >> 16) & 255) - 60);
  const g = Math.max(0, ((n >> 8) & 255) - 60);
  const b = Math.max(0, (n & 255) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

export const TraderIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 8 L6 4 H18 L20 8 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M6 8 V20 H18 V8" stroke="currentColor" strokeWidth="1.6" />
    <rect x="10" y="12" width="4" height="8" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
export const OfficerIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 12 L11 14 L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
export const AllocatorIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 6 L9 4 L15 6 L20 4 V18 L15 20 L9 18 L4 20 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 4 V18 M15 6 V20" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
export const CitizenIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="9" y="7" width="6" height="6" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);
