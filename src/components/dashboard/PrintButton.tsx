"use client";

export function PrintButton({ label = "Print / Save as PDF", className = "btn-primary" }: { label?: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
        <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
