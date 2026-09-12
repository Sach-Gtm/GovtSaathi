import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Officers & GATCs — MAAPSETU" };

export default async function AllocatorOfficers() {
  await requireRole(["allocator", "admin"]);
  const supabase = createSupabaseServerClient();

  // Try to join the GATC centre; fall back gracefully if the registry migration
  // (0007) has not been applied yet.
  let rows: any[] = [];
  try {
    const withCentre = await supabase
      .from("profiles")
      .select("id, full_name, role, state_code, organisation, employee_code, is_active, email, phone, gatc_centre:gatc_centres(name, registration_no, valid_until, is_active)")
      .in("role", ["officer", "gatc"])
      .order("state_code")
      .order("full_name");
    if (withCentre.error) throw withCentre.error;
    rows = (withCentre.data ?? []) as any[];
  } catch {
    const plain = await supabase
      .from("profiles")
      .select("id, full_name, role, state_code, organisation, employee_code, is_active, email, phone")
      .in("role", ["officer", "gatc"])
      .order("state_code")
      .order("full_name");
    rows = (plain.data ?? []) as any[];
  }

  const centreValid = (c: any) => c && c.is_active && (!c.valid_until || new Date(c.valid_until) >= new Date());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Officers &amp; GATCs</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Employee / GATC code</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">GATC centre</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => {
                const c = p.gatc_centre;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{p.full_name}</td>
                    <td className="px-4 py-3">{p.role.toUpperCase()}</td>
                    <td className="px-4 py-3 font-mono">{p.employee_code ?? "—"}</td>
                    <td className="px-4 py-3">{p.state_code ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.role !== "gatc" ? (
                        <span className="text-ink/40">—</span>
                      ) : c ? (
                        <div>
                          <div>{c.name}</div>
                          <div className="mt-0.5">
                            {centreValid(c) ? (
                              <Badge variant="success">Accredited{c.valid_until ? ` till ${formatDate(c.valid_until)}` : ""}</Badge>
                            ) : (
                              <Badge variant="danger">Accreditation expired</Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-warning">Not linked to a centre</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{p.email}</div>
                      {p.phone && <div className="text-ink/60">{p.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {p.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Disabled</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
