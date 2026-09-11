import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, dueState, dueLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ReverifyButton } from "@/components/dashboard/ReverifyButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Instruments — MAAPSETU" };

export default async function TraderInstruments() {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("instruments")
    .select("id, category, make, model, serial_no, capacity, last_verified_on, next_due_on, business:businesses(id, trade_name, legal_name, state_code)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as any[];
  const reminders = rows.filter((i) => ["overdue", "due_soon"].includes(dueState(i.next_due_on)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Instruments</h1>

      {/* Renewal reminders */}
      {reminders.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 border-b border-warning/20 px-5 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-warning">
              <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <span className="font-display font-semibold">Renewal reminders</span>
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">{reminders.length}</span>
          </div>
          <ul className="divide-y divide-warning/15">
            {reminders.map((i) => {
              const st = dueState(i.next_due_on);
              return (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <div className="font-medium">
                      {i.category.replace(/_/g, " ")} {i.capacity ? `· ${i.capacity}` : ""}
                      <span className="ml-2 font-mono text-xs text-ink/50">{i.serial_no ?? ""}</span>
                    </div>
                    <div className="text-sm">
                      <span className={st === "overdue" ? "font-medium text-danger" : "font-medium text-warning"}>
                        {dueLabel(i.next_due_on)}
                      </span>
                      <span className="text-ink/50"> · {i.business?.trade_name ?? i.business?.legal_name}</span>
                    </div>
                  </div>
                  <ReverifyButton
                    instrumentId={i.id}
                    businessId={i.business?.id}
                    stateCode={i.business?.state_code ?? null}
                    className="btn-primary"
                    label="Re-verify now"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No instruments yet" description="Add instruments to a new application to see them here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">Instrument</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Last verified</th>
                  <th className="px-4 py-3">Next due</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((i) => {
                  const st = dueState(i.next_due_on);
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
                            {st === "overdue" && <Badge variant="danger">Overdue</Badge>}
                            {st === "due_soon" && <Badge variant="warning">Due soon</Badge>}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ReverifyButton
                          instrumentId={i.id}
                          businessId={i.business?.id}
                          stateCode={i.business?.state_code ?? null}
                          className="text-brand font-medium"
                          label="Re-verify"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
