import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { signPayload } from "@/lib/signature";
import { writeAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

/**
 * Officer's field device pushes verification records here after a site visit.
 *
 * A successful record with outcome "pass" or "conditional" issues a signed
 * certificate; the QR that ends up on the sticker embeds a signature over a
 * canonical payload so that a scanner can verify authenticity even offline.
 *
 * The request is idempotent on `local_id` — retries from the sync queue
 * return the same server-side record.
 */

const Payload = z.object({
  local_id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  instrument_id: z.string().uuid(),
  outcome: z.enum(["pass", "fail", "conditional"]),
  observed_values: z.record(z.union([z.string(), z.number()])),
  tolerance_ok: z.boolean().nullable(),
  observations: z.string().nullable().optional(),
  location_lat: z.number().nullable().optional(),
  location_lng: z.number().nullable().optional(),
  photo_refs: z.array(z.string()).default([]),
  performed_at: z.string(),
  device_id: z.string()
});

export async function POST(req: Request) {
  const authed = createSupabaseServerClient();
  const {
    data: { user }
  } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const parsed = Payload.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const svc = createSupabaseServiceClient();

  // Confirm the assignment belongs to this officer
  const { data: assignment, error: assignErr } = await svc
    .from("assignments")
    .select("id, application_id, assignee_id")
    .eq("id", body.assignment_id)
    .maybeSingle();
  if (assignErr || !assignment) return NextResponse.json({ error: "assignment_not_found" }, { status: 404 });
  if (assignment.assignee_id !== user.id)
    return NextResponse.json({ error: "not_assignee" }, { status: 403 });

  const { data: profile } = await svc.from("profiles").select("role, state_code").eq("id", user.id).single();
  if (!profile || !["officer", "gatc"].includes(profile.role)) {
    return NextResponse.json({ error: "role_forbidden" }, { status: 403 });
  }

  // Idempotency — has this local_id already been processed?
  const { data: existingEvent } = await svc
    .from("sync_events")
    .select("payload, id")
    .contains("payload", { local_id: body.local_id })
    .eq("event_type", "verification.create")
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ status: "duplicate", event_id: existingEvent.id });
  }

  // Canonical payload — deterministic, signed by the server key.
  const canonical = {
    assignment_id: body.assignment_id,
    instrument_id: body.instrument_id,
    outcome: body.outcome,
    observed_values: body.observed_values,
    performed_at: body.performed_at,
    performed_by: user.id,
    device_id: body.device_id
  };
  const { hash, signatureB64 } = signPayload(canonical);

  // Persist the raw sync event first (append-only ledger)
  await svc.from("sync_events").insert({
    device_id: body.device_id,
    performed_by: user.id,
    event_type: "verification.create",
    payload: body,
    processed: false
  });

  // Insert verification record
  const { data: vr, error: vrErr } = await svc
    .from("verification_records")
    .insert({
      assignment_id: body.assignment_id,
      instrument_id: body.instrument_id,
      outcome: body.outcome,
      observed_values: body.observed_values,
      tolerance_ok: body.tolerance_ok,
      observations: body.observations ?? null,
      location_lat: body.location_lat ?? null,
      location_lng: body.location_lng ?? null,
      photo_refs: body.photo_refs,
      performed_by: user.id,
      performed_at: body.performed_at,
      device_id: body.device_id,
      client_recorded_at: body.performed_at,
      signature: Buffer.from(signatureB64, "base64"),
      signature_algo: "ed25519",
      signature_key_id: "govt-primary-2026",
      payload_hash: hash
    })
    .select("id")
    .single();

  if (vrErr) {
    return NextResponse.json({ error: "insert_failed", details: vrErr.message }, { status: 500 });
  }

  // Bump instrument.last_verified_on
  await svc
    .from("instruments")
    .update({
      last_verified_on: body.performed_at.slice(0, 10),
      // 1-year re-verification cadence by default; individual states may configure differently.
      next_due_on: new Date(new Date(body.performed_at).getTime() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    })
    .eq("id", body.instrument_id);

  let certificateNo: string | null = null;

  if (body.outcome !== "fail") {
    // Business context for the certificate
    const { data: appRow } = await svc
      .from("applications")
      .select("business_id")
      .eq("id", assignment.application_id)
      .single();

    const validUntil = new Date(new Date(body.performed_at).getTime() + 365 * 24 * 3600 * 1000)
      .toISOString().slice(0, 10);

    // Certificate: sign a compact payload for QR use
    const { data: certRow } = await svc
      .from("certificates")
      .insert({
        verification_record_id: vr!.id,
        business_id: appRow!.business_id,
        instrument_id: body.instrument_id,
        issued_by: user.id,
        issued_on: body.performed_at.slice(0, 10),
        valid_until: validUntil,
        qr_payload: "",
        qr_signature: ""
      })
      .select("id, certificate_no")
      .single();

    if (certRow) {
      certificateNo = certRow.certificate_no;
      const qrCanonical = {
        v: 1,
        cert: certRow.certificate_no,
        instrument: body.instrument_id,
        issued: body.performed_at.slice(0, 10),
        valid: validUntil,
        outcome: body.outcome
      };
      const { signatureB64: qrSig } = signPayload(qrCanonical);
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${encodeURIComponent(certRow.certificate_no)}`;
      const qrPayload = JSON.stringify({ ...qrCanonical, sig: qrSig, url });
      await svc
        .from("certificates")
        .update({ qr_payload: qrPayload, qr_signature: qrSig })
        .eq("id", certRow.id);
    }
  }

  // Application status: if every included instrument now has a completed record, mark verified
  const { data: appInstrs } = await svc
    .from("application_instruments")
    .select("instrument_id, application:applications(id)")
    .eq("application_id", assignment.application_id);
  const { data: doneRecords } = await svc
    .from("verification_records")
    .select("instrument_id")
    .eq("assignment_id", body.assignment_id);
  const doneSet = new Set((doneRecords ?? []).map((r) => r.instrument_id));
  const allDone = (appInstrs ?? []).every((r) => doneSet.has(r.instrument_id));
  if (allDone) {
    await svc.from("applications").update({ status: "verified" }).eq("id", assignment.application_id);
    await svc.from("assignments").update({ completed_at: new Date().toISOString() }).eq("id", body.assignment_id);
    // Notify the trader that verification is complete
    const { data: appOwner } = await svc
      .from("applications")
      .select("submitted_by, application_no")
      .eq("id", assignment.application_id)
      .single();
    if (appOwner?.submitted_by) {
      await notify({
        user_id: appOwner.submitted_by,
        kind: "verification",
        title: "Verification complete",
        body: `Application ${appOwner.application_no} has been verified${certificateNo ? ` — certificate ${certificateNo} issued` : ""}.`,
        entity_type: "application",
        entity_id: assignment.application_id,
        link: `/dashboard/trader/applications/${assignment.application_id}`
      });
    }
  }

  await svc.from("sync_events").update({ processed: true, processed_at: new Date().toISOString() })
    .contains("payload", { local_id: body.local_id })
    .eq("event_type", "verification.create");

  await writeAudit({
    actor_id: user.id,
    actor_role: profile.role as any,
    action: "verification.record",
    entity_type: "verification_record",
    entity_id: vr!.id,
    meta: { certificate_no: certificateNo, outcome: body.outcome, instrument_id: body.instrument_id }
  });

  return NextResponse.json({
    status: "ok",
    verification_record_id: vr!.id,
    certificate_no: certificateNo
  });
}
