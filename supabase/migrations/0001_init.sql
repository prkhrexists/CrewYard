create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  name text,
  college text,
  year text,
  major text,
  github_username text,
  github_verified boolean default false,
  reputation integer default 0,
  commits_this_week integer default 0,
  commits_change_percent numeric default 0,
  top_language text,
  top_language_percent numeric,
  avatar_url text,
  is_seed boolean default false,
  created_at timestamptz default now()
);

-- ASKS
create table asks (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id),
  type text check (type in ('help', 'teammate', 'build_log')),
  title text not null,
  details text not null,
  tags text[] default '{}',
  commits_this_month integer,
  is_seed boolean default false,
  created_at timestamptz default now()
);

-- COMMENTS
create table comments (
  id uuid default gen_random_uuid() primary key,
  ask_id uuid references asks(id) on delete cascade,
  author_id uuid references profiles(id),
  body text not null,
  is_seed boolean default false,
  created_at timestamptz default now()
);

-- LIKES
create table likes (
  id uuid default gen_random_uuid() primary key,
  ask_id uuid references asks(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(ask_id, user_id)
);

-- SAVES
create table saves (
  id uuid default gen_random_uuid() primary key,
  ask_id uuid references asks(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(ask_id, user_id)
);

-- GROUPS
create table groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  tags text[] default '{}',
  is_seed boolean default false,
  created_at timestamptz default now()
);

-- GROUP_MEMBERS
create table group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- CONVERSATIONS
create table conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now()
);

-- CONVERSATION_PARTICIPANTS
create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references profiles(id),
  primary key (conversation_id, user_id)
);

-- MESSAGES
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text not null,
  is_seed boolean default false,
  created_at timestamptz default now()
);

-- FUNCTION: handle_new_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, name, avatar_url)
  values (
    new.id,
    -- Provide a sane default username based on the email
    split_part(new.email, '@', 1),
    -- Handle name via raw_user_meta_data if available
    new.raw_user_meta_data->>'full_name',
    -- Handle avatar_url via raw_user_meta_data if available
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- TRIGGER: on_auth_user_created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
