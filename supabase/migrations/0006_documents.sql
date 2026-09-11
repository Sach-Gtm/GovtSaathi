-- Supporting documents — GSTIN proof, ID, prior certificates, purchase
-- invoices, calibration/traceability papers — attachable to an application,
-- business, instrument or certificate. Additive; nothing else depends on it.

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('application','business','instrument','certificate')),
  entity_id uuid not null,
  doc_type text not null default 'supporting',
  storage_key text not null,
  file_name text,
  mime text,
  size_bytes int,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists documents_entity_idx on documents(entity_type, entity_id);
create index if not exists documents_uploader_idx on documents(uploaded_by);

alter table documents enable row level security;

drop policy if exists documents_read on documents;
create policy documents_read on documents for select
  using (uploaded_by = auth.uid() or current_role_name() in ('officer','gatc','allocator','admin'));

drop policy if exists documents_insert on documents;
create policy documents_insert on documents for insert
  with check (uploaded_by = auth.uid());

drop policy if exists documents_admin_all on documents;
create policy documents_admin_all on documents for all
  using (current_role_name() = 'admin')
  with check (current_role_name() = 'admin');

-- Private storage bucket for the files themselves. The API route uploads with
-- the service role and hands out short-lived signed URLs, so reads are gated by
-- the documents table RLS above.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists documents_upload on storage.objects;
create policy documents_upload on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and current_role_name() in ('trader','officer','gatc','allocator','admin')
  );

drop policy if exists documents_read_own on storage.objects;
create policy documents_read_own on storage.objects for select
  using (
    bucket_id = 'documents'
    and (owner = auth.uid() or current_role_name() in ('officer','gatc','allocator','admin'))
  );
