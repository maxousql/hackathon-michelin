alter table public.tire_passports
  add column if not exists tire_brand text,
  add column if not exists tire_model text;

update public.tire_passports
set
  tire_brand = coalesce(
    tire_brand,
    case
      when tire_name ilike 'michelin %' then 'Michelin'
      else 'Autre'
    end
  ),
  tire_model = coalesce(
    tire_model,
    nullif(regexp_replace(tire_name, '^michelin\s+', '', 'i'), ''),
    tire_name
  )
where tire_brand is null
   or tire_model is null;

alter table public.tire_passports
  alter column tire_brand set not null,
  alter column tire_model set not null;

notify pgrst, 'reload schema';
