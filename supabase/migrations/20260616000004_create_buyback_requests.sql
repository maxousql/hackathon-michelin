-- Programme de reprise (seconde main) : un utilisateur déclare un pneu usagé
-- que MICHELIN rachète pour le remettre à neuf / recycler.

create table if not exists public.buyback_requests (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  product_id           bigint references public.michelin_products (id),
  product_label        text not null,
  segment              text,
  condition            text not null
                         check (condition in ('new', 'very_good', 'good', 'fair')),
  quantity             integer not null default 1 check (quantity > 0),
  estimated_amount_eur numeric(10, 2) not null check (estimated_amount_eur >= 0),
  status               text not null default 'pending'
                         check (status in ('pending', 'accepted', 'received', 'paid', 'rejected')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists buyback_requests_user_id_idx
  on public.buyback_requests (user_id, created_at desc);

-- Réutilise la fonction définie par la migration des profils.
create trigger buyback_requests_updated_at
  before update on public.buyback_requests
  for each row execute procedure public.set_updated_at();

-- RLS : chaque utilisateur ne voit/crée que ses propres demandes.
-- (Le service role utilisé par l'API NestJS bypasse la RLS.)
alter table public.buyback_requests enable row level security;

create policy "users read own buyback requests"
  on public.buyback_requests for select
  using (auth.uid() = user_id);

create policy "users create own buyback requests"
  on public.buyback_requests for insert
  with check (auth.uid() = user_id);
