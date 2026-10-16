create table if not exists public.saju_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  gender text not null check (gender in ('female', 'male', 'undisclosed')),
  birth_date date not null,
  calendar text not null check (calendar in ('solar', 'lunar')),
  leap_month boolean not null default false,
  birth_time time,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint lunar_leap_only check (calendar = 'lunar' or leap_month = false)
);

create unique index if not exists saju_profiles_one_default_per_user
  on public.saju_profiles (user_id)
  where is_default;

create index if not exists saju_profiles_user_created
  on public.saju_profiles (user_id, created_at);

alter table public.saju_profiles enable row level security;

drop policy if exists "Members can read their own saju profiles" on public.saju_profiles;
create policy "Members can read their own saju profiles"
  on public.saju_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members can add their own saju profiles" on public.saju_profiles;
create policy "Members can add their own saju profiles"
  on public.saju_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members can update their own saju profiles" on public.saju_profiles;
create policy "Members can update their own saju profiles"
  on public.saju_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members can delete their own saju profiles" on public.saju_profiles;
create policy "Members can delete their own saju profiles"
  on public.saju_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.saju_profiles to authenticated;
