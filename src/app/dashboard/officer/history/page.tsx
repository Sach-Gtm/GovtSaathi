import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Badge, statusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verification history — GovtSathi" };

export default async function OfficerHistory() {
  const profile = await requireRole(["officer", "gatc"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("verification_records")
    .select("id, outcome, performed_at, instrument:instruments(category, serial_no)")
    .eq("performed_by", profile.id)
    .order("performed_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as any[];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Verification history</h1>
      {rows.length === 0 ? (
        <EmptyState title="No verifications yet" description="Records you complete will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Instrument</th>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{formatDate(r.performed_at)}</td>
                  <td className="px-4 py-3">{r.instrument?.category?.replace(/_/g, " ") ?? "—"}</td>
                  <td className="px-4 py-3 font-mono">{r.instrument?.serial_no ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(r.outcome)}>{r.outcome}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
