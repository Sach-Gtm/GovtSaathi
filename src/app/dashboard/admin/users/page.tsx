import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users — Govt Saathi" };

export default async function AdminUsers() {
  await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, email, phone, state_code, organisation, employee_code, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Users</h1>
      <p className="text-sm text-ink/70">
        Role changes for officers, GATCs, allocators and admins are done here (or via a Supabase console).
        Traders self-register.
      </p>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.full_name}</td>
                <td className="px-4 py-3">{p.role}</td>
                <td className="px-4 py-3 text-xs">{p.email}</td>
                <td className="px-4 py-3">{p.state_code ?? "—"}</td>
                <td className="px-4 py-3">{p.organisation ?? "—"}</td>
                <td className="px-4 py-3">
                  {p.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Disabled</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
