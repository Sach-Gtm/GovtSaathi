import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui/StatTile";
import { ProgressRing } from "@/components/ui/Charts";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { minutesToLabel, formatDate } from "@/lib/utils";
import { FieldMap, type MapPin } from "@/components/dashboard/FieldMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Field operations — MAAPSETU" };

interface PlanRow {
  assignment_id: string;
  assignee_id: string;
  officer_name: string;
  employee_code: string | null;
  planned_seq: number | null;
  scheduled_for: string;
  check_in_at: string | null;
  check_out_at: string | null;
  minutes_on_site: number | null;
  completed_at: string | null;
  shop_name: string;
  address_line1: string | null;
  city: string | null;
  shop_state: string | null;
  shop_lat: number | null;
  shop_lng: number | null;
  application_no: string;
  instrument_count: number;
}

function visitStatus(r: PlanRow): MapPin["status"] {
  if (r.completed_at || r.check_out_at) return "done";
  if (r.check_in_at) return "in_progress";
  return "planned";
}

export default async function FieldOps() {
  await requireRole(["admin", "allocator"]);
  const supabase = createSupabaseServerClient();

  const { data } = await supabase.from("field_plan_today").select("*");
  const rows = (data ?? []) as PlanRow[];

  // Group by officer
  const byOfficer = new Map<string, PlanRow[]>();
  rows.forEach((r) => {
    const arr = byOfficer.get(r.assignee_id) ?? [];
    arr.push(r);
    byOfficer.set(r.assignee_id, arr);
  });
  for (const arr of byOfficer.values()) {
    arr.sort((a, b) => (a.planned_seq ?? 99) - (b.planned_seq ?? 99));
  }

  const totalPlanned = rows.length;
  const totalDone = rows.filter((r) => visitStatus(r) === "done").length;
  const activeOfficers = byOfficer.size;
  const withTime = rows.filter((r) => r.minutes_on_site != null);
  const avgMins = withTime.length
    ? Math.round(withTime.reduce((s, r) => s + (r.minutes_on_site ?? 0), 0) / withTime.length)
    : null;

  const pins: MapPin[] = rows
    .filter((r) => r.shop_lat != null && r.shop_lng != null)
    .map((r) => ({
      lat: r.shop_lat as number,
      lng: r.shop_lng as number,
      label: r.shop_name,
      sub: `${r.officer_name} · ${r.application_no}`,
      status: visitStatus(r)
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Field operations — today</h1>
        <p className="mt-1 text-ink/70">
          Where every officer is going, how many shops are planned, and how long each visit is taking.
          Live from the field, {formatDate(new Date())}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Officers on duty" value={activeOfficers} accent="#0B5FFF" />
        <StatTile label="Shops planned" value={totalPlanned} accent="#8B5CF6" />
        <StatTile label="Visited so far" value={totalDone} accent="#0F9D58" hint={`${totalPlanned - totalDone} to go`} />
        <StatTile label="Avg time per shop" value={minutesToLabel(avgMins)} accent="#E37400" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No visits scheduled today"
          description="When the allocator schedules assignments for today, each officer's route appears here with a live map."
        />
      ) : (
        <>
          {/* Map */}
          <div>
            <div className="mb-3 flex items-center gap-4 text-xs text-ink/60">
              <span className="inline-flex items-center gap-1.5"><Dot c="#0B5FFF" /> Planned</span>
              <span className="inline-flex items-center gap-1.5"><Dot c="#E37400" /> On site now</span>
              <span className="inline-flex items-center gap-1.5"><Dot c="#0F9D58" /> Done</span>
            </div>
            {pins.length > 0 ? (
              <FieldMap pins={pins} />
            ) : (
              <div className="card p-6 text-sm text-ink/60">
                Shops for today don&apos;t have location tags yet. Add latitude / longitude to a business
                (or capture it on officer check-in) and pins will appear here.
              </div>
            )}
          </div>

          {/* Per-officer plans */}
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from(byOfficer.entries()).map(([officerId, visits]) => {
              const done = visits.filter((v) => visitStatus(v) === "done").length;
              const officer = visits[0];
              const officerMins = visits.filter((v) => v.minutes_on_site != null);
              const officerAvg = officerMins.length
                ? Math.round(officerMins.reduce((s, v) => s + (v.minutes_on_site ?? 0), 0) / officerMins.length)
                : null;
              return (
                <div key={officerId} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-lg font-semibold">{officer.officer_name}</div>
                      <div className="text-xs text-ink/60">
                        {officer.employee_code ?? "—"} · avg {minutesToLabel(officerAvg)} per shop
                      </div>
                    </div>
                    <ProgressRing value={done} max={visits.length} size={64} stroke={7} label={`${done}/${visits.length}`} sublabel="visited" color="#0F9D58" />
                  </div>

                  <ol className="mt-5 space-y-3">
                    {visits.map((v, i) => {
                      const st = visitStatus(v);
                      return (
                        <li key={v.assignment_id} className="flex items-start gap-3">
                          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
                            {v.planned_seq ?? i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium">{v.shop_name}</span>
                              {st === "done" && <Badge variant="success">Done</Badge>}
                              {st === "in_progress" && <Badge variant="warning">On site</Badge>}
                              {st === "planned" && <Badge variant="brand">Planned</Badge>}
                            </div>
                            <div className="truncate text-xs text-ink/60">
                              {[v.address_line1, v.city].filter(Boolean).join(", ")} · {v.instrument_count} instrument{v.instrument_count !== 1 ? "s" : ""}
                            </div>
                            <div className="mt-0.5 text-xs text-ink/50">
                              {v.check_in_at && `In ${new Date(v.check_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                              {v.check_out_at && ` · Out ${new Date(v.check_out_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                              {v.minutes_on_site != null && ` · ${minutesToLabel(v.minutes_on_site)} on site`}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />;
}
