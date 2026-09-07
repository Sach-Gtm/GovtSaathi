import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { OfflineIndicator } from "./OfflineIndicator";

export const dynamic = "force-dynamic";
export const metadata = { title: "My jobs — GovtSathi" };

export default async function OfficerHome() {
  const profile = await requireRole(["officer", "gatc"]);
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("assignments")
    .select(`
      id, scheduled_for, accepted_at, completed_at, notes,
      application:applications(
        id, application_no, state_code, notes,
        business:businesses(legal_name, trade_name, address_line1, city, state_code, contact_phone),
        application_instruments:application_instruments(instrument:instruments(id, category, make, model, serial_no, capacity, accuracy_class))
      )
    `)
    .eq("assignee_id", profile.id)
    .is("completed_at", null)
    .order("scheduled_for", { ascending: true });

  const jobs = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Today&apos;s jobs</h1>
          <p className="mt-1 text-ink/70">
            Assignments you have accepted or that are waiting for you. The app holds the day&apos;s data on your device so
            you can work without a signal.
          </p>
        </div>
        <OfflineIndicator />
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No open jobs" description="Nothing assigned right now. Check back or refresh to pull new work." />
      ) : (
        <ul className="grid gap-4">
          {jobs.map((j) => {
            const app = j.application;
            const b = app?.business;
            const instrs = (app?.application_instruments ?? []) as any[];
            return (
              <li key={j.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-ink/70">{app?.application_no}</span>
                      {!j.accepted_at && <Badge variant="warning">Awaiting acceptance</Badge>}
                    </div>
                    <div className="mt-1 font-display text-lg font-semibold">{b?.trade_name ?? b?.legal_name}</div>
                    <div className="text-sm text-ink/70">
                      {[b?.address_line1, b?.city, b?.state_code].filter(Boolean).join(", ")}
                    </div>
                    {b?.contact_phone && (
                      <a href={`tel:${b.contact_phone}`} className="text-sm text-brand">Call {b.contact_phone}</a>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-ink/60">Scheduled</div>
                    <div className="font-medium">{formatDate(j.scheduled_for)}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-canvas p-3 text-sm">
                  <div className="font-medium text-ink/80">{instrs.length} instrument{instrs.length !== 1 && "s"}</div>
                  <ul className="mt-1 divide-y divide-border">
                    {instrs.slice(0, 4).map((row) => {
                      const i = row.instrument;
                      return (
                        <li key={i.id} className="py-1.5">
                          <span className="font-medium">{i.category.replace(/_/g, " ")}</span>
                          <span className="text-ink/60"> · {[i.make, i.model, i.serial_no].filter(Boolean).join(" ") || "no serial"}{i.capacity ? ` · ${i.capacity}` : ""}</span>
                        </li>
                      );
                    })}
                    {instrs.length > 4 && <li className="py-1.5 text-ink/60">+{instrs.length - 4} more</li>}
                  </ul>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link href={`/dashboard/officer/jobs/${j.id}`} className="btn-primary">Open job</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
