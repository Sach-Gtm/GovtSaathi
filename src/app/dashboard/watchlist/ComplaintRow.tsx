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

  async function update(next: string) {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("complaints").update({ status: next }).eq("id", complaint.id);
    setStatus(next);
    setSaving(false);
    router.refresh();
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
      </div>
    </div>
  );
}
