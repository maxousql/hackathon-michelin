alter table public.saved_races
  add column if not exists bike_id uuid references public.bikes(id) on delete set null;

create index if not exists saved_races_bike_id_idx
  on public.saved_races (bike_id);

create table if not exists public.tire_passports (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  bike_id             uuid        not null references public.bikes(id) on delete cascade,
  product_id          integer,
  tire_brand          text        not null,
  tire_model          text        not null,
  tire_name           text        not null,
  tire_dimension      text,
  mounted_at          date        not null,
  mounted_distance_km integer     not null default 0 check (mounted_distance_km >= 0),
  reference_front_bar numeric(3,1) check (reference_front_bar is null or reference_front_bar > 0),
  reference_rear_bar  numeric(3,1) check (reference_rear_bar is null or reference_rear_bar > 0),
  status              text        not null default 'active'
                      check (status in ('active', 'replace-soon', 'retired')),
  created_at          timestamptz not null default now()
);

alter table public.tire_passports
  add column if not exists tire_brand text,
  add column if not exists tire_model text;

create index if not exists tire_passports_user_id_idx
  on public.tire_passports (user_id, created_at desc);

create index if not exists tire_passports_bike_id_idx
  on public.tire_passports (bike_id, created_at desc);

alter table public.tire_passports enable row level security;

create policy "users can read own tire_passports"
  on public.tire_passports for select using (auth.uid() = user_id);

create policy "users can insert own tire_passports"
  on public.tire_passports for insert with check (auth.uid() = user_id);

create policy "users can update own tire_passports"
  on public.tire_passports for update using (auth.uid() = user_id);

create policy "users can delete own tire_passports"
  on public.tire_passports for delete using (auth.uid() = user_id);
