import Link from "next/link";
import { Logo } from "./Logo";
import { InstallPWA } from "./InstallPWA";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="container-app grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Link href="/" aria-label="Govt Saathi home"><Logo /></Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
            The online way to check that weighing and measuring instruments used in trade are verified
            under the Legal Metrology Act.
          </p>
          <div className="mt-5">
            <InstallPWA className="btn-primary" />
          </div>
        </div>

        {/* For everyone */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">For everyone</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/verify" className="text-ink/70 hover:text-brand">Check a certificate</Link></li>
            <li><Link href="/report?type=complaint" className="text-ink/70 hover:text-brand">Complain about a shop</Link></li>
            <li><Link href="/register" className="text-ink/70 hover:text-brand">Register your shop</Link></li>
            <li><Link href="/login" className="text-ink/70 hover:text-brand">Officer sign-in</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">Support</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/report?type=service" className="text-ink/70 hover:text-brand">Ask for help</Link></li>
            <li><Link href="/report?type=bug" className="text-ink/70 hover:text-brand">Report a problem</Link></li>
            <li><a href="mailto:support@govtsaathi.in" className="text-ink/70 hover:text-brand">Email support</a></li>
          </ul>
        </div>

        {/* About */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">About</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><span className="text-ink/70">Smart India Hackathon 2026</span></li>
            <li><span className="text-ink/70">Problem statement SIH26036</span></li>
            <li>
              <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="text-ink/70 hover:text-brand">
                Department of Consumer Affairs
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-app flex flex-col gap-2 py-5 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Govt Saathi · Team Codebit. A hackathon prototype, not an official government portal.</span>
          <span>Made in India 🇮🇳</span>
        </div>
      </div>
      <div className="h-1 tricolor-bar" aria-hidden />
    </footer>
  );
}
