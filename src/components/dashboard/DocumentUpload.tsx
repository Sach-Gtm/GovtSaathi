"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Uploads a supporting document (PDF or image) for an entity via /api/documents.
 * In-app upload; the server validates type (pdf/png/jpg/webp) and size (≤10 MB).
 */
export function DocumentUpload({
  entityType,
  entityId,
  docType = "supporting"
}: {
  entityType: "application" | "business" | "instrument" | "certificate";
  entityId: string;
  docType?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("entity_type", entityType);
      fd.append("entity_id", entityId);
      fd.append("doc_type", docType);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          j.error === "file_too_large" ? "File is over 10 MB." :
          j.error === "unsupported_type" ? "Use a PDF or an image." :
          j.error ?? "Upload failed"
        );
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <label className="btn-outline cursor-pointer text-sm">
        <input ref={inputRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={onPick} disabled={pending} />
        {pending ? "Uploading…" : "Attach document"}
      </label>
      <span className="ml-2 text-xs text-ink/50">PDF or image, up to 10 MB</span>
      {err && <div className="mt-1 text-xs text-danger">{err}</div>}
    </div>
  );
}
