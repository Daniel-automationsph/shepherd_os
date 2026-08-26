// All sample data lives here. Replace this file (or point it at a real
// API/service layer) once a backend is wired up. Nothing in the UI layer
// should construct sample data directly — components only read from here.

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

function makeKpi({ name, category, target, actual, unit = '', period = 'This Month', trend = [] }) {
  const pct = achievementPct(actual, target)
  return {
    name,
    category,
    target,
    actual,
    unit,
    period,
    trend,
    achievementPct: pct,
    variance: actual - target,
    status: statusFromAchievement(pct),
    momChangePct: momChangePct(trend),
  }
}

// ---------------------------------------------------------------------
// People & Growth
// ---------------------------------------------------------------------

export const totalMembers = 1245
export const activeMembers = 1108
export const newMembers = 42
export const inactiveMembers = 137
export const membershipGrowthPct = 3.8

export const attendanceKpi = makeKpi({
  name: 'Average Weekly Attendance',
  category: 'People & Growth',
  target: 450,
  actual: 425,
  trend: [
    { label: 'May', value: 380 },
    { label: 'Jun', value: 398 },
    { label: 'Jul', value: 410 },
    { label: 'Aug', value: 425 },
  ],
})

export const firstTimersKpi = makeKpi({
  name: 'First Timers',
  category: 'People & Growth',
  target: 60,
  actual: 64,
  trend: [
    { label: 'May', value: 42 },
    { label: 'Jun', value: 48 },
    { label: 'Jul', value: 57 },
    { label: 'Aug', value: 64 },
  ],
})

export const firstTimerFunnel = [
  { label: 'First Timers', count: 64 },
  { label: 'Contacted', count: 55 },
  { label: 'Returned', count: 39 },
  { label: 'Connected to Life Group', count: 27 },
  { label: 'Regular Attendee', count: 18 },
]

// ---------------------------------------------------------------------
// Life Groups
// ---------------------------------------------------------------------

export const lifeGroups = [
  { name: 'Alpha 01', district: 'Poblacion', barangay: 'Zone I (Poblacion)', leader: 'J. Domingo', targetHeadcount: 12, actualHeadcount: 10 },
  { name: 'Alpha 02', district: 'Poblacion', barangay: 'Zone I (Poblacion)', leader: 'M. Reyes', targetHeadcount: 12, actualHeadcount: 14 },
  { name: 'Beta 01', district: 'Poblacion', barangay: 'Zone II (Poblacion)', leader: 'R. Cruz', targetHeadcount: 15, actualHeadcount: 13 },
  { name: 'Beta 02', district: 'Poblacion', barangay: 'Zone II (Poblacion)', leader: 'A. Santos', targetHeadcount: 15, actualHeadcount: 15 },
  { name: 'Gamma 01', district: 'South Cluster', barangay: 'Wawa', leader: 'P. Lim', targetHeadcount: 14, actualHeadcount: 9 },
  { name: 'Gamma 02', district: 'Central Cluster', barangay: 'Marfrancisco', leader: 'C. Tan', targetHeadcount: 14, actualHeadcount: 16 },
  { name: 'Delta 01', district: 'Central Cluster', barangay: 'Cacawan', leader: 'E. Garcia', targetHeadcount: 13, actualHeadcount: 12 },
  { name: 'Delta 02', district: 'Central Cluster', barangay: 'Papandayan', leader: 'F. Villanueva', targetHeadcount: 12, actualHeadcount: 8 },
].map((g) => {
  const pct = achievementPct(g.actualHeadcount, g.targetHeadcount)
  return { ...g, achievementPct: pct, status: statusFromAchievement(pct) }
})

export const lifeGroupHeadcountKpi = makeKpi({
  name: 'Life Group Headcount',
  category: 'Life Groups',
  target: 300,
  actual: 286,
  trend: [
    { label: 'May', value: 241 },
    { label: 'Jun', value: 256 },
    { label: 'Jul', value: 273 },
    { label: 'Aug', value: 286 },
  ],
})

