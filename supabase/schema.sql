-- Shepherd OS — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: uses "create table if not exists".

-- ---------------------------------------------------------------------
-- org_stats: single-row table of church-wide scalar figures
-- (membership counts, life group totals, barangay coverage totals).
-- ---------------------------------------------------------------------
create table if not exists org_stats (
  id smallint primary key default 1 check (id = 1), -- enforce single row
  total_members integer not null default 0,
  active_members integer not null default 0,
  new_members integer not null default 0,
  inactive_members integer not null default 0,
  membership_growth_pct numeric not null default 0,
  total_life_groups integer not null default 0,
  target_life_groups integer not null default 0,
  total_barangays integer not null default 0,
  barangays_reached integer not null default 0,
  reach_target_pct numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- funnel_stages: the first-timer funnel shown on People & Growth
-- ---------------------------------------------------------------------
create table if not exists funnel_stages (
  id bigint generated always as identity primary key,
  label text not null,
  count integer not null default 0,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------
-- kpis: generic KPI table used across Dashboard, People & Growth,
-- Life Groups, Outreach, Financial, and KPI Center.
-- "trend" holds the monthly sparkline/chart points as JSON:
--   [{"label": "May", "value": 380}, ...]
-- category is a free-text grouping label (e.g. "People & Growth",
-- "Life Groups", "Outreach", "Financial") — the KPI Center screen
-- groups cards by this value.
-- ---------------------------------------------------------------------
create table if not exists kpis (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  target numeric not null,
  actual numeric not null default 0,
  unit text not null default '',
  period text not null default 'This Month',
  trend jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- life_groups: individual small-group roster with headcount targets
-- ---------------------------------------------------------------------
create table if not exists life_groups (
  id bigint generated always as identity primary key,
  name text not null,
  district text not null,       -- church-defined ministry cluster (not an official LGU unit)
  barangay text not null,       -- real barangay name, should match barangays.name
  leader text not null,
  target_headcount integer not null default 0,
  actual_headcount integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- barangays: outreach stats per barangay of Pinamalayan.
-- NOTE: boundary polygon geometry is NOT stored here — it stays in the
-- static src/data/pinamalayanBarangays.json bundled with the app (real
-- PSGC administrative boundary data, doesn't change). This table only
-- holds the outreach STATS that should update over time. The two are
-- joined client-side by matching "name" exactly.
-- ---------------------------------------------------------------------
create table if not exists barangays (
  id bigint generated always as identity primary key,
  name text not null unique,     -- must match pinamalayanBarangays.json's adm4_en / "name"
  area text not null,             -- church-defined ministry cluster
  lat numeric not null,
  lng numeric not null,
  reached boolean not null default false,
  extension_church boolean not null default false, -- true for the real, established Extension Church areas (a life group that grew into a full congregation)
  population integer not null default 0,
  people_reached integer not null default 0,
  first_timers integer not null default 0,
  life_groups integer not null default 0,
  outreach_activities integer not null default 0,
  households_reached integer not null default 0,
  growth_pct numeric not null default 0
);

-- ---------------------------------------------------------------------
-- financial_categories: giving breakdown by fund
-- ---------------------------------------------------------------------
create table if not exists financial_categories (
  id bigint generated always as identity primary key,
  name text not null,
  target numeric not null,
  actual numeric not null default 0
);

-- ---------------------------------------------------------------------
-- attention_items: the Management Attention feed
-- severity must be one of the app's KPI_STATUS values.
-- ---------------------------------------------------------------------
create table if not exists attention_items (
  id bigint generated always as identity primary key,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('onTarget', 'attention', 'critical')),
  area text not null,
  created_at timestamptz not null default now()
);

-- =======================================================================
-- Row Level Security
-- =======================================================================
-- This starter config allows the public "anon" key to READ everything
-- (fine for an internal dashboard behind Vercel, no public sign-up flow)
-- and to INSERT new kpis (so the "New Target" form in KPI Center works
-- out of the box). Tighten this before handling sensitive real data —
-- e.g. require `auth.role() = 'authenticated'` once you add Supabase
-- Auth and a login screen, and restrict writes to specific roles.

alter table org_stats enable row level security;
alter table funnel_stages enable row level security;
alter table kpis enable row level security;
alter table life_groups enable row level security;
alter table barangays enable row level security;
alter table financial_categories enable row level security;
alter table attention_items enable row level security;

create policy "public read org_stats" on org_stats for select using (true);
create policy "public read funnel_stages" on funnel_stages for select using (true);
create policy "public read kpis" on kpis for select using (true);
create policy "public read life_groups" on life_groups for select using (true);
create policy "public read barangays" on barangays for select using (true);
create policy "public read financial_categories" on financial_categories for select using (true);
create policy "public read attention_items" on attention_items for select using (true);

-- Allow inserts from the anon key so the "New Target" form works without
-- auth. Remove/replace this once you add login.
create policy "public insert kpis" on kpis for insert with check (true);
