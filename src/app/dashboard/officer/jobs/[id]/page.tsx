import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkflowTimeline } from "@/components/dashboard/WorkflowTimeline";
import { JobWorkspace } from "./JobWorkspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Job — MAAPSETU" };

export default async function JobPage({ params }: { params: { id: string } }) {
  const profile = await requireRole(["officer", "gatc"]);
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("assignments")
    .select(`
      id, scheduled_for, created_at, accepted_at, completed_at, notes, check_in_at, check_out_at,
      application:applications(
        id, application_no, status, submitted_at, notes,
        business:businesses(id, legal_name, trade_name, address_line1, city, state_code, contact_phone),
        application_instruments:application_instruments(instrument:instruments(id, category, make, model, serial_no, capacity, accuracy_class))
      )
    `)
    .eq("id", params.id)
    .eq("assignee_id", profile.id)
    .maybeSingle();

  if (!data) notFound();
  const app: any = (data as any).application;

  const instrumentIds = (app.application_instruments ?? []).map((r: any) => r.instrument.id);
  let certificate: { id: string; certificate_no: string } | null = null;
  if (instrumentIds.length) {
    const { data: certs } = await supabase
      .from("certificates")
      .select("id, certificate_no")
      .in("instrument_id", instrumentIds)
      .order("issued_on", { ascending: false })
      .limit(1);
    certificate = (certs as any[])?.[0] ?? null;
  }

  return (
    <div className="space-y-6">
      <WorkflowTimeline
        status={app.status}
        submittedAt={app.submitted_at}
        assignment={{
          scheduled_for: (data as any).scheduled_for,
          created_at: (data as any).created_at,
          accepted_at: (data as any).accepted_at,
          check_in_at: (data as any).check_in_at,
          completed_at: (data as any).completed_at,
          assignee: { full_name: profile.full_name, role: profile.role }
        }}
        certificate={certificate}
      />
      <JobWorkspace assignment={data as any} officerId={profile.id} />
    </div>
  );
}
