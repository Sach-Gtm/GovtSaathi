import Link from "next/link";
import { HeroScene } from "@/components/ui/HeroScene";
import { WorkflowDiagram } from "@/components/ui/WorkflowDiagram";
import { Reveal } from "@/components/ui/Reveal";
import { LandingNav } from "@/components/ui/LandingNav";
import { SiteFooter } from "@/components/ui/SiteFooter";
import {
  RoleCard,
  TraderIcon,
  OfficerIcon,
  AllocatorIcon,
  CitizenIcon
} from "@/components/ui/RoleCard";
import { getSessionProfile, roleHomePath } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const profile = await getSessionProfile();

  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />

      <LandingNav dashboardHref={profile ? roleHomePath(profile.role) : undefined} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-canvas opacity-70" aria-hidden />
        <div className="pointer-events-none absolute inset-0 noise" aria-hidden />

        <div className="container-app relative grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
          <div>
            <div className="rise-in mb-5 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-ink/10 bg-canvas/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Smart India Hackathon 2026
              </span>
              <span className="hidden text-ink/40 sm:inline">·</span>
              <span className="text-ink/70">Dept. of Consumer Affairs</span>
            </div>
            <h1 className="rise-in-delay-1 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
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
              {profile ? (
                <Link href={roleHomePath(profile.role)} className="btn-primary">
                  Open my dashboard
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ) : (
                <Link href="/register" className="btn-primary">
                  Get started
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
              <Link href="/verify" className="btn-outline">Check a certificate</Link>
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

        {/* Instrument marquee — label fixed, track clipped in its own rail */}
        <div className="border-y border-border bg-paper/80">
          <div className="container-app flex items-center gap-4 py-4 text-sm text-ink/60">
            <span className="shrink-0 font-medium text-ink/80">What gets checked</span>
            <span className="h-4 w-px shrink-0 bg-border" />
            <div className="marquee-rail">
              <div className="marquee gap-10">
                {INSTRUMENTS.concat(INSTRUMENTS).map((t, i) => (
                  <span key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="container-app py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Why this matters</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            When a scale is wrong, the customer pays for it, every single day.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            Today all of this runs on paper. Applications on a form, scheduling on a phone call, readings
            in a register, certificates as printouts. Nobody can see the full picture, and the one person
            the law is meant to protect, the customer, can see nothing at all. Govt Saathi fixes that.
          </p>
        </Reveal>
      </section>

      {/* Roles — flip cards */}
      <section className="container-app pb-20">
        <Reveal className="mb-10 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Who it is for</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">One place, four people, everyone in the loop</h2>
          <p className="mt-3 text-sm text-ink/60">Tap any card to see, in plain words, what it does.</p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <RoleCard role={r} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-border bg-canvas">
        <div className="container-app py-20">
          <Reveal className="mb-10 text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-brand">How it works</div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Four simple steps</h2>
          </Reveal>
          <Reveal delay={120}>
            <WorkflowDiagram />
          </Reveal>
        </div>
      </section>

      {/* Trust points */}
      <section className="container-app py-20">
        <Reveal className="mb-12 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand">Built to be trusted</div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">The things that make it real</h2>
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-canvas p-8 transition-transform hover:-translate-y-1">
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-app pb-20">
        <Reveal>
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
                  I run a shop, register
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
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
    body: "List your machines, ask for a check, get reminded before it expires.",
    backTitle: "What you do here",
    steps: [
      "Add your shop and the machines you use to weigh or measure.",
      "Send a request for a government check.",
      "An officer visits, and you get a sticker with a QR code."
    ],
    icon: TraderIcon,
    accent: "#0B5FFF"
  },
  {
    tag: "Officer",
    title: "Do the check on your phone",
    body: "The day's visits on your device. Record, sign, even with no network.",
    backTitle: "What you do here",
    steps: [
      "See your list of shops to visit today, in order.",
      "Check in at the shop, test the machine, record the readings.",
      "Sign it. A certificate is made, even without internet."
    ],
    icon: OfficerIcon,
    accent: "#F5C400"
  },
  {
    tag: "Department",
    title: "See everything, live",
    body: "Send the nearest officer. Track the day on a live map.",
    backTitle: "What you do here",
    steps: [
      "Give each request to the nearest officer or test centre.",
      "Watch on a live map where officers are and what is done.",
      "See which shops are overdue, by state and district."
    ],
    icon: AllocatorIcon,
    accent: "#0F9D58"
  },
  {
    tag: "Customer",
    title: "Check it in three seconds",
    body: "Scan the sticker. See if it is valid, and until when. Free, for anyone.",
    backTitle: "What you do here",
    steps: [
      "Point your phone at the QR sticker on the scale.",
      "See a clear pass or fail, and the valid-until date.",
      "It works even if the shop has no internet."
    ],
    icon: CitizenIcon,
    accent: "#E37400"
  }
];

const FEATURES = [
  {
    title: "A sticker that can't be faked",
    body:
      "The QR code carries a digital signature. Scan a real one and it passes. Scan a copied or tampered one and it clearly fails, even with the internet switched off.",
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
