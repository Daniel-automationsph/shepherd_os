import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import AchievementBar from '../components/AchievementBar'
import PyaGrowth from '../components/PyaGrowth'
import PyaBarThenLineChart from '../components/PyaBarThenLineChart'
import { peso, commas } from '../data/api'
import { useAppData } from '../context/DataContext'
import { usePeriod } from '../context/PeriodContext'

export default function Financial() {
  const { data } = useAppData()
  const { financialKpi: kpi, numberOfTithersKpi, financialCategories, areaFinancialStats } = data
  const { monthlySeries } = usePeriod()

  return (
    <div className="scroll-page">
      <SectionHeader title="Financial Status" subtitle="Monitoring only — not a replacement for full accounting" />

      <div className="card">
        <div style={{ display: 'flex' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Total Tithes and Offering — This Month</h2>
          <StatusBadge status={kpi.status} />
        </div>
        <div style={{ marginTop: 16 }}>
          <PyaGrowth pya={kpi.target} actual={kpi.actual} formatter={peso} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 16 }}>
          <Fact label="Achievement" value={`${kpi.achievementPct.toFixed(1)}%`} />
          <Fact
            label="Variance"
            value={`${kpi.variance >= 0 ? '+' : '-'}${peso(Math.abs(kpi.variance))}`}
            color={kpi.variance >= 0 ? 'var(--status-on-target)' : 'var(--status-critical)'}
          />
        </div>
        <div className="body-muted" style={{ marginTop: 18, marginBottom: 4, fontSize: 13 }}>
          Monthly Trend — PYA (bar) then the real monthly trend (line)
        </div>
        <PyaBarThenLineChart
          pya={monthlySeries?.total?.totalGiving?.pya || 0}
          months={monthlySeries?.total?.totalGiving?.months || []}
          color="var(--accent)"
          valueFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`}
        />
      </div>

      {numberOfTithersKpi && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Number of Tithers — This Month</h2>
            <StatusBadge status={numberOfTithersKpi.status} />
          </div>
          <div style={{ marginTop: 16 }}>
            <PyaGrowth pya={numberOfTithersKpi.target} actual={numberOfTithersKpi.actual} formatter={commas} />
          </div>
          <div className="body-muted" style={{ marginTop: 18, marginBottom: 4, fontSize: 13 }}>
            Monthly Trend — PYA (bar) then the real monthly trend (line)
          </div>
          <PyaBarThenLineChart
            pya={monthlySeries?.total?.numberOfTithers?.pya || 0}
            months={monthlySeries?.total?.numberOfTithers?.months || []}
            color="var(--primary)"
            valueFormatter={(v) => commas(Math.round(v))}
          />
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>By Category</h2>
        <div className="caption" style={{ marginBottom: 14 }}>
          Bars compare Actual against PYA (Previous Year Accomplishment)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {financialCategories.map((cat) => {
            const growthPct = cat.target > 0 ? ((cat.actual - cat.target) / cat.target) * 100 : null
            return (
              <div key={cat.name}>
                <AchievementBar label={cat.name} target={cat.target} actual={cat.actual} formatter={peso} />
                {growthPct != null && (
                  <div
                    className="caption"
                    style={{
                      marginTop: 2,
                      color: growthPct >= 0 ? 'var(--status-on-target)' : 'var(--status-critical)',
                      fontWeight: 700,
                    }}
                  >
                    {growthPct >= 0 ? '+' : ''}
                    {growthPct.toFixed(1)}% vs PYA
                  </div>
                )}
              </div>
            )
          })}
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
                        color: a.isMainChurch ? '#00698c' : '#256e42',
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
