"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";

const ROLES = [
  ["citizen", "Citizen"],
  ["trader", "Shop owner"],
  ["officer", "Officer"],
  ["gatc", "GATC verifier"],
  ["allocator", "Allocator"],
  ["admin", "Administrator"]
] as const;

const ROLE_VARIANT: Record<string, "default" | "brand" | "success" | "warning" | "danger"> = {
  citizen: "default",
  trader: "brand",
  officer: "success",
  gatc: "success",
  allocator: "warning",
  admin: "danger"
};

interface UserRow {
  id: string;
  full_name: string;
  role: string;
  email: string | null;
  state_code: string | null;
  employee_code: string | null;
  is_active: boolean;
}

export function RoleManager({ user, states, selfId }: { user: UserRow; states: { code: string; name: string }[]; selfId: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(user.role);
  const [stateCode, setStateCode] = useState(user.state_code ?? "");
  const [empCode, setEmpCode] = useState(user.employee_code ?? "");
  const [active, setActive] = useState(user.is_active);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isSelf = user.id === selfId;
  const needsEmp = role === "officer" || role === "gatc";

  async function save() {
    setSaving(true);
    setErr(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        state_code: stateCode || null,
        employee_code: empCode || null,
        is_active: active,
        requested_role: null,
        requested_at: null
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="text-brand text-sm font-medium">
        {open ? "Close" : "Manage"}
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-border bg-paper p-4">
          {isSelf && (
            <div className="mb-3 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
              This is your own account. Take care not to lock yourself out of admin.
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role">
              <select className="field-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="State">
              <select className="field-select" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                <option value="">—</option>
                {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </Field>
            {needsEmp && (
              <Field label="Employee / GATC code" className="sm:col-span-2">
                <input className="field-input font-mono" value={empCode} onChange={(e) => setEmpCode(e.target.value)} placeholder="LM-MH-0442" />
              </Field>
            )}
            <Field label="Account status" className="sm:col-span-2">
              <select className="field-select" value={active ? "active" : "disabled"} onChange={(e) => setActive(e.target.value === "active")}>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </Field>
          </div>
          {err && <div className="mt-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">{err}</div>}
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save changes"}</button>
            <button onClick={() => setOpen(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function roleBadgeVariant(role: string) {
  return ROLE_VARIANT[role] ?? "default";
}

/** Approve / decline a pending access request. */
export function RequestActions({ user }: { user: { id: string; requested_role: string } }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [busy, setBusy] = useState(false);

  async function approve() {
    setBusy(true);
    await supabase.from("profiles").update({ role: user.requested_role, requested_role: null, requested_at: null }).eq("id", user.id);
    setBusy(false);
    router.refresh();
  }
  async function decline() {
    setBusy(true);
    await supabase.from("profiles").update({ requested_role: null, requested_at: null }).eq("id", user.id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={approve} disabled={busy} className="btn-primary text-xs">Approve</button>
      <button onClick={decline} disabled={busy} className="btn-outline text-xs">Decline</button>
    </div>
  );
}
