import { requireRole, roleLabel, type UserRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { formatDate } from "@/lib/utils";
import { RoleManager, RequestActions, roleBadgeVariant } from "./RoleManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users & access — MAAPSETU" };

export default async function AdminUsers() {
  const me = await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();

  const [{ data: users }, { data: states }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, email, phone, state_code, organisation, employee_code, is_active, requested_role, requested_at, access_note, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("states").select("code, name").order("name")
  ]);

  const rows = (users ?? []) as any[];
  const stateList = (states ?? []) as { code: string; name: string }[];

  const pending = rows.filter((r) => r.requested_role);
  const counts: Record<string, number> = {};
  rows.forEach((r) => (counts[r.role] = (counts[r.role] ?? 0) + 1));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Users &amp; access</h1>
        <p className="mt-1 text-ink/70">
          Approve access requests and set who is an officer, GATC, allocator or administrator. All from
          here, no database needed.
        </p>
      </div>

      {/* Role counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Officers & GATCs" value={(counts.officer ?? 0) + (counts.gatc ?? 0)} accent="#0F9D58" />
        <StatTile label="Allocators" value={counts.allocator ?? 0} accent="#E37400" />
        <StatTile label="Shop owners" value={counts.trader ?? 0} accent="#0B2E6F" />
        <StatTile label="Pending requests" value={pending.length} accent="#D14343" />
      </div>

      {/* Access requests */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Access requests</h2>
        {pending.length === 0 ? (
          <div className="card p-6 text-sm text-ink/60">
            No pending requests. When a signed-in user asks for officer, GATC or allocator access, it shows up here for approval.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{u.full_name}</span>
                    <span className="text-xs text-ink/50">{u.email}</span>
                    <span className="text-ink/40">wants</span>
                    <Badge variant={roleBadgeVariant(u.requested_role)}>{roleLabel(u.requested_role as UserRole)}</Badge>
                  </div>
                  {u.access_note && <p className="mt-1 text-sm text-ink/70">“{u.access_note}”</p>}
                  <div className="mt-1 text-xs text-ink/50">
                    Currently {roleLabel(u.role as UserRole)} · requested {formatDate(u.requested_at)}
                  </div>
                </div>
                <RequestActions user={{ id: u.id, requested_role: u.requested_role }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All users */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">All users</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border align-top">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.full_name}</div>
                    <div className="text-xs text-ink/50">{u.email}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={roleBadgeVariant(u.role)}>{roleLabel(u.role as UserRole)}</Badge></td>
                  <td className="px-4 py-3">{u.state_code ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.employee_code ?? "—"}</td>
                  <td className="px-4 py-3">
                    {u.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Disabled</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <RoleManager user={u} states={stateList} selfId={me.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
