"use client";
import Link from "next/link";

/**
 * Graceful boundary for any server/client exception inside the dashboard. Keeps
 * the masthead + nav (this renders inside the layout) and replaces only the page
 * body — so a single failing query never white-screens the whole app. The most
 * common cause is a pending database migration; the copy says so.
 */
export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[55vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-canvas p-8 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning/15 text-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l9 16H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold">This page could not load</h1>
        <p className="mt-2 text-sm text-ink/70">
          Something went wrong fetching the data. If this is a fresh deployment, a database migration may
          still be pending. Try again, or return to your dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary">Try again</button>
          <Link href="/dashboard" className="btn-outline">Back to dashboard</Link>
        </div>
        {error?.digest && <p className="mt-4 font-mono text-xs text-ink/40">Ref: {error.digest}</p>}
      </div>
    </div>
  );
}
