import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewApplicationForm } from "./NewApplicationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New application — MAAPSETU" };

export default async function NewApplicationPage() {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();

  const [{ data: businesses }, { data: states }] = await Promise.all([
    supabase.from("businesses").select("id, legal_name, trade_name, state_code, district_id").order("legal_name"),
    supabase.from("states").select("code, name").order("name")
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">File a new application</h1>
        <p className="mt-1 text-ink/70">
          Add your business and list every instrument in scope. The system will route it to a verifier
          — Legal Metrology Officer or GATC — by district and instrument class.
        </p>
      </div>
      <NewApplicationForm
        businesses={(businesses ?? []) as any}
        states={(states ?? []) as any}
      />
    </div>
  );
}
