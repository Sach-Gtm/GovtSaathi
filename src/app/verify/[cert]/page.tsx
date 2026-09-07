import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CertRow {
  certificate_no: string;
  issued_on: string;
  valid_until: string;
  revoked: boolean;
  outcome: "pass" | "fail" | "conditional";
  instrument: {
    category: string;
    make: string | null;
    model: string | null;
    serial_no: string | null;
    capacity: string | null;
    accuracy_class: string | null;
  };
  business: {
    legal_name: string;
    trade_name: string | null;
    city: string | null;
    state: string | null;
  };
}

async function loadCert(certNo: string): Promise<CertRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("verify_certificate", { cert_no: certNo });
  if (error || !data || data.length === 0) return null;
  return data[0] as CertRow;
}

export default async function VerifyResult({ params }: { params: { cert: string } }) {
  const cert = decodeURIComponent(params.cert);
  if (!cert || cert === "undefined") notFound();
  const row = await loadCert(cert);

  const now = new Date();
  const valid = row && !row.revoked && new Date(row.valid_until) >= now && row.outcome !== "fail";

  return (
    <main className="min-h-screen bg-paper">
      <header className="container-app py-5">
        <Link href="/"><Logo /></Link>
      </header>

      <div className="container-app max-w-2xl pt-6 pb-16">
        {!row ? (
          <div className="card p-8 text-center">
            <div className="text-2xl">❌</div>
            <h1 className="mt-3 text-2xl font-display font-semibold">No certificate found</h1>
            <p className="mt-2 text-ink/70">
              We could not find a certificate matching <span className="font-mono">{cert}</span>.
              Check the number and try again.
            </p>
            <Link href="/verify" className="btn-outline mt-6">Try another number</Link>
          </div>
        ) : (
          <div className={`card p-0 overflow-hidden`}>
            <div className={`px-6 py-5 ${valid ? "bg-success/10" : "bg-danger/10"}`}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${valid ? "bg-success" : "bg-danger"}`}>
                  {valid ? "✓" : "!"}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink/70">This instrument is</div>
                  <div className="text-2xl font-display font-semibold">
                    {row.revoked ? "Revoked" : valid ? "Verified & valid" : row.outcome === "fail" ? "Verification failed" : "Certificate expired"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-ink/50">Certificate number</div>
                <div className="mt-1 font-mono">{row.certificate_no}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-ink/50">Outcome</div>
                <div className="mt-1"><Badge variant={statusBadge(row.outcome)}>{row.outcome}</Badge></div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-ink/50">Issued on</div>
                <div className="mt-1">{formatDate(row.issued_on)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-ink/50">Valid until</div>
                <div className="mt-1">{formatDate(row.valid_until)}</div>
              </div>
            </div>

            <div className="border-t border-border px-6 py-6">
              <div className="text-xs uppercase tracking-wide text-ink/50">Instrument</div>
              <div className="mt-1 font-display text-lg">
                {row.instrument.category.replace(/_/g, " ")}
                {row.instrument.capacity ? ` · ${row.instrument.capacity}` : ""}
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div><dt className="text-ink/50">Make</dt><dd>{row.instrument.make ?? "—"}</dd></div>
                <div><dt className="text-ink/50">Model</dt><dd>{row.instrument.model ?? "—"}</dd></div>
                <div><dt className="text-ink/50">Serial</dt><dd className="font-mono">{row.instrument.serial_no ?? "—"}</dd></div>
                <div><dt className="text-ink/50">Accuracy class</dt><dd>{row.instrument.accuracy_class ?? "—"}</dd></div>
              </dl>
            </div>

            <div className="border-t border-border px-6 py-6">
              <div className="text-xs uppercase tracking-wide text-ink/50">Trader</div>
              <div className="mt-1 font-display text-lg">
                {row.business.trade_name ?? row.business.legal_name}
              </div>
              <div className="text-sm text-ink/70">
                {row.business.legal_name}
                {row.business.city ? ` · ${row.business.city}` : ""}
                {row.business.state ? `, ${row.business.state}` : ""}
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 text-xs text-ink/60">
              Data source: GovtSathi — the official verification ledger. If this number appears here,
              it was issued by an authorised Legal Metrology Officer or a Government Approved Test Centre.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
