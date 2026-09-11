import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit log — MAAPSETU" };

export default async function AuditLog() {
  await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, actor_role, meta, created_at, actor:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as any[];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">Audit log</h1>
          <p className="mt-1 text-ink/70">Every critical action is written here — application submissions, assignments, verifications, revocations.</p>
        </div>
        <a href="/api/export/audit" className="btn-outline text-sm">Export CSV</a>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.created_at)}</td>
                <td className="px-4 py-3">{r.actor?.full_name ?? "—"} <span className="text-xs text-ink/60">{r.actor_role}</span></td>
                <td className="px-4 py-3 font-mono">{r.action}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.entity_type}/{r.entity_id?.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-xs text-ink/60 max-w-xs truncate">{JSON.stringify(r.meta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
