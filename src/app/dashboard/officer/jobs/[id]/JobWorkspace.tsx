"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getDeviceId, offlineDB } from "@/lib/offline/db";
import { drainSyncQueue } from "@/lib/offline/sync";
import { Field } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { OfflineIndicator } from "../../OfflineIndicator";

interface Instrument {
  id: string;
  category: string;
  make: string | null;
  model: string | null;
  serial_no: string | null;
  capacity: string | null;
  accuracy_class: string | null;
}
interface Assignment {
  id: string;
  scheduled_for: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  notes: string | null;
  application: {
    id: string;
    application_no: string;
    notes: string | null;
    business: {
      id: string;
      legal_name: string;
      trade_name: string | null;
      address_line1: string;
      city: string | null;
      state_code: string | null;
      contact_phone: string | null;
    };
    application_instruments: Array<{ instrument: Instrument }>;
  };
}

interface Row {
  local_id: string;
  instrument_id: string;
  outcome: "pass" | "fail" | "conditional";
  observed_values: { reference: string; observed: string; tolerance: string; error: string };
  tolerance_ok: boolean | null;
  observations: string;
  photos: File[];
  status: "pending" | "queued" | "synced";
}

function blank(instrument_id: string): Row {
  return {
    local_id: crypto.randomUUID(),
    instrument_id,
    outcome: "pass",
    observed_values: { reference: "", observed: "", tolerance: "", error: "" },
    tolerance_ok: null,
    observations: "",
    photos: [],
    status: "pending"
  };
}

