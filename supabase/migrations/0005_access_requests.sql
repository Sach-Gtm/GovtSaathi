-- Access requests + role-change guard, so admins grant roles from the UI.

alter table profiles add column if not exists requested_role user_role;
alter table profiles add column if not exists access_note text;
alter table profiles add column if not exists requested_at timestamptz;

-- Prevent a non-admin from changing their own role (self-update policy has no
-- column check, so without this a user could self-promote). Admins still change
-- roles freely via profiles_admin_write. Signup INSERTs are unaffected.
create or replace function guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and coalesce(current_role_name()::text, '') <> 'admin' then
    raise exception 'Only an administrator can change a role';
  end if;
  -- Only an admin may flip is_active
  if new.is_active is distinct from old.is_active and coalesce(current_role_name()::text, '') <> 'admin' then
    raise exception 'Only an administrator can change active status';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on profiles;
create trigger profiles_role_guard before update on profiles
  for each row execute function guard_profile_role();
