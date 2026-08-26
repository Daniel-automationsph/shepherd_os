import { STATUS_META } from '../data/mockData'

export default function StatusBadge({ status, compact = false }) {
  const meta = STATUS_META[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compact ? '3px 8px' : '5px 10px',
        borderRadius: 'var(--radius-pill)',
        background: meta.bg,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: meta.fg,
          display: 'inline-block',
        }}
      />
      <span style={{ color: meta.fg, fontSize: compact ? 10.5 : 11.5, fontWeight: 700, letterSpacing: 0.2 }}>
        {meta.label}
      </span>
    </span>
  )
}
