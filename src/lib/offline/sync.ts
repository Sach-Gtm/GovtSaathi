"use client";
import { offlineDB, PendingVerification } from "./db";

/**
 * Drain the pending queue into the server. Runs on manual trigger, on
 * `navigator.onLine` transition, and on a poll while the app is open.
 *
 * Conflict rules:
 *  - Verification records are append-only server-side. A duplicate `local_id`
 *    from a retry is idempotent and returns the same server record.
 *  - Photo uploads are separate and their storage keys are attached to the
 *    verification payload before it is sent.
 */
export async function drainSyncQueue(): Promise<{ pushed: number; failed: number }> {
  if (typeof window === "undefined") return { pushed: 0, failed: 0 };
  if (!navigator.onLine) return { pushed: 0, failed: 0 };

  const db = offlineDB();
  const queued = await db.pendingVerifications.where("status").anyOf("queued", "failed").toArray();

  let pushed = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      await db.pendingVerifications.update(item.local_id, { status: "syncing" });
      const photoKeys = await uploadPhotos(item);
      const payload = toServerPayload(item, photoKeys);

      const res = await fetch("/api/sync/verifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Server ${res.status}`);

      await db.pendingVerifications.update(item.local_id, {
        status: "synced",
        last_error: null
      });
      pushed++;
    } catch (e) {
      failed++;
      await db.pendingVerifications.update(item.local_id, {
        status: "failed",
        attempts: (item.attempts ?? 0) + 1,
        last_error: e instanceof Error ? e.message : String(e)
      });
    }
  }

  return { pushed, failed };
}

async function uploadPhotos(item: PendingVerification): Promise<string[]> {
  if (!item.photo_blobs?.length) return [];
  const keys: string[] = [];
  for (let i = 0; i < item.photo_blobs.length; i++) {
    const form = new FormData();
    form.append("file", item.photo_blobs[i], `${item.local_id}-${i}.jpg`);
    form.append("assignment_id", item.assignment_id);
    form.append("instrument_id", item.instrument_id);
    const res = await fetch("/api/sync/photos", { method: "POST", body: form });
    if (!res.ok) throw new Error(`Photo upload failed: ${res.status}`);
    const { key } = await res.json();
    keys.push(key);
  }
  return keys;
}

function toServerPayload(item: PendingVerification, photo_refs: string[]) {
  return {
    local_id: item.local_id,
    assignment_id: item.assignment_id,
    instrument_id: item.instrument_id,
    outcome: item.outcome,
    observed_values: item.observed_values,
    tolerance_ok: item.tolerance_ok,
    observations: item.observations,
    location_lat: item.location_lat,
    location_lng: item.location_lng,
    photo_refs,
    performed_at: item.performed_at,
    device_id: item.device_id
  };
}

export function registerSyncListeners() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => {
    void drainSyncQueue();
  });
}
