import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GRANULARITIES, optionsFor, defaultMonthlyKey } from '../data/periods'
import { fetchPeriodMetrics } from '../data/periodApi'

const PeriodContext = createContext(null)

export function PeriodProvider({ children }) {
  const [granularity, setGranularityState] = useState('Monthly')
  const [selectedKey, setSelectedKey] = useState(defaultMonthlyKey())
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const options = useMemo(() => optionsFor(granularity), [granularity])
  const selected = useMemo(() => options.find((o) => o.key === selectedKey) || options[0], [options, selectedKey])

  const setGranularity = useCallback((g) => {
    setGranularityState(g)
    const opts = optionsFor(g)
    setSelectedKey(opts[opts.length - 1].key) // default to the most recent period in that granularity
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

  useEffect(() => {
    if (selected) load(selected.months)
  }, [selected, load])

  const value = {
    granularity,
    setGranularity,
    granularities: GRANULARITIES,
    options,
    selectedKey,
    setSelectedKey,
    selected,
    metrics,
    loading,
    error,
    refetch: () => selected && load(selected.months),
  }

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export function usePeriod() {
  const ctx = useContext(PeriodContext)
  if (!ctx) throw new Error('usePeriod must be used within a PeriodProvider')
  return ctx
}
