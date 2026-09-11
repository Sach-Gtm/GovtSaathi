import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/rbac";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED = ["application", "business", "instrument", "certificate"];
const MAX = 10 * 1024 * 1024; // 10 MB
const OK_MIME = /^(application\/pdf|image\/(png|jpe?g|webp))$/i;

/** Upload a supporting document (PS req 10). Any signed-in stakeholder. */
export async function POST(req: Request) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const entity_type = String(form.get("entity_type") ?? "");
  const entity_id = String(form.get("entity_id") ?? "");
  const doc_type = String(form.get("doc_type") ?? "supporting").slice(0, 40);

  if (!file || !ALLOWED.includes(entity_type) || !entity_id) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (file.size > MAX) return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  if (!OK_MIME.test(file.type)) return NextResponse.json({ error: "unsupported_type" }, { status: 415 });

  const svc = createSupabaseServiceClient();
  const safe = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
  const key = `${entity_type}/${entity_id}/${crypto.randomUUID()}-${safe}`;

  const { error: upErr } = await svc.storage
    .from("documents")
    .upload(key, file.stream(), { contentType: file.type, upsert: false, duplex: "half" as any });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: row, error } = await svc
    .from("documents")
    .insert({
      entity_type,
      entity_id,
      doc_type,
      storage_key: key,
      file_name: file.name,
      mime: file.type,
      size_bytes: file.size,
      uploaded_by: profile.id
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit({
    actor_id: profile.id,
    actor_role: profile.role,
    action: "document.upload",
    entity_type,
    entity_id,
    meta: { doc_type, file_name: file.name }
  });

  return NextResponse.json({ ok: true, id: row!.id });
}
