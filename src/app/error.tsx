"use client";
import Link from "next/link";

/** App-wide fallback so no route ever shows a raw white "server-side exception". */
export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-canvas p-8 text-center shadow-card">
        <h1 className="font-display text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink/70">
          We couldn’t load this page. Please try again in a moment.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary">Try again</button>
          <Link href="/" className="btn-outline">Home</Link>
        </div>
        {error?.digest && <p className="mt-4 font-mono text-xs text-ink/40">Ref: {error.digest}</p>}
      </div>
    </main>
  );
}
