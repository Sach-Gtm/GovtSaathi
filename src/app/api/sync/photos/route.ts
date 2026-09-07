import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Uploads a single field photo to Supabase Storage under
 *   verification-photos/<assignment_id>/<instrument_id>/<uuid>.jpg
 *
 * Returns { key } which is stored inside the verification record's photo_refs.
 */
export async function POST(req: Request) {
  const authed = createSupabaseServerClient();
  const {
    data: { user }
  } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const assignment_id = form.get("assignment_id") as string | null;
  const instrument_id = form.get("instrument_id") as string | null;
  if (!file || !assignment_id || !instrument_id) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  const key = `${assignment_id}/${instrument_id}/${crypto.randomUUID()}.jpg`;
  const { error } = await svc.storage
    .from("verification-photos")
    .upload(key, file.stream(), { contentType: file.type || "image/jpeg", upsert: false, duplex: "half" as any });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ key });
}
