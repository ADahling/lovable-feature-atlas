
create table public.features (
  id text primary key,
  name text not null,
  category text not null,
  status text not null check (status in ('GA','Beta','Removed')),
  release_date date not null,
  pricing text not null default 'All plans',
  icon text not null default '✨',
  tagline text not null,
  description text not null,
  capabilities jsonb not null default '[]'::jsonb,
  use_cases jsonb not null default '[]'::jsonb,
  source text not null default 'lovable.dev/changelog',
  source_url text,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index features_release_date_idx on public.features (release_date desc);
create index features_status_idx on public.features (status);
create index features_category_idx on public.features (category);

alter table public.features enable row level security;

create policy "Public can read features"
  on public.features for select
  using (true);

create table public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','ok','failed','skipped')),
  source text not null,
  added_count integer not null default 0,
  scanned_count integer not null default 0,
  added_ids jsonb not null default '[]'::jsonb,
  error text
);

create index scrape_runs_started_at_idx on public.scrape_runs (started_at desc);

alter table public.scrape_runs enable row level security;

create policy "Public can read scrape runs"
  on public.scrape_runs for select
  using (true);
