import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { fetchAppData } from '../data/api'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  // Tracks whether we've EVER successfully loaded, independent of `data`
  // itself, so `load` can stay a stable (empty-deps) callback without
  // needing `data` in its dependency array — using `data` there would
  // redefine `load` every time it changes, which would re-run the
  // mount effect below and refetch in a loop.
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    // Only block the whole page with the full-screen loading state on
    // the very first load, when there's nothing to show yet. Every
    // subsequent refetch (e.g. after saving something in Admin Console)
    // should update `data` quietly in the background — NOT unmount the
    // current screen, or the user gets bounced back to whatever that
    // screen's default view is (e.g. Admin Console resetting to its
    // first tab) instead of staying exactly where they were.
    if (!hasLoadedOnce.current) {
      setLoading(true)
    }
    setError(null)
    try {
      const result = await fetchAppData()
      setData(result)
      hasLoadedOnce.current = true
    } catch (err) {
      console.error(err)
      // Same reasoning as the loading guard above: only block the whole
      // page with a full error screen if we've never successfully
      // loaded before. A failed background refetch (e.g. a network
      // hiccup right after a save) shouldn't replace an already-working
      // screen with an error page and lose the user's place — the admin
      // form itself already shows its own error if the SAVE specifically
      // failed; this only covers the follow-up refetch.
      if (!hasLoadedOnce.current) {
        setError(err.message || 'Something went wrong loading data.')
      }
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
