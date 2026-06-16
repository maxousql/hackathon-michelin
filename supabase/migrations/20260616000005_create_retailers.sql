-- Revendeurs partenaires (« où acheter ») par région commerciale et pays.

create table if not exists public.retailers (
  id         uuid primary key default gen_random_uuid(),
  region     text not null,
  country    text not null,
  name       text not null,
  website    text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists retailers_region_country_idx
  on public.retailers (region, country);

-- Lecture publique : l'information « où acheter » est destinée à tous.
-- (Le service role utilisé par l'API NestJS bypasse la RLS.)
alter table public.retailers enable row level security;

create policy "public can read retailers"
  on public.retailers for select
  to anon, authenticated
  using (true);

insert into public.retailers (region, country, name, website) values
  ('EUN', 'UK', 'Tredz',            'https://www.tredz.co.uk'),
  ('EUN', 'UK', 'Biketart',         'https://www.biketart.com'),
  ('EUN', 'UK', 'Evans Cycles',     'https://www.evanscycles.com'),
  ('EUN', 'DE', 'Bike24',           'https://www.bike24.com'),
  ('EUN', 'DE', 'Bike-Components',  'https://www.bike-components.de'),
  ('EUN', 'DE', 'Amazon (DE)',      'https://www.amazon.de'),
  ('EUS', 'ES', 'Deporvillage',     'https://www.deporvillage.com'),
  ('EUS', 'NL', 'FuturumShop',      'https://www.futurumshop.nl'),
  ('EUS', 'IT', 'LordGun',          'https://www.lordgunbicycles.com'),
  ('ECA', 'PL', 'Centrum Rowerowe', 'https://www.centrumrowerowe.pl'),
  ('EUS', 'ES', 'Bikeinn',          'https://www.bikeinn.com'),
  ('EUS', 'BE', 'Van Eyck Sports',  'https://www.vaneycksports.be'),
  ('EUS', 'FR', 'Probikeshop',      'https://www.probikeshop.fr'),
  ('EUS', 'FR', 'Alltricks',        'https://www.alltricks.fr'),
  ('EUS', 'FR', 'Materiel-velo',    'https://www.materiel-velo.com')
on conflict (website) do nothing;
