import { requireRole } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Businesses — MAAPSETU" };

export default async function TraderBusinesses() {
  await requireRole(["trader"]);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
  const rows = data ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Businesses</h1>
      {rows.length === 0 ? (
        <EmptyState
          title="No businesses yet"
          description="You will add your business when you file your first verification application."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((b) => (
            <li key={b.id} className="card p-5">
              <div className="font-display text-lg font-semibold">{b.trade_name ?? b.legal_name}</div>
              <div className="text-sm text-ink/70">{b.legal_name}</div>
              <div className="mt-2 text-sm text-ink/70">
                {[b.address_line1, b.city, b.pincode, b.state_code].filter(Boolean).join(", ")}
              </div>
              {b.gstin && <div className="mt-1 text-xs font-mono text-ink/60">GSTIN {b.gstin}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
