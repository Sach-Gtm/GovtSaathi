"use client";
import { useEffect, useState } from "react";
import { drainSyncQueue, registerSyncListeners } from "@/lib/offline/sync";
import { offlineDB } from "@/lib/offline/db";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [pushing, setPushing] = useState(false);

  useEffect(() => {
    registerSyncListeners();
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    const tick = async () => {
      try {
        const n = await offlineDB().pendingVerifications.where("status").anyOf("queued", "failed").count();
        setPending(n);
      } catch {}
    };
    tick();
    const t = setInterval(tick, 5000);

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      clearInterval(t);
    };
  }, []);

  async function syncNow() {
    setPushing(true);
    await drainSyncQueue();
    const n = await offlineDB().pendingVerifications.where("status").anyOf("queued", "failed").count();
    setPending(n);
    setPushing(false);
  }

  return (
    <div className="rounded-md border border-border bg-canvas px-3 py-2 text-xs flex items-center gap-3">
      <span className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${online ? "bg-success" : "bg-danger"}`} />
        {online ? "Online" : "Offline"}
      </span>
      <span className="text-ink/60">Queue: <span className="font-medium">{pending}</span></span>
      <button onClick={syncNow} disabled={!online || pushing || pending === 0} className="text-brand font-medium disabled:opacity-40">
        {pushing ? "Syncing…" : "Sync now"}
      </button>
    </div>
  );
}
