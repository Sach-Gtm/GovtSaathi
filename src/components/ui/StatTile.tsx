import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  accent = "#0B2E6F",
  icon,
  trend
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  icon?: React.ReactNode;
  trend?: { dir: "up" | "down" | "flat"; text: string };
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-canvas p-5 shadow-card transition-transform hover:-translate-y-0.5">
      {/* top accent keyline */}
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-80"
        style={{ background: `radial-gradient(circle, ${accent}40, transparent 70%)` }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="text-sm text-ink/60">{label}</div>
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon ?? <DefaultDot />}
        </div>
      </div>
      <div className="relative mt-2 font-display text-3xl font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
      <div className="relative mt-1 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.dir === "up" && "text-success",
              trend.dir === "down" && "text-danger",
              trend.dir === "flat" && "text-ink/50"
            )}
          >
            {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "→"} {trend.text}
          </span>
        )}
        {hint && <span className="text-ink/50">{hint}</span>}
      </div>
    </div>
  );
}

function DefaultDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
