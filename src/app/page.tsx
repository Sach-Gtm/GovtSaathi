import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="container-app flex items-center justify-between py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/verify" className="btn-ghost">Verify a certificate</Link>
          <Link href="/login" className="btn-outline">Sign in</Link>
          <Link href="/register" className="btn-accent">Register</Link>
        </nav>
      </header>

      <section className="container-app pt-12 pb-20">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-3 py-1 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            SIH 2026 · SIH26036 · Department of Consumer Affairs
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-semibold leading-tight tracking-tight">
            Every weighing instrument in the country,
            <span className="text-brand"> checked and traceable online.</span>
          </h1>
          <p className="mt-6 text-lg text-ink/70 leading-relaxed">
            Under the Legal Metrology Act, every scale, dispenser, weighbridge and balance used in trade
            must be verified before it is used, and re-verified on a schedule. GovtSathi puts that entire
            workflow — application, allocation, field verification, signed certificate, public lookup —
            on one traceable rail.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">
              Get started
            </Link>
            <Link href="/verify" className="btn-outline">
              Verify a certificate by number
            </Link>
          </div>
        </div>
      </section>

      <section className="container-app pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <div key={r.title} className="card p-6">
              <div className="text-sm font-semibold text-brand">{r.tag}</div>
              <div className="mt-2 font-display text-xl font-semibold">{r.title}</div>
              <p className="mt-3 text-sm text-ink/70 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-canvas">
        <div className="container-app py-20">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-brand">How one verification runs through the system</div>
            <h2 className="mt-2 text-3xl font-display font-semibold">
              Trader files it. Allocator routes it. Officer records it. Citizen scans it.
            </h2>
          </div>
          <ol className="mt-10 grid gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-6">
                <div className="text-4xl font-display font-semibold text-ink/20">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-4 font-display text-lg font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-ink/70 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-app py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-3 font-display text-lg font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container-app flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-8 text-sm text-ink/60">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span>© {new Date().getFullYear()} GovtSathi · Team Codebit</span>
          </div>
          <div className="flex gap-5">
            <Link href="/verify">Verify certificate</Link>
            <Link href="/login">Officer sign-in</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

const ROLES = [
  {
    tag: "Trader",
    title: "One shop, every scale",
    body: "Register once, list every instrument you own, file for verification and re-verification. Get an SMS alert before the certificate expires."
  },
  {
    tag: "Officer / GATC",
    title: "The day's jobs on your phone",
    body: "Assigned jobs download to the device. Record readings, error against tolerance, photos and signature — with no signal. Syncs when it can."
  },
  {
    tag: "Allocator",
    title: "Nearest verifier, not loudest complaint",
    body: "Route applications by district, instrument class and load. Watch pendency by state, department and officer in real time."
  },
  {
    tag: "Citizen",
    title: "Three seconds at the counter",
    body: "Point a phone at the sticker on the scale. See when it was verified, until when it is valid, and who checked it. Works even in a basement godown."
  }
];

const STEPS = [
  {
    title: "Trader applies",
    body: "Registers once, lists every instrument he owns, and files for verification. Fee paid online, receipt saved."
  },
  {
    title: "System allots it",
    body: "Picks a verifier — Legal Metrology Officer or Government Approved Test Centre — by district, instrument class and load, then books a date."
  },
  {
    title: "Checked on site",
    body: "Readings, error against tolerance, photographs and signature captured on the field device. No signal needed."
  },
  {
    title: "Certificate issues",
    body: "Signed, dated, and carrying a QR that anyone can scan. The signature travels in the QR, so a scan validates offline too."
  }
];

const FEATURES = [
  {
    icon: "🔏",
    title: "A certificate that proves itself",
    body:
      "The QR carries an Ed25519 signature over the certificate identity. Turn the wifi off, scan a real one — passes. Scan a tampered one — fails."
  },
  {
    icon: "📶",
    title: "Built for no signal",
    body:
      "Officers work in basements and rural markets. The field app holds the day's jobs locally, records everything offline, and resolves conflicts when it syncs."
  },
  {
    icon: "🗺️",
    title: "Records that cross borders",
    body:
      "A weighbridge moves state. A chain operates across four districts. The data model handles jurisdiction rather than assume one."
  }
];
