import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import BarangayMap from '../components/BarangayMap'
import TrendChart from '../components/TrendChart'
import { useAppData } from '../context/DataContext'

export default function GeographicReach() {
  const { data } = useAppData()
  const { barangays, totalBarangays, barangaysReached, geographicCoverageKpi, reachTargetPct } = data
  const [selected, setSelected] = useState(null)
  const gap = reachTargetPct - geographicCoverageKpi.actual

  const tiles = [
    ['Total Barangays', totalBarangays, null],
    ['Barangays Reached', barangaysReached, null],
    ['Coverage', `${geographicCoverageKpi.actual.toFixed(0)}%`, null],
    ['Gap to Target', `${gap.toFixed(0)}%`, 'var(--status-attention)'],
  ]

  return (
    <div className="scroll-page">
      <SectionHeader
        title="Geographic Reach"
        subtitle="Which barangays are we reaching — and where should outreach focus next?"
      />

      <div className="two-col">
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Reach Map</h2>
          <div className="body-muted" style={{ marginTop: 4, marginBottom: 14 }}>
            Click a barangay for detail
          </div>
          <BarangayMap barangays={barangays} selectedName={selected?.name} onSelect={setSelected} />
        </div>

        <div className="card">
          {!selected ? (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Coverage Trend</h2>
              <TrendChart points={geographicCoverageKpi.trend} color="var(--primary)" valueFormatter={(v) => `${v}%`} />
              <div className="body-muted" style={{ marginTop: 8 }}>
                Select a barangay on the map to see its detail here.
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>{selected.name}</h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                    color: selected.extensionChurch ? 'var(--accent)' : selected.reached ? 'var(--status-on-target)' : 'var(--status-critical)',
                    background: selected.extensionChurch ? 'var(--accent-soft)' : selected.reached ? 'var(--status-on-target-bg)' : 'var(--status-critical-bg)',
                  }}
                >
                  {selected.extensionChurch ? 'Extension Church' : selected.reached ? 'Reached' : 'Not Reached'}
                </span>
              </div>
              <div className="body-muted">
                {selected.area} · Pop. {selected.population}
              </div>
              <div style={{ marginTop: 16 }}>
                {selected.reached ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    <Fact label="People Reached" value={selected.peopleReached} />
                    <Fact label="First Timers" value={selected.firstTimers} />
                    <Fact label="Life Groups" value={selected.lifeGroups} />
                    <Fact label="Households" value={selected.householdsReached} />
                    <Fact label="Outreach Activities" value={selected.outreachActivities} />
                    <Fact label="Growth" value={`${selected.growthPct >= 0 ? '+' : ''}${selected.growthPct.toFixed(0)}%`} />
                  </div>
                ) : (
                  <div className="body-muted">
                    No recorded outreach activity yet. Consider prioritizing this barangay for the next outreach cycle.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', margin: '20px 0' }}>
        {tiles.map(([label, value, color]) => (
          <div className="card" key={label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="label">{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: color || 'var(--ink)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>All Tracked Barangays</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {barangays.map((b) => (
            <div
              key={b.name}
              onClick={() => setSelected(b)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 4px',
                cursor: 'pointer',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: b.extensionChurch ? 'var(--accent)' : b.reached ? 'var(--status-on-target)' : 'var(--status-critical)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, fontSize: 14 }}>
                {b.name}
                {b.extensionChurch && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--accent)',
                      background: 'var(--accent-soft)',
                      padding: '2px 6px',
                      borderRadius: 999,
                    }}
                  >
                    EXTENSION CHURCH
                  </span>
                )}
              </div>
              <div className="body-muted">{b.area}</div>
              <div className="body-muted" style={{ width: 90, textAlign: 'right' }}>
                {b.reached ? `${b.peopleReached} people` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div style={{ width: 130 }}>
      <div className="label">{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  )
}
