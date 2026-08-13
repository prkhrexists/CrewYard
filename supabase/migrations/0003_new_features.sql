-- 0003_new_features.sql

-- 1. SIGNALS
create table if not exists signals (
  id            uuid default gen_random_uuid() primary key,
  type          text check (type in (''release'',''project'',''article'',''event'')) not null,
  category      text not null,
  title         text not null,
  summary       text not null,
  why_it_matters text,
  source        text,
  source_url    text,
  published_at  timestamptz default now(),
  tags          text[] default '{}',
  author        text,
  featured      boolean default false,
  metrics       text,
  is_seed       boolean default false,
  created_at    timestamptz default now()
);

-- 2. PROFILES extra columns
alter table profiles
  add column if not exists city                 text,
  add column if not exists bio                  text,
  add column if not exists availability         text default 'OPEN TO BUILD',
  add column if not exists skills               text[] default '{}',
  add column if not exists looking_for          text[] default '{}',
  add column if not exists looking_for_details  text,
  add column if not exists currently_building   text,
  add column if not exists technologies         text[] default '{}',
  add column if not exists goals                text[] default '{}',
  add column if not exists preferred_cadence    text,
  add column if not exists activity_status      text default 'active-this-week',
  add column if not exists campus_pod           text,
  add column if not exists building             jsonb,
  add column if not exists projects             jsonb default '[]'::jsonb,
  add column if not exists reputation_history   jsonb default '[]'::jsonb;

-- 3. GROUPS extra JSONB columns
alter table groups
  add column if not exists category             text default 'other',
  add column if not exists member_ids           text[] default '{}',
  add column if not exists open_asks            integer default 0,
  add column if not exists active_builders      integer default 0,
  add column if not exists active_this_week     boolean default false,
  add column if not exists pinned_announcement  jsonb,
  add column if not exists discussions          jsonb default '[]'::jsonb,
  add column if not exists recent_builds        jsonb default '[]'::jsonb,
  add column if not exists resources            jsonb default '[]'::jsonb,
  add column if not exists ask_ids              text[] default '{}';

-- 4. CREW_MEMBERS
create table if not exists crew_members (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade,
  builder_id  uuid references profiles(id) on delete cascade,
  context     text,
  last_active text,
  created_at  timestamptz default now(),
  unique(user_id, builder_id)
);
