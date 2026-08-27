import { supabase } from './supabaseClient'
import boundaries from './pinamalayanBarangays.json'

export const KPI_STATUS = {
  ON_TARGET: 'onTarget',
  ATTENTION: 'attention',
  CRITICAL: 'critical',
}

export function statusFromAchievement(pct) {
  if (pct >= 100) return KPI_STATUS.ON_TARGET
  if (pct >= 80) return KPI_STATUS.ATTENTION
  return KPI_STATUS.CRITICAL
}

export const STATUS_META = {
  [KPI_STATUS.ON_TARGET]: { label: 'On Target', fg: 'var(--status-on-target)', bg: 'var(--status-on-target-bg)' },
  [KPI_STATUS.ATTENTION]: { label: 'Needs Attention', fg: 'var(--status-attention)', bg: 'var(--status-attention-bg)' },
  [KPI_STATUS.CRITICAL]: { label: 'Critical', fg: 'var(--status-critical)', bg: 'var(--status-critical-bg)' },
}

function achievementPct(actual, target) {
  return target === 0 ? 0 : (actual / target) * 100
}

function momChangePct(trend) {
  if (!trend || trend.length < 2) return null
  const prev = trend[trend.length - 2].value
  const curr = trend[trend.length - 1].value
  if (prev === 0) return null
  return ((curr - prev) / prev) * 100
}

function hydrateKpi(row) {
  const target = Number(row.target)
  const actual = Number(row.actual)
  const pct = achievementPct(actual, target)
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    target,
    actual,
    unit: row.unit,
    period: row.period,
    trend: row.trend || [],
    achievementPct: pct,
    variance: actual - target,
    status: statusFromAchievement(pct),
    momChangePct: momChangePct(row.trend),
  }
}

function hydrateLifeGroup(row) {
  const pct = achievementPct(row.actual_headcount, row.target_headcount)
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    barangay: row.barangay,
    leader: row.leader,
    targetHeadcount: row.target_headcount,
    actualHeadcount: row.actual_headcount,
    achievementPct: pct,
    status: statusFromAchievement(pct),
  }
}

function hydrateBarangay(row) {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    lat: Number(row.lat),
    lng: Number(row.lng),
    reached: row.reached,
    extensionChurch: row.extension_church,
    population: row.population,
    peopleReached: row.people_reached,
    firstTimers: row.first_timers,
    lifeGroups: row.life_groups,
    outreachActivities: row.outreach_activities,
    householdsReached: row.households_reached,
    growthPct: Number(row.growth_pct),
  }
}

function hydrateFinancialCategory(row) {
  const pct = achievementPct(row.actual, row.target)
  return {
    id: row.id,
    name: row.name,
    target: Number(row.target),
    actual: Number(row.actual),
    achievementPct: pct,
    variance: row.actual - row.target,
    status: statusFromAchievement(pct),
  }
}

/**
 * Fetches every dataset the app needs in parallel and returns it already
 * shaped/computed exactly like the old static mockData.js did, so screens
 * barely had to change when this replaced it. Throws on any failure —
 * callers (DataContext) are expected to catch and surface an error state.
 */
