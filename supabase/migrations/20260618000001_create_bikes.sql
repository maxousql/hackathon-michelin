create table if not exists public.bikes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  type        text        not null default 'road'
                check (type in ('road', 'mtb', 'gravel')),
  distance_km integer     not null default 0,
  is_primary  boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table public.bikes enable row level security;

create policy "users can read own bikes"
  on public.bikes for select using (auth.uid() = user_id);

create policy "users can insert own bikes"
  on public.bikes for insert with check (auth.uid() = user_id);

create policy "users can update own bikes"
  on public.bikes for update using (auth.uid() = user_id);

create policy "users can delete own bikes"
  on public.bikes for delete using (auth.uid() = user_id);
