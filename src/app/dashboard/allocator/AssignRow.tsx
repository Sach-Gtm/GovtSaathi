"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface OfficerRow {
  id: string;
  full_name: string;
  role: "officer" | "gatc";
  organisation: string | null;
  employee_code: string | null;
}

export function AssignRow({ applicationId, officers }: { applicationId: string; officers: OfficerRow[] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [assignee, setAssignee] = useState<string>(officers[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function assign() {
    setPending(true);
    setErr(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("assignments").insert({
        application_id: applicationId,
        assignee_id: assignee,
        assigned_by: user.id,
        scheduled_for: date || null
      });
      if (error) throw error;
      await supabase.from("applications").update({ status: "assigned" }).eq("id", applicationId);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setPending(false);
    }
  }

  if (!officers?.length) return <span className="text-xs text-ink/60">No officers on record.</span>;

  return (
    <div className="flex items-center gap-2">
      <select className="field-select text-xs" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
        {officers.map((o) => (
          <option key={o.id} value={o.id}>
            {o.full_name} · {o.role.toUpperCase()}{o.employee_code ? ` (${o.employee_code})` : ""}
          </option>
        ))}
      </select>
      <input type="date" className="field-input text-xs w-36" value={date} onChange={(e) => setDate(e.target.value)} />
      <button disabled={pending || !assignee} onClick={assign} className="btn-primary text-xs">
        {pending ? "…" : "Assign"}
      </button>
      {err && <span className="text-xs text-danger">{err}</span>}
    </div>
  );
}
