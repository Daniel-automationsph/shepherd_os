import { supabase } from './supabaseClient'
import { UNREPORTED_MONTHS } from './periods'

// Metrics with "flow" behavior (a real count per month — sum across the
// selected period) vs "average" behavior (attendance — average across
// the period, since it's an average headcount, not a running total) vs
// "stock" behavior (membership/life groups — a snapshot, so we take the
// most recent reported month's value rather than summing or averaging).
const METRIC_SPECS = {
  attendance: { section: 'sunday_attendance', subsection: null, label: 'Total Membership', mode: 'average' },
  firstTimers: { section: 'first_timers', subsection: null, label: 'Total Membership', mode: 'sum' },
  membership: { section: 'category1_membership', subsection: null, label: 'Total Membership', mode: 'stock' },
  tithes: { section: 'finances', subsection: null, label: 'Tithes', mode: 'sum' },
  offerings: { section: 'finances', subsection: null, label: 'Offerings', mode: 'sum' },
  missionOffering: { section: 'finances', subsection: null, label: 'Mission Offering', mode: 'sum' },
  pledges: { section: 'finances', subsection: null, label: 'Pledges', mode: 'sum' },
  totalGiving: { section: 'finances', subsection: null, label: 'Total Tithes & Offering', mode: 'sum' },
  lifeGroupMembership: { section: 'life_group_ministry', subsection: 'lg_membership', label: 'Total No. Of Life Group Membership', mode: 'stock' },
}

function aggregate(monthValues, mode, selectedMonths) {
  const reportedInSelection = monthValues.filter((r) => selectedMonths.includes(r.month) && !UNREPORTED_MONTHS.has(r.month))
  if (reportedInSelection.length === 0) return 0

  if (mode === 'sum') {
    return reportedInSelection.reduce((s, r) => s + Number(r.value), 0)
  }
  if (mode === 'average') {
    const sum = reportedInSelection.reduce((s, r) => s + Number(r.value), 0)
    return sum / reportedInSelection.length
  }
  // 'stock' — most recent reported month within the selection.
  const sorted = [...reportedInSelection].sort((a, b) => (a.month < b.month ? 1 : -1))
  return Number(sorted[0].value)
}

function computeMetricsForArea(metricsForThisArea, valueRows, selectedMonths) {
  const result = {}
  for (const [key, spec] of Object.entries(METRIC_SPECS)) {
    const metric = metricsForThisArea.find((m) => m.section === spec.section && (m.subsection ?? null) === spec.subsection && m.label === spec.label)
    if (!metric) {
      result[key] = { actual: 0, target: 0 }
      continue
    }
    const monthsForMetric = valueRows.filter((v) => v.metric_id === metric.id)
    const actual = aggregate(monthsForMetric, spec.mode, selectedMonths)

    // Prorate the annual PYA target to match the selected period's length
    // for sum-mode metrics (a fair "pace toward the annual goal"), but not
    // for average-mode (attendance) or stock-mode (membership) metrics,
    // where the raw PYA is already the right comparison basis regardless
    // of how many months are selected.
    let target = Number(metric.pya) || 0
    if (spec.mode === 'sum') {
      target = (target / 12) * selectedMonths.filter((m) => !UNREPORTED_MONTHS.has(m)).length
    }
    result[key] = { actual, target }
  }
  return result
}

/**
 * Fetches real figures for exactly the given months, for the church-wide
 * TOTAL area AND each real operational area (Sta. Rita / Lumambayan /
 * Buli / Inclanay), aggregated appropriately per metric (sum/average/
 * stock — see METRIC_SPECS). Returns { total: {...}, byArea: [...] }.
 *
 * This queries the full monthly time series in por_metrics/
 * por_monthly_values (the original Excel import), not the single-
 * snapshot tables (org_stats, life_groups, etc.) the Admin Console edits.
 */
