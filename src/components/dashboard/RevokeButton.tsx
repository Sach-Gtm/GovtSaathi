"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Staff-only certificate revocation with a required reason. */
export function RevokeButton({ certificateId }: { certificateId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!reason.trim()) {
      setErr("A reason is required.");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const res = await fetch(`/api/certificates/${certificateId}/revoke`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline border-danger/40 text-danger hover:bg-danger/5">
        Revoke certificate
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
      <div className="text-sm font-medium text-danger">Revoke this certificate?</div>
      <p className="mt-1 text-xs text-ink/60">The public verify page will immediately show it as revoked. This is audited.</p>
      <input
        className="field-input mt-2"
        placeholder="Reason (e.g. tampering confirmed on re-inspection)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <button disabled={pending} onClick={submit} className="btn-primary bg-danger text-xs hover:bg-danger">
          {pending ? "Revoking…" : "Confirm revoke"}
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost text-xs">Cancel</button>
      </div>
      {err && <div className="mt-1 text-xs text-danger">{err}</div>}
    </div>
  );
}
