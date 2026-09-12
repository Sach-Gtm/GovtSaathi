"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Header bell with an unread count. Degrades silently if the table is absent. */
export function NotificationBell() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { count: c, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .is("read_at", null);
        if (!error && !cancelled) setCount(c ?? 0);
      } catch {
        /* ignore */
      }
    }
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={`Notifications${count ? `, ${count} unread` : ""}`}
      className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-canvas text-ink/70 hover:text-brand"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
