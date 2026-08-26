import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import TrendChart from '../components/TrendChart'
import { lifeGroups, lifeGroupHeadcountKpi, totalLifeGroups, KPI_STATUS } from '../data/mockData'

export default function LifeGroups() {
  const [filter, setFilter] = useState('All')
  const districts = ['All', ...new Set(lifeGroups.map((g) => g.district))]
  const filtered = filter === 'All' ? lifeGroups : lifeGroups.filter((g) => g.district === filter)

  const healthy = lifeGroups.filter((g) => g.status === KPI_STATUS.ON_TARGET).length
  const attention = lifeGroups.filter((g) => g.status === KPI_STATUS.ATTENTION).length
  const critical = lifeGroups.filter((g) => g.status === KPI_STATUS.CRITICAL).length

  return (
    <div className="scroll-page">
      <SectionHeader title="Life Groups" subtitle="Roll-up headcount by group, church-defined ministry area, and church total" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(0, 3fr)', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <div style={{ display: 'flex' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Church-Wide Roll-Up</h2>
            <StatusBadge status={lifeGroupHeadcountKpi.status} />
          </div>
          <div className="stat-large" style={{ marginTop: 14 }}>
            {lifeGroupHeadcountKpi.actual} / {lifeGroupHeadcountKpi.target}
          </div>
          <div className="body-muted">
            {lifeGroupHeadcountKpi.achievementPct.toFixed(1)}% achievement · {totalLifeGroups} groups
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <CountChip label="Healthy" count={healthy} color="var(--status-on-target)" />
            <CountChip label="Attention" count={attention} color="var(--status-attention)" />
            <CountChip label="Critical" count={critical} color="var(--status-critical)" />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Headcount Trend</h2>
          <TrendChart points={lifeGroupHeadcountKpi.trend} color="var(--accent)" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Groups</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            fontSize: 13.5,
          }}
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Group', 'Ministry Area', 'Barangay', 'Leader', 'Target', 'Actual', 'Achievement', 'Status'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.name} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13.5 }}>{g.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.district}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.barangay}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.leader}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.targetHeadcount}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.actualHeadcount}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.achievementPct.toFixed(0)}%</td>
                <td style={{ padding: '10px 14px' }}>
                  <StatusBadge status={g.status} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CountChip({ label, count, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 10, background: `${color}1a` }}>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{count}</div>
      <div className="caption">{label}</div>
    </div>
  )
}
