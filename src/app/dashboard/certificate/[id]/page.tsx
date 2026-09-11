import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderQrDataUrl } from "@/lib/qr";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { RevokeButton } from "@/components/dashboard/RevokeButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verification certificate — MAAPSETU" };

export default async function CertificatePrint({ params }: { params: { id: string } }) {
  const profile = await requireProfile();
  const isStaff = ["officer", "gatc", "admin"].includes(profile.role);
  const supabase = createSupabaseServerClient();

  const { data: cert } = await supabase
    .from("certificates")
    .select(`
      id, certificate_no, issued_on, valid_until, revoked, revoked_reason, qr_payload,
      issued_by:profiles(full_name, employee_code, role),
      verification_record:verification_records(outcome, performed_at, payload_hash, signature_algo),
      instrument:instruments(category, make, model, serial_no, capacity, accuracy_class),
      business:businesses(legal_name, trade_name, address_line1, city, state_code)
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (!cert) notFound();

  const c: any = cert;
  const h = headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const verifyUrl = `${proto}://${host}/verify/${encodeURIComponent(c.certificate_no)}`;
  const qr = await renderQrDataUrl(verifyUrl);

  const outcome: string = c.verification_record?.outcome ?? "pass";
  const expired = new Date(c.valid_until) < new Date();
  const status = c.revoked ? "REVOKED" : expired ? "EXPIRED" : outcome === "fail" ? "FAILED" : "VALID";
  const statusColor = status === "VALID" ? "#0E7A4B" : status === "EXPIRED" ? "#E37400" : "#D14343";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/trader/certificates" className="text-sm text-brand hover:underline">← Back to certificates</Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/verify/${encodeURIComponent(c.certificate_no)}`} className="btn-outline">Open public verify</Link>
          {isStaff && !c.revoked && <RevokeButton certificateId={c.id} />}
          <PrintButton />
        </div>
      </div>

      {/* Certificate sheet */}
      <div className="print-sheet relative overflow-hidden rounded-xl border border-border bg-white p-8 shadow-card sm:p-10">
        <div className="pointer-events-none absolute inset-0 cert-guilloche" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 tricolor-bar" aria-hidden />

        <div className="relative">
          {/* header */}
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden className="shrink-0">
              <circle cx="24" cy="24" r="22" fill="#fff" stroke="#0B2E6F" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="15.5" fill="none" stroke="#0B2E6F" strokeWidth="1.6" />
              {Array.from({ length: 24 }).map((_, i) => (
                <line key={i} x1="24" y1="24" x2="24" y2="9" stroke="#0B2E6F" strokeWidth="0.9" transform={`rotate(${i * 15} 24 24)`} />
              ))}
              <circle cx="24" cy="24" r="2.4" fill="#0B2E6F" />
            </svg>
            <div>
              <div className="font-display text-lg font-semibold text-brand">Government of India · भारत सरकार</div>
              <div className="text-sm text-ink/70">Department of Consumer Affairs · Legal Metrology Division</div>
              <div className="text-xs text-ink/50">Legal Metrology Act, 2009 · Legal Metrology (General) Rules, 2011</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="font-display text-2xl font-semibold">Certificate of Verification</div>
            <div className="mt-1 text-sm text-ink/60">विधिक माप विज्ञान — सत्यापन प्रमाणपत्र</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-semibold text-white" style={{ background: statusColor }}>
              {status}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto]">
            <div className="space-y-5">
              <Row label="Certificate number" value={c.certificate_no} mono />
              <div className="grid grid-cols-2 gap-5">
                <Row label="Issued on" value={formatDate(c.issued_on)} />
                <Row label="Valid until" value={formatDate(c.valid_until)} />
              </div>
              <Row label="Verification outcome" value={outcome.toUpperCase()} />

              <div className="border-t border-border pt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">Instrument</div>
                <div className="mt-1 font-medium">
                  {c.instrument?.category?.replace(/_/g, " ")} {c.instrument?.capacity ? `· ${c.instrument.capacity}` : ""}
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <Cell label="Make" value={c.instrument?.make} />
                  <Cell label="Model" value={c.instrument?.model} />
                  <Cell label="Serial no." value={c.instrument?.serial_no} mono />
                  <Cell label="Accuracy class" value={c.instrument?.accuracy_class} />
                </dl>
              </div>

              <div className="border-t border-border pt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">Trader / Establishment</div>
                <div className="mt-1 font-medium">{c.business?.trade_name ?? c.business?.legal_name}</div>
                <div className="text-sm text-ink/70">
                  {c.business?.legal_name}
                  {c.business?.city ? ` · ${c.business.city}` : ""}
                  {c.business?.state_code ? `, ${c.business.state_code}` : ""}
                </div>
              </div>
            </div>

            {/* QR + authenticity */}
            <div className="flex flex-col items-center gap-2 sm:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="Scan to verify this certificate" className="h-40 w-40 rounded-lg border border-border" />
              <div className="text-center text-xs text-ink/60">Scan to verify · अधिप्रमाणित करें</div>
              <div className="mt-1 break-all text-center text-[10px] text-ink/40">{verifyUrl}</div>
            </div>
          </div>

          {/* signature block */}
          <div className="mt-8 flex items-end justify-between gap-6 border-t border-border pt-5">
            <div className="text-xs text-ink/55">
              <div>This is a digitally issued certificate. Authenticity is cryptographically verifiable</div>
              <div>via the QR code above, offline, using an Ed25519 signature ({c.verification_record?.signature_algo ?? "ed25519"}).</div>
              {c.verification_record?.payload_hash && (
                <div className="mt-1 font-mono text-[10px] text-ink/40">SHA-256 {String(c.verification_record.payload_hash).slice(0, 32)}…</div>
              )}
            </div>
            <div className="text-center">
              <div className="font-display text-sm italic text-brand">Digitally signed</div>
              <div className="mt-1 border-t border-ink/40 pt-1 text-sm font-medium">{c.issued_by?.full_name ?? "Legal Metrology Officer"}</div>
              <div className="text-xs text-ink/55">
                {c.issued_by?.role?.toString().toUpperCase()} {c.issued_by?.employee_code ? `· ${c.issued_by.employee_code}` : ""}
              </div>
            </div>
          </div>

          {c.revoked && (
            <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              This certificate has been REVOKED{c.revoked_reason ? `: ${c.revoked_reason}` : ""}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</div>
      <div className={`mt-0.5 text-lg ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}
function Cell({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-ink/50">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value || "—"}</dd>
    </div>
  );
}
