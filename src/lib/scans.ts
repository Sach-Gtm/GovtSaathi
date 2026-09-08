import { createSupabaseServiceClient } from "./supabase/server";

/**
 * Records a public verification of a certificate. Fire-and-forget from the
 * verify page so the officer intelligence panel can spot certificates that are
 * scanned unusually often (possible dispute) or not at all (unused machine).
 */
export async function logCertificateScan(certificateNo: string, source = "web"): Promise<void> {
  try {
    // Single insert — business_id is not needed (cert_scan_stats joins on
    // certificate_no), so we skip the extra lookup and keep the page fast.
    const svc = createSupabaseServiceClient();
    await svc.from("certificate_scans").insert({ certificate_no: certificateNo, source });
  } catch {
    // Never let scan logging break the public page.
  }
}
