-- Shepherd OS — JIL Pinamalayan POR data schema
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Then run seed.sql (same way) to load the real data.
--
-- This stores the FULL monthly/demographic Periodic Operations Report
-- (Sep 2025 – Aug 2026) from JIL_Pinamalayan_POR_2025-2026.xlsx — every
-- number from all 5 sheets (TOTAL + Sta Rita, Lumambayan, Buli, Inclanay),
-- not just the simplified rollup currently shown in the app's mockData.js.
-- This is a separate, additional store — the live app still reads from
-- mockData.js until it's wired up to fetch from here (a follow-up step).

-- ---------------------------------------------------------------------
-- por_areas: the 5 sheets — TOTAL (church-wide rollup) + 4 real
-- operational areas, each an Extension Church that grew from life group
-- ministry.
-- ---------------------------------------------------------------------
create table if not exists por_areas (
  id bigint generated always as identity primary key,
  name text not null unique,              -- 'TOTAL', 'Sta Rita', 'Lumambayan', 'Buli', 'Inclanay'
  barangay_name text,                     -- matches barangays.name / pinamalayanBarangays.json for the 4 real areas; null for TOTAL
  is_extension_church boolean not null default false,
  is_total_rollup boolean not null default false
);

-- ---------------------------------------------------------------------
-- por_metrics: one row per metric LINE in the report (375 total) — e.g.
-- "Category 1 Membership / Men", "Finances / Tithes", "Life Group
-- Ministry / LG Attendance / Children". pya/aa/num_growth/pct_growth are
-- the report's own summary columns for that line; the actual month-by-
-- month numbers live in por_monthly_values below.
--
-- section/subsection are free text, not an enum, matching the report's
-- own section headers exactly:
--   sections: category1_membership, category2_membership,
--             sunday_attendance, first_timers, workers,
--             life_group_ministry, finances
--   subsections (life_group_ministry only): life_groups_count,
--             life_group_leaders, lg_membership, lg_attendance
-- demographic is one of: Men, Women, Young Adult, KKB, Children, Hetero,
--   or the section's own total-row label (e.g. "Total Membership",
--   "Total Workers") for rows that aren't broken out by demographic.
-- ---------------------------------------------------------------------
create table if not exists por_metrics (
  id bigint generated always as identity primary key,
  area_id bigint not null references por_areas (id) on delete cascade,
  section text not null,
  subsection text,
  label text not null,           -- the exact row label from the sheet, e.g. "Men", "Total Membership", "Tithes"
  pya numeric,                   -- Previous Year Average — used as the target baseline
  aa numeric,                    -- this period's Average/Actual
  num_growth numeric,
  pct_growth numeric,
  unique (area_id, section, subsection, label)
);

-- ---------------------------------------------------------------------
-- por_monthly_values: the actual month-by-month figures (4,500 rows =
-- 375 metrics × 12 months, Sep 2025 – Aug 2026). August is present with
-- value 0 across the board in the source file (not yet reported at
-- import time) — filter it out in queries if you want "reported months
-- only" behavior, same as the app's trend charts do.
-- ---------------------------------------------------------------------
create table if not exists por_monthly_values (
  id bigint generated always as identity primary key,
  metric_id bigint not null references por_metrics (id) on delete cascade,
  month date not null,           -- always the 1st of the month, e.g. 2025-09-01
  value numeric,
  unique (metric_id, month)
);

create index if not exists idx_por_monthly_values_month on por_monthly_values (month);
create index if not exists idx_por_metrics_area on por_metrics (area_id);
create index if not exists idx_por_metrics_section on por_metrics (section, subsection);

-- =======================================================================
-- Row Level Security — same starter posture as schema.sql: public read
-- via the anon key, no public write. Tighten before handling sensitive
-- real data at scale (e.g. restrict to authenticated leadership roles).
-- =======================================================================
alter table por_areas enable row level security;
alter table por_metrics enable row level security;
alter table por_monthly_values enable row level security;

create policy "public read por_areas" on por_areas for select using (true);
create policy "public read por_metrics" on por_metrics for select using (true);
create policy "public read por_monthly_values" on por_monthly_values for select using (true);
