"use client";
import Dexie, { Table } from "dexie";

/**
 * On-device store for the field officer app.
 *
 * The officer downloads their day's assignments; every observation captured in
 * the field is inserted into `pendingVerifications` and then drained by
 * `syncQueue` when connectivity returns.
 *
 * The schema is intentionally flat — Dexie is a queue and cache, not a database.
 */

export interface CachedAssignment {
  id: string;
  application_no: string;
  business_name: string;
  address: string;
  scheduled_for: string | null;
  instruments: Array<{
    id: string;
    category: string;
    make: string | null;
    model: string | null;
    serial_no: string | null;
    capacity: string | null;
  }>;
  synced_at: string;
}

export interface PendingVerification {
  local_id: string;                    // uuid on device
  assignment_id: string;
  instrument_id: string;
  outcome: "pass" | "fail" | "conditional";
  observed_values: Record<string, number | string>;
  tolerance_ok: boolean | null;
  observations: string | null;
  location_lat: number | null;
  location_lng: number | null;
  photo_blobs: Blob[];                 // pending photos, uploaded once online
  performed_at: string;                // ISO
  device_id: string;
  attempts: number;
  last_error: string | null;
  status: "queued" | "syncing" | "synced" | "failed";
}

class OfflineDB extends Dexie {
  assignments!: Table<CachedAssignment, string>;
  pendingVerifications!: Table<PendingVerification, string>;

  constructor() {
    super("govtsathi-field");
    this.version(1).stores({
      assignments: "id, application_no, scheduled_for",
      pendingVerifications: "local_id, assignment_id, instrument_id, status, performed_at"
    });
  }
}

let _db: OfflineDB | null = null;
export function offlineDB(): OfflineDB {
  if (typeof window === "undefined") throw new Error("offlineDB called on the server");
  if (!_db) _db = new OfflineDB();
  return _db;
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  const key = "govtsathi:device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
