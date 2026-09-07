import Link from "next/link";

export const metadata = { title: "Dashboard — GovtSathi" };

export default function CitizenHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Welcome</h1>
        <p className="mt-1 text-ink/70">You are signed in as a citizen. You can look up any certificate for free.</p>
      </div>
      <div className="card p-6">
        <div className="font-display text-lg font-semibold">Verify a certificate</div>
        <p className="mt-2 text-sm text-ink/70">
          Scan the QR sticker on any weighing or measuring instrument, or enter the certificate number by hand.
        </p>
        <Link href="/verify" className="btn-primary mt-4 inline-flex">Open the verifier</Link>
      </div>
      <div className="card p-6">
        <div className="font-display text-lg font-semibold">Register as a trader</div>
        <p className="mt-2 text-sm text-ink/70">
          If you own a shop with weighing scales, dispensers, weighbridges or any measuring device used in
          trade, apply for verification here.
        </p>
        <p className="mt-2 text-xs text-ink/60">
          To change your role, contact the department — a citizen account is deliberately read-only for public lookups.
        </p>
      </div>
    </div>
  );
}
