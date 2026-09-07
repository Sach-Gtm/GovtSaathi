import { createSupabaseServiceClient } from "./supabase/server";

/**
 * Records a public verification of a certificate. Fire-and-forget from the
 * verify page so the officer intelligence panel can spot certificates that are
 * scanned unusually often (possible dispute) or not at all (unused machine).
 */
export async function logCertificateScan(certificateNo: string, source = "web"): Promise<void> {
  try {
    const svc = createSupabaseServiceClient();
    const { data: cert } = await svc
      .from("certificates")
      .select("business_id")
      .eq("certificate_no", certificateNo)
      .maybeSingle();
    if (!cert) return;
    await svc.from("certificate_scans").insert({
      certificate_no: certificateNo,
      business_id: cert.business_id,
      source
    });
  } catch {
    // Never let scan logging break the public page.
  }
}
