"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Files a re-verification application for an EXISTING instrument (reuses the
 * instrument row rather than creating a duplicate). Schema-free: it inserts an
 * application + application_instruments link, exactly like a first verification.
 */
export function ReverifyButton({
  instrumentId,
  businessId,
  stateCode,
  label = "Apply for re-verification",
  className = "btn-outline"
}: {
  instrumentId: string;
  businessId: string;
  stateCode: string | null;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    if (!stateCode) {
      setErr("Add a state to this business first.");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: app, error } = await supabase
        .from("applications")
        .insert({
          business_id: businessId,
          submitted_by: user.id,
          state_code: stateCode,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          notes: "Re-verification request"
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: linkErr } = await supabase
        .from("application_instruments")
        .insert({ application_id: app!.id, instrument_id: instrumentId });
      if (linkErr) throw linkErr;
      router.push(`/dashboard/trader/applications/${app!.id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setPending(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={go} disabled={pending} className={className}>
        {pending ? "Filing…" : label}
      </button>
      {err && <span className="text-xs text-danger">{err}</span>}
    </span>
  );
}
