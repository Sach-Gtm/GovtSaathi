import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { windowFor } from "@/lib/notify";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Scheduled expiry-reminder sweep (PS req 8, "automated alerts & reminders").
 * Scans instruments.next_due_on and certificates.valid_until, creates one
 * in-app notification per (owner, item, escalation-window) — de-duplicated by
 * dedupe_key so it fires once as each window is crossed — and, if a mail
 * provider is configured, emails the newly-created ones.
 *
 * Invoke via Vercel Cron (GET) with `Authorization: Bearer $CRON_SECRET`, or
 * any scheduler sending the same header / `x-cron-secret`.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // no open endpoint if unconfigured
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}` || req.headers.get("x-cron-secret") === secret;
}

async function sendEmail(to: string | null | undefined, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  const from = process.env.RESEND_FROM || "MAAPSETU <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, subject, html })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const horizon = new Date(Date.now() + 31 * 86_400_000).toISOString().slice(0, 10);

  const [{ data: instr }, { data: certs }] = await Promise.all([
    svc
      .from("instruments")
      .select("id, category, serial_no, next_due_on, business:businesses(owner_id)")
      .not("next_due_on", "is", null)
      .lte("next_due_on", horizon),
    svc
      .from("certificates")
      .select("id, certificate_no, valid_until, business:businesses(owner_id)")
      .eq("revoked", false)
      .lte("valid_until", horizon)
  ]);

  const rows: any[] = [];
  for (const i of (instr ?? []) as any[]) {
    const w = windowFor(i.next_due_on);
    const owner = i.business?.owner_id;
    if (!w || !owner) continue;
    rows.push({
      user_id: owner,
      kind: "expiry_instrument",
      title: w === "overdue" ? "Instrument overdue for re-verification" : "Instrument re-verification due soon",
      body: `${String(i.category).replace(/_/g, " ")}${i.serial_no ? ` (${i.serial_no})` : ""} — due ${i.next_due_on}`,
      entity_type: "instrument",
      entity_id: i.id,
      link: "/dashboard/trader/instruments",
      due_on: i.next_due_on,
      window: w,
      dedupe_key: `expiry_instrument:${i.id}:${w}`
    });
  }
  for (const c of (certs ?? []) as any[]) {
    const w = windowFor(c.valid_until);
    const owner = c.business?.owner_id;
    if (!w || !owner) continue;
    rows.push({
      user_id: owner,
      kind: "expiry_cert",
      title: w === "overdue" ? "Certificate expired" : "Certificate expiring soon",
      body: `${c.certificate_no} — valid until ${c.valid_until}`,
      entity_type: "certificate",
      entity_id: c.id,
      link: `/dashboard/certificate/${c.id}`,
      due_on: c.valid_until,
      window: w,
      dedupe_key: `expiry_cert:${c.id}:${w}`
    });
  }

  let created = 0;
  let emailed = 0;

  if (rows.length) {
    const { data: inserted, error } = await svc
      .from("notifications")
      .upsert(rows, { onConflict: "dedupe_key", ignoreDuplicates: true })
      .select("id, user_id, title, body, link");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    created = inserted?.length ?? 0;

    if (created && process.env.RESEND_API_KEY) {
      const userIds = Array.from(new Set((inserted ?? []).map((r: any) => r.user_id)));
      const { data: profs } = await svc.from("profiles").select("id, email").in("id", userIds);
      const emailById = new Map((profs ?? []).map((p: any) => [p.id, p.email]));
      for (const n of inserted as any[]) {
        const to = emailById.get(n.user_id);
        const html = `<p>${n.body ?? ""}</p><p><a href="${base}${n.link ?? ""}">Open MAAPSETU →</a></p>`;
        if (await sendEmail(to, n.title, html)) {
          emailed++;
          await svc.from("notifications").update({ emailed_at: new Date().toISOString() }).eq("id", n.id);
        }
      }
    }
  }

  const scanned = (instr?.length ?? 0) + (certs?.length ?? 0);
  await writeAudit({
    actor_id: null,
    actor_role: null,
    action: "reminder.expiry",
    entity_type: "notification",
    meta: { scanned, created, emailed }
  });

  return NextResponse.json({ ok: true, scanned, created, emailed });
}

// Some schedulers POST; accept both.
export const POST = GET;
