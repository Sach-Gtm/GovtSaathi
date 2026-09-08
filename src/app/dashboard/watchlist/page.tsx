import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { ComplaintRow } from "./ComplaintRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Watchlist — MAAPSETU" };

export default async function Watchlist() {
  await requireRole(["officer", "gatc", "allocator", "admin"]);
  const supabase = createSupabaseServerClient();

  const ninetyAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();

  const [{ data: complaints }, { data: frequent }, { data: dormant }, openCount] = await Promise.all([
    supabase
      .from("complaints")
      .select("id, complaint_no, shop_name, city, state_code, category, description, status, certificate_no, contact_phone, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("cert_scan_stats")
      .select("certificate_no, legal_name, trade_name, city, state_code, instrument_category, serial_no, scans_7d, scans_30d, scans_total, last_scan_at")
      .gt("scans_30d", 0)
      .order("scans_7d", { ascending: false })
      .order("scans_30d", { ascending: false })
      .limit(10),
    supabase
      .from("cert_scan_stats")
      .select("certificate_no, legal_name, trade_name, city, state_code, instrument_category, serial_no, last_scan_at, age_days, valid_until, revoked")
      .gt("age_days", 90)
      .eq("revoked", false)
      .or(`last_scan_at.is.null,last_scan_at.lt.${ninetyAgo}`)
      .order("age_days", { ascending: false })
      .limit(12),
    supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "open")
  ]);

  const cRows = (complaints ?? []) as any[];
  const fRows = (frequent ?? []) as any[];
  const dRows = (dormant ?? []) as any[];
  const maxScan = Math.max(1, ...fRows.map((r) => r.scans_30d ?? 0));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Watchlist &amp; complaints</h1>
        <p className="mt-1 text-ink/70">
          Signals worth a second look. Customer complaints, shops customers keep re-checking, and machines
          that have gone quiet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Open complaints" value={openCount.count ?? 0} accent="#D14343" />
        <StatTile label="Frequently re-checked" value={fRows.length} accent="#E37400" hint="possible dispute" />
        <StatTile label="Quiet 90+ days" value={dRows.length} accent="#8B5CF6" hint="maybe not in use" />
      </div>

      {/* Complaints */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Customer complaints</h2>
        {cRows.length === 0 ? (
          <EmptyState title="No complaints" description="When a customer reports a shop, it appears here for an officer to act on." />
        ) : (
          <div className="space-y-3">
            {cRows.map((c) => <ComplaintRow key={c.id} complaint={c} />)}
          </div>
        )}
      </section>

      {/* Frequently scanned */}
      <section>
        <h2 className="mb-1 font-display text-lg font-semibold">Customers keep checking these</h2>
        <p className="mb-3 text-sm text-ink/60">
          A sticker scanned unusually often can mean customers are suspicious. An officer may want to
          re-visit and re-check the machine.
        </p>
        {fRows.length === 0 ? (
          <div className="card p-6 text-sm text-ink/60">No scans recorded yet. This fills in as customers verify stickers.</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">Shop</th>
                  <th className="px-4 py-3">Instrument</th>
                  <th className="px-4 py-3">Scans (7d / 30d)</th>
                  <th className="px-4 py-3 w-40">Activity</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fRows.map((r) => (
                  <tr key={r.certificate_no}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.trade_name ?? r.legal_name}</div>
                      <div className="text-xs text-ink/60">{[r.city, r.state_code].filter(Boolean).join(", ")}</div>
                    </td>
                    <td className="px-4 py-3">
                      {r.instrument_category?.replace(/_/g, " ")}
                      <span className="text-ink/50"> · {r.serial_no ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {r.scans_7d} <span className="text-ink/40">/ {r.scans_30d}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 overflow-hidden rounded-full bg-canvas">
                        <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, ((r.scans_30d ?? 0) / maxScan) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/verify/${encodeURIComponent(r.certificate_no)}`} className="text-brand font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dormant */}
      <section>
        <h2 className="mb-1 font-display text-lg font-semibold">Gone quiet for 90+ days</h2>
        <p className="mb-3 text-sm text-ink/60">
          A verified machine that nobody has scanned in three months may no longer be in use. Worth
          confirming the shop still runs it.
        </p>
        {dRows.length === 0 ? (
          <div className="card p-6 text-sm text-ink/60">Nothing dormant. Every verified machine has recent activity.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {dRows.map((r) => (
              <div key={r.certificate_no} className="card flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.trade_name ?? r.legal_name}</div>
                  <div className="text-xs text-ink/60">
                    {r.instrument_category?.replace(/_/g, " ")} · {[r.city, r.state_code].filter(Boolean).join(", ")}
                  </div>
                  <div className="mt-1 text-xs text-ink/50">
                    {r.last_scan_at ? `Last scanned ${formatDate(r.last_scan_at)}` : "Never scanned"}
                  </div>
                </div>
                <Badge variant="default">{r.age_days}d old</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
