import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import TrendChart from '../components/TrendChart'
import { useAppData } from '../context/DataContext'

export default function PeopleGrowth() {
  const { data } = useAppData()
  const { totalMembers, activeMembers, newMembers, inactiveMembers, membershipGrowthPct, attendanceKpi, firstTimerFunnel, areaPeopleStats } = data

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
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Discipleship Pipeline</h2>
          <div className="body-muted" style={{ marginTop: 4, marginBottom: 16 }}>
            Evangelized → Pre-Encounter → Encounter → Post-Encounter → Water Baptized
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

      {areaPeopleStats && areaPeopleStats.length > 0 && (
        <div className="card" style={{ marginTop: 20, padding: 8, overflowX: 'auto' }}>
          <div style={{ padding: '12px 12px 4px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>By Area</h2>
            <div className="body-muted" style={{ marginTop: 2 }}>
              Membership, attendance, and first-timers for the Main Church and each Extension Church.
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720, marginTop: 8 }}>
            <thead>
              <tr style={{ background: 'var(--surface-muted)' }}>
                {['Area', 'Membership', 'Attendance', 'First Timers', 'Workers'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areaPeopleStats.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.areaName}</div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 999,
                        color: a.isMainChurch ? '#00698c' : '#256e42',
                        background: a.isMainChurch ? '#e0f7ff' : '#e8f8ee',
                      }}
                    >
                      {a.isMainChurch ? 'MAIN CHURCH' : 'EXTENSION CHURCH'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {a.membershipActual} / {a.membershipTarget}
                    </div>
                    <StatusBadge status={a.membershipStatus} compact />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {a.attendanceActual.toFixed(0)} / {a.attendanceTarget.toFixed(0)}
                    </div>
                    <StatusBadge status={a.attendanceStatus} compact />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {a.firstTimersActual} / {a.firstTimersTarget}
                    </div>
                    <StatusBadge status={a.firstTimersStatus} compact />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.totalWorkers}</div>
                    <div className="caption">{a.volunteerWorkers} volunteer</div>
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

function MiniStat({ label, value }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  )
}
