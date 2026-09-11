import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/rbac";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Revoke a certificate (enforcement). Officer / GATC / admin only. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await getSessionProfile();
  if (!profile || !["officer", "gatc", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let reason = "";
  let complaintNo: string | undefined;
  try {
    const body = await req.json();
    reason = (body?.reason ?? "").toString().slice(0, 500);
    complaintNo = body?.complaint_no;
  } catch {
    /* no body */
  }

  const svc = createSupabaseServiceClient();
  const { data: cert, error } = await svc
    .from("certificates")
    .update({ revoked: true, revoked_reason: reason || "Revoked by authority", revoked_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("id, certificate_no")
    .maybeSingle();

  if (error || !cert) return NextResponse.json({ error: error?.message ?? "not_found" }, { status: 404 });

  await writeAudit({
    actor_id: profile.id,
    actor_role: profile.role,
    action: "certificate.revoke",
    entity_type: "certificate",
    entity_id: params.id,
    meta: { certificate_no: cert.certificate_no, reason, complaint_no: complaintNo ?? null }
  });

  return NextResponse.json({ ok: true, certificate_no: cert.certificate_no });
}
