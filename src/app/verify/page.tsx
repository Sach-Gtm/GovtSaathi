import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { VideoCard } from "@/components/ui/VideoShowcase";

export const metadata = { title: "Verify a certificate — Govt Saathi" };

export default function VerifyIndex({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="container-app py-5">
        <Link href="/"><Logo /></Link>
      </header>

      <div className="container-app grid gap-10 pt-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Left — the check */}
        <div className="max-w-xl">
          <div className="badge-brand mb-4 inline-flex">Public check · free for everyone</div>
          <h1 className="font-display text-4xl font-semibold">Is this scale really verified?</h1>
          <p className="mt-3 leading-relaxed text-ink/70">
            Point your phone camera at the QR sticker on the scale or the pump. It opens this page with the
            number already filled in. Or type the number printed under the QR by hand.
          </p>

          <form action="/verify" method="get" className="card mt-8 p-6">
            <label className="field-label" htmlFor="q">Certificate number</label>
            <div className="flex gap-2">
              <input
                id="q"
                name="q"
                defaultValue={searchParams.q ?? ""}
                placeholder="e.g. LM-2026-a1b2c3d4"
                className="field-input font-mono"
                autoFocus
              />
              <button type="submit" formAction={`/verify/${encodeURIComponent(searchParams.q ?? "")}`} className="btn-primary">
                Check
              </button>
            </div>
            <p className="field-hint mt-2">
              Numbers look like <span className="kbd">LM-2026-XXXXXXXX</span>. No account needed.
            </p>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-canvas p-4 text-sm text-ink/70">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-success">
              <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span>
              The proof is stored inside the QR code itself, so a scan works even where the shop has no
              internet. A copied or tampered sticker will not pass.
            </span>
          </div>
        </div>

        {/* Right — how people use it */}
        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">How people use it</div>
          <VideoCard
            item={{
              src: "/demo-market.mp4",
              poster: "/demo-market-poster.jpg",
              title: "One kilo of tomatoes, checked in seconds",
              caption: "She scans the sticker on the vendor's scale before paying"
            }}
          />
          <p className="mt-3 text-sm text-ink/60">
            A quick scan at the market or the petrol pump tells any customer the scale has really been
            checked by the government — and until when it stays valid.
          </p>
        </div>
      </div>
    </main>
  );
}
