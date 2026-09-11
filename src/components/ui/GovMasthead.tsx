import { GovTools } from "./GovTools";

/** Ashoka-chakra roundel — a national mark used on the flag, drawn from scratch.
 *  (Not the protected State Emblem.) */
function NationalEmblem({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Government of India" className="shrink-0">
      <circle cx="24" cy="24" r="22" fill="#fff" stroke="#0B2E6F" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke="#0B2E6F" strokeWidth="1.6" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="24"
          y1="24"
          x2="24"
          y2="9"
          stroke="#0B2E6F"
          strokeWidth="0.9"
          transform={`rotate(${i * 15} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="2.4" fill="#0B2E6F" />
    </svg>
  );
}

/**
 * Persistent Government of India masthead shown on every page: a dark utility bar
 * (identity + accessibility + language) over a light identity bar (emblem +
 * bilingual ministry lockup + National Consumer Helpline), closed by the
 * national tricolour hairline. Modelled on doca.gov.in / lm.doca.gov.in.
 */
export function GovMasthead() {
  return (
    <header className="relative z-40">
      {/* Utility bar */}
      <div className="gov-band text-white">
        <div className="container-app flex items-center justify-between gap-3 py-1.5 text-[11px] sm:text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden>🇮🇳</span>
            <span className="truncate font-medium">
              <span className="t-en">Government of India</span>
              <span className="t-hi lang-hi">भारत सरकार</span>
            </span>
            <span className="hidden text-white/40 md:inline">·</span>
            <span className="hidden truncate text-white/75 md:inline">
              <span className="t-en">Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
              <span className="t-hi lang-hi">उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय</span>
            </span>
          </div>
          <GovTools />
        </div>
      </div>

      {/* Identity bar */}
      <div className="border-b border-border bg-canvas">
        <div className="container-app flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-3">
            <NationalEmblem />
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold text-brand sm:text-[17px]">
                <span className="t-en">Department of Consumer Affairs</span>
                <span className="t-hi lang-hi">उपभोक्ता मामले विभाग</span>
              </div>
              <div className="text-[11px] text-ink/60 sm:text-xs">
                <span className="t-en">Legal Metrology Division · Government of India</span>
                <span className="t-hi lang-hi">विधिक माप विज्ञान प्रभाग · भारत सरकार</span>
              </div>
            </div>
          </div>

          <a
            href="tel:1915"
            className="hidden items-center gap-2 rounded-full border border-border bg-paper px-3 py-1.5 text-xs sm:inline-flex"
            aria-label="National Consumer Helpline 1915"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white" aria-hidden>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1Z" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-semibold text-ink">National Consumer Helpline</span>
              <span className="block text-ink/60">1915 · टोल-फ्री</span>
            </span>
          </a>
        </div>
      </div>

      <div className="h-1 tricolor-bar" aria-hidden />
    </header>
  );
}
