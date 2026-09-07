import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  accent = "#0B5FFF",
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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-canvas p-5 shadow-card">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 blur-2xl"
        style={{ background: `radial-gradient(circle, ${accent}33, transparent 70%)` }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div className="text-sm text-ink/60">{label}</div>
        {icon && (
          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: `${accent}1a`, color: accent }}>
            {icon}
          </div>
        )}
      </div>
      <div className="relative mt-2 font-display text-3xl font-semibold tabular-nums">{value}</div>
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
