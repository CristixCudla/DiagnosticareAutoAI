-- Add is_admin column to profiles table
alter table public.profiles
add column if not exists is_admin boolean not null default false;

-- Update RLS policies to allow admins to view all profiles
drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ));

-- Update RLS policies to allow admins to view all subscriptions
drop policy if exists "subscriptions_select_own" on public.subscriptions;

create policy "subscriptions_select_own_or_admin"
  on public.subscriptions for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ));

-- Update RLS policies to allow admins to update all subscriptions
drop policy if exists "subscriptions_update_own" on public.subscriptions;

create policy "subscriptions_update_own_or_admin"
  on public.subscriptions for update
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ));
