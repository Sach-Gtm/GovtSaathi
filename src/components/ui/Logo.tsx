import { LogoMark } from "./LogoMark";

export function Logo({
  compact = false,
  size = 34
}: {
  compact?: boolean;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <LogoMark size={size} />
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight leading-none">
          <span className="text-ink">Govt</span> <span className="text-brand">Saathi</span>
        </span>
      )}
    </span>
  );
}
