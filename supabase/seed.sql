-- Shepherd OS — seed data
-- Auto-generated from src/data/mockData.js — do not hand-edit, regenerate instead
-- via: node supabase/generate-seed.js
-- Run this AFTER schema.sql, in Supabase Dashboard → SQL Editor.

-- Clear existing rows first (safe to re-run this whole file)
truncate table org_stats, funnel_stages, kpis, life_groups, barangays, financial_categories, attention_items restart identity;

insert into org_stats (id, total_members, active_members, new_members, inactive_members, membership_growth_pct, total_life_groups, target_life_groups, total_barangays, barangays_reached, reach_target_pct) values
  (1, 920, 754, 43, 166, 0.3, 74, 74, 37, 23, 70);

insert into funnel_stages (label, count, sort_order) values
  ('Evangelized', 15, 0),
  ('Pre-Encounter', 0, 1),
  ('Encounter', 0, 2),
  ('Post-Encounter', 0, 3),
  ('Water Baptized', 0, 4);

insert into kpis (name, category, target, actual, unit, period, trend) values
  ('Average Weekly Attendance', 'People & Growth', 297, 249, '', 'This Month', '[{"label":"Apr","value":233},{"label":"May","value":287},{"label":"Jun","value":261},{"label":"Jul","value":255}]'::jsonb),
  ('First Timers', 'People & Growth', 382, 333, '', 'This Month', '[{"label":"Apr","value":36},{"label":"May","value":33},{"label":"Jun","value":39},{"label":"Jul","value":43}]'::jsonb),
  ('Life Group Headcount', 'Life Groups', 802, 756, '', 'This Month', '[{"label":"Apr","value":756},{"label":"May","value":756},{"label":"Jun","value":756},{"label":"Jul","value":756}]'::jsonb),
  ('Geographic Coverage', 'Outreach', 70, 62.16216216216216, '%', 'This Month', '[{"label":"Apr","value":43},{"label":"May","value":46},{"label":"Jun","value":54},{"label":"Jul","value":62}]'::jsonb),
  ('Overall Giving', 'Financial', 1909014, 1704171, '₱', 'This Month', '[{"label":"Apr","value":150151},{"label":"May","value":188255},{"label":"Jun","value":151482},{"label":"Jul","value":144924}]'::jsonb);

insert into life_groups (name, district, barangay, leader, target_headcount, actual_headcount) values
  ('Sta. Rita', 'Extension Church', 'Sta. Rita', '57 Groups', 582, 535),
  ('Lumambayan', 'Extension Church', 'Lumambayan', '5 Groups', 60, 60),
  ('Buli', 'Extension Church', 'Buli', '5 Groups', 60, 61),
  ('Inclanay', 'Extension Church', 'Inclanay', '7 Groups', 100, 100);

