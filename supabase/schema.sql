create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  roster text[] not null default '{}',
  owned_weapons text[] not null default '{}',
  enka_showcase jsonb not null default '{}'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  team_slot_preferences jsonb default null,
  updated_at timestamptz not null default now()
);

alter table public.player_profiles
  add column if not exists enka_showcase jsonb not null default '{}'::jsonb;

alter table public.player_profiles
  add column if not exists goals jsonb not null default '[]'::jsonb;

alter table public.player_profiles
  add column if not exists team_slot_preferences jsonb default null;

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

create table if not exists public.team_ai_daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.team_ai_daily_usage enable row level security;
revoke all on table public.team_ai_daily_usage from anon, authenticated;

create or replace function public.claim_team_ai_request()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_count integer;
begin
  if auth.uid() is null then
    return false;
  end if;

  insert into public.team_ai_daily_usage as daily_usage (user_id, usage_date, request_count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, usage_date)
  do update set request_count = daily_usage.request_count + 1
  where daily_usage.request_count < 5
  returning request_count into claimed_count;

  return claimed_count is not null;
end;
$$;

revoke all on function public.claim_team_ai_request() from public, anon;
grant execute on function public.claim_team_ai_request() to authenticated;

create or replace function public.release_team_ai_request()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.team_ai_daily_usage
  set request_count = request_count - 1
  where user_id = auth.uid()
    and usage_date = current_date
    and request_count > 0;
end;
$$;

revoke all on function public.release_team_ai_request() from public, anon;
grant execute on function public.release_team_ai_request() to authenticated;
