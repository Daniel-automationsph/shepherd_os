import { usePeriod } from '../context/PeriodContext'

/** Shows the currently selected period + loading/error state. Renders
 * `children` (the actual historical figures) only once real data has
 * loaded successfully. */
export default function HistoricalBanner({ children }) {
  const { selected, loading, error, refetch } = usePeriod()

  return (
    <div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: 'var(--accent)',
            flexShrink: 0,
          }}
        >
          📅
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{selected?.label}</div>
          <div className="caption">Read-only historical figures — change the period in the sidebar</div>
        </div>
      </div>

      {loading ? (
        <div className="body-muted" style={{ textAlign: 'center', padding: 40 }}>
          Loading figures for this period...
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn't load this period</div>
          <div className="body-muted" style={{ marginBottom: 14 }}>
            {error}
          </div>
          <button
            onClick={refetch}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
