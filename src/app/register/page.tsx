import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { VideoCard } from "@/components/ui/VideoShowcase";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — Govt Saathi" };

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
            allocators are set up by their office — ask your state Legal
            Metrology office for access, then sign in.
          </p>

          <div className="mt-6">
            <VideoCard
              item={{
                src: "/demo-pump.mp4",
                poster: "/demo-pump-poster.jpg",
                title: "This is what your customers do",
                caption: "A verified sticker is a customer's proof you play fair"
              }}
            />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-canvas p-4 text-sm">
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
