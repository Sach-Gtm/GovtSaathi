import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Instruments — GovtSathi" };

export default async function TraderInstruments() {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("instruments")
    .select("id, category, make, model, serial_no, capacity, last_verified_on, next_due_on, business:businesses(trade_name, legal_name)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Instruments</h1>
      {rows.length === 0 ? (
        <EmptyState title="No instruments yet" description="Add instruments to a new application to see them here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Instrument</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Last verified</th>
                <th className="px-4 py-3">Next due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((i) => {
                const overdue = i.next_due_on && new Date(i.next_due_on) < new Date();
                return (
                  <tr key={i.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{i.category.replace(/_/g, " ")} {i.capacity ? `· ${i.capacity}` : ""}</div>
                      <div className="text-xs text-ink/60">{[i.make, i.model].filter(Boolean).join(" ") || "—"}</div>
                    </td>
                    <td className="px-4 py-3">{i.business?.trade_name ?? i.business?.legal_name}</td>
                    <td className="px-4 py-3 font-mono">{i.serial_no ?? "—"}</td>
                    <td className="px-4 py-3">{formatDate(i.last_verified_on)}</td>
                    <td className="px-4 py-3">
                      {i.next_due_on ? (
                        <span className="inline-flex items-center gap-2">
                          {formatDate(i.next_due_on)}
                          {overdue && <Badge variant="danger">Overdue</Badge>}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
