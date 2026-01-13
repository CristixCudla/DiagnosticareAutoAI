-- Create subscription tiers enum
create type subscription_tier as enum ('free', 'standard', 'premium');

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier subscription_tier not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  free_diagnostics_used integer not null default 0,
  free_diagnostics_limit integer not null default 15,
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Trigger to auto-create subscription on profile creation
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, tier, free_diagnostics_used, free_diagnostics_limit)
  values (new.id, 'free', 0, 15)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;

create trigger on_profile_created
  after insert on public.profiles
  for each row
  execute function public.handle_new_subscription();
