"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";

interface Business {
  id: string;
  legal_name: string;
  trade_name: string | null;
  state_code: string | null;
  district_id: string | null;
}
interface StateRef { code: string; name: string }

interface InstrumentDraft {
  category: string;
  make: string;
  model: string;
  serial_no: string;
  capacity: string;
  accuracy_class: string;
  location_description: string;
}

const CATEGORIES = [
  ["weighing_scale", "Weighing scale (retail counter)"],
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

function blankInstrument(): InstrumentDraft {
  return { category: "weighing_scale", make: "", model: "", serial_no: "", capacity: "", accuracy_class: "", location_description: "" };
}

export function NewApplicationForm({ businesses, states }: { businesses: Business[]; states: StateRef[] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [newBusinessMode, setNewBusinessMode] = useState(businesses.length === 0);
  const [businessDraft, setBusinessDraft] = useState({
    legal_name: "",
    trade_name: "",
    gstin: "",
    address_line1: "",
    city: "",
    state_code: states[0]?.code ?? "MH",
    pincode: "",
    contact_phone: ""
  });

  const [instruments, setInstruments] = useState<InstrumentDraft[]>([blankInstrument()]);
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setInstrument(i: number, patch: Partial<InstrumentDraft>) {
    setInstruments((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      // 1. Ensure a business exists
      let bId = businessId;
      let stateCode = businesses.find((b) => b.id === bId)?.state_code ?? businessDraft.state_code;
      if (newBusinessMode || !bId) {
        const { data, error } = await supabase.from("businesses").insert({
          owner_id: user.id,
          legal_name: businessDraft.legal_name,
          trade_name: businessDraft.trade_name || null,
          gstin: businessDraft.gstin || null,
          address_line1: businessDraft.address_line1,
          city: businessDraft.city || null,
          state_code: businessDraft.state_code,
          pincode: businessDraft.pincode || null,
          contact_phone: businessDraft.contact_phone || null
        }).select("id, state_code").single();
        if (error) throw error;
        bId = data!.id;
        stateCode = data!.state_code!;
      }

      // 2. Insert instruments
      const instrumentRows = instruments
        .filter((r) => r.serial_no.trim() || r.make.trim() || r.model.trim())
        .map((r) => ({
          business_id: bId,
          category: r.category,
          make: r.make || null,
          model: r.model || null,
          serial_no: r.serial_no || null,
          capacity: r.capacity || null,
          accuracy_class: r.accuracy_class || null,
          location_description: r.location_description || null
        }));

      if (!instrumentRows.length) throw new Error("Add at least one instrument");

      const { data: insertedInstruments, error: instrErr } = await supabase
        .from("instruments").insert(instrumentRows).select("id");
      if (instrErr) throw instrErr;

      // 3. Create application (draft) then submit
      const { data: app, error: appErr } = await supabase
        .from("applications")
        .insert({
          business_id: bId,
          submitted_by: user.id,
          state_code: stateCode,
          preferred_date: preferredDate || null,
          notes: notes || null,
          status: "submitted",
          submitted_at: new Date().toISOString()
        })
        .select("id, application_no")
        .single();
      if (appErr) throw appErr;

      // 4. Link instruments
      const links = insertedInstruments!.map((i) => ({ application_id: app!.id, instrument_id: i.id }));
      const { error: linkErr } = await supabase.from("application_instruments").insert(links);
      if (linkErr) throw linkErr;

      router.push(`/dashboard/trader/applications/${app!.id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-semibold">Business</div>
            <p className="text-sm text-ink/60">Choose an existing business or add a new one for this application.</p>
          </div>
          <button
            type="button"
            onClick={() => setNewBusinessMode((v) => !v)}
            className="btn-outline"
          >
            {newBusinessMode ? "Use an existing business" : "Add a new business"}
          </button>
        </div>

        {!newBusinessMode ? (
          <Field label="Existing business">
            <select className="field-select" value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.trade_name ?? b.legal_name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Legal name" className="sm:col-span-2">
              <input required className="field-input" value={businessDraft.legal_name}
                onChange={(e) => setBusinessDraft({ ...businessDraft, legal_name: e.target.value })} />
            </Field>
            <Field label="Trade name (shop signboard)">
              <input className="field-input" value={businessDraft.trade_name}
                onChange={(e) => setBusinessDraft({ ...businessDraft, trade_name: e.target.value })} />
            </Field>
            <Field label="GSTIN">
              <input className="field-input font-mono" value={businessDraft.gstin}
                onChange={(e) => setBusinessDraft({ ...businessDraft, gstin: e.target.value })} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <input required className="field-input" value={businessDraft.address_line1}
                onChange={(e) => setBusinessDraft({ ...businessDraft, address_line1: e.target.value })} />
            </Field>
            <Field label="City">
              <input className="field-input" value={businessDraft.city}
                onChange={(e) => setBusinessDraft({ ...businessDraft, city: e.target.value })} />
            </Field>
            <Field label="State">
              <select className="field-select" value={businessDraft.state_code}
                onChange={(e) => setBusinessDraft({ ...businessDraft, state_code: e.target.value })}>
                {states.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="PIN code">
              <input className="field-input" value={businessDraft.pincode}
                onChange={(e) => setBusinessDraft({ ...businessDraft, pincode: e.target.value })} />
            </Field>
            <Field label="Contact phone">
              <input className="field-input" value={businessDraft.contact_phone}
                onChange={(e) => setBusinessDraft({ ...businessDraft, contact_phone: e.target.value })} />
            </Field>
          </div>
        )}
      </section>

      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-semibold">Instruments</div>
            <p className="text-sm text-ink/60">List every scale, dispenser or measure to be verified in this visit.</p>
          </div>
          <button type="button" onClick={() => setInstruments((p) => [...p, blankInstrument()])} className="btn-outline">
            Add instrument
          </button>
        </div>

        <div className="space-y-4">
          {instruments.map((row, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Instrument #{i + 1}</div>
                {instruments.length > 1 && (
                  <button type="button" onClick={() => setInstruments((p) => p.filter((_, idx) => idx !== i))} className="text-xs text-danger">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Category">
                  <select className="field-select" value={row.category} onChange={(e) => setInstrument(i, { category: e.target.value })}>
                    {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Make">
                  <input className="field-input" value={row.make} onChange={(e) => setInstrument(i, { make: e.target.value })} />
                </Field>
                <Field label="Model">
                  <input className="field-input" value={row.model} onChange={(e) => setInstrument(i, { model: e.target.value })} />
                </Field>
                <Field label="Serial no.">
                  <input className="field-input font-mono" value={row.serial_no} onChange={(e) => setInstrument(i, { serial_no: e.target.value })} />
                </Field>
                <Field label="Capacity" hint="e.g. 500 kg, 2000 L/min">
                  <input className="field-input" value={row.capacity} onChange={(e) => setInstrument(i, { capacity: e.target.value })} />
                </Field>
                <Field label="Accuracy class" hint="e.g. III, M1">
                  <input className="field-input" value={row.accuracy_class} onChange={(e) => setInstrument(i, { accuracy_class: e.target.value })} />
                </Field>
                <Field label="Location on premises" className="sm:col-span-3">
                  <input className="field-input" placeholder="e.g. Counter 2, near billing" value={row.location_description} onChange={(e) => setInstrument(i, { location_description: e.target.value })} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <div className="font-display text-lg font-semibold">Visit details</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred date" hint="We will try to schedule around this.">
            <input type="date" className="field-input" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes for the officer">
          <textarea className="field-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the verifier should know — parking, timings, contact person…" />
        </Field>
      </section>

      {err && (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{err}</div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Submitting…" : "Submit application"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
