create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  roster text[] not null default '{}',
  owned_weapons text[] not null default '{}',
  enka_showcase jsonb not null default '{}'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.player_profiles
  add column if not exists enka_showcase jsonb not null default '{}'::jsonb;

alter table public.player_profiles
  add column if not exists goals jsonb not null default '[]'::jsonb;

alter table public.player_profiles enable row level security;

revoke all on table public.player_profiles from anon, authenticated;
grant select, insert, update on table public.player_profiles to authenticated;

drop policy if exists "Players can read their own profile" on public.player_profiles;
create policy "Players can read their own profile"
  on public.player_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Players can create their own profile" on public.player_profiles;
create policy "Players can create their own profile"
  on public.player_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own profile" on public.player_profiles;
create policy "Players can update their own profile"
  on public.player_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
