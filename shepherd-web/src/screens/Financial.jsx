import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import AchievementBar from '../components/AchievementBar'
import TrendChart from '../components/TrendChart'
import { financialKpi, financialCategories, peso } from '../data/mockData'

export default function Financial() {
  const kpi = financialKpi
  return (
    <div className="scroll-page">
      <SectionHeader title="Financial Status" subtitle="Monitoring only — not a replacement for full accounting" />

      <div className="card">
        <div style={{ display: 'flex' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Overall Giving — This Month</h2>
          <StatusBadge status={kpi.status} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 16 }}>
          <Fact label="Target" value={peso(kpi.target)} />
          <Fact label="Actual" value={peso(kpi.actual)} />
          <Fact label="Achievement" value={`${kpi.achievementPct.toFixed(1)}%`} />
          <Fact
            label="Variance"
            value={`${kpi.variance >= 0 ? '+' : '-'}${peso(Math.abs(kpi.variance))}`}
            color={kpi.variance >= 0 ? 'var(--status-on-target)' : 'var(--status-critical)'}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(280px, 2fr)', gap: 20, alignItems: 'start', marginTop: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>By Category</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {financialCategories.map((cat) => (
              <AchievementBar key={cat.name} label={cat.name} target={cat.target} actual={cat.actual} formatter={peso} />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Achievement Trend</h2>
          <TrendChart points={kpi.trend} color="var(--accent)" valueFormatter={(v) => `${v}%`} />
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value, color }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 3, color: color || 'var(--ink)' }}>{value}</div>
    </div>
  )
}
