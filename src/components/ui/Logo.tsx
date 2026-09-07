export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width="28" height="28" viewBox="0 0 28 28" className="text-ink" aria-hidden="true">
        <rect x="1" y="1" width="26" height="26" rx="6" fill="currentColor" />
        <path d="M8 14 L13 19 L20 9" stroke="#F5C400" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Govt<span className="text-brand">Sathi</span>
        </span>
      )}
    </span>
  );
}
