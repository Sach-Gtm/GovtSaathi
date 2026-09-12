import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, dueState } from "@/lib/utils";
import { GatcEditor } from "./GatcManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "GATC centres — MAAPSETU" };

const CAT_LABEL: Record<string, string> = {
  weighing_scale: "Weighing scale", beam_scale: "Beam scale", platform_scale: "Platform scale",
  crane_scale: "Crane scale", weighbridge: "Weighbridge", fuel_dispenser: "Fuel dispenser",
  flow_meter: "Flow meter", length_measure: "Length measure", volume_measure: "Volume measure",
  capacity_measure: "Capacity measure", other: "Other"
};

export default async function AdminGatc() {
  await requireRole(["admin"]);
  const supabase = createSupabaseServerClient();

  const [{ data: centres, error }, { data: states }] = await Promise.all([
    supabase.from("gatc_centres").select("*").order("state_code").order("name"),
    supabase.from("states").select("code, name").order("name")
  ]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-semibold">GATC centres</h1>
        <div className="card border-warning/40 bg-warning/5 p-6 text-sm text-ink/70">
          The GATC registry table isn’t available yet. Apply migration
          <span className="font-mono"> supabase/migrations/0007_gatc_centres.sql</span> and reload.
        </div>
      </div>
    );
  }

  const rows = (centres ?? []) as any[];
  const stateList = (states ?? []) as { code: string; name: string }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">GATC centres</h1>
          <p className="mt-1 text-ink/70">
            Government Approved Test Centres — registration, accreditation scope and validity. Only in-validity
            centres should be assigned verification work.
          </p>
        </div>
        <GatcEditor states={stateList} isNew startOpen={false} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No centres yet" description="Add the first Government Approved Test Centre to the registry." />
      ) : (
        <div className="space-y-3">
          {rows.map((c) => {
            const valid = c.is_active && (!c.valid_until || new Date(c.valid_until) >= new Date());
            const expiring = c.is_active && dueState(c.valid_until) === "due_soon";
            return (
              <div key={c.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-semibold">{c.name}</span>
                      {c.registration_no && <span className="font-mono text-xs text-ink/50">{c.registration_no}</span>}
                      {!c.is_active ? <Badge variant="danger">Disabled</Badge> : valid ? <Badge variant="success">Accredited</Badge> : <Badge variant="danger">Accreditation expired</Badge>}
                      {expiring && valid && <Badge variant="warning">Expiring soon</Badge>}
                    </div>
                    <div className="mt-1 text-sm text-ink/70">
                      {c.state_code ?? "—"}
                      {c.valid_until ? ` · valid until ${formatDate(c.valid_until)}` : ""}
                      {c.contact_person ? ` · ${c.contact_person}` : ""}
                      {c.contact_phone ? ` · ${c.contact_phone}` : ""}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(c.accreditation_scope ?? []).length === 0 ? (
                        <span className="text-xs text-ink/50">No scope set</span>
                      ) : (
                        (c.accreditation_scope as string[]).map((s) => (
                          <span key={s} className="rounded-full border border-border bg-paper px-2 py-0.5 text-xs text-ink/70">
                            {CAT_LABEL[s] ?? s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <GatcEditor centre={c} states={stateList} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
