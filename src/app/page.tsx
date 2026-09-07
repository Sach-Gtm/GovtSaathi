import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { HeroScene } from "@/components/ui/HeroScene";
import { WorkflowDiagram } from "@/components/ui/WorkflowDiagram";
import { VideoGallery } from "@/components/ui/VideoShowcase";
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
      <div className="h-1 tricolor-bar" aria-hidden />

      <header className="container-app flex items-center justify-between py-4">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/verify" className="btn-ghost">Check a certificate</Link>
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
              <span>Department of Consumer Affairs</span>
            </div>
            <h1 className="rise-in-delay-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Is that weighing scale
              <br />
              <span className="relative inline-block">
                <span className="text-brand">actually honest?</span>
                <span className="absolute inset-x-0 -bottom-2 h-2 rounded-full bg-accent/60" aria-hidden />
              </span>
            </h1>
            <p className="rise-in-delay-2 mt-7 max-w-xl text-lg leading-relaxed text-ink/75">
              By law, every scale, petrol pump, weighbridge and measure used in a shop has to be checked
              by the government before it is used. Govt Saathi brings that whole process online, so a shop
              owner can apply in minutes, an officer can do the check on their phone, and any customer can
              confirm it in three seconds.
            </p>
            <div className="rise-in-delay-3 mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                Get started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/verify" className="btn-outline">
                Check a certificate
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-ink/10 pt-6">
              {[
                { k: "Free", u: "for anyone to check a scale" },
                { k: "Works offline", u: "in basements and rural markets" },
                { k: "3 seconds", u: "to confirm at the counter" }
              ].map((s) => (
                <div key={s.u}>
                  <div className="font-display text-xl font-semibold">{s.k}</div>
                  <div className="mt-1 text-xs text-ink/60 leading-snug">{s.u}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <HeroScene />
          </div>
        </div>

        {/* Instrument marquee */}
        <div className="border-y border-border bg-canvas/60">
          <div className="container-app flex items-center gap-3 overflow-hidden py-4 text-sm text-ink/50">
            <span className="shrink-0 font-medium text-ink/70">What gets checked:</span>
            <div className="marquee flex gap-8 whitespace-nowrap">
              {INSTRUMENTS.concat(INSTRUMENTS).map((t, i) => (
                <span key={i} className="shrink-0">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The problem, in plain words */}
      <section className="container-app py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Why this matters</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            When a scale is wrong, the customer pays for it — every single day.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            Today all of this runs on paper. Applications on a form, scheduling on a phone call, readings
            in a register, certificates as printouts. Nobody can see the full picture, and the one person
            the law is meant to protect — the customer — can see nothing at all. Govt Saathi fixes that.
          </p>
        </div>
      </section>

      {/* Roles */}
      <section className="container-app pb-20">
        <div className="mb-10 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Who it is for</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">One place, four people, everyone in the loop</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => <RoleCard key={r.title} role={r} index={i} />)}
        </div>
      </section>

      {/* Video */}
      <section className="border-y border-border bg-canvas">
        <div className="container-app py-20">
          <div className="mb-10 text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-brand">See it in action</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              A quick scan is all it takes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/70">
              Buying a kilo of tomatoes or filling petrol — the same three-second check tells you the
              scale or the pump has really been verified.
            </p>
          </div>
          <VideoGallery
            items={[
              {
                src: "/demo-market.mp4",
                poster: "/demo-market-poster.jpg",
                title: "At the vegetable market",
                caption: "She scans the sticker on the scale before paying"
              },
              {
                src: "/demo-pump.mp4",
                poster: "/demo-pump-poster.jpg",
                title: "At the petrol pump",
                caption: "He checks the dispenser is verified before filling"
              }
            ]}
          />
        </div>
      </section>

      {/* Workflow */}
      <section className="container-app py-20">
        <div className="mb-10 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">How it works</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Four simple steps</h2>
        </div>
        <WorkflowDiagram />
      </section>

      {/* Trust points */}
      <section className="border-t border-border bg-canvas">
        <div className="container-app py-20">
          <div className="mb-12 text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-brand">Built to be trusted</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">The things that make it real</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border bg-paper p-8">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 blur-3xl transition-opacity group-hover:opacity-90"
                  style={{ background: f.tint }}
                  aria-hidden
                />
                <div className="relative flex items-start gap-5">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-ink text-white">{f.icon}</div>
                  <div>
                    <div className="font-display text-xl font-semibold leading-snug">{f.title}</div>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-20">
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
              <div className="text-xs font-semibold uppercase tracking-widest text-accent">Anyone can do this</div>
              <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Point your phone at the sticker on a scale. See if it is really checked.
              </h3>
              <p className="mt-4 max-w-xl text-white/70">
                No account, no charge. And because the proof is stored inside the QR code itself, it even
                works when the shop has no internet.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/verify" className="btn-accent w-full justify-center">Check a certificate</Link>
              <Link href="/register" className="btn-outline w-full justify-center border-white/25 bg-transparent text-white hover:bg-white/5">
                I run a shop — register
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container-app flex flex-col gap-3 py-8 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span>© {new Date().getFullYear()} Govt Saathi · Team Codebit</span>
          </div>
          <div className="flex gap-5">
            <Link href="/verify">Check a certificate</Link>
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

const INSTRUMENTS = [
  "Shop weighing scales",
  "Petrol & diesel pumps",
  "Weighbridges",
  "Jewellery balances",
  "Milk testers",
  "Cloth & length measures",
  "LPG & fuel meters",
  "Grocery scales"
];

const ROLES = [
  {
    tag: "Shop owner",
    title: "Apply in a few minutes",
    body: "Register once, list your scales and machines, and ask for a check. You get a reminder before your certificate runs out.",
    icon: TraderIcon,
    accent: "#0B5FFF"
  },
  {
    tag: "Officer",
    title: "Do the check on your phone",
    body: "Your visits for the day are on your device. Note the readings, take photos, sign it off — even with no network. It syncs later.",
    icon: OfficerIcon,
    accent: "#F5C400"
  },
  {
    tag: "Department",
    title: "See everything, in real time",
    body: "Send the nearest officer, not the one who got the loudest complaint. Track where every officer is and how the day is going.",
    icon: AllocatorIcon,
    accent: "#0F9D58"
  },
  {
    tag: "Customer",
    title: "Check it in three seconds",
    body: "Scan the sticker on any scale. See when it was checked, until when it is valid, and who checked it. Free, for anyone.",
    icon: CitizenIcon,
    accent: "#E37400"
  }
];

const FEATURES = [
  {
    title: "A sticker that can't be faked",
    body:
      "The QR code carries a digital signature. Scan a real one and it passes. Scan a copied or tampered one and it clearly fails — even with the internet switched off.",
    tint: "radial-gradient(circle, rgba(11,95,255,0.35), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" stroke="#F5C400" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8 12 L11 15 L16 9" stroke="#F5C400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  {
    title: "Works without a signal",
    body:
      "Officers work in basements, godowns and rural markets. The app keeps the day's work on the phone and uploads it the moment there is a connection again.",
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
    title: "Every visit is on the map",
    body:
      "When an officer checks in at a shop, the time and location are recorded. The department can see who went where, how many shops are covered, and how long each check took.",
    tint: "radial-gradient(circle, rgba(15,157,88,0.30), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11Z" stroke="#F5C400" strokeWidth="1.7" />
        <circle cx="12" cy="10" r="2.5" stroke="#F5C400" strokeWidth="1.7" />
      </svg>
    )
  },
  {
    title: "Nothing gets lost",
    body:
      "Every important action is written to a permanent record. A shop that moves to another state keeps its history. A certificate can always be traced back to the officer who signed it.",
    tint: "radial-gradient(circle, rgba(227,116,0,0.30), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#F5C400" strokeWidth="1.7" />
        <path d="M7 8 H17 M7 12 H17 M7 16 H12" stroke="#F5C400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
];
