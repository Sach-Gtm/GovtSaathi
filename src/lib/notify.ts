import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { daysUntil } from "@/lib/utils";

export type ReminderWindow = "overdue" | "7d" | "15d" | "30d" | null;

/** Which escalation window a due date currently falls in. */
export function windowFor(dueOn: string | null | undefined): ReminderWindow {
  const d = daysUntil(dueOn);
  if (d === null) return null;
  if (d < 0) return "overdue";
  if (d <= 7) return "7d";
  if (d <= 15) return "15d";
  if (d <= 30) return "30d";
  return null;
}

export interface NotifyInput {
  user_id: string;
  kind: string;
  title: string;
  body?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  link?: string | null;
}

/**
 * Best-effort single in-app notification. Silently no-ops if the notifications
 * table isn't present yet (pre-migration) so callers never break.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const svc = createSupabaseServiceClient();
    await svc.from("notifications").insert({
      user_id: input.user_id,
      kind: input.kind,
      title: input.title,
      body: input.body ?? null,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      link: input.link ?? null
    });
  } catch {
    /* notifications are best-effort */
  }
}
