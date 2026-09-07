-- Scan logging, customer complaints, and feedback — powering the officer
-- intelligence panel (frequently-scanned = possible dispute, dormant = unused
-- machine) and the public support channels.

-- ============================================================
-- Certificate scans — one row per public verification / QR scan
-- ============================================================
create table if not exists certificate_scans (
  id bigserial primary key,
  certificate_no text not null,
  business_id uuid references businesses(id) on delete set null,
  scanned_at timestamptz not null default now(),
  source text not null default 'web'
);
create index if not exists cert_scans_no_idx on certificate_scans(certificate_no);
create index if not exists cert_scans_time_idx on certificate_scans(scanned_at);
create index if not exists cert_scans_business_idx on certificate_scans(business_id);

alter table certificate_scans enable row level security;
drop policy if exists scans_read on certificate_scans;
create policy scans_read on certificate_scans for select
  using (current_role_name() in ('admin','allocator','officer','gatc'));
-- Inserts happen server-side with the service role (bypasses RLS).

-- ============================================================
-- Complaints — a customer flags a shop / instrument
-- ============================================================
do $$ begin
  create type complaint_status as enum ('open','under_review','resolved','dismissed');
exception when duplicate_object then null; end $$;

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_no text unique not null default ('CMP-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,5)),
  certificate_no text,
  business_id uuid references businesses(id) on delete set null,
  shop_name text,
  city text,
  state_code text references states(code),
  category text not null default 'other',
  description text not null,
  contact_phone text,
  contact_email text,
  status complaint_status not null default 'open',
  assigned_to uuid references profiles(id),
  officer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists complaints_status_idx on complaints(status);
create index if not exists complaints_business_idx on complaints(business_id);

drop trigger if exists complaints_updated_at on complaints;
create trigger complaints_updated_at before update on complaints
  for each row execute function set_updated_at();

alter table complaints enable row level security;
drop policy if exists complaints_read on complaints;
create policy complaints_read on complaints for select
  using (current_role_name() in ('admin','allocator','officer','gatc'));
drop policy if exists complaints_officer_update on complaints;
create policy complaints_officer_update on complaints for update
  using (current_role_name() in ('admin','allocator','officer','gatc'))
  with check (current_role_name() in ('admin','allocator','officer','gatc'));
-- Public submissions go through a server route with the service role.

-- ============================================================
-- Feedback — bug reports and service requests
-- ============================================================
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'bug',           -- 'bug' | 'service'
  subject text,
  message text not null,
  contact_email text,
  page_url text,
  created_by uuid references profiles(id),
  status text not null default 'open',
  created_at timestamptz not null default now()
);
alter table feedback enable row level security;
drop policy if exists feedback_read on feedback;
create policy feedback_read on feedback for select
  using (current_role_name() in ('admin','allocator'));

-- ============================================================
-- Insight view: per-certificate scan stats
-- ============================================================
create or replace view cert_scan_stats as
select
  c.certificate_no,
  c.business_id,
  c.instrument_id,
  c.issued_on,
  c.valid_until,
  c.revoked,
  b.legal_name,
  b.trade_name,
  b.city,
  b.state_code,
  i.category as instrument_category,
  i.serial_no,
  coalesce(s.scans_total, 0)  as scans_total,
  coalesce(s.scans_30d, 0)    as scans_30d,
  coalesce(s.scans_7d, 0)     as scans_7d,
  s.last_scan_at,
  (current_date - c.issued_on) as age_days
from certificates c
join businesses b on b.id = c.business_id
join instruments i on i.id = c.instrument_id
left join (
  select certificate_no,
    count(*) as scans_total,
    count(*) filter (where scanned_at > now() - interval '30 days') as scans_30d,
    count(*) filter (where scanned_at > now() - interval '7 days') as scans_7d,
    max(scanned_at) as last_scan_at
  from certificate_scans group by certificate_no
) s on s.certificate_no = c.certificate_no;

grant select on cert_scan_stats to authenticated;
