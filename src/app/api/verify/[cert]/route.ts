import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Public JSON endpoint for scanners that want structured data instead of the
 * human page. Uses the security-definer `verify_certificate` RPC so anyone
 * (anon or authed) can hit it.
 */
export async function GET(_req: Request, { params }: { params: { cert: string } }) {
  const cert = decodeURIComponent(params.cert);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("verify_certificate", { cert_no: cert });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = data?.[0];
  if (!row) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  const now = new Date();
  const valid = !row.revoked && new Date(row.valid_until) >= now && row.outcome !== "fail";
  return NextResponse.json({ ok: valid, ...row });
}
