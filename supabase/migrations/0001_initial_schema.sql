-- GovtSathi — Online Verification System for Weighing & Measuring Instruments
-- Initial schema. Runs on Supabase (PostgreSQL 15+).

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- Enums
-- ============================================================
do $$ begin
  create type user_role as enum ('citizen','trader','officer','gatc','allocator','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('draft','submitted','assigned','in_verification','verified','rejected','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_outcome as enum ('pass','fail','conditional');
exception when duplicate_object then null; end $$;

do $$ begin
  create type instrument_category as enum (
    'weighing_scale','beam_scale','platform_scale','crane_scale',
    'weighbridge','fuel_dispenser','flow_meter','length_measure',
    'volume_measure','capacity_measure','other'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- Reference: states / districts
-- ============================================================
create table if not exists states (
  code text primary key,
  name text not null,
  region text
);

create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(code) on delete cascade,
  name text not null,
  unique(state_code, name)
);

-- ============================================================
-- Profiles — extends auth.users
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'citizen',
  phone text,
  email text,
  state_code text references states(code),
  district_id uuid references districts(id),
  employee_code text,          -- for officers / GATC staff
  organisation text,           -- GATC or trader business name
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_state_idx on profiles(state_code);

-- ============================================================
-- Trader businesses (a trader profile can own multiple businesses)
-- ============================================================
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  legal_name text not null,
  trade_name text,
  gstin text,
  pan text,
  address_line1 text not null,
  address_line2 text,
  city text,
  district_id uuid references districts(id),
  state_code text references states(code),
  pincode text,
  contact_phone text,
  contact_email text,
  created_at timestamptz not null default now()
);

create index if not exists businesses_owner_idx on businesses(owner_id);

-- ============================================================
-- Instruments — one row per weighing / measuring device
-- ============================================================
create table if not exists instruments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category instrument_category not null,
  make text,
  model text,
  serial_no text,
  capacity text,               -- e.g. "500 kg", "2000 L/min"
  accuracy_class text,         -- e.g. "III", "M1"
  location_description text,
  last_verified_on date,
  next_due_on date,
  created_at timestamptz not null default now(),
  unique(business_id, serial_no)
);

create index if not exists instruments_business_idx on instruments(business_id);

