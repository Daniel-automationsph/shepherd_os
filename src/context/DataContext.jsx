import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchAppData } from '../data/api'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAppData()
      setData(result)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong loading data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return <DataContext.Provider value={{ data, loading, error, refetch: load }}>{children}</DataContext.Provider>
}

/**
 * Access the shared app data. Returns { data, loading, error, refetch }.
 * `data` is null until the first successful fetch — screens should check
 * `loading`/`error` before reading from `data`.
 */
export function useAppData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData must be used within a DataProvider')
  return ctx
}
