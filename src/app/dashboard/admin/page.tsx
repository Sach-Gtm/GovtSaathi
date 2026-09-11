import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate, greeting } from "@/lib/utils";
import { StatTile } from "@/components/ui/StatTile";
import { BarChart, HBar, ProgressRing } from "@/components/ui/Charts";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview — MAAPSETU" };

const ic = {
  file: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h9l3 3v15H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" /><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 10v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
};

export default async function AdminHome() {
  const profile = await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();

  const today = new Date().toISOString().slice(0, 10);

  const [total, submitted, assigned, verified, overdue, officers, todayVisits] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "assigned"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "verified"),
    supabase.from("instruments").select("id", { count: "exact", head: true }).lt("next_due_on", today),
    supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["officer", "gatc"]).eq("is_active", true),
    supabase.from("assignments").select("id", { count: "exact", head: true }).eq("scheduled_for", today)
  ]);

  const statuses = ["submitted", "assigned", "in_verification", "verified", "rejected"];
  const counts = await Promise.all(
    statuses.map((s) => supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", s))
  );
  const statusData = [
    { label: "New", value: counts[0].count ?? 0, color: "#0B2E6F" },
    { label: "Assigned", value: counts[1].count ?? 0, color: "#0F766E" },
    { label: "In progress", value: counts[2].count ?? 0, color: "#C25E00" },
    { label: "Verified", value: counts[3].count ?? 0, color: "#0E7A4B" },
    { label: "Rejected", value: counts[4].count ?? 0, color: "#D14343" }
  ];

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

  const totalN = total.count ?? 0;
  const verifiedN = verified.count ?? 0;
  const coverage = totalN > 0 ? Math.round((verifiedN / totalN) * 100) : 0;
  const longDate = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Government banner header */}
      <div className="relative overflow-hidden rounded-2xl gov-band p-6 text-white shadow-band sm:p-7">
        <div className="pointer-events-none absolute inset-0 grain-light" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-white/60">{longDate}</div>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{greeting(profile.full_name)}</h1>
            <p className="mt-1 max-w-xl text-sm text-white/75">
              Here is where things stand across the department right now.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/dashboard/admin/field-ops" className="btn-accent">Live field operations →</Link>
              <Link href="/dashboard/admin/audit" className="btn-outline border-white/30 bg-white/5 text-white hover:bg-white/10">Audit log</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <ProgressRing value={coverage} size={92} stroke={9} color="#3DD68C" label={`${coverage}%`} sublabel="verified" />
            <div className="text-sm">
              <div className="font-semibold text-white">Verification coverage</div>
              <div className="mt-0.5 text-white/60">{verifiedN.toLocaleString("en-IN")} of {totalN.toLocaleString("en-IN")}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#3DD68C]" /> live from the ledger
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Applications" value={totalN.toLocaleString("en-IN")} accent="#0B2E6F" hint="all time" icon={ic.file} />
        <StatTile label="Waiting to assign" value={(submitted.count ?? 0).toLocaleString("en-IN")} accent="#C25E00" hint="need an officer" icon={ic.clock} />
        <StatTile label="Verified" value={verifiedN.toLocaleString("en-IN")} accent="#0E7A4B" hint="certificate issued" icon={ic.check} />
        <StatTile label="Overdue instruments" value={(overdue.count ?? 0).toLocaleString("en-IN")} accent="#D14343" hint="past re-check date" icon={ic.alert} />
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
          <div className="space-y-3.5">
            {[
              { k: "Visits scheduled", v: todayVisits.count ?? 0 },
              { k: "Officers on duty", v: officers.count ?? 0 },
              { k: "Assigned, not started", v: assigned.count ?? 0 }
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-ink/70">{r.k}</span>
                <span className="font-display text-xl font-semibold tabular-nums text-brand">{r.v}</span>
              </div>
            ))}
            <Link href="/dashboard/admin/field-ops" className="btn-outline mt-1 w-full justify-center">Open the live map</Link>
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
