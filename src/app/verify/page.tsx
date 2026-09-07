import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata = { title: "Verify a certificate — Govt Saathi" };

export default function VerifyIndex({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="container-app py-5">
        <Link href="/" aria-label="Govt Saathi home"><Logo /></Link>
      </header>

      <div className="container-app grid gap-10 pt-8 lg:grid-cols-[1fr_1fr] lg:items-center">
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

        {/* Right — scan illustration */}
        <div className="flex justify-center">
          <ScanScene />
        </div>
      </div>
    </main>
  );
}

function ScanScene() {
  return (
    <svg viewBox="0 0 420 420" className="w-full max-w-md" role="img" aria-label="A phone scanning a QR sticker on a weighing scale and showing it is verified.">
      <defs>
        <linearGradient id="vsPhone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B2333" />
          <stop offset="1" stopColor="#0B1220" />
        </linearGradient>
        <radialGradient id="vsGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0F9D58" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0F9D58" stopOpacity="0" />
        </radialGradient>
        <pattern id="vsDots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#0B1220" opacity="0.06" />
        </pattern>
      </defs>

      <rect width="420" height="420" fill="url(#vsDots)" />
      <circle cx="230" cy="210" r="150" fill="url(#vsGlow)" />

      {/* Weighing scale with sticker */}
      <g transform="translate(40 250)">
        <ellipse cx="120" cy="120" rx="120" ry="20" fill="#0B1220" opacity="0.1" />
        <rect x="30" y="60" width="180" height="60" rx="8" fill="#F7F5EF" stroke="#E4E1D6" strokeWidth="2" />
        <rect x="60" y="20" width="120" height="44" rx="6" fill="#FFFFFF" stroke="#E4E1D6" strokeWidth="2" />
        {/* Sticker */}
        <g transform="translate(150 66)">
          <rect x="0" y="0" width="46" height="46" rx="4" fill="#FFFFFF" stroke="#0B5FFF" strokeWidth="1.5" />
          <rect x="6" y="6" width="12" height="12" fill="#0B1220" />
          <rect x="28" y="6" width="12" height="12" fill="#0B1220" />
          <rect x="6" y="28" width="12" height="12" fill="#0B1220" />
          <rect x="24" y="24" width="4" height="4" fill="#0B1220" />
          <rect x="32" y="30" width="4" height="4" fill="#0B1220" />
          <rect x="28" y="36" width="4" height="4" fill="#0B1220" />
        </g>
        <text x="120" y="98" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0B1220" fontFamily="ui-monospace, monospace">2.000 kg</text>
      </g>

      {/* Phone */}
      <g transform="translate(210 40)" className="gs-float">
        <rect x="0" y="0" width="150" height="290" rx="24" fill="url(#vsPhone)" />
        <rect x="10" y="12" width="130" height="266" rx="16" fill="#0B1220" />
        <rect x="55" y="20" width="40" height="6" rx="3" fill="#2A3446" />

        {/* Camera view of the sticker */}
        <rect x="22" y="40" width="106" height="120" rx="10" fill="#101827" />
        <g transform="translate(45 62)">
          <rect x="0" y="0" width="60" height="60" rx="4" fill="#FFFFFF" />
          <rect x="6" y="6" width="14" height="14" fill="#0B1220" />
          <rect x="40" y="6" width="14" height="14" fill="#0B1220" />
          <rect x="6" y="40" width="14" height="14" fill="#0B1220" />
          <rect x="30" y="30" width="6" height="6" fill="#0B1220" />
          <rect x="40" y="38" width="6" height="6" fill="#0B1220" />
        </g>
        {/* Scan brackets */}
        <g stroke="#F5C400" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M32 52 v-8 h8" />
          <path d="M118 52 v-8 h-8" />
          <path d="M32 148 v8 h8" />
          <path d="M118 148 v8 h-8" />
        </g>

        {/* Verified result card */}
        <g transform="translate(22 174)">
          <rect x="0" y="0" width="106" height="86" rx="10" fill="#0F9D58" />
          <circle cx="53" cy="26" r="15" fill="#FFFFFF" />
          <path d="M46 26 L51 31 L61 20" stroke="#0F9D58" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="53" y="56" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">Verified</text>
          <text x="53" y="72" textAnchor="middle" fontSize="8" fill="#FFFFFF" opacity="0.9">Valid until 13 Mar 2027</text>
        </g>
      </g>
    </svg>
  );
}
