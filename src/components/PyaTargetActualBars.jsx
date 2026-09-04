const PYA_COLOR = '#8095a8'
const TARGET_COLOR = '#c98a2c'
const AA_COLOR = '#2f5233'

/**
 * Small reference visual: PYA, Target (optional), and AA side by side —
 * a quick "where do these three numbers stand relative to each other"
 * glance, kept separate from the monthly trend line so that chart isn't
 * sharing its scale with numbers of a very different magnitude.
 *
 * Deliberately NOT a full Recharts chart — axes/grid/margins are all
 * overhead for something this simple, and made the original version
 * take up far more space than 3 bars need. This is plain, tightly
 * sized divs instead, with a fixed max-width so it doesn't stretch to
 * fill a wide column the way a ResponsiveContainer would.
 */
export default function PyaTargetActualBars({ pya, target, actual, valueFormatter = (v) => Math.round(v).toString(), maxHeight = 90 }) {
  const bars = [
    { label: 'PYA', value: pya, color: PYA_COLOR },
    ...(target != null ? [{ label: 'Target', value: target, color: TARGET_COLOR }] : []),
    { label: 'AA', value: actual, color: AA_COLOR },
  ]
  const maxValue = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', maxWidth: 200, height: maxHeight + 44 }}>
      {bars.map((b) => (
        <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 3, whiteSpace: 'nowrap' }}>{valueFormatter(b.value)}</div>
          <div
            style={{
              width: 22,
              height: Math.max(4, (b.value / maxValue) * maxHeight),
              background: b.color,
              borderRadius: '4px 4px 0 0',
            }}
          />
          <div className="caption" style={{ marginTop: 4 }}>
            {b.label}
          </div>
        </div>
      ))}
    </div>
  )
}
