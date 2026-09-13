import Link from "next/link";
import { HeroScene } from "@/components/ui/HeroScene";
import { WorkflowDiagram } from "@/components/ui/WorkflowDiagram";
import { Reveal } from "@/components/ui/Reveal";
import { LandingNav } from "@/components/ui/LandingNav";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { RotatingHeadline } from "@/components/ui/RotatingHeadline";
import { ScalesEmblem } from "@/components/ui/ScalesEmblem";
import {
  RoleCard,
  TraderIcon,
  OfficerIcon,
  AllocatorIcon,
  CitizenIcon
} from "@/components/ui/RoleCard";

export default function LandingPage() {
  return (
    <main id="main" className="min-h-screen bg-paper">
      <LandingNav />

      {/* ── Hero (light, warm) ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-canvas opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(760px 380px at 88% 6%, rgba(230,167,0,0.12), transparent 60%), radial-gradient(680px 420px at 8% 20%, rgba(11,46,111,0.08), transparent 55%), radial-gradient(700px 420px at 70% 100%, rgba(14,122,75,0.08), transparent 55%)"
          }}
          aria-hidden
        />
        {/* faint rotating chakra */}
        <svg className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 opacity-[0.06]" viewBox="0 0 200 200" aria-hidden>
          <g className="gs-spin-slow" style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="#0B2E6F" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#0B2E6F" strokeWidth="1" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1="100" y1="100" x2="100" y2="8" stroke="#0B2E6F" strokeWidth="1" transform={`rotate(${i * 15} 100 100)`} />
            ))}
          </g>
        </svg>

        <div className="container-app relative grid gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div>
            <div className="rise-in mb-5 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-ink/10 bg-canvas/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold" />
                Smart India Hackathon 2026 · SIH26036
              </span>
            </div>

            {/* English headline */}
            <h1 className="t-en rise-in-delay-1 font-display text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Is that weighing scale
              <br />
              <RotatingHeadline phrases={HERO_PHRASES} />
            </h1>
            {/* Hindi headline */}
            <h1 className="t-hi lang-hi rise-in-delay-1 font-display text-3xl font-semibold leading-[1.2] tracking-tight sm:text-4xl lg:text-5xl">
              क्या वह तराज़ू
              <br />
              <span className="relative inline-block text-accent">
                सच में सही है?
                <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-gold/50" aria-hidden />
              </span>
            </h1>

            <p className="rise-in-delay-2 mt-6 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
              <span className="t-en">
                By law, every scale, petrol pump, weighbridge and measure used in a shop must be checked by
                the government before use. MAAPSETU brings that whole process online — a shopkeeper applies in
                minutes, an officer verifies on their phone, and any customer confirms it in three seconds.
              </span>
              <span className="t-hi lang-hi">
                कानून के अनुसार, दुकान में इस्तेमाल होने वाले हर तराज़ू, पेट्रोल पंप, धर्मकांटा और माप की सरकारी
                जाँच ज़रूरी है। MAAPSETU इस पूरी प्रक्रिया को ऑनलाइन लाता है — दुकानदार मिनटों में आवेदन करे, अधिकारी
                फ़ोन पर जाँच करे, और कोई भी ग्राहक तीन सेकंड में पुष्टि कर ले।
              </span>
            </p>

            <div className="rise-in-delay-3 mt-8 flex flex-wrap gap-3">
              <Link href="/verify" className="btn-accent">
                <span className="t-en">Check a certificate</span>
                <span className="t-hi lang-hi">प्रमाणपत्र जाँचें</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/register" className="btn-outline">
                <span className="t-en">Register your shop</span>
                <span className="t-hi lang-hi">अपनी दुकान पंजीकृत करें</span>
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-ink/10 pt-6">
              {[
                { k: "Free", u: "for anyone to check a scale", h: "किसी के लिए भी मुफ़्त" },
                { k: "Offline", u: "works in basements & mandis", h: "बिना नेटवर्क भी काम करे" },
                { k: "3 sec", u: "to confirm at the counter", h: "काउंटर पर पुष्टि" }
              ].map((s) => (
                <div key={s.u}>
                  <div className="font-display text-xl font-semibold text-ink">{s.k}</div>
                  <div className="mt-1 text-xs leading-snug text-ink/60">
                    <span className="t-en">{s.u}</span>
                    <span className="t-hi lang-hi">{s.h}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <HeroScene />
          </div>
        </div>

        {/* Instrument marquee */}
        <div className="relative border-y border-border bg-paper/80">
          <div className="container-app flex items-center gap-4 py-3.5 text-sm text-ink/60">
            <span className="shrink-0 font-medium text-ink/80">
              <span className="t-en">What gets checked</span>
              <span className="t-hi lang-hi">क्या-क्या जाँचा जाता है</span>
            </span>
            <span className="h-4 w-px shrink-0 bg-border" />
            <div className="marquee-rail">
              <div className="marquee gap-10">
                {INSTRUMENTS.concat(INSTRUMENTS).map((t, i) => (
                  <span key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The problem ─────────────────────────────────────────────── */}
      <section className="container-app py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">
            <span className="t-en">Why this matters</span>
            <span className="t-hi lang-hi">यह क्यों ज़रूरी है</span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            <span className="t-en">When a scale is wrong, the customer pays for it — every single day.</span>
            <span className="t-hi lang-hi">जब तराज़ू ग़लत हो, तो हर दिन ग्राहक ही नुकसान उठाता है।</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            <span className="t-en">
              Today all of this runs on paper. Applications on a form, scheduling on a phone call, readings in
              a register, certificates as printouts. Nobody sees the full picture, and the one person the law
              is meant to protect — the customer — sees nothing at all. MAAPSETU fixes that.
            </span>
            <span className="t-hi lang-hi">
              आज यह सब कागज़ पर चलता है। फ़ॉर्म पर आवेदन, फ़ोन पर समय, रजिस्टर में रीडिंग, और प्रिंट किए हुए
              प्रमाणपत्र। पूरी तस्वीर किसी को नहीं दिखती, और जिस ग्राहक की रक्षा कानून करना चाहता है, उसे कुछ नहीं
              दिखता। MAAPSETU इसे ठीक करता है।
            </span>
          </p>
        </Reveal>
      </section>

      {/* ── Roles — flip cards ──────────────────────────────────────── */}
      <section className="container-app pb-20">
        <Reveal className="mb-10 text-center">
          <div className="eyebrow">
            <span className="t-en">Who it is for</span>
            <span className="t-hi lang-hi">यह किसके लिए है</span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            <span className="t-en">One place, four people, everyone in the loop</span>
            <span className="t-hi lang-hi">एक जगह, चार भूमिकाएँ, सब एक साथ</span>
          </h2>
          <p className="mt-3 text-sm text-ink/60">
            <span className="t-en">Tap any card to see, in plain words, what it does.</span>
            <span className="t-hi lang-hi">विवरण देखने के लिए किसी भी कार्ड को छुएँ।</span>
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <RoleCard role={r} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-canvas">
        <div className="container-app py-20">
          <Reveal className="mb-10 text-center">
            <div className="eyebrow">
              <span className="t-en">How it works</span>
              <span className="t-hi lang-hi">यह कैसे काम करता है</span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              <span className="t-en">Four simple steps</span>
              <span className="t-hi lang-hi">चार आसान चरण</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <WorkflowDiagram />
          </Reveal>
        </div>
      </section>

      {/* ── Trust points ────────────────────────────────────────────── */}
      <section className="container-app cv-auto py-20">
        <Reveal className="mb-12 text-center">
          <div className="eyebrow">
            <span className="t-en">Built to be trusted</span>
            <span className="t-hi lang-hi">भरोसे के लिए बना</span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            <span className="t-en">The things that make it real</span>
            <span className="t-hi lang-hi">जो इसे असली बनाते हैं</span>
          </h2>
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
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand text-white">{f.icon}</div>
                  <div>
                    <div className="font-display text-xl font-semibold leading-snug">
                      <span className="t-en">{f.title}</span>
                      <span className="t-hi lang-hi">{f.titleHi}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">
                      <span className="t-en">{f.body}</span>
                      <span className="t-hi lang-hi">{f.bodyHi}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="container-app cv-auto pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl gov-band text-white">
            <div className="pointer-events-none absolute inset-0 grain-light" aria-hidden />
            <div className="pointer-events-none absolute -bottom-8 -right-6 opacity-20 sm:opacity-25" aria-hidden>
              <ScalesEmblem size={230} />
            </div>
            <div className="relative grid gap-8 p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-14">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gold">
                  <span className="t-en">Anyone can do this</span>
                  <span className="t-hi lang-hi">कोई भी कर सकता है</span>
                </div>
                <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  <span className="t-en">Point your phone at the sticker on a scale. See if it is really checked.</span>
                  <span className="t-hi lang-hi">तराज़ू पर लगे स्टिकर पर फ़ोन ले जाएँ। देखें कि वह सच में जाँचा गया है या नहीं।</span>
                </h3>
                <p className="mt-4 max-w-xl text-white/75">
                  <span className="t-en">
                    No account, no charge. The proof is stored inside the QR code itself, so it works even when
                    the shop has no internet — or just tap your phone if the sticker supports NFC.
                  </span>
                  <span className="t-hi lang-hi">
                    न खाता, न शुल्क। प्रमाण QR कोड में ही होता है, इसलिए दुकान में इंटरनेट न हो तो भी काम करता है —
                    या स्टिकर पर NFC हो तो बस फ़ोन टैप करें।
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/verify" className="btn-accent w-full justify-center">
                  <span className="t-en">Check a certificate</span>
                  <span className="t-hi lang-hi">प्रमाणपत्र जाँचें</span>
                </Link>
                <Link href="/register" className="btn-outline w-full justify-center border-white/30 bg-transparent text-white hover:bg-white/10">
                  <span className="t-en">I run a shop, register</span>
                  <span className="t-hi lang-hi">मैं दुकान चलाता हूँ</span>
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

const HERO_PHRASES = ["actually honest?", "cheating you?", "short on weight?", "giving full value?", "telling the truth?"];

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
    accent: "#0B2E6F"
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
    accent: "#0E7A4B"
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
    accent: "#C25E00"
  },
  {
    tag: "Customer",
    title: "Check it in three seconds",
    body: "Scan the sticker. See if it is valid, and until when. Free, for anyone.",
    backTitle: "What you do here",
    steps: [
      "Point your phone at the QR sticker on the scale, or tap it (NFC).",
      "See a clear pass or fail, and the valid-until date.",
      "It works even if the shop has no internet."
    ],
    icon: CitizenIcon,
    accent: "#0F766E"
  }
];

const FEATURES = [
  {
    title: "A sticker that can't be faked",
    titleHi: "जो स्टिकर नकली नहीं हो सकता",
    body:
      "The QR code carries a digital signature. Scan a real one and it passes. Scan a copied or tampered one and it clearly fails, even with the internet switched off.",
    bodyHi:
      "QR कोड में डिजिटल हस्ताक्षर होता है। असली को स्कैन करें तो पास, नकली या छेड़छाड़ किए हुए को स्कैन करें तो साफ़ फेल — इंटरनेट बंद हो तब भी।",
    tint: "radial-gradient(circle, rgba(11,46,111,0.35), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8 12 L11 15 L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  {
    title: "Works without a signal",
    titleHi: "बिना नेटवर्क भी चले",
    body:
      "Officers work in basements, godowns and rural markets. The app keeps the day's work on the phone and uploads it the moment there is a connection again.",
    bodyHi:
      "अधिकारी तहखानों, गोदामों और गाँव की मंडियों में काम करते हैं। ऐप दिन भर का काम फ़ोन में रखता है और नेटवर्क आते ही अपलोड कर देता है।",
    tint: "radial-gradient(circle, rgba(14,122,75,0.32), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="3" width="12" height="18" rx="2" stroke="#fff" strokeWidth="1.7" />
        <path d="M9 8 H15 M9 12 H15 M9 16 H13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: "Every visit is on the map",
    titleHi: "हर दौरा नक्शे पर",
    body:
      "When an officer checks in at a shop, the time and location are recorded. The department can see who went where, how many shops are covered, and how long each check took.",
    bodyHi:
      "जब अधिकारी दुकान पर पहुँचता है, तो समय और स्थान दर्ज होता है। विभाग देख सकता है कौन कहाँ गया, कितनी दुकानें हुईं, और हर जाँच में कितना समय लगा।",
    tint: "radial-gradient(circle, rgba(255,153,51,0.28), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11Z" stroke="#fff" strokeWidth="1.7" />
        <circle cx="12" cy="10" r="2.5" stroke="#fff" strokeWidth="1.7" />
      </svg>
    )
  },
  {
    title: "Nothing gets lost",
    titleHi: "कुछ भी न खोए",
    body:
      "Every important action is written to a permanent record. A shop that moves to another state keeps its history. A certificate can always be traced back to the officer who signed it.",
    bodyHi:
      "हर ज़रूरी कार्रवाई स्थायी रिकॉर्ड में लिखी जाती है। दूसरे राज्य में गई दुकान का इतिहास बना रहता है। हर प्रमाणपत्र उस अधिकारी तक पहुँचाया जा सकता है जिसने उसे हस्ताक्षरित किया।",
    tint: "radial-gradient(circle, rgba(15,118,110,0.28), transparent 60%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#fff" strokeWidth="1.7" />
        <path d="M7 8 H17 M7 12 H17 M7 16 H12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
];
