alter table public.bikes
  add column if not exists tire_diameter text,
  add column if not exists tire_width text,
  add column if not exists tire_sealing text,
  add column if not exists riding_surface text not null default 'mixed',
  add column if not exists riding_priority text not null default 'versatility',
  add column if not exists is_ebike boolean not null default false;

do $$
begin
  alter table public.bikes
    add constraint bikes_tire_sealing_check
    check (
      tire_sealing is null
      or tire_sealing in ('TUBE TYPE', 'TUBELESS READY', 'TUBULAR')
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.bikes
    add constraint bikes_riding_surface_check
    check (riding_surface in ('smooth', 'mixed', 'loose', 'mud', 'urban'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.bikes
    add constraint bikes_riding_priority_check
    check (
      riding_priority in (
        'performance',
        'endurance',
        'grip',
        'durability',
        'versatility'
      )
    );
exception
  when duplicate_object then null;
end $$;
