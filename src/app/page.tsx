import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { HeroScene } from "@/components/ui/HeroScene";
import { WorkflowDiagram } from "@/components/ui/WorkflowDiagram";
import {
  RoleCard,
  TraderIcon,
  OfficerIcon,
  AllocatorIcon,
  CitizenIcon
} from "@/components/ui/RoleCard";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Tricolor rail — Republic of India */}
      <div className="h-1 tricolor-bar" aria-hidden />

      <header className="container-app flex items-center justify-between py-4">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/verify" className="btn-ghost">Verify a certificate</Link>
          <Link href="/login" className="btn-outline">Sign in</Link>
          <Link href="/register" className="btn-accent">Register</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-canvas opacity-70" aria-hidden />
        <div className="pointer-events-none absolute inset-0 noise" aria-hidden />

        <div className="container-app relative grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
          <div>
            <div className="rise-in mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-canvas/70 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Smart India Hackathon 2026</span>
              <span className="text-ink/40">·</span>
              <span>SIH26036 · Department of Consumer Affairs</span>
            </div>
            <h1 className="rise-in-delay-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Every weighing instrument in India,
              <br />
              <span className="relative inline-block">
                <span className="text-brand">checked and traceable online.</span>
                <span className="absolute inset-x-0 -bottom-2 h-2 rounded-full bg-accent/60" aria-hidden />
              </span>
            </h1>
            <p className="rise-in-delay-2 mt-7 max-w-xl text-lg leading-relaxed text-ink/70">
              Under the Legal Metrology Act, every scale, dispenser, weighbridge and balance used in trade
              must be verified before it is used, and re-verified on schedule. GovtSathi puts that whole
              workflow — application, allocation, field verification, signed certificate, public lookup —
              on one traceable rail.
            </p>
            <div className="rise-in-delay-3 mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                Get started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/verify" className="btn-outline">
                Verify by certificate number
              </Link>
            </div>

            {/* Trust rail */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-ink/10 pt-6">
              {[
                { k: "10", u: "states supported at launch" },
                { k: "4", u: "roles on one traceable rail" },
                { k: "3s", u: "public verification time" }
              ].map((s) => (
                <div key={s.u}>
                  <div className="font-display text-2xl font-semibold">{s.k}</div>
                  <div className="mt-1 text-xs text-ink/60 leading-snug">{s.u}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="container-app py-20">
        <div className="mb-10 max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Four people on one page</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            The Act protects the buyer. Nobody could see the whole picture — until now.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => <RoleCard key={r.title} role={r} index={i} />)}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-border bg-canvas">
        <div className="container-app py-20">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-widest text-brand">How one verification runs</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Trader files it. Allocator routes it. Officer records it. Citizen scans it.
            </h2>
          </div>
          <div className="mt-14">
            <WorkflowDiagram />
          </div>
        </div>
      </section>

      {/* The four things beyond the brief */}
      <section className="container-app py-20">
        <div className="mb-12 max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Four things beyond the brief</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            The Department asked for nine. We build all nine, and add these four on top.
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border bg-canvas p-8">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 blur-3xl transition-opacity group-hover:opacity-90"
                style={{ background: f.tint }}
                aria-hidden
              />
              <div className="relative flex items-start gap-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-ink text-white">
                  {f.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">0{i + 1}</div>
                  <div className="mt-1 font-display text-xl font-semibold leading-snug">{f.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{f.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-app pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(11,95,255,0.5), transparent 40%), radial-gradient(circle at 80% 70%, rgba(245,196,0,0.35), transparent 45%)"
            }}
            aria-hidden
          />
          <div className="relative grid gap-8 p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-14">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-accent">Try the public verifier</div>
              <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Scan the sticker. See when it was checked, until when it is valid, who signed it.
              </h3>
              <p className="mt-4 max-w-xl text-white/70">
                The signature travels in the QR itself. A scan validates even when this site is unreachable —
                any officer app can verify offline against the public key.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/verify" className="btn-accent w-full justify-center">
                Open the verifier
              </Link>
              <Link href="/register" className="btn-outline w-full justify-center bg-transparent text-white border-white/25 hover:bg-white/5">
                Register as a trader
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container-app flex flex-col gap-3 py-8 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span>© {new Date().getFullYear()} GovtSathi · Team Codebit · SIH26036</span>
          </div>
          <div className="flex gap-5">
            <Link href="/verify">Verify certificate</Link>
            <Link href="/login">Officer sign-in</Link>
            <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="hover:text-brand">
              Department of Consumer Affairs
            </a>
          </div>
        </div>
        <div className="h-1 tricolor-bar" aria-hidden />
      </footer>
    </main>
  );
}

const ROLES = [
  {
    tag: "Trader",
    title: "One shop, every scale",
    body: "Register once, list every instrument you own, file for verification and re-verification. Get an alert before the certificate expires.",
    icon: TraderIcon,
    accent: "#0B5FFF"
  },
  {
    tag: "Officer · GATC",
    title: "The day's jobs on your phone",
    body: "Assigned jobs download to the device. Record readings, error against tolerance, photos and signature — with no signal. Syncs when it can.",
    icon: OfficerIcon,
    accent: "#F5C400"
  },
  {
    tag: "Allocator",
    title: "Nearest verifier, not loudest complaint",
    body: "Route applications by district, instrument class and load. Watch pendency by state, department and officer in real time.",
    icon: AllocatorIcon,
    accent: "#0F9D58"
  },
  {
    tag: "Citizen",
    title: "Three seconds at the counter",
    body: "Point a phone at the sticker on the scale. See when it was verified, until when it is valid, and who checked it. Works even in a basement godown.",
    icon: CitizenIcon,
    accent: "#E37400"
  }
];

const FEATURES = [
  {
    title: "A certificate that proves itself",
    body:
      "The QR on the sticker carries an Ed25519 signature over the certificate identity. On stage we turn the wifi off, scan a real one — passes. Scan a tampered one — fails.",
    tint: "radial-gradient(circle, rgba(11,95,255,0.35), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" stroke="#F5C400" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8 12 L11 15 L16 9" stroke="#F5C400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  {
    title: "Built for no signal",
    body:
      "Officers work in basements and rural markets. The field app holds the day's jobs locally, records everything offline, and resolves conflicts when it syncs.",
    tint: "radial-gradient(circle, rgba(245,196,0,0.30), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="3" width="12" height="18" rx="2" stroke="#F5C400" strokeWidth="1.7" />
        <path d="M9 8 H15 M9 12 H15 M9 16 H13" stroke="#F5C400" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="17" cy="17" r="4" fill="#F5C400" />
        <path d="M15 17 L16.5 18.5 L19 16" stroke="#0B1220" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Records that cross borders",
    body:
      "A weighbridge moves state. A chain of shops operates across four districts. The data model handles jurisdiction rather than assume one — the department named this problem itself.",
    tint: "radial-gradient(circle, rgba(15,157,88,0.30), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 6 L9 4 L15 6 L20 4 V18 L15 20 L9 18 L4 20 Z" stroke="#F5C400" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 4 V18 M15 6 V20" stroke="#F5C400" strokeWidth="1.4" />
      </svg>
    )
  },
  {
    title: "A written architecture",
    body:
      "Threat model. Permission matrix across all four roles. Audit logging for every critical action. How it would actually be rolled out to a state. Written before code.",
    tint: "radial-gradient(circle, rgba(227,116,0,0.30), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#F5C400" strokeWidth="1.7" />
        <path d="M7 8 H17 M7 12 H17 M7 16 H12" stroke="#F5C400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
];
