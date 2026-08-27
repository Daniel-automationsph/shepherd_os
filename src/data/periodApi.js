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
  // monthValues: array of {month, value} for the reported (non-null) rows only.
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

/**
 * Fetches real church-wide (area = 'TOTAL') figures for exactly the given
 * months, aggregated appropriately per metric (sum/average/stock — see
 * METRIC_SPECS above). Used by the date-range selector — this queries the
 * full monthly time series in por_metrics/por_monthly_values, not the
 * single-snapshot tables the rest of the app reads from.
 */
export async function fetchPeriodMetrics(selectedMonths) {
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

  const result = {}
  for (const [key, spec] of Object.entries(METRIC_SPECS)) {
    const metric = findMetric(spec)
    if (!metric) {
      result[key] = { actual: 0, target: 0 }
      continue
    }
    const monthsForMetric = valueRows.filter((v) => v.metric_id === metric.id)
    const actual = aggregate(monthsForMetric, spec.mode, selectedMonths)

    // Prorate the annual PYA target to match the selected period's length
    // for sum-mode metrics (a fair "pace toward the annual goal" — e.g. a
    // single month is compared against ~1/12th of the annual target), but
    // NOT for average-mode (attendance) or stock-mode (membership)
    // metrics, where the raw PYA is already the right comparison basis
    // regardless of how many months are selected.
    let target = Number(metric.pya) || 0
    if (spec.mode === 'sum') {
      target = (target / 12) * selectedMonths.filter((m) => !UNREPORTED_MONTHS.has(m)).length
    }

    result[key] = { actual, target }
  }

  return result
}
