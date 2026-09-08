import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — MAAPSETU" };

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="container-app py-5"><Logo /></header>
      <div className="container-app grid items-start gap-10 pt-10 lg:grid-cols-2 lg:pt-16">
        <div className="max-w-md">
          <h1 className="text-4xl font-display font-semibold">Create an account</h1>
          <p className="mt-3 text-ink/70 leading-relaxed">
            Shop owners register here. Officers, GATC staff and department
            allocators are set up by their office. Ask your state Legal
            Metrology office for access, then sign in.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              ["List your machines once", "Add every scale, pump or measure you use in trade."],
              ["Ask for a check in a tap", "The nearest officer or test centre is sent to you."],
              ["Get a sticker customers trust", "A QR certificate anyone can scan in three seconds."]
            ].map(([t, d], i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-sm text-ink/60">{d}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-lg border border-border bg-canvas p-4 text-sm">
            <div className="font-medium">Just want to check a scale?</div>
            <p className="mt-1 text-ink/70">
              You do not need an account for that. Go to the
              {" "}<Link href="/verify" className="text-brand underline">public check</Link>{" "}
              or scan the QR on the sticker.
            </p>
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          <RegisterForm />
          <div className="mt-6 border-t border-border pt-6 text-sm">
            Already have an account? <Link href="/login" className="text-brand font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
