import { statusFromAchievement, STATUS_META } from '../data/api'
import Sparkline from './Sparkline'
import StatusBadge from './StatusBadge'

export default function KpiStatCard({ label, achievementPct, subtitle, trend = [] }) {
  const status = statusFromAchievement(achievementPct)
  const meta = STATUS_META[status]
  const displayPct = achievementPct % 1 === 0 ? achievementPct.toFixed(0) : achievementPct.toFixed(1)
  const barColor = meta.fg.startsWith('var') ? getComputedColor(meta.fg) : meta.fg

  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="stat-large" style={{ marginTop: 10 }}>
        {displayPct}%
      </div>
      <div className="body-muted" style={{ marginTop: 6 }}>
        {subtitle}
      </div>

      {/* Thin progress-toward-target bar — a quick "am I on pace" signal
          alongside the trend sparkline below, without taking up much
          space in an already-compact card. */}
      <div style={{ marginTop: 10, height: 5, borderRadius: 3, background: 'var(--surface-muted)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(Math.max(achievementPct, 0), 100)}%`,
            height: '100%',
            background: barColor,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <div style={{ flex: 1 }}>
          <Sparkline points={trend.map((t) => t.value)} color={barColor} />
        </div>
        <StatusBadge status={status} compact />
      </div>
    </div>
  )
}

// Recharts needs a real color string, not a CSS var reference, for gradients.
function getComputedColor(cssVar) {
  const map = {
    'var(--status-on-target)': '#2f7d4f',
    'var(--status-attention)': '#c98a2c',
    'var(--status-critical)': '#b3432d',
  }
  return map[cssVar] || '#2f5233'
}