export function JobWorkspace({ assignment, officerId }: { assignment: Assignment; officerId: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const instruments = assignment.application.application_instruments.map((r) => r.instrument);
  const [rows, setRows] = useState<Row[]>(instruments.map((i) => blank(i.id)));
  const [accepted, setAccepted] = useState<boolean>(!!assignment.accepted_at);
  const [saveState, setSaveState] = useState<string | null>(null);
  const [checkInAt, setCheckInAt] = useState<string | null>(assignment.check_in_at);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<string | null>(null);

  async function checkIn() {
    setGeoState("Getting your location…");
    const finish = async (lat: number | null, lng: number | null) => {
      const now = new Date().toISOString();
      await supabase
        .from("assignments")
        .update({ check_in_at: now, check_in_lat: lat, check_in_lng: lng })
        .eq("id", assignment.id);
      // Tag the shop's location too, if we have a fix and it has none yet
      if (lat != null && lng != null) {
        setGeo({ lat, lng });
        await supabase
          .from("businesses")
          .update({ lat, lng })
          .eq("id", (assignment.application.business as any).id ?? "")
          .is("lat", null);
      }
      setCheckInAt(now);
      setGeoState(lat != null ? "Checked in with location" : "Checked in (no location)");
      router.refresh();
    };

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      await finish(null, null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => void finish(pos.coords.latitude, pos.coords.longitude),
      () => void finish(null, null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }

  useEffect(() => {
    // Cache assignment into IndexedDB so it survives offline
    if (typeof window === "undefined") return;
    void offlineDB().assignments.put({
      id: assignment.id,
      application_no: assignment.application.application_no,
      business_name:
        assignment.application.business.trade_name ?? assignment.application.business.legal_name,
      address: [
        assignment.application.business.address_line1,
        assignment.application.business.city,
        assignment.application.business.state_code
      ]
        .filter(Boolean)
        .join(", "),
      scheduled_for: assignment.scheduled_for,
      instruments,
      synced_at: new Date().toISOString()
    });
  }, [assignment.id]);

  async function acceptJob() {
    await supabase.from("assignments").update({ accepted_at: new Date().toISOString() }).eq("id", assignment.id);
    setAccepted(true);
    router.refresh();
  }

  function setRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function setObs(idx: number, k: keyof Row["observed_values"], v: string) {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, observed_values: { ...r.observed_values, [k]: v } } : r))
    );
  }

  async function queueRow(idx: number) {
    const r = rows[idx];
    if (!r.observed_values.observed) {
      setSaveState("Enter the observed reading first");
      return;
    }
    const db = offlineDB();
    await db.pendingVerifications.put({
      local_id: r.local_id,
      assignment_id: assignment.id,
      instrument_id: r.instrument_id,
      outcome: r.outcome,
      observed_values: r.observed_values as any,
      tolerance_ok: r.tolerance_ok,
      observations: r.observations || null,
      location_lat: null,
      location_lng: null,
      photo_blobs: r.photos,
      performed_at: new Date().toISOString(),
      device_id: getDeviceId(),
      attempts: 0,
      last_error: null,
      status: "queued"
    });
    setRow(idx, { status: "queued" });
    setSaveState("Saved to device");
    // Try to sync opportunistically
    void drainSyncQueue();
  }

  async function completeJob() {
    // Ensure everything is at least queued
    for (let i = 0; i < rows.length; i++) if (rows[i].status === "pending") await queueRow(i);
    await drainSyncQueue();
    const now = new Date().toISOString();
    await supabase
      .from("assignments")
      .update({ completed_at: now, check_out_at: now })
      .eq("id", assignment.id);
    router.push("/dashboard/officer");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/50">Job</div>
          <h1 className="text-2xl font-display font-semibold">
            {assignment.application.business.trade_name ?? assignment.application.business.legal_name}
          </h1>
          <div className="text-sm text-ink/70 mt-1 font-mono">{assignment.application.application_no}</div>
          <div className="text-sm text-ink/70">
            {[assignment.application.business.address_line1, assignment.application.business.city].filter(Boolean).join(", ")}
          </div>
        </div>
        <OfflineIndicator />
      </div>

      {!accepted && (
        <div className="card p-4 flex items-center justify-between">
          <div className="text-sm">Accept this job before starting the site visit.</div>
          <button onClick={acceptJob} className="btn-primary">Accept</button>
        </div>
      )}

      {/* Geo check-in */}
      {accepted && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${checkInAt ? "bg-success" : "bg-ink/30"}`} />
                <span className="font-medium">
                  {checkInAt ? "Checked in at this shop" : "Not checked in yet"}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-ink/60">
                {checkInAt
                  ? `Arrived ${new Date(checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}${
                      geo ? ` · ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : ""
                    }`
                  : "Check in when you reach the shop. We tag the time and your location so your visit is on record."}
              </div>
              {geoState && <div className="mt-0.5 text-xs text-brand">{geoState}</div>}
            </div>
            {!checkInAt && (
              <button onClick={checkIn} className="btn-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
                  <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11Z" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Check in here
              </button>
            )}
          </div>
        </div>
      )}

      <ol className="space-y-4">
        {instruments.map((i, idx) => {
          const r = rows[idx];
          return (
            <li key={i.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-semibold">
                    {i.category.replace(/_/g, " ")} {i.capacity ? `· ${i.capacity}` : ""}
                  </div>
                  <div className="text-sm text-ink/70">
                    {[i.make, i.model, i.serial_no].filter(Boolean).join(" · ") || "no manufacturer info"}
                    {i.accuracy_class ? ` · class ${i.accuracy_class}` : ""}
                  </div>
                </div>
                {r.status === "queued" && <Badge variant="warning">Saved to device</Badge>}
                {r.status === "synced" && <Badge variant="success">Synced</Badge>}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Field label="Reference load">
                  <input className="field-input" value={r.observed_values.reference}
                    onChange={(e) => setObs(idx, "reference", e.target.value)} placeholder="e.g. 50 kg" />
                </Field>
                <Field label="Observed reading">
                  <input className="field-input" value={r.observed_values.observed}
                    onChange={(e) => setObs(idx, "observed", e.target.value)} placeholder="e.g. 50.02 kg" />
                </Field>
                <Field label="Tolerance">
                  <input className="field-input" value={r.observed_values.tolerance}
                    onChange={(e) => setObs(idx, "tolerance", e.target.value)} placeholder="e.g. ±25 g" />
                </Field>
                <Field label="Error">
                  <input className="field-input" value={r.observed_values.error}
                    onChange={(e) => setObs(idx, "error", e.target.value)} placeholder="e.g. +20 g" />
                </Field>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Outcome">
                  <select className="field-select" value={r.outcome}
                    onChange={(e) => setRow(idx, { outcome: e.target.value as any })}>
                    <option value="pass">Pass</option>
                    <option value="conditional">Conditional</option>
                    <option value="fail">Fail</option>
                  </select>
                </Field>
                <Field label="Within tolerance">
                  <select className="field-select" value={r.tolerance_ok === null ? "" : r.tolerance_ok ? "yes" : "no"}
                    onChange={(e) => setRow(idx, { tolerance_ok: e.target.value === "" ? null : e.target.value === "yes" })}>
                    <option value="">—</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Field>
              </div>

              <Field label="Observations" className="mt-3">
                <textarea className="field-textarea" value={r.observations}
                  onChange={(e) => setRow(idx, { observations: e.target.value })}
                  placeholder="Anything the record should reflect — condition, sealing, prior tampering…" />
              </Field>

              <Field label="Photos" className="mt-3">
                <input type="file" multiple accept="image/*" capture="environment"
                  onChange={(e) => setRow(idx, { photos: Array.from(e.target.files ?? []) })} />
                {r.photos.length > 0 && (
                  <div className="mt-2 text-xs text-ink/60">{r.photos.length} photo{r.photos.length !== 1 && "s"} attached</div>
                )}
              </Field>

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => queueRow(idx)} className="btn-primary">
                  Save this instrument
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {saveState && <div className="text-sm text-ink/60">{saveState}</div>}

      <div className="flex gap-3">
        <button onClick={completeJob} className="btn-accent">Finish job & sync</button>
      </div>
    </div>
  );
}
