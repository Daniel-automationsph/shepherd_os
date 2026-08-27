import { statusFromAchievement, STATUS_META } from '../data/api'

export default function AchievementBar({ label, target, actual, formatter = (v) => Math.round(v).toString() }) {
  const pct = target === 0 ? 0 : actual / target
  const status = statusFromAchievement(pct * 100)
  const meta = STATUS_META[status]

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div className="body-muted">
          {formatter(actual)} / {formatter(target)}
        </div>
      </div>
      <div style={{ marginTop: 6, height: 8, borderRadius: 6, background: 'var(--surface-muted)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(Math.max(pct * 100, 0), 100)}%`,
            height: '100%',
            background: meta.fg,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div className="caption" style={{ marginTop: 4 }}>
        {(pct * 100).toFixed(1)}% achievement
      </div>
    </div>
  )
}
