import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { JobWorkspace } from "./JobWorkspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Job — GovtSathi" };

export default async function JobPage({ params }: { params: { id: string } }) {
  const profile = await requireRole(["officer", "gatc"]);
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("assignments")
    .select(`
      id, scheduled_for, accepted_at, completed_at, notes,
      application:applications(
        id, application_no, notes,
        business:businesses(legal_name, trade_name, address_line1, city, state_code, contact_phone),
        application_instruments:application_instruments(instrument:instruments(id, category, make, model, serial_no, capacity, accuracy_class))
      )
    `)
    .eq("id", params.id)
    .eq("assignee_id", profile.id)
    .maybeSingle();

  if (!data) notFound();
  return <JobWorkspace assignment={data as any} officerId={profile.id} />;
}
