import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata = { title: "Verify a certificate — GovtSathi" };

export default function VerifyIndex({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="container-app py-5">
        <Link href="/"><Logo /></Link>
      </header>
      <div className="container-app max-w-2xl pt-8">
        <div className="badge-brand mb-4 inline-flex">Public verifier</div>
        <h1 className="text-4xl font-display font-semibold">Check any weighing or measuring instrument</h1>
        <p className="mt-3 text-ink/70 leading-relaxed">
          Scan the QR sticker on the scale — it opens this page directly, with the certificate number
          filled in — or enter the number printed under the QR by hand.
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
              Verify
            </button>
          </div>
          <p className="field-hint mt-2">
            Numbers look like <span className="kbd">LM-2026-XXXXXXXX</span>. The lookup is public and free.
          </p>
        </form>

        <div className="mt-10 text-sm text-ink/60">
          The signature travels in the QR itself, so a scan validates even if this website is unreachable —
          any officer app can verify a scan offline against the public key.
        </div>
      </div>
    </main>
  );
}