export async function fetchAppData() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured yet. Copy .env.example to .env.local, fill in your Supabase project URL and anon key, then restart the dev server (or redeploy).',
    )
  }
  const [orgStatsRes, funnelRes, kpisRes, lifeGroupsRes, barangaysRes, financialRes, attentionRes] = await Promise.all([
    supabase.from('org_stats').select('*').eq('id', 1).single(),
    supabase.from('funnel_stages').select('*').order('sort_order'),
    supabase.from('kpis').select('*').order('id'),
    supabase.from('life_groups').select('*').order('id'),
    supabase.from('barangays').select('*').order('name'),
    supabase.from('financial_categories').select('*').order('id'),
    supabase.from('attention_items').select('*').order('id'),
  ])

  for (const [label, res] of [
    ['org_stats', orgStatsRes],
    ['funnel_stages', funnelRes],
    ['kpis', kpisRes],
    ['life_groups', lifeGroupsRes],
    ['barangays', barangaysRes],
    ['financial_categories', financialRes],
    ['attention_items', attentionRes],
  ]) {
    if (res.error) throw new Error(`Failed to load ${label}: ${res.error.message}`)
  }

  const orgStats = orgStatsRes.data
  const kpis = kpisRes.data.map(hydrateKpi)
  const byName = Object.fromEntries(kpis.map((k) => [k.name, k]))

  const lifeGroups = lifeGroupsRes.data.map(hydrateLifeGroup)
  const dbBarangays = barangaysRes.data.map(hydrateBarangay)

  // Cross-check: warn (don't crash) if a barangay in the DB doesn't have a
  // matching polygon in the static boundary file, or vice versa — this is
  // the kind of silent join mismatch that's easy to introduce by typo.
  const boundaryNames = new Set(boundaries.features.map((f) => f.properties.name))
  const dbNames = new Set(dbBarangays.map((b) => b.name))
  for (const name of dbNames) {
    if (!boundaryNames.has(name)) {
      console.warn(`Barangay "${name}" exists in Supabase but has no matching boundary polygon.`)
    }
  }

  const financialCategories = financialRes.data.map(hydrateFinancialCategory)

  const attentionItems = attentionRes.data.map((row) => ({
    id: row.id,
    title: row.title,
    detail: row.detail,
    severity: row.severity,
    area: row.area,
  }))

  return {
    // People & Growth
    totalMembers: orgStats.total_members,
    activeMembers: orgStats.active_members,
    newMembers: orgStats.new_members,
    inactiveMembers: orgStats.inactive_members,
    membershipGrowthPct: Number(orgStats.membership_growth_pct),
    attendanceKpi: byName['Average Weekly Attendance'],
    firstTimersKpi: byName['First Timers'],
    firstTimerFunnel: funnelRes.data.map((f) => ({ label: f.label, count: f.count })),

    // Life Groups
    lifeGroups,
    lifeGroupHeadcountKpi: byName['Life Group Headcount'],
    totalLifeGroups: orgStats.total_life_groups,
    targetLifeGroups: orgStats.target_life_groups,

    // Geographic Reach
    barangays: dbBarangays,
    totalBarangays: orgStats.total_barangays,
    barangaysReached: orgStats.barangays_reached,
    reachTargetPct: Number(orgStats.reach_target_pct),
    geographicCoverageKpi: byName['Geographic Coverage'],

    // Financial
    financialCategories,
    financialKpi: byName['Overall Giving'],

    // Management Attention
    attentionItems,

    // All KPIs (for KPI Center)
    allKpis: kpis,

    // Dashboard roll-ups
    lifeGroupAchievementPct: achievementPct(byName['Life Group Headcount'].actual, byName['Life Group Headcount'].target),
    firstTimerAchievementPct: achievementPct(byName['First Timers'].actual, byName['First Timers'].target),
    financialAchievementPct: achievementPct(byName['Overall Giving'].actual, byName['Overall Giving'].target),
    reachAchievementPct: achievementPct(byName['Geographic Coverage'].actual, byName['Geographic Coverage'].target),
  }
}

