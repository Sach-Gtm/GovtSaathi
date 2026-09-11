"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
  dismissed: "Dismissed"
};
const STATUS_VARIANT: Record<string, "danger" | "warning" | "success" | "default"> = {
  open: "danger",
  under_review: "warning",
  resolved: "success",
  dismissed: "default"
};
const CATEGORY_LABEL: Record<string, string> = {
  underweight: "Gives less than it should",
  tampered: "Machine looks tampered",
  no_sticker: "No sticker",
  expired: "Sticker expired",
  overcharge: "Overcharged",
  other: "Other"
};

export function ComplaintRow({ complaint }: { complaint: any }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(complaint.status);
  const [saving, setSaving] = useState(false);

  const [revoking, setRevoking] = useState(false);
  const [revMsg, setRevMsg] = useState<string | null>(null);

  async function update(next: string) {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("complaints").update({ status: next }).eq("id", complaint.id);
    setStatus(next);
    setSaving(false);
    router.refresh();
  }

  async function revokeLinked() {
    if (!complaint.certificate_no) return;
    if (!confirm(`Revoke certificate ${complaint.certificate_no}? The public verify page will show it as revoked.`)) return;
    setRevoking(true);
    setRevMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: cert } = await supabase
        .from("certificates")
        .select("id")
        .eq("certificate_no", complaint.certificate_no)
        .maybeSingle();
      if (!cert) throw new Error("Certificate not found in the ledger");
      const res = await fetch(`/api/certificates/${cert.id}/revoke`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: `Complaint ${complaint.complaint_no}`, complaint_no: complaint.complaint_no })
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      await supabase.from("complaints").update({ status: "under_review" }).eq("id", complaint.id);
      setStatus("under_review");
      setRevMsg("Certificate revoked.");
      router.refresh();
    } catch (e: any) {
      setRevMsg(e.message ?? String(e));
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink/60">{complaint.complaint_no}</span>
            <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
            <Badge variant="default">{CATEGORY_LABEL[complaint.category] ?? complaint.category}</Badge>
          </div>
          <div className="mt-1 font-medium">
            {complaint.shop_name || "Unnamed shop"}
            {complaint.city ? <span className="text-ink/50"> · {complaint.city}</span> : null}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-ink/70">{complaint.description}</p>
          <div className="mt-1 text-xs text-ink/50">
            {formatDateTime(complaint.created_at)}
            {complaint.certificate_no ? ` · sticker ${complaint.certificate_no}` : ""}
            {complaint.contact_phone ? ` · ${complaint.contact_phone}` : ""}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <select
            className="field-select w-40 text-sm"
            value={status}
            disabled={saving}
            onChange={(e) => update(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="under_review">Under review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          {complaint.certificate_no && (
            <button
              onClick={revokeLinked}
              disabled={revoking}
              className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
            >
              {revoking ? "Revoking…" : `Revoke sticker ${complaint.certificate_no}`}
            </button>
          )}
          {revMsg && <span className="text-xs text-ink/60">{revMsg}</span>}
        </div>
      </div>
    </div>
  );
}
