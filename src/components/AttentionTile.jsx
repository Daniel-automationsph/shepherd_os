import { STATUS_META, KPI_STATUS } from '../data/api'

const ICONS = {
  [KPI_STATUS.CRITICAL]: '⚠',
  [KPI_STATUS.ATTENTION]: '●',
  [KPI_STATUS.ON_TARGET]: '✓',
}

export default function AttentionTile({ item }) {
  const meta = STATUS_META[item.severity]
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        background: meta.bg,
        opacity: 0.92,
        border: `1px solid ${meta.bg}`,
      }}
    >
      <div style={{ color: meta.fg, fontSize: 16, lineHeight: '20px' }}>{ICONS[item.severity]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, overflowWrap: 'break-word' }}>{item.title}</div>
        <div className="body-muted" style={{ marginTop: 3, overflowWrap: 'break-word' }}>
          {item.detail}
        </div>
        <div className="caption" style={{ marginTop: 6 }}>
          {item.area.toUpperCase()}
        </div>
      </div>
    </div>
  )
}
