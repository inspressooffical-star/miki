-- 회원 이름·성별 저장 + 명식 중복 저장 방지.
-- 기존 saju_profiles 데이터는 삭제·변경하지 않고, 여러 번 실행해도 안전하게 작성했어.
-- 실행 순서: 1) schema.sql (이미 적용했다면 생략)  2) 이 파일

-- 1) 계정 정보 (명식과 별개로 관리)
create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  gender text not null default 'undisclosed' check (gender in ('female', 'male', 'undisclosed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_profiles enable row level security;

drop policy if exists "member_profiles_select_own" on public.member_profiles;
drop policy if exists "member_profiles_insert_own" on public.member_profiles;
drop policy if exists "member_profiles_update_own" on public.member_profiles;
drop policy if exists "member_profiles_delete_own" on public.member_profiles;

create policy "member_profiles_select_own" on public.member_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "member_profiles_insert_own" on public.member_profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "member_profiles_update_own" on public.member_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "member_profiles_delete_own" on public.member_profiles
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.member_profiles to authenticated;

-- 2) 가입 시 입력한 이름·성별(raw_user_meta_data)을 자동으로 복사. 실패해도 가입은 막지 않아.
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
  v_gender text := coalesce(new.raw_user_meta_data ->> 'gender', 'undisclosed');
begin
  if v_name is not null then
    if v_gender not in ('female', 'male', 'undisclosed') then
      v_gender := 'undisclosed';
    end if;
    insert into public.member_profiles (user_id, display_name, gender)
    values (new.id, left(v_name, 40), v_gender)
    on conflict (user_id) do nothing;
  end if;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_member on auth.users;
create trigger on_auth_user_created_member
  after insert on auth.users
  for each row execute function public.handle_new_member();

-- 3) 명식 중복 저장 방지용 클라이언트 키 (기존 행은 null 그대로 유지)
alter table public.saju_profiles add column if not exists client_key uuid;

create unique index if not exists saju_profiles_user_client_key
  on public.saju_profiles (user_id, client_key)
  where client_key is not null;
