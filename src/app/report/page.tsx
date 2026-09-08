import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ReportForm } from "./ReportForm";

export const metadata = { title: "Report or complain — MAAPSETU" };

const VALID = ["bug", "service", "complaint"] as const;
type Kind = (typeof VALID)[number];

export default function ReportPage({ searchParams }: { searchParams: { type?: string; cert?: string } }) {
  const type: Kind = (VALID.includes(searchParams.type as Kind) ? searchParams.type : "complaint") as Kind;

  return (
    <main className="min-h-screen bg-paper">
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="container-app py-5">
        <Link href="/" aria-label="MAAPSETU home"><Logo /></Link>
      </header>

      <div className="container-app max-w-2xl pt-6 pb-20">
        <h1 className="font-display text-4xl font-semibold">How can we help?</h1>
        <p className="mt-2 text-ink/70">
          Complain about a shop, report a problem with the site, or ask for help. Anyone can use this, no
          account needed.
        </p>
        <ReportForm initialType={type} certNo={searchParams.cert} />
      </div>
    </main>
  );
}