export const totalLifeGroups = 24
export const targetLifeGroups = 26

// ---------------------------------------------------------------------
// Geographic Reach — Pinamalayan, Oriental Mindoro, Philippines (5208)
// ---------------------------------------------------------------------

// Town center used to anchor the map.
export const pinamalayanCenter = [13.0364, 121.4889]

// IMPORTANT: barangay names and populations are real (2020 PSA census).
// lat/lng are approximate PLACEHOLDER coordinates scattered around the town
// center for demo purposes — not surveyed GPS points. Per-barangay outreach
// figures (peopleReached, firstTimers, etc.) are illustrative sample data.
export const barangays = [
  { name: "Anoling", area: "Central Cluster", lat: 13.02844, lng: 121.50704, reached: false, population: 1927, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Bacungan", area: "Central Cluster", lat: 13.04962, lng: 121.49128, reached: false, population: 1593, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Bangbang", area: "South Cluster", lat: 13.01607, lng: 121.48107, reached: false, population: 1044, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Banilad", area: "South Cluster", lat: 13.00312, lng: 121.50916, reached: false, population: 1933, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Buli", area: "Central Cluster", lat: 13.04076, lng: 121.52090, reached: false, population: 1348, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Cacawan", area: "Central Cluster", lat: 13.03691, lng: 121.48288, reached: true, population: 6736, peopleReached: 169, firstTimers: 15, lifeGroups: 1, outreachActivities: 6, householdsReached: 47, growthPct: -1.0 },
  { name: "Calingag", area: "Central Cluster", lat: 13.02784, lng: 121.46058, reached: false, population: 1984, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Del Razon", area: "North Cluster", lat: 13.09099, lng: 121.45629, reached: false, population: 1494, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Guinhawa", area: "North Cluster", lat: 13.06451, lng: 121.49861, reached: true, population: 2236, peopleReached: 76, firstTimers: 12, lifeGroups: 0, outreachActivities: 1, householdsReached: 25, growthPct: -2.0 },
  { name: "Inclanay", area: "South Cluster", lat: 12.98358, lng: 121.52359, reached: true, population: 2085, peopleReached: 79, firstTimers: 8, lifeGroups: 0, outreachActivities: 1, householdsReached: 27, growthPct: -5.0 },
  { name: "Lumangbayan", area: "Central Cluster", lat: 13.03025, lng: 121.50298, reached: true, population: 2705, peopleReached: 133, firstTimers: 19, lifeGroups: 0, outreachActivities: 5, householdsReached: 42, growthPct: -6.0 },
  { name: "Malaya", area: "Central Cluster", lat: 13.01735, lng: 121.49154, reached: false, population: 935, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Maliangcog", area: "Central Cluster", lat: 13.04171, lng: 121.51513, reached: false, population: 1585, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Maningcol", area: "South Cluster", lat: 12.99523, lng: 121.50592, reached: false, population: 1800, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Marayos", area: "Central Cluster", lat: 13.02926, lng: 121.47022, reached: true, population: 1751, peopleReached: 68, firstTimers: 7, lifeGroups: 0, outreachActivities: 1, householdsReached: 20, growthPct: -8.0 },
  { name: "Marfrancisco", area: "Central Cluster", lat: 13.02478, lng: 121.47480, reached: true, population: 6079, peopleReached: 276, firstTimers: 35, lifeGroups: 1, outreachActivities: 1, householdsReached: 92, growthPct: 19.0 },
  { name: "Nabuslot", area: "South Cluster", lat: 12.99108, lng: 121.51787, reached: true, population: 2853, peopleReached: 58, firstTimers: 10, lifeGroups: 0, outreachActivities: 1, householdsReached: 16, growthPct: 10.0 },
  { name: "Pagalagala", area: "North Cluster", lat: 13.07027, lng: 121.49103, reached: false, population: 1228, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Palayan", area: "South Cluster", lat: 12.99821, lng: 121.47788, reached: true, population: 1957, peopleReached: 87, firstTimers: 10, lifeGroups: 0, outreachActivities: 1, householdsReached: 26, growthPct: -3.0 },
  { name: "Pambisan Malaki", area: "Central Cluster", lat: 13.02493, lng: 121.51468, reached: false, population: 1838, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Pambisan Munti", area: "North Cluster", lat: 13.07107, lng: 121.49777, reached: false, population: 1109, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Panggulayan", area: "Central Cluster", lat: 13.02191, lng: 121.45936, reached: true, population: 2789, peopleReached: 95, firstTimers: 12, lifeGroups: 0, outreachActivities: 5, householdsReached: 29, growthPct: -8.0 },
  { name: "Papandayan", area: "Central Cluster", lat: 13.04814, lng: 121.51185, reached: true, population: 6912, peopleReached: 233, firstTimers: 34, lifeGroups: 1, outreachActivities: 6, householdsReached: 72, growthPct: 28.0 },
  { name: "Pili", area: "Central Cluster", lat: 13.03356, lng: 121.49008, reached: true, population: 3937, peopleReached: 130, firstTimers: 18, lifeGroups: 0, outreachActivities: 4, householdsReached: 37, growthPct: -2.0 },
  { name: "Quinabigan", area: "Central Cluster", lat: 13.04975, lng: 121.50132, reached: true, population: 2455, peopleReached: 75, firstTimers: 7, lifeGroups: 0, outreachActivities: 6, householdsReached: 21, growthPct: -7.0 },
  { name: "Ranzo", area: "Central Cluster", lat: 13.02056, lng: 121.51445, reached: false, population: 924, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Rosario", area: "Central Cluster", lat: 13.01806, lng: 121.46796, reached: true, population: 1735, peopleReached: 74, firstTimers: 7, lifeGroups: 0, outreachActivities: 2, householdsReached: 24, growthPct: 16.0 },
  { name: "Sabang", area: "Central Cluster", lat: 13.02966, lng: 121.51290, reached: true, population: 2945, peopleReached: 103, firstTimers: 14, lifeGroups: 0, outreachActivities: 3, householdsReached: 33, growthPct: 13.0 },
  { name: "Santa Isabel", area: "South Cluster", lat: 13.00388, lng: 121.46856, reached: true, population: 2901, peopleReached: 141, firstTimers: 16, lifeGroups: 0, outreachActivities: 5, householdsReached: 46, growthPct: 10.0 },
  { name: "Santa Maria", area: "South Cluster", lat: 12.98721, lng: 121.46882, reached: false, population: 1504, peopleReached: 0, firstTimers: 0, lifeGroups: 0, outreachActivities: 0, householdsReached: 0, growthPct: 0 },
  { name: "Santa Rita", area: "Central Cluster", lat: 13.04069, lng: 121.45522, reached: true, population: 3028, peopleReached: 135, firstTimers: 11, lifeGroups: 0, outreachActivities: 6, householdsReached: 40, growthPct: -4.0 },
  { name: "Santo Nino", area: "South Cluster", lat: 13.00101, lng: 121.46035, reached: true, population: 1277, peopleReached: 35, firstTimers: 4, lifeGroups: 0, outreachActivities: 5, householdsReached: 10, growthPct: 6.0 },
  { name: "Wawa", area: "South Cluster", lat: 13.00390, lng: 121.50008, reached: true, population: 4764, peopleReached: 140, firstTimers: 21, lifeGroups: 1, outreachActivities: 5, householdsReached: 42, growthPct: 10.0 },
  { name: "Zone I (Poblacion)", area: "Poblacion", lat: 13.03846, lng: 121.48044, reached: true, population: 2957, peopleReached: 135, firstTimers: 21, lifeGroups: 2, outreachActivities: 2, householdsReached: 37, growthPct: 3.0 },
  { name: "Zone II (Poblacion)", area: "Poblacion", lat: 13.00606, lng: 121.49089, reached: true, population: 2994, peopleReached: 77, firstTimers: 13, lifeGroups: 2, outreachActivities: 1, householdsReached: 22, growthPct: 26.0 },
  { name: "Zone III (Poblacion)", area: "Poblacion", lat: 13.01274, lng: 121.51699, reached: true, population: 2029, peopleReached: 94, firstTimers: 9, lifeGroups: 0, outreachActivities: 4, householdsReached: 26, growthPct: -12.0 },
  { name: "Zone IV (Poblacion)", area: "Poblacion", lat: 12.99619, lng: 121.49142, reached: true, population: 1012, peopleReached: 30, firstTimers: 3, lifeGroups: 0, outreachActivities: 5, householdsReached: 9, growthPct: 18.0 },
]

export const totalBarangays = 37
export const barangaysReached = 22
export const reachTargetPct = 70

export const geographicCoverageKpi = makeKpi({
  name: 'Geographic Coverage',
  category: 'Outreach',
  target: 70,
  actual: (barangaysReached / totalBarangays) * 100,
  unit: '%',
  trend: [
    { label: 'May', value: 43 },
    { label: 'Jun', value: 46 },
    { label: 'Jul', value: 54 },
    { label: 'Aug', value: 59 },
  ],
})

// ---------------------------------------------------------------------
// Financial
// ---------------------------------------------------------------------

export const financialCategories = [
  { name: 'General Fund', target: 300000, actual: 290000 },
  { name: 'Missions', target: 80000, actual: 92000 },
  { name: 'Building Fund', target: 100000, actual: 72000 },
  { name: 'Outreach', target: 20000, actual: 18500 },
].map((c) => {
  const pct = achievementPct(c.actual, c.target)
  return { ...c, achievementPct: pct, variance: c.actual - c.target, status: statusFromAchievement(pct) }
})

export const financialKpi = makeKpi({
  name: 'Overall Giving',
  category: 'Financial',
  target: 500000,
  actual: 482500,
  unit: '₱',
  trend: [
    { label: 'May', value: 91 },
    { label: 'Jun', value: 96 },
    { label: 'Jul', value: 88 },
    { label: 'Aug', value: 96.5 },
  ],
})

// ---------------------------------------------------------------------
// Management Attention
// ---------------------------------------------------------------------

export const attentionItems = [
  {
    title: '2 KPIs critically below target',
    detail: 'Building Fund (72%) and Barangay Coverage (59% vs 70% target) need leadership review this week.',
    severity: KPI_STATUS.CRITICAL,
    area: 'KPI Center',
  },
  {
    title: '3 Life Groups below headcount target',
    detail: 'Alpha 01, Gamma 01, and Delta 02 are each more than 15% under their headcount target.',
    severity: KPI_STATUS.CRITICAL,
    area: 'Life Groups',
  },
  {
    title: 'Financial target is ₱17,500 short',
    detail: 'Overall giving is at 96.5% of the ₱500,000 monthly target.',
    severity: KPI_STATUS.ATTENTION,
    area: 'Financial',
  },
  {
    title: '15 target barangays remain unreached',
    detail: 'Anoling, Bacungan, Bangbang, and 12 others have no recorded outreach activity this quarter.',
    severity: KPI_STATUS.ATTENTION,
    area: 'Outreach',
  },
  {
    title: 'First-Timer target exceeded',
    detail: '64 first timers vs a target of 60 — 107% achievement, +12% vs previous month.',
    severity: KPI_STATUS.ON_TARGET,
    area: 'People & Growth',
  },
]

// ---------------------------------------------------------------------
// Convenience roll-ups for the Dashboard's executive KPI row
// ---------------------------------------------------------------------

export const lifeGroupAchievementPct = (lifeGroupHeadcountKpi.actual / lifeGroupHeadcountKpi.target) * 100
export const firstTimerAchievementPct = (firstTimersKpi.actual / firstTimersKpi.target) * 100
export const financialAchievementPct = (financialKpi.actual / financialKpi.target) * 100
export const reachAchievementPct = (geographicCoverageKpi.actual / geographicCoverageKpi.target) * 100

export function peso(v) {
  const s = Math.round(v).toString()
  return '₱' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function commas(v) {
  const s = Math.round(v).toString()
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
