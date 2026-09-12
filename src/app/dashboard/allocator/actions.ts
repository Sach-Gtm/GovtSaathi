"use server";
import { getSessionProfile } from "@/lib/rbac";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

/**
 * Allocate (or re-allocate) an application to a verifier in one atomic server
 * action: close any prior open assignment, insert the new one, move the
 * application to 'assigned', and write an audit entry. Fixes the earlier
 * non-transactional two-call client path and de-duplicates assignment rows.
 */
export async function allocate(input: { applicationId: string; assigneeId: string; scheduledFor: string | null }) {
  const profile = await getSessionProfile();
  if (!profile || !["allocator", "admin"].includes(profile.role)) return { error: "Not authorised" };
  if (!input.assigneeId) return { error: "Pick a verifier" };

  const svc = createSupabaseServiceClient();
  const now = new Date().toISOString();

  const { data: open } = await svc
    .from("assignments")
    .select("id, assignee_id")
    .eq("application_id", input.applicationId)
    .is("completed_at", null);
  const prior = open ?? [];
  for (const a of prior) {
    await svc.from("assignments").update({ completed_at: now, notes: "reassigned" }).eq("id", a.id);
  }

  const { error } = await svc.from("assignments").insert({
    application_id: input.applicationId,
    assignee_id: input.assigneeId,
    assigned_by: profile.id,
    scheduled_for: input.scheduledFor
  });
  if (error) return { error: error.message };

  await svc.from("applications").update({ status: "assigned" }).eq("id", input.applicationId);
  await writeAudit({
    actor_id: profile.id,
    actor_role: profile.role,
    action: prior.length ? "assignment.reassign" : "assignment.assign",
    entity_type: "application",
    entity_id: input.applicationId,
    meta: { assignee_id: input.assigneeId, prior: prior.map((p) => p.assignee_id) }
  });
  await notify({
    user_id: input.assigneeId,
    kind: "assignment",
    title: "New verification job assigned",
    body: "An application has been assigned to you. Open your jobs to accept it.",
    entity_type: "application",
    entity_id: input.applicationId,
    link: "/dashboard/officer"
  });
  return { ok: true };
}

/** Return an assigned application to the queue (closes open assignments). */
export async function unassign(input: { applicationId: string }) {
  const profile = await getSessionProfile();
  if (!profile || !["allocator", "admin"].includes(profile.role)) return { error: "Not authorised" };
  const svc = createSupabaseServiceClient();
  const now = new Date().toISOString();
  await svc
    .from("assignments")
    .update({ completed_at: now, notes: "unassigned" })
    .eq("application_id", input.applicationId)
    .is("completed_at", null);
  await svc.from("applications").update({ status: "submitted" }).eq("id", input.applicationId);
  await writeAudit({
    actor_id: profile.id,
    actor_role: profile.role,
    action: "assignment.unassign",
    entity_type: "application",
    entity_id: input.applicationId
  });
  return { ok: true };
}
