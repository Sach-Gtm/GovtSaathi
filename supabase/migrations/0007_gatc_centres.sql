-- GATC (Government Approved Test Centre) registry & accreditation.
-- Models the GATC stakeholder properly: registration, accreditation scope
-- (which instrument categories they may verify), validity window and
-- jurisdiction. Additive; existing GATC users keep working.

create table if not exists gatc_centres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_no text unique,
  accreditation_scope text[] not null default '{}',   -- instrument_category values
  valid_from date,
  valid_until date,
  state_code text references states(code),
  district_id uuid references districts(id),
  contact_person text,
  contact_phone text,
  contact_email text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gatc_state_idx on gatc_centres(state_code);

-- Link a GATC user profile to its centre (nullable, additive).
alter table profiles add column if not exists gatc_centre_id uuid references gatc_centres(id);

drop trigger if exists gatc_centres_updated_at on gatc_centres;
create trigger gatc_centres_updated_at before update on gatc_centres
  for each row execute function set_updated_at();

alter table gatc_centres enable row level security;

-- Any signed-in staff/trader can read the registry (needed for allocation +
-- transparency); only admins write.
drop policy if exists gatc_read on gatc_centres;
create policy gatc_read on gatc_centres for select
  using (auth.uid() is not null);

drop policy if exists gatc_admin_write on gatc_centres;
create policy gatc_admin_write on gatc_centres for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

grant select on gatc_centres to authenticated;

-- Helper: is a centre currently accredited?
create or replace function gatc_is_valid(c gatc_centres)
returns boolean language sql immutable as $$
  select c.is_active
    and (c.valid_from is null or c.valid_from <= current_date)
    and (c.valid_until is null or c.valid_until >= current_date);
$$;
