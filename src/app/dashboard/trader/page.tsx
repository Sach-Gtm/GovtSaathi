import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatTile } from "@/components/ui/StatTile";
import { formatDate, greeting } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My applications — MAAPSETU" };

interface AppRow {
  id: string;
  application_no: string;
  status: string;
  preferred_date: string | null;
  submitted_at: string | null;
  created_at: string;
  business: { legal_name: string; trade_name: string | null } | null;
}

export default async function TraderApplications() {
  const profile = await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("applications")
    .select("id, application_no, status, preferred_date, submitted_at, created_at, business:businesses(legal_name, trade_name)")
    .order("created_at", { ascending: false });

  const apps = (data ?? []) as unknown as AppRow[];

  const inProgress = apps.filter((a) => ["submitted", "assigned", "in_verification"].includes(a.status)).length;
  const verified = apps.filter((a) => a.status === "verified").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{greeting(profile.full_name)}</h1>
          <p className="mt-1 text-ink/70">
            This is where you ask us to check your weighing scales and other instruments, and see how each
            request is going.
          </p>
        </div>
        <Link href="/dashboard/trader/applications/new" className="btn-primary">+ New request</Link>
      </div>

      {apps.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Requests filed" value={apps.length} accent="#0B2E6F" />
          <StatTile label="Being checked" value={inProgress} accent="#E37400" hint="with an officer" />
          <StatTile label="Verified" value={verified} accent="#0F9D58" hint="certificate ready" />
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Your requests</h2>

      {apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="File your first verification request. Add your business and its instruments first — you can do it as part of the same flow."
          action={<Link href="/dashboard/trader/applications/new" className="btn-primary">Start an application</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Application no.</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Preferred date</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((a) => (
                <tr key={a.id} className="hover:bg-canvas/50">
                  <td className="px-4 py-3 font-mono">{a.application_no}</td>
                  <td className="px-4 py-3">{a.business?.trade_name ?? a.business?.legal_name ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(a.preferred_date)}</td>
                  <td className="px-4 py-3">{formatDate(a.submitted_at)}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(a.status)}>{a.status.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/trader/applications/${a.id}`} className="text-brand font-medium">Open →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
