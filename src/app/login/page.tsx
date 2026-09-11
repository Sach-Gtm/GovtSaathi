import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { GovScene } from "@/components/ui/GovScene";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — MAAPSETU" };

export default function LoginPage({
  searchParams
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main id="main" className="min-h-screen bg-paper lg:grid lg:grid-cols-2">
      {/* Left — official brand panel */}
      <div className="relative hidden overflow-hidden bg-ink text-white lg:block">
        <div className="absolute inset-x-0 top-0 z-20 h-1 tricolor-bar" aria-hidden />
        <GovScene className="absolute inset-x-0 bottom-0 h-2/3 w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-transparent" aria-hidden />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="MAAPSETU home">
            <LogoMark size={40} />
            <span className="font-display text-xl font-semibold">
              MAAP<span className="text-accent">SETU</span>
            </span>
          </Link>

          <div className="max-w-md rise-in">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              The trust rail for every weighing instrument in India.
            </h2>
            <ul className="mt-8 space-y-4">
              {[
                "One application, one officer, one signed certificate.",
                "Field checks that work even with no network.",
                "Every certificate traceable back to the officer who signed it."
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="text-white/85">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs leading-relaxed text-white/55">
            A Smart India Hackathon 2026 prototype by Team GovtSaathi, built for problem statement SIH26036
            from the Department of Consumer Affairs, Ministry of Consumer Affairs, Food &amp; Public
            Distribution, Government of India. Not an official government portal.
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex min-h-screen flex-col">
        <div className="h-1 tricolor-bar lg:hidden" aria-hidden />
        <header className="p-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-display text-lg font-semibold">MAAP<span className="text-accent">SETU</span></span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm rise-in-delay-1">
            <h1 className="font-display text-4xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-ink/70">
              For shop owners, officers, test centres and the department. Just want to check a scale?{" "}
              <Link href="/verify" className="font-medium text-brand">Do it here, no account needed.</Link>
            </p>

            <div className="mt-8">
              <LoginForm next={searchParams.next} error={searchParams.error} />
            </div>

            <div className="mt-6 border-t border-border pt-6 text-sm">
              New here? <Link href="/register" className="font-medium text-brand">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
