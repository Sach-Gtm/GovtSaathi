import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, daysUntil } from "@/lib/utils";
import { AssignRow } from "./AssignRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Application queue — MAAPSETU" };

export default async function AllocatorHome() {
  await requireRole(["allocator", "admin"]);
  const supabase = createSupabaseServerClient();

  const [{ data: apps }, { data: officers }, { data: openAssignments }] = await Promise.all([
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
      .order("full_name"),
    supabase.from("assignments").select("assignee_id").is("completed_at", null)
  ]);

  // open-job count per officer
  const load = new Map<string, number>();
  (openAssignments ?? []).forEach((a: any) => load.set(a.assignee_id, (load.get(a.assignee_id) ?? 0) + 1));
  const officerRows = (officers ?? []).map((o: any) => ({ ...o, openJobs: load.get(o.id) ?? 0 }));

  const rows = (apps ?? []) as any[];
  const waiting = rows.filter((r) => r.status === "submitted");
  const breaching = waiting.filter((r) => {
    const d = daysUntil(r.submitted_at);
    return d !== null && -d > 5;
  });

  function ageBadge(submittedAt: string | null) {
    const d = daysUntil(submittedAt);
    if (d === null) return null;
    const age = -d;
    if (age > 5) return <Badge variant="danger">SLA {age}d</Badge>;
    if (age >= 3) return <Badge variant="warning">{age}d</Badge>;
    return <Badge variant="success">{age}d</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Application queue</h1>
          <p className="mt-1 text-ink/70">
            Submitted and reassignable applications, oldest first. The verifier list is ranked by state match and current workload.
          </p>
        </div>
        <a href="/api/export/applications" className="btn-outline text-sm">Export CSV</a>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-sm text-ink/60">Waiting to assign</div>
          <div className="mt-1 font-display text-2xl font-semibold text-warning">{waiting.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-ink/60">Over SLA (&gt; 5 days)</div>
          <div className="mt-1 font-display text-2xl font-semibold text-danger">{breaching.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-ink/60">Active verifiers</div>
          <div className="mt-1 font-display text-2xl font-semibold text-brand">{officerRows.length}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Queue is clear" description="No applications waiting for allocation right now." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">App no.</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Instr.</th>
                  <th className="px-4 py-3">Waiting</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assign to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((a) => (
                  <tr key={a.id} className="align-top">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/dashboard/trader/applications/${a.id}`} className="text-brand hover:underline">{a.application_no}</Link>
                    </td>
                    <td className="px-4 py-3">{a.business?.trade_name ?? a.business?.legal_name}</td>
                    <td className="px-4 py-3">{[a.business?.city, a.business?.state_code].filter(Boolean).join(", ")}</td>
                    <td className="px-4 py-3">{a.application_instruments?.[0]?.count ?? 0}</td>
                    <td className="px-4 py-3">{ageBadge(a.submitted_at)}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(a.status)}>{a.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3">
                      <AssignRow
                        applicationId={a.id}
                        appState={a.state_code}
                        officers={officerRows as any}
                        assigned={a.status === "assigned"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
