import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GRANULARITIES, optionsFor, defaultMonthlyKey } from '../data/periods'
import { fetchPeriodMetrics, fetchMonthlySeries } from '../data/periodApi'

const PeriodContext = createContext(null)

export function PeriodProvider({ children }) {
  const [granularity, setGranularityState] = useState('Monthly')
  const [selectedKey, setSelectedKey] = useState(defaultMonthlyKey())
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // The "PYA + monthly trend" bar charts always show the full year
  // regardless of the selected period, so this is fetched once on mount
  // rather than refetching every time the period selector changes.
  const [monthlySeries, setMonthlySeries] = useState(null)
  const [monthlySeriesLoading, setMonthlySeriesLoading] = useState(true)
  const [monthlySeriesError, setMonthlySeriesError] = useState(null)

  const options = useMemo(() => optionsFor(granularity), [granularity])
  const selected = useMemo(() => options.find((o) => o.key === selectedKey) || options[0], [options, selectedKey])

  const setGranularity = useCallback((g) => {
    setGranularityState(g)
    const opts = optionsFor(g)
    setSelectedKey(opts[opts.length - 1].key) // default to the most recent period in that granularity
  }, [])

  // Sets granularity + key together in one go (used by the Apply button in
  // PeriodSelector) — React batches these into a single re-render inside
  // an event handler, so the fetch effect below only fires once instead
  // of twice (once for the granularity change, once for the key change).
  const applyPeriod = useCallback((g, key) => {
    setGranularityState(g)
    setSelectedKey(key)
  }, [])

  const load = useCallback(async (months) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPeriodMetrics(months)
      setMetrics(result)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load data for this period.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMonthlySeries = useCallback(async () => {
    setMonthlySeriesLoading(true)
    setMonthlySeriesError(null)
    try {
      const result = await fetchMonthlySeries()
      setMonthlySeries(result)
    } catch (err) {
      console.error(err)
      setMonthlySeriesError(err.message || 'Could not load the monthly trend.')
    } finally {
      setMonthlySeriesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selected) load(selected.months)
  }, [selected, load])

  useEffect(() => {
    loadMonthlySeries()
  }, [loadMonthlySeries])

  const value = {
    granularity,
    setGranularity,
    applyPeriod,
    granularities: GRANULARITIES,
    options,
    selectedKey,
    setSelectedKey,
    selected,
    metrics,
    loading,
    error,
    refetch: () => selected && load(selected.months),
    monthlySeries,
    monthlySeriesLoading,
    monthlySeriesError,
    refetchMonthlySeries: loadMonthlySeries,
  }

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export function usePeriod() {
  const ctx = useContext(PeriodContext)
  if (!ctx) throw new Error('usePeriod must be used within a PeriodProvider')
  return ctx
}
