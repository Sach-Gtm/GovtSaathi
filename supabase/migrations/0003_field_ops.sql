-- Field operations & geo-tagging
-- Adds shop coordinates, planned route order, and on-site check-in/out timing
-- so a controlling officer can see where each officer goes today, how many
-- shops are planned, and how long each visit takes.

-- Shop location (geocoded once at registration or entered by the officer)
alter table businesses add column if not exists lat numeric(10,7);
alter table businesses add column if not exists lng numeric(10,7);

-- Route planning + on-site timing on the assignment
alter table assignments add column if not exists planned_seq int;
alter table assignments add column if not exists check_in_at timestamptz;
alter table assignments add column if not exists check_out_at timestamptz;
alter table assignments add column if not exists check_in_lat numeric(10,7);
alter table assignments add column if not exists check_in_lng numeric(10,7);

-- Minutes spent on site (generated from check-in / check-out)
create or replace function assignment_minutes_on_site(a assignments)
returns int language sql immutable as $$
  select case
    when a.check_in_at is not null and a.check_out_at is not null
    then greatest(0, round(extract(epoch from (a.check_out_at - a.check_in_at)) / 60.0)::int)
    else null
  end;
$$;

-- Officers may update their own check-in / route fields (policy already allows
-- assignee updates via assignments_officer_update).

-- Convenience view: today's field plan per officer
create or replace view field_plan_today as
select
  a.id as assignment_id,
  a.assignee_id,
  p.full_name as officer_name,
  p.employee_code,
  p.state_code,
  a.planned_seq,
  a.scheduled_for,
  a.check_in_at,
  a.check_out_at,
  assignment_minutes_on_site(a) as minutes_on_site,
  a.completed_at,
  b.id as business_id,
  coalesce(b.trade_name, b.legal_name) as shop_name,
  b.address_line1,
  b.city,
  b.state_code as shop_state,
  b.lat as shop_lat,
  b.lng as shop_lng,
  app.application_no,
  (select count(*) from application_instruments ai where ai.application_id = app.id) as instrument_count
from assignments a
join profiles p on p.id = a.assignee_id
join applications app on app.id = a.application_id
join businesses b on b.id = app.business_id
where a.scheduled_for = current_date;

grant select on field_plan_today to authenticated;
