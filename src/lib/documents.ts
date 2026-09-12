import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export interface DocRow {
  id: string;
  file_name: string | null;
  mime: string | null;
  size_bytes: number | null;
  doc_type: string;
  created_at: string;
  url: string | null;
}

/**
 * List supporting documents for an entity. Rows are read with the caller's
 * session (RLS-scoped); short-lived signed URLs are minted with the service
 * role. Degrades to [] if the documents feature/migration isn't present yet.
 */
export async function listDocuments(entityType: string, entityId: string): Promise<DocRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, file_name, mime, size_bytes, doc_type, created_at, storage_key")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];

    const svc = createSupabaseServiceClient();
    const out: DocRow[] = [];
    for (const d of data as any[]) {
      let url: string | null = null;
      try {
        const { data: signed } = await svc.storage.from("documents").createSignedUrl(d.storage_key, 3600);
        url = signed?.signedUrl ?? null;
      } catch {
        url = null;
      }
      out.push({
        id: d.id,
        file_name: d.file_name,
        mime: d.mime,
        size_bytes: d.size_bytes,
        doc_type: d.doc_type,
        created_at: d.created_at,
        url
      });
    }
    return out;
  } catch {
    return [];
  }
}
