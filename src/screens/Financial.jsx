import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import AchievementBar from '../components/AchievementBar'
import TrendChart from '../components/TrendChart'
import { peso } from '../data/api'
import { useAppData } from '../context/DataContext'

export default function Financial() {
  const { data } = useAppData()
  const { financialKpi: kpi, financialCategories, areaFinancialStats } = data
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

      <div className="two-col" style={{ marginTop: 20 }}>
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
          <TrendChart points={kpi.trend} color="var(--accent)" valueFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`} />
        </div>
      </div>

      {areaFinancialStats && areaFinancialStats.length > 0 && (
        <div className="card" style={{ marginTop: 20, padding: 8, overflowX: 'auto' }}>
          <div style={{ padding: '12px 12px 4px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>By Area</h2>
            <div className="body-muted" style={{ marginTop: 2 }}>
              Tithes, Offerings, Mission Offering, and Pledges for the Main Church and each Extension Church.
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780, marginTop: 8 }}>
            <thead>
              <tr style={{ background: 'var(--surface-muted)' }}>
                {['Area', 'Tithes', 'Offerings', 'Mission Offering', 'Pledges', 'Total Giving'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areaFinancialStats.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.areaName}</div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: a.isMainChurch ? '#1d5fa8' : 'var(--accent)',
                      }}
                    >
                      {a.isMainChurch ? 'Main Church' : 'Extension Church'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{peso(a.tithesActual)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{peso(a.offeringsActual)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{peso(a.missionOfferingActual)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{peso(a.pledgesActual)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{peso(a.totalGivingActual)}</div>
                    <StatusBadge status={a.totalGivingStatus} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
