-- Tolerance / maximum-permissible-error (MPE) reference, keyed by instrument
-- category + accuracy class. Lets the field app auto-derive pass/fail from the
-- entered reference vs observed reading instead of a manual judgement.
--
-- NOTE: the seeded values are a simplified, percent-of-load model for the demo.
-- The LM (General) Rules, 2011 schedules define class-specific MPE in terms of
-- the verification scale interval (e) and number of intervals (n); those exact
-- schedules can be loaded into this same table (mpe_is_percent=false with the
-- appropriate absolute values per capacity band).

create table if not exists tolerances (
  id uuid primary key default gen_random_uuid(),
  category instrument_category not null,
  accuracy_class text,               -- e.g. 'III', 'II', 'M1'; null = any class
  capacity_min numeric,              -- optional capacity band (base unit)
  capacity_max numeric,
  mpe_value numeric not null,        -- magnitude of the max permissible error
  mpe_unit text not null default '%',
  mpe_is_percent boolean not null default true,
  basis text default 'in-service',   -- 'verification' (initial) or 'in-service'
  reference text,                    -- rule citation
  created_at timestamptz not null default now()
);

create index if not exists tolerances_lookup_idx on tolerances(category, accuracy_class);

alter table tolerances enable row level security;

-- Reference data — readable by any signed-in user (officers cache it offline).
drop policy if exists tolerances_read on tolerances;
create policy tolerances_read on tolerances for select
  using (auth.uid() is not null);

drop policy if exists tolerances_admin_write on tolerances;
create policy tolerances_admin_write on tolerances for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

grant select on tolerances to authenticated;
