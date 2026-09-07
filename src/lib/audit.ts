import { createSupabaseServiceClient } from "./supabase/server";
import type { UserRole } from "./rbac";

export interface AuditEntry {
  actor_id: string | null;
  actor_role: UserRole | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  meta?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase.from("audit_logs").insert({
    actor_id: entry.actor_id,
    actor_role: entry.actor_role,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id ?? null,
    meta: entry.meta ?? {},
    ip_address: entry.ip_address ?? null,
    user_agent: entry.user_agent ?? null
  });
}
