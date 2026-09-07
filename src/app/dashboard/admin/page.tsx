import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin overview — Govt Saathi" };

export default async function AdminHome() {
  await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();

  const [total, submitted, verified, overdue] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "verified"),
    supabase.from("instruments").select("id", { count: "exact", head: true }).lt("next_due_on", new Date().toISOString().slice(0, 10))
  ]);

  const { data: recentCerts } = await supabase
    .from("certificates")
    .select("id, certificate_no, issued_on, valid_until, revoked, instrument:instruments(category, serial_no), business:businesses(legal_name, state_code)")
    .order("issued_on", { ascending: false })
    .limit(10);

  const cards = [
    { label: "Applications total", value: total.count ?? 0 },
    { label: "Awaiting allocation", value: submitted.count ?? 0 },
    { label: "Verified", value: verified.count ?? 0 },
    { label: "Instruments overdue", value: overdue.count ?? 0 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold">Overview</h1>
        <p className="mt-1 text-ink/70">Verification pendency, applications flow and certificate issuance across states.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-xs uppercase tracking-wide text-ink/60">{c.label}</div>
            <div className="mt-2 text-3xl font-display font-semibold">{c.value.toLocaleString("en-IN")}</div>
          </div>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="p-5 border-b border-border font-display font-semibold">Recent certificates</div>
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Certificate</th>
              <th className="px-4 py-3">Instrument</th>
              <th className="px-4 py-3">Trader</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Valid until</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(recentCerts ?? []).map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono">{c.certificate_no}</td>
                <td className="px-4 py-3">{c.instrument?.category?.replace(/_/g, " ")} · <span className="font-mono">{c.instrument?.serial_no ?? "—"}</span></td>
                <td className="px-4 py-3">{c.business?.legal_name} <span className="text-ink/60">({c.business?.state_code})</span></td>
                <td className="px-4 py-3">{formatDate(c.issued_on)}</td>
                <td className="px-4 py-3">{formatDate(c.valid_until)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
