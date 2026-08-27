-- Shepherd OS — Auth & Roles schema
-- Run this AFTER schema.sql and seed.sql, in Supabase Dashboard → SQL Editor.
--
-- Sets up four leadership roles matching the org hierarchy:
--   life_group_leader  → sees only their own life group
--   barangay_leader     → sees all life groups + the barangay row for their barangay
--   district_leader      → sees all life groups + barangays in their ministry area
--   senior_leadership    → sees everything (all tables, unrestricted)
--
-- Accounts are admin-created (see "Creating a leader account" in the README)
-- — there is no public self-signup. A new signed-up/invited user gets a
-- blank `profiles` row automatically (via the trigger below) with role NULL
-- ("pending"); an admin must then run an UPDATE to assign their role+scope
-- before they can see any data.

create type user_role as enum ('life_group_leader', 'barangay_leader', 'district_leader', 'senior_leadership');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role user_role, -- null = pending, awaiting admin assignment
  life_group_id bigint references life_groups (id),  -- required for life_group_leader
  barangay_name text references barangays (name),     -- required for barangay_leader
  district text,                                      -- required for district_leader (matches life_groups.district / barangays.area)
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Everyone can read their own profile (needed so the app can look up its
-- own role after login); senior_leadership can read/manage all profiles.
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "senior reads all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'senior_leadership')
);
create policy "senior manages profiles" on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'senior_leadership')
);

-- Auto-create a blank profile row whenever a new auth user is created
-- (whether via admin invite or, if you ever enable it, self-signup).
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- Helper: is the current user senior leadership? (used everywhere below)
-- ---------------------------------------------------------------------
create or replace function is_senior()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'senior_leadership'
  );
$$ language sql security definer stable;

create or replace function current_profile()
returns profiles as $$
  select * from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ---------------------------------------------------------------------
-- Replace the earlier "public read" policies (from schema.sql) with
-- role-scoped ones now that auth exists. Drop the old permissive ones
-- first.
-- ---------------------------------------------------------------------
drop policy if exists "public read org_stats" on org_stats;
drop policy if exists "public read funnel_stages" on funnel_stages;
drop policy if exists "public read kpis" on kpis;
drop policy if exists "public insert kpis" on kpis;
drop policy if exists "public read life_groups" on life_groups;
drop policy if exists "public read barangays" on barangays;
drop policy if exists "public read financial_categories" on financial_categories;
drop policy if exists "public read attention_items" on attention_items;

-- Church-wide figures & money: senior leadership only.
create policy "senior reads org_stats" on org_stats for select using (is_senior());
create policy "senior reads funnel_stages" on funnel_stages for select using (is_senior());
create policy "senior reads kpis" on kpis for select using (is_senior());
create policy "senior inserts kpis" on kpis for insert with check (is_senior());
create policy "senior reads financial_categories" on financial_categories for select using (is_senior());
create policy "senior reads attention_items" on attention_items for select using (is_senior());

-- life_groups: scoped by role.
create policy "scoped read life_groups" on life_groups for select using (
  is_senior()
  or (select role from profiles where id = auth.uid()) = 'district_leader'
     and district = (select district from profiles where id = auth.uid())
  or (select role from profiles where id = auth.uid()) = 'barangay_leader'
     and barangay = (select barangay_name from profiles where id = auth.uid())
  or (select role from profiles where id = auth.uid()) = 'life_group_leader'
     and id = (select life_group_id from profiles where id = auth.uid())
);

-- barangays: scoped by role. Life group leaders can see the barangay row
-- their own group belongs to (read-only context), not the full list.
create policy "scoped read barangays" on barangays for select using (
  is_senior()
  or (select role from profiles where id = auth.uid()) = 'district_leader'
     and area = (select district from profiles where id = auth.uid())
  or (select role from profiles where id = auth.uid()) = 'barangay_leader'
     and name = (select barangay_name from profiles where id = auth.uid())
  or (select role from profiles where id = auth.uid()) = 'life_group_leader'
     and name = (
       select barangay from life_groups
       where id = (select life_group_id from profiles where id = auth.uid())
     )
);