-- ============================================================
-- Applications — trader requests verification for one or more instruments
-- ============================================================
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  application_no text unique not null default ('APP-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6)),
  business_id uuid not null references businesses(id) on delete restrict,
  submitted_by uuid not null references profiles(id),
  status application_status not null default 'draft',
  state_code text not null references states(code),
  district_id uuid references districts(id),
  preferred_date date,
  notes text,
  fee_amount numeric(12,2),
  fee_paid boolean not null default false,
  fee_txn_ref text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_status_idx on applications(status);
create index if not exists applications_state_district_idx on applications(state_code, district_id);
create index if not exists applications_business_idx on applications(business_id);

-- link table: instruments included in an application
create table if not exists application_instruments (
  application_id uuid not null references applications(id) on delete cascade,
  instrument_id uuid not null references instruments(id) on delete restrict,
  primary key (application_id, instrument_id)
);

-- ============================================================
-- Assignments — officer / GATC assignment to an application
-- ============================================================
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  assignee_id uuid not null references profiles(id),
  assigned_by uuid not null references profiles(id),
  scheduled_for date,
  accepted_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists assignments_assignee_idx on assignments(assignee_id);
create index if not exists assignments_application_idx on assignments(application_id);

-- ============================================================
-- Verification records — one per instrument in an application
-- ============================================================
create table if not exists verification_records (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  instrument_id uuid not null references instruments(id) on delete restrict,
  outcome verification_outcome not null,
  observed_values jsonb not null default '{}'::jsonb,
  tolerance_ok boolean,
  observations text,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  photo_refs text[] default '{}',       -- Supabase Storage keys
  performed_by uuid not null references profiles(id),
  performed_at timestamptz not null,
  device_id text,                       -- offline device that captured it
  client_recorded_at timestamptz,       -- when offline device recorded
  signature bytea,                      -- Ed25519 signature over canonical payload
  signature_algo text default 'ed25519',
  signature_key_id text,
  payload_hash text,                    -- sha-256 of canonical payload (hex)
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists vr_assignment_idx on verification_records(assignment_id);
create index if not exists vr_instrument_idx on verification_records(instrument_id);

-- ============================================================
-- Certificates — issued after a verification with 'pass' or 'conditional'
-- ============================================================
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text unique not null default ('LM-' || to_char(now(),'YYYY') || '-' || substr(gen_random_uuid()::text,1,8)),
  verification_record_id uuid not null references verification_records(id) on delete cascade,
  business_id uuid not null references businesses(id),
  instrument_id uuid not null references instruments(id),
  issued_by uuid not null references profiles(id),
  issued_on date not null default current_date,
  valid_until date not null,
  qr_payload text not null,              -- URL-safe payload embedded in QR
  qr_signature text not null,            -- base64 signature over qr_payload
  revoked boolean not null default false,
  revoked_reason text,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists certificates_business_idx on certificates(business_id);
create index if not exists certificates_instrument_idx on certificates(instrument_id);

-- ============================================================
-- Sync queue — records pushed from officer's offline device
-- (server side ledger; the queue itself is stored on-device in IndexedDB)
-- ============================================================
create table if not exists sync_events (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  performed_by uuid not null references profiles(id),
  event_type text not null,             -- 'verification.create', 'photo.upload', etc.
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed boolean not null default false,
  processed_at timestamptz,
  error text
);

create index if not exists sync_events_processed_idx on sync_events(processed);

-- ============================================================
-- Audit log — every critical action leaves a trail
-- ============================================================
create table if not exists audit_logs (
  id bigserial primary key,
  actor_id uuid references profiles(id),
  actor_role user_role,
  action text not null,                 -- e.g. 'application.submit', 'assignment.assign'
  entity_type text not null,
  entity_id uuid,
  meta jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_action_idx on audit_logs(action);
create index if not exists audit_entity_idx on audit_logs(entity_type, entity_id);
create index if not exists audit_actor_idx on audit_logs(actor_id);

-- ============================================================
-- Triggers — updated_at
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists applications_updated_at on applications;
create trigger applications_updated_at before update on applications
  for each row execute function set_updated_at();

-- ============================================================
-- Helper: current role
-- ============================================================
create or replace function current_role_name() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table instruments enable row level security;
alter table applications enable row level security;
alter table application_instruments enable row level security;
alter table assignments enable row level security;
alter table verification_records enable row level security;
alter table certificates enable row level security;
alter table sync_events enable row level security;
alter table audit_logs enable row level security;

-- profiles: users can read/update their own; admins can read all
drop policy if exists profiles_self_read on profiles;
create policy profiles_self_read on profiles for select
  using (id = auth.uid() or current_role_name() in ('admin','allocator'));

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles for update
  using (id = auth.uid());

drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

-- businesses / instruments: trader-owner OR officer-in-state
drop policy if exists businesses_owner_rw on businesses;
create policy businesses_owner_rw on businesses for all
  using (owner_id = auth.uid() or current_role_name() in ('admin','allocator','officer','gatc'))
  with check (owner_id = auth.uid() or current_role_name() = 'admin');

drop policy if exists instruments_read on instruments;
create policy instruments_read on instruments for select
  using (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
    or current_role_name() in ('admin','allocator','officer','gatc')
  );

drop policy if exists instruments_write on instruments;
create policy instruments_write on instruments for insert
  with check (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
    or current_role_name() = 'admin'
  );

-- applications: trader can CRUD own drafts; officer/allocator read in scope
drop policy if exists applications_read on applications;
create policy applications_read on applications for select
  using (
    submitted_by = auth.uid()
    or current_role_name() in ('admin','allocator')
    or exists (select 1 from assignments a where a.application_id = applications.id and a.assignee_id = auth.uid())
  );

drop policy if exists applications_trader_insert on applications;
create policy applications_trader_insert on applications for insert
  with check (submitted_by = auth.uid());

drop policy if exists applications_trader_update on applications;
create policy applications_trader_update on applications for update
  using (submitted_by = auth.uid() and status in ('draft','submitted'))
  with check (submitted_by = auth.uid());

drop policy if exists applications_admin_all on applications;
create policy applications_admin_all on applications for all
  using (current_role_name() in ('admin','allocator'))
  with check (current_role_name() in ('admin','allocator'));

-- application_instruments follows applications
drop policy if exists appinst_read on application_instruments;
create policy appinst_read on application_instruments for select
  using (
    exists (select 1 from applications a where a.id = application_id and (a.submitted_by = auth.uid() or current_role_name() in ('admin','allocator','officer','gatc')))
  );

drop policy if exists appinst_write on application_instruments;
create policy appinst_write on application_instruments for all
  using (
    exists (select 1 from applications a where a.id = application_id and (a.submitted_by = auth.uid() or current_role_name() in ('admin','allocator')))
  ) with check (true);

-- assignments
drop policy if exists assignments_read on assignments;
create policy assignments_read on assignments for select
  using (
    assignee_id = auth.uid()
    or current_role_name() in ('admin','allocator')
    or exists (select 1 from applications a where a.id = application_id and a.submitted_by = auth.uid())
  );

drop policy if exists assignments_alloc_write on assignments;
create policy assignments_alloc_write on assignments for all
  using (current_role_name() in ('admin','allocator'))
  with check (current_role_name() in ('admin','allocator'));

drop policy if exists assignments_officer_update on assignments;
create policy assignments_officer_update on assignments for update
  using (assignee_id = auth.uid())
  with check (assignee_id = auth.uid());

-- verification_records
drop policy if exists vr_read on verification_records;
create policy vr_read on verification_records for select
  using (
    performed_by = auth.uid()
    or current_role_name() in ('admin','allocator')
    or exists (
      select 1 from assignments a
      join applications app on app.id = a.application_id
      where a.id = verification_records.assignment_id and app.submitted_by = auth.uid()
    )
  );

drop policy if exists vr_write on verification_records;
create policy vr_write on verification_records for insert
  with check (performed_by = auth.uid() and current_role_name() in ('officer','gatc'));

-- certificates — publicly readable is handled via a security-definer RPC (verify_certificate)
drop policy if exists certificates_read on certificates;
create policy certificates_read on certificates for select
  using (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
    or current_role_name() in ('admin','allocator','officer','gatc')
  );

drop policy if exists certificates_write on certificates;
create policy certificates_write on certificates for insert
  with check (current_role_name() in ('officer','gatc','admin'));

-- audit_logs — insert only from server side (service role bypasses RLS)
drop policy if exists audit_read on audit_logs;
create policy audit_read on audit_logs for select
  using (current_role_name() in ('admin','allocator'));

-- sync_events — device can insert own events; admin reads
drop policy if exists sync_read on sync_events;
create policy sync_read on sync_events for select
  using (performed_by = auth.uid() or current_role_name() = 'admin');

drop policy if exists sync_write on sync_events;
create policy sync_write on sync_events for insert
  with check (performed_by = auth.uid());

-- ============================================================
-- Public verification RPC — used by /verify/[qr] without auth
-- ============================================================
create or replace function public.verify_certificate(cert_no text)
returns table (
  certificate_no text,
  issued_on date,
  valid_until date,
  revoked boolean,
  outcome verification_outcome,
  instrument jsonb,
  business jsonb
) language sql security definer set search_path = public as $$
  select
    c.certificate_no,
    c.issued_on,
    c.valid_until,
    c.revoked,
    vr.outcome,
    jsonb_build_object(
      'category', i.category,
      'make', i.make,
      'model', i.model,
      'serial_no', i.serial_no,
      'capacity', i.capacity,
      'accuracy_class', i.accuracy_class
    ),
    jsonb_build_object(
      'legal_name', b.legal_name,
      'trade_name', b.trade_name,
      'city', b.city,
      'state', b.state_code
    )
  from certificates c
  join verification_records vr on vr.id = c.verification_record_id
  join instruments i on i.id = c.instrument_id
  join businesses b on b.id = c.business_id
  where c.certificate_no = cert_no
  limit 1;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;

-- ============================================================
-- New-user hook: auto-create profile row on signup
-- ============================================================
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role)
  ) on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
