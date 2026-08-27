import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import TrendChart from '../components/TrendChart'
import { useAppData } from '../context/DataContext'

export default function PeopleGrowth() {
  const { data } = useAppData()
  const { totalMembers, activeMembers, newMembers, inactiveMembers, membershipGrowthPct, attendanceKpi, firstTimerFunnel } = data

  const metrics = [
    ['Total Members', totalMembers, null],
    ['Active Members', activeMembers, null],
    ['New Members', newMembers, null],
    ['Inactive Members', inactiveMembers, null],
    ['Growth', `+${membershipGrowthPct}%`, 'var(--status-on-target)'],
  ]

  const maxCount = firstTimerFunnel[0].count
  const palette = ['#2f5233', '#c98a2c', '#6e8fa3', '#8e5b45', '#4c7a50']

  return (
    <div className="scroll-page">
      <SectionHeader title="People & Growth" subtitle="Membership, attendance, and first-timer metrics" />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 20 }}>
        {metrics.map(([label, value, color]) => (
          <div className="card" key={label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="label">{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: color || 'var(--ink)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div style={{ display: 'flex' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Attendance</h2>
            <StatusBadge status={attendanceKpi.status} />
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 14 }}>
            <MiniStat label="Average" value={attendanceKpi.actual.toFixed(0)} />
            <MiniStat label="Target" value={attendanceKpi.target.toFixed(0)} />
            <MiniStat label="Achievement" value={`${attendanceKpi.achievementPct.toFixed(1)}%`} />
            {attendanceKpi.momChangePct != null && (
              <MiniStat
                label="vs Last Month"
                value={`${attendanceKpi.momChangePct >= 0 ? '+' : ''}${attendanceKpi.momChangePct.toFixed(1)}%`}
              />
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <TrendChart points={attendanceKpi.trend} color="var(--primary)" />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>First-Timer Funnel</h2>
          <div className="body-muted" style={{ marginTop: 4, marginBottom: 16 }}>
            First Timers → Contacted → Returned → Connected → Regular
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {firstTimerFunnel.map((stage, i) => (
              <div key={stage.label}>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, fontSize: 14 }}>{stage.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{stage.count}</div>
                </div>
                <div style={{ marginTop: 4, height: 8, borderRadius: 6, background: 'var(--surface-muted)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(stage.count / maxCount) * 100}%`,
                      height: '100%',
                      background: palette[i % palette.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  )
}
