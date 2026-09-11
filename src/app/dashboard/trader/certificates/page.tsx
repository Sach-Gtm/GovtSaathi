import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, dueState } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ReverifyButton } from "@/components/dashboard/ReverifyButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Certificates — MAAPSETU" };

export default async function TraderCertificates() {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("certificates")
    .select("id, certificate_no, issued_on, valid_until, revoked, instrument:instruments(id, category, serial_no, capacity), business:businesses(id, state_code)")
    .order("issued_on", { ascending: false });

  const rows = (data ?? []) as any[];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Certificates</h1>
      {rows.length === 0 ? (
        <EmptyState title="No certificates yet" description="Certificates appear here once an officer completes verification." />
      ) : (
        <ul className="grid gap-3">
          {rows.map((c) => {
            const expired = new Date(c.valid_until) < new Date();
            const soon = dueState(c.valid_until) === "due_soon";
            const needsRenew = !c.revoked && (expired || soon);
            return (
              <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-mono">{c.certificate_no}</div>
                  <div className="text-sm text-ink/60">
                    {c.instrument?.category?.replace(/_/g, " ")} · {c.instrument?.serial_no ?? "—"}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>Valid until {formatDate(c.valid_until)}</div>
                  <div className="mt-1 flex items-center gap-3 justify-end">
                    {c.revoked ? <Badge variant="danger">Revoked</Badge> : expired ? <Badge variant="warning">Expired</Badge> : soon ? <Badge variant="warning">Expiring soon</Badge> : <Badge variant="success">Valid</Badge>}
                    {needsRenew && c.instrument?.id && (
                      <ReverifyButton instrumentId={c.instrument.id} businessId={c.business?.id} stateCode={c.business?.state_code ?? null} className="text-accent font-medium" label="Renew" />
                    )}
                    <Link href={`/dashboard/certificate/${c.id}`} className="text-brand font-medium">Certificate →</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
