-- Grant explicit table-level privileges so PostgREST can execute DML
-- even on tables not created via the Supabase dashboard.
grant all on public.profiles to service_role;
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;

-- Trigger: auto-create a profile row when a new auth.users row is inserted.
-- Uses SECURITY DEFINER so it runs as postgres (owner) and bypasses any RLS.
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'firstName', ''),
    coalesce(new.raw_user_meta_data ->> 'lastName', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
