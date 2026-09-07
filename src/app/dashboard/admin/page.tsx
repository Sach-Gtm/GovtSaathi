import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate, greeting } from "@/lib/utils";
import { StatTile } from "@/components/ui/StatTile";
import { BarChart, HBar } from "@/components/ui/Charts";
import { Badge, statusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview — Govt Saathi" };

export default async function AdminHome() {
  const profile = await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    total,
    submitted,
    assigned,
    verified,
    overdue,
    officers,
    todayVisits
  ] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "assigned"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "verified"),
    supabase.from("instruments").select("id", { count: "exact", head: true }).lt("next_due_on", today),
    supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["officer", "gatc"]).eq("is_active", true),
    supabase.from("assignments").select("id", { count: "exact", head: true }).eq("scheduled_for", today)
  ]);

  // Status breakdown for the bar chart
  const statuses = ["submitted", "assigned", "in_verification", "verified", "rejected"];
  const counts = await Promise.all(
    statuses.map((s) =>
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", s)
    )
  );
  const statusData = [
    { label: "New", value: counts[0].count ?? 0, color: "#0B5FFF" },
    { label: "Assigned", value: counts[1].count ?? 0, color: "#8B5CF6" },
    { label: "In progress", value: counts[2].count ?? 0, color: "#E37400" },
    { label: "Verified", value: counts[3].count ?? 0, color: "#0F9D58" },
    { label: "Rejected", value: counts[4].count ?? 0, color: "#D14343" }
  ];

  // State-wise pendency
  const { data: stateRows } = await supabase
    .from("applications")
    .select("state_code, status")
    .in("status", ["submitted", "assigned", "in_verification"]);
  const byState = new Map<string, number>();
  (stateRows ?? []).forEach((r: any) => byState.set(r.state_code, (byState.get(r.state_code) ?? 0) + 1));
  const statePend = Array.from(byState.entries())
    .map(([code, n]) => ({ code, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  const maxState = Math.max(1, ...statePend.map((s) => s.n));

  const { data: recentCerts } = await supabase
    .from("certificates")
    .select("id, certificate_no, issued_on, valid_until, instrument:instruments(category, serial_no), business:businesses(legal_name, state_code)")
    .order("issued_on", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{greeting(profile.full_name)}</h1>
          <p className="mt-1 text-ink/70">Here is where things stand across the department right now.</p>
        </div>
        <Link href="/dashboard/admin/field-ops" className="btn-primary">
          Live field operations →
        </Link>
      </div>

      {/* KPI tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Applications" value={(total.count ?? 0).toLocaleString("en-IN")} accent="#0B5FFF" hint="all time" />
        <StatTile label="Waiting to assign" value={(submitted.count ?? 0).toLocaleString("en-IN")} accent="#E37400" hint="need an officer" />
        <StatTile label="Verified" value={(verified.count ?? 0).toLocaleString("en-IN")} accent="#0F9D58" hint="certificate issued" />
        <StatTile label="Overdue instruments" value={(overdue.count ?? 0).toLocaleString("en-IN")} accent="#D14343" hint="past re-check date" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Application flow chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-1 font-display text-lg font-semibold">Where every application is</div>
          <p className="mb-6 text-sm text-ink/60">From the moment a trader files, to a signed certificate.</p>
          <BarChart data={statusData} />
        </div>

        {/* Field today */}
        <div className="card p-6">
          <div className="mb-4 font-display text-lg font-semibold">Today, in the field</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/70">Visits scheduled</span>
              <span className="font-display text-xl font-semibold">{todayVisits.count ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/70">Officers on duty</span>
              <span className="font-display text-xl font-semibold">{officers.count ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/70">Assigned, not started</span>
              <span className="font-display text-xl font-semibold">{assigned.count ?? 0}</span>
            </div>
            <Link href="/dashboard/admin/field-ops" className="btn-outline w-full justify-center mt-2">
              Open the live map
            </Link>
          </div>
        </div>
      </div>

      {/* State pendency + recent certs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 font-display text-lg font-semibold">Pending work by state</div>
          {statePend.length === 0 ? (
            <p className="text-sm text-ink/60">Nothing pending. The queue is clear.</p>
          ) : (
            <div className="space-y-4">
              {statePend.map((s) => (
                <HBar key={s.code} label={s.code} value={s.n} max={maxState} right={`${s.n} pending`} />
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 font-display text-lg font-semibold">Latest certificates issued</div>
          {(recentCerts ?? []).length === 0 ? (
            <p className="text-sm text-ink/60">No certificates issued yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(recentCerts ?? []).map((c: any) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-mono text-xs text-ink/70">{c.certificate_no}</div>
                    <div className="text-ink/80">{c.business?.legal_name} · {c.instrument?.category?.replace(/_/g, " ")}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">Valid</Badge>
                    <div className="mt-1 text-xs text-ink/50">till {formatDate(c.valid_until)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