export async function fetchPeriodMetrics(selectedMonths) {
  if (!supabase) {
    throw new Error('Supabase is not configured yet — see .env.example.')
  }

  const { data: areaRows, error: areaErr } = await supabase.from('por_areas').select('id, name, barangay_name, is_extension_church')
  if (areaErr) throw new Error(`Failed to load areas: ${areaErr.message}`)

  const totalArea = areaRows.find((a) => a.name === 'TOTAL')
  const realAreas = areaRows.filter((a) => a.name !== 'TOTAL').sort((a, b) => a.name.localeCompare(b.name))
  if (!totalArea) throw new Error('Could not find the TOTAL area in por_areas.')

  const { data: metricsRows, error: metricsErr } = await supabase
    .from('por_metrics')
    .select('id, area_id, section, subsection, label, pya')
    .in(
      'area_id',
      areaRows.map((a) => a.id),
    )
  if (metricsErr) throw new Error(`Failed to load metrics: ${metricsErr.message}`)

  const neededMetricIds = metricsRows
    .filter((m) => Object.values(METRIC_SPECS).some((spec) => spec.section === m.section && (spec.subsection ?? null) === (m.subsection ?? null) && spec.label === m.label))
    .map((m) => m.id)

  const { data: valueRows, error: valuesErr } = await supabase.from('por_monthly_values').select('metric_id, month, value').in('metric_id', neededMetricIds)
  if (valuesErr) throw new Error(`Failed to load monthly values: ${valuesErr.message}`)

  const total = computeMetricsForArea(
    metricsRows.filter((m) => m.area_id === totalArea.id),
    valueRows,
    selectedMonths,
  )

  const byArea = realAreas.map((area) => ({
    areaName: area.barangay_name || area.name,
    isMainChurch: area.name === 'Sta Rita', // matched against add_main_church.sql's flag on barangays; por_areas itself has no main-church flag
    ...computeMetricsForArea(
      metricsRows.filter((m) => m.area_id === area.id),
      valueRows,
      selectedMonths,
    ),
  }))

  return { total, byArea }
}

/**
 * Fetches the full 12-month raw series (Sep–Aug, unaggregated) plus PYA
 * for each tracked church-wide (TOTAL) metric — used for the "PYA +
 * monthly trend" bar charts. Unlike fetchPeriodMetrics above, this
 * ignores the selected date range entirely and always returns the whole
 * year, since a trend chart needs every month to be meaningful.
 */
export async function fetchMonthlySeries() {
  if (!supabase) {
    throw new Error('Supabase is not configured yet — see .env.example.')
  }

  const { data: areaRow, error: areaErr } = await supabase.from('por_areas').select('id').eq('name', 'TOTAL').single()
  if (areaErr) throw new Error(`Failed to load TOTAL area: ${areaErr.message}`)

  const { data: metricsRows, error: metricsErr } = await supabase
    .from('por_metrics')
    .select('id, section, subsection, label, pya')
    .eq('area_id', areaRow.id)
  if (metricsErr) throw new Error(`Failed to load metrics: ${metricsErr.message}`)

  function findMetric(spec) {
    return metricsRows.find((m) => m.section === spec.section && (m.subsection ?? null) === spec.subsection && m.label === spec.label)
  }

  const neededMetricIds = Object.values(METRIC_SPECS)
    .map(findMetric)
    .filter(Boolean)
    .map((m) => m.id)

  const { data: valueRows, error: valuesErr } = await supabase
    .from('por_monthly_values')
    .select('metric_id, month, value')
    .in('metric_id', neededMetricIds)
  if (valuesErr) throw new Error(`Failed to load monthly values: ${valuesErr.message}`)

  const monthLabel = (m) => new Date(m + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

  const result = {}
  for (const [key, spec] of Object.entries(METRIC_SPECS)) {
    const metric = findMetric(spec)
    if (!metric) {
      result[key] = { pya: 0, months: [] }
      continue
    }
    const rows = valueRows.filter((v) => v.metric_id === metric.id).sort((a, b) => (a.month < b.month ? -1 : 1))
    result[key] = {
      pya: Number(metric.pya) || 0,
      months: rows.map((r) => ({
        label: monthLabel(r.month),
        value: Number(r.value),
        unreported: UNREPORTED_MONTHS.has(r.month),
      })),
    }
  }

  return result
}
