import { requireProfile } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationList } from "./NotificationList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications — MAAPSETU" };

export default async function NotificationsPage() {
  await requireProfile();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, title, body, link, window, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Notifications</h1>
        <p className="mt-1 text-ink/70">Renewal reminders, assignments and updates. Reminders escalate as a due date approaches.</p>
      </div>
      {error ? (
        <div className="card border-warning/40 bg-warning/5 p-6 text-sm text-ink/70">
          Notifications aren’t available yet. Apply migration
          <span className="font-mono"> supabase/migrations/0009_notifications.sql</span> and reload.
        </div>
      ) : (
        <NotificationList initial={(data ?? []) as any} />
      )}
    </div>
  );
}
