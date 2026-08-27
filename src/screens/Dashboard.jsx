import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import KpiStatCard from '../components/KpiStatCard'
import BarangayMap from '../components/BarangayMap'
import AttentionTile from '../components/AttentionTile'
import { peso } from '../data/api'
import { useAppData } from '../context/DataContext'

export default function Dashboard() {
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
        title="Executive Dashboard"
        subtitle="See the church. Measure the mission. Manage the ministry."
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

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Life Group Performance</h2>
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
