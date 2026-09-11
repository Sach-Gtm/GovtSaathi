import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/**
 * Role-gated CSV export of records and reports (PS req 12). Rows are read with
 * the caller's session so Row Level Security scopes exactly what they may see.
 */
export async function GET(_req: Request, { params }: { params: { dataset: string } }) {
  const profile = await getSessionProfile();
  if (!profile || !["officer", "gatc", "allocator", "admin"].includes(profile.role)) {
    return new NextResponse("forbidden", { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const ds = params.dataset;
  let rows: Record<string, any>[] = [];
  let cols: string[] | undefined;

  if (ds === "applications") {
    const { data } = await supabase
      .from("applications")
      .select("application_no, status, state_code, preferred_date, submitted_at, created_at, business:businesses(legal_name, city)")
      .order("created_at", { ascending: false })
      .limit(5000);
    rows = (data ?? []).map((a: any) => ({
      application_no: a.application_no,
      status: a.status,
      state: a.state_code,
      business: a.business?.legal_name ?? "",
      city: a.business?.city ?? "",
      preferred_date: a.preferred_date ?? "",
      submitted_at: a.submitted_at ?? "",
      created_at: a.created_at
    }));
    cols = ["application_no", "status", "state", "business", "city", "preferred_date", "submitted_at", "created_at"];
  } else if (ds === "certificates") {
    const { data } = await supabase
      .from("certificates")
      .select("certificate_no, issued_on, valid_until, revoked, business:businesses(legal_name, state_code), instrument:instruments(category, serial_no)")
      .order("issued_on", { ascending: false })
      .limit(5000);
    rows = (data ?? []).map((c: any) => ({
      certificate_no: c.certificate_no,
      issued_on: c.issued_on,
      valid_until: c.valid_until,
      status: c.revoked ? "revoked" : new Date(c.valid_until) < new Date() ? "expired" : "valid",
      business: c.business?.legal_name ?? "",
      state: c.business?.state_code ?? "",
      instrument: c.instrument?.category ?? "",
      serial_no: c.instrument?.serial_no ?? ""
    }));
    cols = ["certificate_no", "issued_on", "valid_until", "status", "business", "state", "instrument", "serial_no"];
  } else if (ds === "complaints") {
    const { data } = await supabase
      .from("complaints")
      .select("complaint_no, status, category, shop_name, city, state_code, certificate_no, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    rows = (data ?? []) as any[];
    cols = ["complaint_no", "status", "category", "shop_name", "city", "state_code", "certificate_no", "created_at"];
  } else if (ds === "audit") {
    const { data } = await supabase
      .from("audit_logs")
      .select("created_at, action, entity_type, entity_id, actor_role, meta")
      .order("created_at", { ascending: false })
      .limit(5000);
    rows = (data ?? []) as any[];
    cols = ["created_at", "action", "entity_type", "entity_id", "actor_role", "meta"];
  } else if (ds === "pendency") {
    const { data } = await supabase
      .from("applications")
      .select("state_code, status")
      .in("status", ["submitted", "assigned", "in_verification"]);
    const byState = new Map<string, { submitted: number; assigned: number; in_verification: number }>();
    (data ?? []).forEach((r: any) => {
      const e = byState.get(r.state_code) ?? { submitted: 0, assigned: 0, in_verification: 0 };
      (e as any)[r.status] = ((e as any)[r.status] ?? 0) + 1;
      byState.set(r.state_code, e);
    });
    rows = Array.from(byState.entries()).map(([state, e]) => ({
      state,
      submitted: e.submitted,
      assigned: e.assigned,
      in_verification: e.in_verification,
      total: e.submitted + e.assigned + e.in_verification
    }));
    rows.sort((a, b) => b.total - a.total);
    cols = ["state", "submitted", "assigned", "in_verification", "total"];
  } else {
    return new NextResponse("unknown dataset", { status: 404 });
  }

  const csv = toCsv(rows, cols);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="maapsetu-${ds}-${stamp}.csv"`
    }
  });
}