insert into barangays (name, area, lat, lng, reached, extension_church, population, people_reached, first_timers, life_groups, outreach_activities, households_reached, growth_pct) values
  ('Anoling', 'Central Cluster', 13.02844, 121.50704, false, false, 1927, 0, 0, 0, 0, 0, 0),
  ('Bacungan', 'Central Cluster', 13.04962, 121.49128, false, false, 1593, 0, 0, 0, 0, 0, 0),
  ('Bangbang', 'South Cluster', 13.01607, 121.48107, false, false, 1044, 0, 0, 0, 0, 0, 0),
  ('Banilad', 'South Cluster', 13.00312, 121.50916, false, false, 1933, 0, 0, 0, 0, 0, 0),
  ('Buli', 'Central Cluster', 13.04076, 121.5209, true, true, 1348, 61, 89, 5, 0, 0, 1.7),
  ('Cacawan', 'Central Cluster', 13.03691, 121.48288, true, false, 6736, 169, 15, 1, 6, 47, -1),
  ('Calingag', 'Central Cluster', 13.02784, 121.46058, false, false, 1984, 0, 0, 0, 0, 0, 0),
  ('Delrazon', 'North Cluster', 13.09099, 121.45629, false, false, 1494, 0, 0, 0, 0, 0, 0),
  ('Guinhawa', 'North Cluster', 13.06451, 121.49861, true, false, 2236, 76, 12, 0, 1, 25, -2),
  ('Inclanay', 'South Cluster', 12.98358, 121.52359, true, true, 2085, 100, 22, 7, 1, 27, 0),
  ('Lumambayan', 'Central Cluster', 13.03025, 121.50298, true, true, 2705, 60, 55, 5, 5, 42, 0),
  ('Malaya', 'Central Cluster', 13.01735, 121.49154, false, false, 935, 0, 0, 0, 0, 0, 0),
  ('Maliangcog', 'Central Cluster', 13.04171, 121.51513, false, false, 1585, 0, 0, 0, 0, 0, 0),
  ('Maningcol', 'South Cluster', 12.99523, 121.50592, false, false, 1800, 0, 0, 0, 0, 0, 0),
  ('Marayos', 'Central Cluster', 13.02926, 121.47022, true, false, 1751, 68, 7, 0, 1, 20, -8),
  ('Marfrancisco', 'Central Cluster', 13.02478, 121.4748, true, false, 6079, 276, 35, 1, 1, 92, 19),
  ('Nabuslot', 'South Cluster', 12.99108, 121.51787, true, false, 2853, 58, 10, 0, 1, 16, 10),
  ('Pagalagala', 'North Cluster', 13.07027, 121.49103, false, false, 1228, 0, 0, 0, 0, 0, 0),
  ('Palayan', 'South Cluster', 12.99821, 121.47788, true, false, 1957, 87, 10, 0, 1, 26, -3),
  ('Pambisan Malaki', 'Central Cluster', 13.02493, 121.51468, false, false, 1838, 0, 0, 0, 0, 0, 0),
  ('Pambisan Munti', 'North Cluster', 13.07107, 121.49777, false, false, 1109, 0, 0, 0, 0, 0, 0),
  ('Panggulayan', 'Central Cluster', 13.02191, 121.45936, true, false, 2789, 95, 12, 0, 5, 29, -8),
  ('Papandayan', 'Central Cluster', 13.04814, 121.51185, true, false, 6912, 233, 34, 1, 6, 72, 28),
  ('Pili', 'Central Cluster', 13.03356, 121.49008, true, false, 3937, 130, 18, 0, 4, 37, -2),
  ('Quinabigan', 'Central Cluster', 13.04975, 121.50132, true, false, 2455, 75, 7, 0, 6, 21, -7),
  ('Ranzo', 'Central Cluster', 13.02056, 121.51445, false, false, 924, 0, 0, 0, 0, 0, 0),
  ('Rosario', 'Central Cluster', 13.01806, 121.46796, true, false, 1735, 74, 7, 0, 2, 24, 16),
  ('Sabang', 'Central Cluster', 13.02966, 121.5129, true, false, 2945, 103, 14, 0, 3, 33, 13),
  ('Sta. Isabel', 'South Cluster', 13.00388, 121.46856, true, false, 2901, 141, 16, 0, 5, 46, 10),
  ('Sta. Maria', 'South Cluster', 12.98721, 121.46882, false, false, 1504, 0, 0, 0, 0, 0, 0),
  ('Sta. Rita', 'Central Cluster', 13.04069, 121.45522, true, true, 3028, 699, 167, 57, 6, 40, 0.4),
  ('Sto. Niño', 'South Cluster', 13.00101, 121.46035, true, false, 1277, 35, 4, 0, 5, 10, 6),
  ('Wawa', 'South Cluster', 13.0039, 121.50008, true, false, 4764, 140, 21, 1, 5, 42, 10),
  ('Zone I', 'Poblacion', 13.03846, 121.48044, true, false, 2957, 135, 21, 2, 2, 37, 3),
  ('Zone II', 'Poblacion', 13.00606, 121.49089, true, false, 2994, 77, 13, 2, 1, 22, 26),
  ('Zone III', 'Poblacion', 13.01274, 121.51699, true, false, 2029, 94, 9, 0, 4, 26, -12),
  ('Zone IV', 'Poblacion', 12.99619, 121.49142, true, false, 1012, 30, 3, 0, 5, 9, 18);

insert into financial_categories (name, target, actual) values
  ('Tithes', 1646874, 1512518),
  ('Offerings', 262140, 191653),
  ('Mission Offering', 38833, 32530),
  ('Pledges', 32601, 30509);

insert into attention_items (title, detail, severity, area) values
  ('Hetero life group membership down 70%', 'Hetero LG membership fell from 113 (PYA) to 34 (AA) — the steepest decline of any life group segment.', 'critical', 'Life Groups'),
  ('0 of 15 evangelized moved into Encounter', 'PreEncounter, Encounter, and Post-Encounter are all at 0 this period despite 15 people evangelized — the discipleship pipeline has stalled after first contact.', 'critical', 'Evangelism'),
  ('Sunday attendance down 16% year over year', 'Average weekly attendance fell from 297 (PYA) to 249 (AA); Children’s attendance dropped the most, down 31%.', 'attention', 'People & Growth'),
  ('Tithes & Offering down 11% vs last year', '₱1,704,171 recorded this period vs ₱1,909,014 (PYA) — Offerings specifically down 27%.', 'attention', 'Financial'),
  ('Volunteer workers grew from 146 to 158', 'Total workers up from 176 to 188 (+7%), driven entirely by volunteer growth — full-time and part-time counts held steady.', 'onTarget', 'People & Growth');
