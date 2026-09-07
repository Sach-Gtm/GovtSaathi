-- Storage bucket for field-verification photos.
-- Private by default; officers upload; admins and the officer who captured can read.

insert into storage.buckets (id, name, public)
values ('verification-photos', 'verification-photos', false)
on conflict (id) do nothing;

-- Officers / GATCs upload
drop policy if exists officers_upload on storage.objects;
create policy officers_upload on storage.objects for insert
  with check (
    bucket_id = 'verification-photos'
    and current_role_name() in ('officer','gatc','admin')
  );

-- Officers read their own uploads
drop policy if exists officers_read_own on storage.objects;
create policy officers_read_own on storage.objects for select
  using (
    bucket_id = 'verification-photos'
    and (
      owner = auth.uid()
      or current_role_name() in ('admin','allocator')
    )
  );
