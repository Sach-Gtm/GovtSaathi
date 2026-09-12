"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

interface Notif {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  window: string | null;
  read_at: string | null;
  created_at: string;
}

const TONE: Record<string, string> = {
  overdue: "border-danger/40 bg-danger/5",
  "7d": "border-warning/40 bg-warning/5",
  "15d": "border-warning/30 bg-warning/5",
  "30d": "border-border bg-paper"
};

export function NotificationList({ initial }: { initial: Notif[] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState<Notif[]>(initial);
  const unread = rows.filter((r) => !r.read_at).length;

  async function markAll() {
    const ids = rows.filter((r) => !r.read_at).map((r) => r.id);
    if (!ids.length) return;
    const now = new Date().toISOString();
    setRows((p) => p.map((r) => (r.read_at ? r : { ...r, read_at: now })));
    await supabase.from("notifications").update({ read_at: now }).in("id", ids);
    router.refresh();
  }

  async function open(n: Notif) {
    if (!n.read_at) {
      const now = new Date().toISOString();
      setRows((p) => p.map((r) => (r.id === n.id ? { ...r, read_at: now } : r)));
      await supabase.from("notifications").update({ read_at: now }).eq("id", n.id);
    }
    if (n.link) router.push(n.link);
    else router.refresh();
  }

  if (!rows.length) {
    return <div className="card p-8 text-center text-ink/60">You’re all caught up — no notifications.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink/60">{unread} unread</div>
        <button onClick={markAll} disabled={!unread} className="btn-outline text-sm disabled:opacity-50">Mark all read</button>
      </div>
      <ul className="space-y-2">
        {rows.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => open(n)}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                n.read_at ? "border-border bg-canvas" : TONE[n.window ?? ""] ?? "border-brand/30 bg-brand-soft/40"
              }`}
            >
              {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />}
              <span className={n.read_at ? "opacity-70" : ""}>
                <span className="block font-medium">{n.title}</span>
                {n.body && <span className="block text-sm text-ink/70">{n.body}</span>}
                <span className="block text-xs text-ink/45">{formatDateTime(n.created_at)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
