import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import KpiStatCard from '../components/KpiStatCard'
import BarangayMap from '../components/BarangayMap'
import AttentionTile from '../components/AttentionTile'
import ModeToggle from '../components/ModeToggle'
import { LoadingSpinner } from '../components/Spinner'
import { peso, commas } from '../data/api'
import { useAppData } from '../context/DataContext'
import { usePeriod } from '../context/PeriodContext'

export default function Dashboard() {
  const [mode, setMode] = useState('Current')
  const { data } = useAppData()
  const [selected, setSelected] = useState(null)

  const {
    lifeGroupHeadcountKpi,
    firstTimersKpi,
    financialKpi,
    geographicCoverageKpi,
    lifeGroupAchievementPct,
    firstTimerAchievementPct,
    financialAchievementPct,
    reachAchievementPct,
    barangays,
    barangaysReached,
    totalBarangays,
    attentionItems,
    lifeGroups,
    totalLifeGroups,
  } = data

  const healthy = lifeGroups.filter((g) => g.achievementPct >= 100).length
  const attention = lifeGroups.filter((g) => g.achievementPct >= 80 && g.achievementPct < 100).length
  const critical = lifeGroups.filter((g) => g.achievementPct < 80).length

  return (
    <div className="scroll-page">
      <SectionHeader
        title="Main Overview"
        subtitle="See the church. Measure the mission. Manage the ministry."
        trailing={<ModeToggle mode={mode} onChange={setMode} />}
      />

      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <BarangayMap barangays={barangays} selectedName={selected?.name} onSelect={setSelected} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent)' }}>⚑</span>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Needs Attention</h2>
          </div>
          <div className="body-muted" style={{ marginTop: 4, marginBottom: 14 }}>
            Don&apos;t search for problems — see them.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {attentionItems.slice(0, 4).map((item) => (
              <AttentionTile key={item.id ?? item.title} item={item} />
            ))}
          </div>
        </div>
      </div>

      {mode === 'Historical' ? (
        <HistoricalKpiRow />
      ) : (
        <div className="kpi-row" style={{ marginBottom: 28 }}>
          <KpiStatCard
            label="LIFE GROUPS"
            achievementPct={lifeGroupAchievementPct}
            subtitle={`${lifeGroupHeadcountKpi.actual} / ${lifeGroupHeadcountKpi.target} headcount`}
            trend={lifeGroupHeadcountKpi.trend}
          />
          <KpiStatCard
            label="FIRST TIMERS"
            achievementPct={firstTimerAchievementPct}
            subtitle={`${firstTimersKpi.actual} / ${firstTimersKpi.target} this month`}
            trend={firstTimersKpi.trend}
          />
          <KpiStatCard
            label="FINANCIAL"
            achievementPct={financialAchievementPct}
            subtitle={`${peso(financialKpi.actual)} of ${peso(financialKpi.target)}`}
            trend={financialKpi.trend}
          />
          <KpiStatCard
            label="GEOGRAPHIC REACH"
            achievementPct={reachAchievementPct}
            subtitle={`${barangaysReached} / ${totalBarangays} barangays`}
            trend={geographicCoverageKpi.trend}
          />
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Life Group Performance</h2>
        <div className="caption" style={{ marginBottom: 16 }}>
          Always shows current live status, regardless of the Date Range selection above.
        </div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <Stat value={totalLifeGroups} label="Groups" />
          <Stat value={`${lifeGroupHeadcountKpi.actual} / ${lifeGroupHeadcountKpi.target}`} label="Headcount" />
          <Stat value={healthy} label="Healthy" color="var(--status-on-target)" />
          <Stat value={attention} label="Attention" color="var(--status-attention)" />
          <Stat value={critical} label="Critical" color="var(--status-critical)" />
        </div>
      </div>
    </div>
  )
}

function HistoricalKpiRow() {
  const { selected, metrics, loading, error, refetch } = usePeriod()

  if (loading) {
    return (
      <div style={{ marginBottom: 28 }}>
        <LoadingSpinner label={`Loading figures for ${selected?.label}...`} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 20, marginBottom: 28 }}>
        <div className="body-muted" style={{ marginBottom: 10 }}>
          {error}
        </div>
        <button
          onClick={refetch}
          style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    )
  }
  if (!metrics) return null

  const cards = [
    ['LIFE GROUP MEMBERSHIP', commas(metrics.lifeGroupMembership.actual), 'Snapshot as of this period'],
    ['FIRST TIMERS', commas(metrics.firstTimers.actual), `of ${commas(metrics.firstTimers.target)} target`],
    ['TOTAL GIVING', peso(metrics.totalGiving.actual), `of ${peso(metrics.totalGiving.target)} target`],
    ['ATTENDANCE', metrics.attendance.actual.toFixed(0), `of ${metrics.attendance.target.toFixed(0)} target`],
  ]

  return (
    <div style={{ marginBottom: 28 }}>
      <div className="caption" style={{ marginBottom: 10 }}>
        Showing {selected?.label} — Geographic Reach isn&apos;t available historically, so it's omitted here.
      </div>
      <div className="kpi-row">
        {cards.map(([label, value, sub]) => (
          <div className="card" key={label}>
            <div className="label">{label}</div>
            <div className="stat-large" style={{ marginTop: 10 }}>
              {value}
            </div>
            <div className="body-muted" style={{ marginTop: 6 }}>
              {sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || 'var(--ink)' }}>{value}</div>
      <div className="label" style={{ marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}
