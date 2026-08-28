import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import TrendChart from '../components/TrendChart'
import { commas } from '../data/api'
import { useAppData } from '../context/DataContext'

export default function PeopleGrowth() {
  const { data } = useAppData()
  const {
    totalMembers,
    activeMembers,
    inactiveMembers,
    membershipGrowthPct,
    attendanceKpi,
    firstTimersKpi,
    firstTimerFunnel,
    areaPeopleStats,
  } = data

  const maxCount = firstTimerFunnel[0].count
  const funnelPalette = ['#2f5233', '#c98a2c', '#6e8fa3', '#8e5b45', '#4c7a50']

  // Church-wide Workers total isn't tracked as its own figure — it's
  // computed by summing the per-area Workers numbers (editable in Admin
  // Console → Area People) rather than needing a separate database field.
  const workers = (areaPeopleStats || []).reduce(
    (sum, a) => ({
      fullTime: sum.fullTime + (a.fullTimeWorkers || 0),
      partTime: sum.partTime + (a.partTimeWorkers || 0),
      volunteer: sum.volunteer + (a.volunteerWorkers || 0),
      total: sum.total + (a.totalWorkers || 0),
    }),
    { fullTime: 0, partTime: 0, volunteer: 0, total: 0 },
  )

  return (
    <div className="scroll-page">
      <SectionHeader title="Membership" subtitle="Category 1, Category 2, Attendance, First Timers, and Workers" />

      {/* --- Category 1 --- */}
      <SectionBlock title="Category 1" subtitle="SSAM + LGAM + SSAM/LGAM">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Fact label="Total Membership" value={commas(totalMembers)} />
          <Fact label="Growth" value={`+${membershipGrowthPct}%`} color="var(--status-on-target)" />
        </div>
      </SectionBlock>

      {/* --- Category 2 --- */}
      <SectionBlock title="Category 2" subtitle="SSAM + SSAM/LGAM">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Fact label="Total Membership" value={commas(activeMembers)} />
          <Fact label="Not in Category 2" value={commas(inactiveMembers)} />
        </div>
      </SectionBlock>

      {/* --- Sunday Service Attendance --- */}
      <SectionBlock title="Sunday Service Attendance">
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }} />
          <StatusBadge status={attendanceKpi.status} />
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
          <Fact label="Average" value={attendanceKpi.actual.toFixed(0)} />
          <Fact label="Target" value={attendanceKpi.target.toFixed(0)} />
          <Fact label="Achievement" value={`${attendanceKpi.achievementPct.toFixed(1)}%`} />
        </div>
        <div style={{ marginTop: 14 }}>
          <TrendChart points={attendanceKpi.trend} color="var(--primary)" />
        </div>
      </SectionBlock>

      {/* --- First Timers --- */}
      <SectionBlock title="First Timers">
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }} />
          <StatusBadge status={firstTimersKpi.status} />
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10, marginBottom: 18 }}>
          <Fact label="This Period" value={commas(firstTimersKpi.actual)} />
          <Fact label="Target" value={commas(firstTimersKpi.target)} />
          <Fact label="Achievement" value={`${firstTimersKpi.achievementPct.toFixed(1)}%`} />
        </div>

        <div className="body-muted" style={{ marginBottom: 12 }}>
          Discipleship Pipeline: Evangelized → Pre-Encounter → Encounter → Post-Encounter → Water Baptized
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
                    background: funnelPalette[i % funnelPalette.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* --- Workers --- */}
      <SectionBlock title="Workers" subtitle="Summed across all areas — edit per-area figures in Admin Console → Area People">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Fact label="Full-time" value={commas(workers.fullTime)} />
          <Fact label="Part-time" value={commas(workers.partTime)} />
          <Fact label="Volunteer" value={commas(workers.volunteer)} />
          <Fact label="Total" value={commas(workers.total)} />
        </div>
      </SectionBlock>

      {/* --- By Area (unchanged) --- */}
      {areaPeopleStats && areaPeopleStats.length > 0 && (
        <div className="card" style={{ marginTop: 8, padding: 8, overflowX: 'auto' }}>
          <div style={{ padding: '12px 12px 4px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>By Area</h2>
            <div className="body-muted" style={{ marginTop: 2 }}>
              Membership, attendance, first-timers, and workers for the Main Church and each Extension Church.
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

function SectionBlock({ title, subtitle, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h2>
      {subtitle && (
        <div className="body-muted" style={{ marginTop: 2, marginBottom: 4 }}>
          {subtitle}
        </div>
      )}
      <div style={{ marginTop: 12 }}>{children}</div>
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
