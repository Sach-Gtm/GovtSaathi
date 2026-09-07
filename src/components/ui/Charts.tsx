/**
 * Lightweight, dependency-free SVG charts. Server-renderable — no client JS.
 */

export function ProgressRing({
  value,
  max = 100,
  size = 96,
  stroke = 10,
  color = "#0B5FFF",
  label,
  sublabel
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4E1D6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-lg font-semibold tabular-nums">{label ?? `${Math.round(pct * 100)}%`}</div>
        {sublabel && <div className="text-[10px] text-ink/50">{sublabel}</div>}
      </div>
    </div>
  );
}

export function BarChart({
  data,
  height = 180,
  format
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barH = height - 34;
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-4" style={{ height, minWidth: data.length * 56 }}>
        {data.map((d) => {
          const h = Math.round((d.value / max) * barH);
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-2" style={{ minWidth: 40 }}>
              <div className="text-xs font-semibold tabular-nums text-ink/70">
                {format ? format(d.value) : d.value}
              </div>
              <div
                className="w-full max-w-[40px] rounded-t-md transition-all"
                style={{ height: Math.max(4, h), background: d.color ?? "#0B5FFF" }}
                title={`${d.label}: ${d.value}`}
              />
              <div className="w-full truncate text-center text-[11px] text-ink/60" title={d.label}>
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Sparkline({
  points,
  width = 120,
  height = 32,
  color = "#0B5FFF"
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(points.length - 1) * step}
        cy={height - ((points[points.length - 1] - min) / span) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

export function HBar({
  label,
  value,
  max,
  color = "#0B5FFF",
  right
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  right?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink/80">{label}</span>
        <span className="tabular-nums text-ink/60">{right ?? value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
