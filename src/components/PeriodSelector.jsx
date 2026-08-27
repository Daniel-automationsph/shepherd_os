import { usePeriod } from '../context/PeriodContext'

/** Always-visible date range picker — lives in the sidebar so it applies
 * across the whole app rather than being page-specific. */
export default function PeriodSelector({ collapsed }) {
  const { granularity, setGranularity, granularities, options, selectedKey, setSelectedKey } = usePeriod()

  if (collapsed) {
    // Icon-only sidebar mode (tablet width) — the two dropdowns don't fit,
    // so just show a compact calendar glyph as a visual placeholder; the
    // full control reappears once the sidebar expands (desktop) or via
    // the mobile layout.
    return (
      <div style={{ padding: '10px 0', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <span style={{ fontSize: 16 }}>📅</span>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="label" style={{ marginBottom: 2 }}>
        Date Range
      </div>
      <select
        value={granularity}
        onChange={(e) => setGranularity(e.target.value)}
        style={selectStyle}
      >
        {granularities.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const selectStyle = {
  width: '100%',
  padding: '7px 8px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--surface-muted)',
  fontSize: 12.5,
  fontFamily: 'inherit',
  color: 'var(--ink)',
}
