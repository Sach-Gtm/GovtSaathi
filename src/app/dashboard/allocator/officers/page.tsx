import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Officers & GATCs — Govt Saathi" };

export default async function AllocatorOfficers() {
  await requireRole(["allocator", "admin"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, state_code, organisation, employee_code, is_active, email, phone")
    .in("role", ["officer", "gatc"])
    .order("state_code")
    .order("full_name");

  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Officers & GATCs</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Employee / GATC code</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.full_name}</td>
                <td className="px-4 py-3">{p.role.toUpperCase()}</td>
                <td className="px-4 py-3 font-mono">{p.employee_code ?? "—"}</td>
                <td className="px-4 py-3">{p.state_code ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  <div>{p.email}</div>
                  {p.phone && <div className="text-ink/60">{p.phone}</div>}
                </td>
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
