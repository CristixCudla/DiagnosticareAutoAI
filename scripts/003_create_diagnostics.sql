-- Create diagnostics table
create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  symptoms text not null,
  ai_diagnosis text not null,
  ai_recommendations text,
  severity text,
  estimated_cost text,
  created_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists diagnostics_user_id_idx on public.diagnostics(user_id);
create index if not exists diagnostics_created_at_idx on public.diagnostics(created_at desc);

-- Enable RLS
alter table public.diagnostics enable row level security;

-- RLS Policies for diagnostics
create policy "diagnostics_select_own"
  on public.diagnostics for select
  using (auth.uid() = user_id);

create policy "diagnostics_insert_own"
  on public.diagnostics for insert
  with check (auth.uid() = user_id);

create policy "diagnostics_delete_own"
  on public.diagnostics for delete
  using (auth.uid() = user_id);
