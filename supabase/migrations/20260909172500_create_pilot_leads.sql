create table if not exists public.pilot_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  organization text,
  email text not null,
  phone text,
  lead_type text not null default 'business' check (lead_type in ('business','validator','mentor','intro','investor')),
  message text,
  source text not null default 'stl-pilot-page',
  reviewed_at timestamptz,
  archived_at timestamptz
);

alter table public.pilot_leads enable row level security;

create policy if not exists "pilot_leads_public_insert"
  on public.pilot_leads
  for insert
  to anon, authenticated
  with check (
    length(trim(name)) > 0
    and position('@' in email) > 1
    and lead_type in ('business','validator','mentor','intro','investor')
  );

-- Read access stays service-role/admin-console only until the active owner/admin
-- capability table is finalized in the canonical app schema.

create index if not exists pilot_leads_created_at_idx on public.pilot_leads (created_at desc);
create index if not exists pilot_leads_lead_type_idx on public.pilot_leads (lead_type, created_at desc);
