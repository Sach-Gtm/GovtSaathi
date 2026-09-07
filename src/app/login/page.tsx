import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — GovtSathi" };

export default function LoginPage({
  searchParams
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="container-app py-5"><Logo /></header>
      <div className="container-app grid items-start gap-10 pt-10 lg:grid-cols-2 lg:pt-16">
        <div className="max-w-md">
          <h1 className="text-4xl font-display font-semibold">Sign in</h1>
          <p className="mt-3 text-ink/70 leading-relaxed">
            For traders, officers, GATC staff, allocators and administrators.
            Citizens do not need an account to look up a certificate — use the
            {" "}<Link className="text-brand underline" href="/verify">public verifier</Link>{" "}
            instead.
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <LoginForm next={searchParams.next} error={searchParams.error} />
          <div className="mt-6 border-t border-border pt-6 text-sm">
            New here? <Link href="/register" className="text-brand font-medium">Create an account</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
