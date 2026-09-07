import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { AssignRow } from "./AssignRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Application queue — GovtSathi" };

export default async function AllocatorHome() {
  await requireRole(["allocator", "admin"]);
  const supabase = createSupabaseServerClient();

  const [{ data: apps }, { data: officers }] = await Promise.all([
    supabase
      .from("applications")
      .select(`
        id, application_no, status, state_code, preferred_date, submitted_at, notes,
        business:businesses(legal_name, trade_name, address_line1, city, state_code),
        application_instruments:application_instruments(count)
      `)
      .in("status", ["submitted", "assigned"])
      .order("submitted_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, role, state_code, organisation, employee_code")
      .in("role", ["officer", "gatc"])
      .eq("is_active", true)
      .order("full_name")
  ]);

  const rows = (apps ?? []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Application queue</h1>
        <p className="mt-1 text-ink/70">
          Submitted and reassignable applications, oldest first. Route to a verifier by district and instrument class.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Queue is clear" description="No applications waiting for allocation right now." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">App no.</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Instruments</th>
                <th className="px-4 py-3">Preferred</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assign to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-mono">{a.application_no}</td>
                  <td className="px-4 py-3">{a.business?.trade_name ?? a.business?.legal_name}</td>
                  <td className="px-4 py-3">{[a.business?.city, a.business?.state_code].filter(Boolean).join(", ")}</td>
                  <td className="px-4 py-3">{a.application_instruments?.[0]?.count ?? 0}</td>
                  <td className="px-4 py-3">{formatDate(a.preferred_date)}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(a.status)}>{a.status.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3"><AssignRow applicationId={a.id} officers={officers as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
