/** Shows Actual, PYA, and the growth % between them — used anywhere we
 * compare this period's actual figure against last year's average. */
export default function PyaGrowth({ pya, actual, formatter = (v) => v }) {
  const growthPct = pya > 0 ? ((actual - pya) / pya) * 100 : null
  const isUp = growthPct != null && growthPct >= 0

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <div className="label">Actual</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 3, overflowWrap: 'break-word' }}>{formatter(actual)}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="label">PYA (Previous Year Accomplishment)</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 3, overflowWrap: 'break-word' }}>{formatter(pya)}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="label">AA vs PYA</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginTop: 3,
            overflowWrap: 'break-word',
            color: growthPct == null ? 'var(--ink)' : isUp ? 'var(--status-on-target)' : 'var(--status-critical)',
          }}
        >
          {growthPct == null ? '—' : `${isUp ? '+' : ''}${growthPct.toFixed(1)}%`}
        </div>
      </div>
    </div>
  )
}
