import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatTile } from "@/components/ui/StatTile";
import { ProgressRing } from "@/components/ui/Charts";
import { formatDate, greeting, minutesToLabel } from "@/lib/utils";
import { OfflineIndicator } from "./OfflineIndicator";

export const dynamic = "force-dynamic";
export const metadata = { title: "My day — MAAPSETU" };

export default async function OfficerHome() {
  const profile = await requireRole(["officer", "gatc"]);
  const supabase = createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("assignments")
    .select(`
      id, scheduled_for, accepted_at, completed_at, notes, planned_seq,
      check_in_at, check_out_at,
      application:applications(
        id, application_no, state_code, notes,
        business:businesses(legal_name, trade_name, address_line1, city, state_code, contact_phone),
        application_instruments:application_instruments(instrument:instruments(id, category, make, model, serial_no, capacity, accuracy_class))
      )
    `)
    .eq("assignee_id", profile.id)
    .is("completed_at", null)
    .order("planned_seq", { ascending: true })
    .order("scheduled_for", { ascending: true });

  const jobs = (data ?? []) as any[];

  // Today's numbers
  const todayJobs = jobs.filter((j) => j.scheduled_for === today);
  const totalInstruments = jobs.reduce(
    (s, j) => s + ((j.application?.application_instruments ?? []).length),
    0
  );
  const onSite = jobs.find((j) => j.check_in_at && !j.check_out_at);

  return (
    <div className="space-y-8">
      {/* Greeting + offline */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{greeting(profile.full_name)}</h1>
          <p className="mt-1 text-ink/70">
            Here is your plan for today. Everything you open is saved on this phone, so you can work even
            where there is no network.
          </p>
        </div>
        <OfflineIndicator />
      </div>

      {/* Today summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Shops to visit today" value={todayJobs.length} accent="#0B5FFF" />
        <StatTile label="Instruments to check" value={totalInstruments} accent="#8B5CF6" />
        <StatTile
          label="Currently on site"
          value={onSite ? "1" : "0"}
          accent="#E37400"
          hint={onSite ? (onSite.application?.business?.trade_name ?? onSite.application?.business?.legal_name) : "not checked in"}
        />
        <div className="card flex items-center justify-between p-5">
          <div>
            <div className="text-sm text-ink/60">All open jobs</div>
            <div className="mt-1 font-display text-3xl font-semibold">{jobs.length}</div>
          </div>
          <ProgressRing value={todayJobs.length} max={Math.max(jobs.length, 1)} size={70} stroke={8} label={`${todayJobs.length}`} sublabel="today" />
        </div>
      </div>

      {/* Job list */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Your visits, in order</h2>
        {jobs.length === 0 ? (
          <EmptyState
            title="Nothing assigned right now"
            description="When your controlling officer schedules a visit for you, it will show up here with the shop, the address, and the instruments to check."
          />
        ) : (
          <ol className="grid gap-4">
            {jobs.map((j, idx) => {
              const app = j.application;
              const b = app?.business;
              const instrs = (app?.application_instruments ?? []) as any[];
              const mapsQuery = encodeURIComponent(
                [b?.address_line1, b?.city, b?.state_code].filter(Boolean).join(", ")
              );
              return (
                <li key={j.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-semibold text-white">
                      {j.planned_seq ?? idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg font-semibold">{b?.trade_name ?? b?.legal_name}</span>
                        {!j.accepted_at && <Badge variant="warning">Not accepted yet</Badge>}
                        {j.check_in_at && !j.check_out_at && <Badge variant="warning">On site</Badge>}
                        {j.scheduled_for === today && <Badge variant="brand">Today</Badge>}
                      </div>
                      <div className="mt-0.5 text-sm text-ink/70">
                        {[b?.address_line1, b?.city, b?.state_code].filter(Boolean).join(", ")}
                      </div>
                      <div className="mt-1 text-xs font-mono text-ink/50">{app?.application_no} · scheduled {formatDate(j.scheduled_for)}</div>

                      <div className="mt-3 rounded-lg bg-canvas p-3 text-sm">
                        <span className="font-medium text-ink/80">{instrs.length} instrument{instrs.length !== 1 ? "s" : ""}: </span>
                        <span className="text-ink/60">
                          {instrs.slice(0, 3).map((r) => r.instrument.category.replace(/_/g, " ")).join(", ")}
                          {instrs.length > 3 && `, +${instrs.length - 3} more`}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/dashboard/officer/jobs/${j.id}`} className="btn-primary">
                          {j.check_in_at ? "Continue visit" : "Start visit"}
                        </Link>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline"
                        >
                          Directions
                        </a>
                        {b?.contact_phone && (
                          <a href={`tel:${b.contact_phone}`} className="btn-ghost">Call shop</a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
