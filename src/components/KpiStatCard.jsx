import { statusFromAchievement, STATUS_META } from '../data/api'
import Sparkline from './Sparkline'
import StatusBadge from './StatusBadge'

export default function KpiStatCard({ label, achievementPct, subtitle, trend = [] }) {
  const status = statusFromAchievement(achievementPct)
  const meta = STATUS_META[status]
  const displayPct = achievementPct % 1 === 0 ? achievementPct.toFixed(0) : achievementPct.toFixed(1)

  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="stat-large" style={{ marginTop: 10 }}>
        {displayPct}%
      </div>
      <div className="body-muted" style={{ marginTop: 6 }}>
        {subtitle}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <Sparkline points={trend.map((t) => t.value)} color={meta.fg.startsWith('var') ? getComputedColor(meta.fg) : meta.fg} />
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
