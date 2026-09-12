-- In-app notifications + reminder ledger. Powers the notification bell, the
-- /dashboard/notifications centre, and the scheduled expiry-reminder cron.
-- The cron de-duplicates via dedupe_key so a given reminder fires once per
-- escalation window (30d → 15d → 7d → overdue).

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,                 -- expiry_instrument | expiry_cert | assignment | verification | complaint | system
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  link text,                          -- in-app deep link
  due_on date,
  window text,                        -- 30d | 15d | 7d | overdue (expiry kinds)
  dedupe_key text unique,             -- one row per (user, entity, window); NULLs allowed & not deduped
  read_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications(user_id, read_at);
create index if not exists notifications_created_idx on notifications(created_at);

alter table notifications enable row level security;

-- Owners read and update (mark-read) their own; inserts happen server-side with
-- the service role (cron / server actions), which bypasses RLS.
drop policy if exists notifications_read on notifications;
create policy notifications_read on notifications for select
  using (user_id = auth.uid());

drop policy if exists notifications_update on notifications;
create policy notifications_update on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notifications_admin on notifications;
create policy notifications_admin on notifications for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

grant select, update on notifications to authenticated;
