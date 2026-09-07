import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient, createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Public intake for the three support channels:
 *  - bug       → feedback (kind=bug)
 *  - service   → feedback (kind=service)
 *  - complaint → complaints (a customer flags a shop / instrument)
 *
 * Uses the service role so anonymous visitors can submit without RLS grants.
 * Reads are still officer/admin-only.
 */
const Base = z.object({
  type: z.enum(["bug", "service", "complaint"]),
  message: z.string().min(5).max(4000),
  subject: z.string().max(200).optional(),
  contact_email: z.string().email().max(200).optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional().or(z.literal("")),
  page_url: z.string().max(500).optional(),
  // complaint-only
  certificate_no: z.string().max(60).optional(),
  shop_name: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  state_code: z.string().max(4).optional(),
  category: z.string().max(40).optional()
});

export async function POST(req: Request) {
  const parsed = Base.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;

  // Attach the signed-in user if there is one (optional)
  let userId: string | null = null;
  try {
    const authed = createSupabaseServerClient();
    const { data } = await authed.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {}

  const svc = createSupabaseServiceClient();

  if (b.type === "complaint") {
    const { data, error } = await svc
      .from("complaints")
      .insert({
        certificate_no: b.certificate_no || null,
        shop_name: b.shop_name || null,
        city: b.city || null,
        state_code: b.state_code || null,
        category: b.category || "other",
        description: b.message,
        contact_phone: b.contact_phone || null,
        contact_email: b.contact_email || null
      })
      .select("complaint_no")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, ref: data?.complaint_no });
  }

  const { error } = await svc.from("feedback").insert({
    kind: b.type,
    subject: b.subject || null,
    message: b.message,
    contact_email: b.contact_email || null,
    page_url: b.page_url || null,
    created_by: userId
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
