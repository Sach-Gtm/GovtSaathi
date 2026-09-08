import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Certificates — MAAPSETU" };

export default async function TraderCertificates() {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("certificates")
    .select("id, certificate_no, issued_on, valid_until, revoked, instrument:instruments(category, serial_no, capacity)")
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
            return (
              <li key={c.id} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="font-mono">{c.certificate_no}</div>
                  <div className="text-sm text-ink/60">
                    {c.instrument.category.replace(/_/g, " ")} · {c.instrument.serial_no ?? "—"}
                  </div>
                </div>
                <div className="text-sm text-right">
                  <div>Valid until {formatDate(c.valid_until)}</div>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    {c.revoked ? <Badge variant="danger">Revoked</Badge> : expired ? <Badge variant="warning">Expired</Badge> : <Badge variant="success">Valid</Badge>}
                    <Link href={`/verify/${encodeURIComponent(c.certificate_no)}`} className="text-brand font-medium">Open →</Link>
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
