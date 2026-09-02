-- ============================================================================
-- Wealth Flow — Supabase schema + Row-Level Security
-- Project: https://rkehlivramsxqjwliyzk.supabase.co
-- Run this whole file in the Supabase > SQL Editor.
--
-- Setup required in the dashboard BEFORE/after:
--   1. Authentication > Providers > "Email" = ON (for email/password login)
--   2. Authentication > Providers > "Google" = ON (add your Google OAuth creds)
--   3. Authentication > URL Configuration > Site URL = your app origin
--   4. Storage: none used. All data lives in Postgres tables below.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: one row per user (created automatically on sign-up via trigger)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  currency text not null default 'INR',
  total_budget_limit numeric not null default 0,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  category text,
  type text not null default 'expense',
  description text,
  payment_method text,
  date text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- budgets
-- ---------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  limit_amount numeric not null default 0,
  spent numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  bg_light text,
  icon_name text,
  budget numeric,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text,
  amount numeric not null default 0,
  currency text not null default 'INR',
  billing_cycle text not null default 'Monthly',
  start_date text,
  next_billing_date text,
  payment_method text,
  status text not null default 'Active',
  reminder_days int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notifications: per-user in-app notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  related_id text,
  related_type text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Automatic profile row on signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, photo_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row-Level Security — enable on every table, users only see their own rows
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.transactions  enable row level security;
alter table public.budgets       enable row level security;
alter table public.categories    enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- transactions
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- budgets
create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- categories
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- subscriptions
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions_delete_own" on public.subscriptions
  for delete using (auth.uid() = user_id);

-- notifications
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_insert_own" on public.notifications
  for insert with check (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Data API access: grant the authenticated role table privileges so PostgREST
-- exposes these tables. (Row access is still enforced by the RLS policies above.)
-- If your project's Data API auto-exposes new tables, these GRANTs are harmless.
-- ============================================================================
grant select, insert, update, delete on public.profiles      to authenticated;
grant select, insert, update, delete on public.transactions  to authenticated;
grant select, insert, update, delete on public.budgets       to authenticated;
grant select, insert, update, delete on public.categories    to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update on public.notifications         to authenticated;

-- ============================================================================
-- Realtime: expose the notifications table for live INSERT/UPDATE updates.
-- (Nos recommends adding this so the client channel receives push events.)
-- ============================================================================
alter publication supabase_realtime add table public.notifications;