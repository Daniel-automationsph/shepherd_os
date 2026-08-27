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
