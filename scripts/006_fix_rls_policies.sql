-- Drop the problematic policies that cause infinite recursion
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
drop policy if exists "subscriptions_update_own_or_admin" on public.subscriptions;

-- Recreate profiles policy without recursion
create policy "profiles_select_policy"
  on public.profiles for select
  using (
    auth.uid() = id 
    or 
    is_admin = true
  );

-- Recreate subscriptions policies without recursion
create policy "subscriptions_select_policy"
  on public.subscriptions for select
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

create policy "subscriptions_update_policy"
  on public.subscriptions for update
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

-- Add policy for admins to update any profile
create policy "profiles_update_policy"
  on public.profiles for update
  using (
    auth.uid() = id
    or
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() 
      and p.is_admin = true
    )
  );

-- Ensure subscription is created for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  insert into public.subscriptions (user_id, tier, is_active, free_diagnostics_used, free_diagnostics_limit)
  values (new.id, 'free', true, 0, 15);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger if it doesn't exist
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
