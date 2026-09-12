"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";

const CATEGORIES = [
  ["weighing_scale", "Weighing scale"],
  ["beam_scale", "Beam scale"],
  ["platform_scale", "Platform scale"],
  ["crane_scale", "Crane scale"],
  ["weighbridge", "Weighbridge"],
  ["fuel_dispenser", "Fuel dispenser"],
  ["flow_meter", "Flow meter"],
  ["length_measure", "Length measure"],
  ["volume_measure", "Volume measure"],
  ["capacity_measure", "Capacity measure"],
  ["other", "Other"]
] as const;

export interface Centre {
  id?: string;
  name: string;
  registration_no: string | null;
  accreditation_scope: string[] | null;
  valid_from: string | null;
  valid_until: string | null;
  state_code: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  is_active: boolean;
}

export function GatcEditor({
  centre,
  states,
  startOpen = false,
  isNew = false
}: {
  centre?: Centre;
  states: { code: string; name: string }[];
  startOpen?: boolean;
  isNew?: boolean;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [open, setOpen] = useState(startOpen);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [f, setF] = useState<Centre>(
    centre ?? {
      name: "",
      registration_no: "",
      accreditation_scope: [],
      valid_from: "",
      valid_until: "",
      state_code: states[0]?.code ?? "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      address: "",
      is_active: true
    }
  );

  function toggleScope(cat: string) {
    setF((p) => {
      const has = (p.accreditation_scope ?? []).includes(cat);
      return { ...p, accreditation_scope: has ? (p.accreditation_scope ?? []).filter((c) => c !== cat) : [...(p.accreditation_scope ?? []), cat] };
    });
  }

  async function save() {
    if (!f.name.trim()) {
      setErr("Name is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    const payload = {
      name: f.name,
      registration_no: f.registration_no || null,
      accreditation_scope: f.accreditation_scope ?? [],
      valid_from: f.valid_from || null,
      valid_until: f.valid_until || null,
      state_code: f.state_code || null,
      contact_person: f.contact_person || null,
      contact_phone: f.contact_phone || null,
      contact_email: f.contact_email || null,
      address: f.address || null,
      is_active: f.is_active
    };
    const { error } = isNew
      ? await supabase.from("gatc_centres").insert(payload)
      : await supabase.from("gatc_centres").update(payload).eq("id", centre!.id!);
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (isNew) setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={isNew ? "btn-primary" : "text-brand text-sm font-medium"}>
        {isNew ? "+ Add GATC centre" : "Manage"}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Centre name" className="sm:col-span-2">
          <input className="field-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Registration no.">
          <input className="field-input font-mono" value={f.registration_no ?? ""} onChange={(e) => setF({ ...f, registration_no: e.target.value })} placeholder="GATC-MH-001" />
        </Field>
        <Field label="State">
          <select className="field-select" value={f.state_code ?? ""} onChange={(e) => setF({ ...f, state_code: e.target.value })}>
            <option value="">—</option>
            {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Accredited from">
          <input type="date" className="field-input" value={f.valid_from ?? ""} onChange={(e) => setF({ ...f, valid_from: e.target.value })} />
        </Field>
        <Field label="Accredited until">
          <input type="date" className="field-input" value={f.valid_until ?? ""} onChange={(e) => setF({ ...f, valid_until: e.target.value })} />
        </Field>
        <Field label="Contact person">
          <input className="field-input" value={f.contact_person ?? ""} onChange={(e) => setF({ ...f, contact_person: e.target.value })} />
        </Field>
        <Field label="Contact phone">
          <input className="field-input" value={f.contact_phone ?? ""} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <input className="field-input" value={f.address ?? ""} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </Field>
        <Field label="Account status">
          <select className="field-select" value={f.is_active ? "active" : "disabled"} onChange={(e) => setF({ ...f, is_active: e.target.value === "active" })}>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </Field>
      </div>

      <div className="mt-3">
        <div className="field-label">Accreditation scope (instrument categories)</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(([v, l]) => {
            const on = (f.accreditation_scope ?? []).includes(v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggleScope(v)}
                className={`rounded-full border px-3 py-1 text-xs ${on ? "border-accent bg-accent text-white" : "border-border bg-canvas text-ink/70"}`}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {err && <div className="mt-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">{err}</div>}
      <div className="mt-3 flex gap-2">
        <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save centre"}</button>
        <button onClick={() => setOpen(false)} className="btn-outline text-sm">Cancel</button>
      </div>
    </div>
  );
}