/** Inserts a new KPI target (used by the KPI Center "New Target" form). */
export async function createKpiTarget({ name, category, target, frequency }) {
  if (!supabase) {
    throw new Error('Supabase is not configured yet — see .env.example.')
  }
  const { data, error } = await supabase
    .from('kpis')
    .insert({
      name,
      category,
      target: Number(target) || 0,
      actual: 0,
      unit: '',
      period: frequency,
      trend: [],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return hydrateKpi(data)
}

export function peso(v) {
  const s = Math.round(v).toString()
  return '₱' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function commas(v) {
  const s = Math.round(v).toString()
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ---------------------------------------------------------------------
// Admin Console — create/update/delete functions.
// Every function throws a plain Error with a readable message on
// failure (never a raw Supabase error object) so form UIs can just do
// `catch (err) { setError(err.message) }` without special-casing.
// ---------------------------------------------------------------------

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured yet — see .env.example.')
}

/** Updates the single org_stats row (People & Growth + roll-up totals). */
export async function updateOrgStats(fields) {
  requireSupabase()
  const payload = {}
  if (fields.totalMembers != null) payload.total_members = Number(fields.totalMembers)
  if (fields.activeMembers != null) payload.active_members = Number(fields.activeMembers)
  if (fields.newMembers != null) payload.new_members = Number(fields.newMembers)
  if (fields.inactiveMembers != null) payload.inactive_members = Number(fields.inactiveMembers)
  if (fields.membershipGrowthPct != null) payload.membership_growth_pct = Number(fields.membershipGrowthPct)
  if (fields.totalLifeGroups != null) payload.total_life_groups = Number(fields.totalLifeGroups)
  if (fields.targetLifeGroups != null) payload.target_life_groups = Number(fields.targetLifeGroups)
  if (fields.totalBarangays != null) payload.total_barangays = Number(fields.totalBarangays)
  if (fields.barangaysReached != null) payload.barangays_reached = Number(fields.barangaysReached)
  if (fields.reachTargetPct != null) payload.reach_target_pct = Number(fields.reachTargetPct)

  const { error } = await supabase.from('org_stats').update(payload).eq('id', 1)
  if (error) throw new Error(error.message)
}

/** Creates a new life group. */
export async function createLifeGroup({ name, district, barangay, leader, targetHeadcount, actualHeadcount }) {
  requireSupabase()
  const { data, error } = await supabase
    .from('life_groups')
    .insert({
      name,
      district,
      barangay,
      leader,
      target_headcount: Number(targetHeadcount) || 0,
      actual_headcount: Number(actualHeadcount) || 0,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return hydrateLifeGroup(data)
}

/** Updates an existing life group by id. */
export async function updateLifeGroup(id, { name, district, barangay, leader, targetHeadcount, actualHeadcount }) {
  requireSupabase()
  const { error } = await supabase
    .from('life_groups')
    .update({
      name,
      district,
      barangay,
      leader,
      target_headcount: Number(targetHeadcount) || 0,
      actual_headcount: Number(actualHeadcount) || 0,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteLifeGroup(id) {
  requireSupabase()
  const { error } = await supabase.from('life_groups').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Updates a barangay's outreach stats/status (barangays themselves aren't created/deleted — the 37 are fixed geography). */
export async function updateBarangay(
  id,
  { reached, extensionChurch, peopleReached, firstTimers, lifeGroups, outreachActivities, householdsReached, growthPct },
) {
  requireSupabase()
  const payload = {}
  if (reached != null) payload.reached = !!reached
  if (extensionChurch != null) payload.extension_church = !!extensionChurch
  if (peopleReached != null) payload.people_reached = Number(peopleReached)
  if (firstTimers != null) payload.first_timers = Number(firstTimers)
  if (lifeGroups != null) payload.life_groups = Number(lifeGroups)
  if (outreachActivities != null) payload.outreach_activities = Number(outreachActivities)
  if (householdsReached != null) payload.households_reached = Number(householdsReached)
  if (growthPct != null) payload.growth_pct = Number(growthPct)

  const { error } = await supabase.from('barangays').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

/** Creates a new financial category. */
export async function createFinancialCategory({ name, target, actual }) {
  requireSupabase()
  const { data, error } = await supabase
    .from('financial_categories')
    .insert({ name, target: Number(target) || 0, actual: Number(actual) || 0 })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return hydrateFinancialCategory(data)
}

export async function updateFinancialCategory(id, { name, target, actual }) {
  requireSupabase()
  const { error } = await supabase
    .from('financial_categories')
    .update({ name, target: Number(target) || 0, actual: Number(actual) || 0 })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteFinancialCategory(id) {
  requireSupabase()
  const { error } = await supabase.from('financial_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Creates a new Management Attention item. */
export async function createAttentionItem({ title, detail, severity, area }) {
  requireSupabase()
  const { data, error } = await supabase.from('attention_items').insert({ title, detail, severity, area }).select().single()
  if (error) throw new Error(error.message)
  return { id: data.id, title: data.title, detail: data.detail, severity: data.severity, area: data.area }
}

export async function updateAttentionItem(id, { title, detail, severity, area }) {
  requireSupabase()
  const { error } = await supabase.from('attention_items').update({ title, detail, severity, area }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteAttentionItem(id) {
  requireSupabase()
  const { error } = await supabase.from('attention_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Updates an existing KPI's target/actual/trend (as opposed to createKpiTarget, which makes a new one). */
export async function updateKpi(id, { target, actual, unit, period }) {
  requireSupabase()
  const payload = {}
  if (target != null) payload.target = Number(target)
  if (actual != null) payload.actual = Number(actual)
  if (unit != null) payload.unit = unit
  if (period != null) payload.period = period

  const { error } = await supabase.from('kpis').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteKpi(id) {
  requireSupabase()
  const { error } = await supabase.from('kpis').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
