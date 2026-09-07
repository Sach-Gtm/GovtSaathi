import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApplicationDetail({ params }: { params: { id: string } }) {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();

  const { data: app } = await supabase
    .from("applications")
    .select(`
      id, application_no, status, preferred_date, notes, submitted_at, created_at,
      business:businesses(legal_name, trade_name, address_line1, city, state_code),
      application_instruments:application_instruments(
        instrument:instruments(id, category, make, model, serial_no, capacity)
      )
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (!app) notFound();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, scheduled_for, accepted_at, completed_at, assignee:profiles(full_name, role, employee_code)")
    .eq("application_id", params.id)
    .order("created_at", { ascending: false });

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_no, issued_on, valid_until, revoked, instrument:instruments(category, make, model, serial_no)")
    .eq("business_id", (app.business as any)?.id ?? "")
    .in("instrument_id", (app.application_instruments as any[]).map((r) => r.instrument.id));

  const business: any = app.business;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/50">Application</div>
          <h1 className="mt-1 text-2xl font-display font-semibold font-mono">{app.application_no}</h1>
          <p className="mt-1 text-sm text-ink/70">
            Filed {formatDateTime(app.submitted_at ?? app.created_at)} · {business?.trade_name ?? business?.legal_name}
          </p>
        </div>
        <Badge variant={statusBadge(app.status)}>{app.status.replace("_", " ")}</Badge>
      </div>

      <section className="card p-6">
        <div className="font-display text-lg font-semibold">Instruments in scope</div>
        <ul className="mt-3 divide-y divide-border">
          {(app.application_instruments as any[]).map((row) => {
            const i = row.instrument;
            return (
              <li key={i.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{i.category.replace(/_/g, " ")} {i.capacity ? `· ${i.capacity}` : ""}</div>
                  <div className="text-ink/60">
                    {[i.make, i.model, i.serial_no].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-6">
        <div className="font-display text-lg font-semibold">Verifier</div>
        {assignments && assignments.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {assignments.map((a: any) => (
              <li key={a.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.assignee?.full_name ?? "—"}</div>
                    <div className="text-xs text-ink/60">
                      {a.assignee?.role?.toUpperCase()} {a.assignee?.employee_code ? `· ${a.assignee.employee_code}` : ""}
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <div>Scheduled: {formatDate(a.scheduled_for)}</div>
                    <div className="text-xs text-ink/60">
                      {a.completed_at ? `Completed ${formatDate(a.completed_at)}` : a.accepted_at ? `Accepted ${formatDate(a.accepted_at)}` : "Awaiting acceptance"}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/60">Waiting for the allocator to assign a verifier.</p>
        )}
      </section>

      {certificates && certificates.length > 0 && (
        <section className="card p-6">
          <div className="font-display text-lg font-semibold">Certificates issued</div>
          <ul className="mt-3 space-y-2 text-sm">
            {certificates.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <div className="font-mono">{c.certificate_no}</div>
                  <div className="text-xs text-ink/60">
                    {c.instrument.category.replace(/_/g, " ")} · {c.instrument.serial_no ?? "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink/60">Valid until {formatDate(c.valid_until)}</div>
                  <Link href={`/verify/${encodeURIComponent(c.certificate_no)}`} className="text-brand text-sm font-medium">Open →</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
