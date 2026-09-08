"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";

const REQUESTABLE = [
  ["officer", "Legal Metrology Officer"],
  ["gatc", "GATC verifier"],
  ["allocator", "Allocator"]
] as const;

/**
 * Lets a signed-in user request elevated access. It sets requested_role on their
 * own profile; an administrator approves it from Users & access. The role guard
 * means this request never changes their actual role by itself.
 */
export function RequestAccess({ currentRequest }: { currentRequest?: string | null }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [role, setRole] = useState<string>("officer");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(!!currentRequest);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("Not signed in"); setBusy(false); return; }
    const { error } = await supabase
      .from("profiles")
      .update({ requested_role: role, access_note: note || null, requested_at: new Date().toISOString() })
      .eq("id", user.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    router.refresh();
  }

  async function cancel() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ requested_role: null, requested_at: null }).eq("id", user.id);
    setBusy(false);
    setDone(false);
    router.refresh();
  }

  if (done) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-warning/20 text-warning">⏳</span>
          <div className="font-display text-lg font-semibold">Request sent</div>
        </div>
        <p className="mt-2 text-sm text-ink/70">
          An administrator will review your request for elevated access. You will get the new access once it
          is approved.
        </p>
        <button onClick={cancel} disabled={busy} className="btn-outline mt-4 text-sm">Cancel request</button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="font-display text-lg font-semibold">Work for the department?</div>
      <p className="mt-1 text-sm text-ink/70">
        If you are a Legal Metrology Officer, a Government Approved Test Centre, or a district allocator,
        request access here. An administrator will approve it.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Field label="Access you need">
          <select className="field-select" value={role} onChange={(e) => setRole(e.target.value)}>
            {REQUESTABLE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="A short note for the admin" hint="Your office, employee code, or how to verify you.">
          <textarea className="field-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. LMO, Pune district, employee code LM-MH-0623" />
        </Field>
        {err && <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{err}</div>}
        <button type="submit" disabled={busy} className="btn-primary">{busy ? "Sending…" : "Request access"}</button>
      </form>
    </div>
  );
}
