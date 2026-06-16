-- Table publique liée à auth.users (1-to-1)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  first_name text    not null,
  last_name  text    not null,
  bike_type  text    not null default 'road' check (bike_type in ('road', 'mtb', 'gravel')),
  level      text    not null default 'beginner' check (level in ('beginner', 'intermediate', 'expert')),
  weight_kg  numeric(5, 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS : chaque utilisateur ne voit que son propre profil
alter table public.profiles enable row level security;

create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Le service role (backend NestJS) peut tout faire
-- Aucune policy nécessaire : le service role bypass RLS par défaut
