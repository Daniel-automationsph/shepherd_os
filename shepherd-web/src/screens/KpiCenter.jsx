import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import { attendanceKpi, firstTimersKpi, lifeGroupHeadcountKpi, geographicCoverageKpi, financialKpi } from '../data/mockData'

const ALL_KPIS = [attendanceKpi, firstTimersKpi, lifeGroupHeadcountKpi, geographicCoverageKpi, financialKpi]

export default function KpiCenter() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const grouped = {}
  for (const k of ALL_KPIS) {
    grouped[k.category] = grouped[k.category] || []
    grouped[k.category].push(k)
  }

  return (
    <div className="scroll-page">
      <SectionHeader
        title="KPI Center"
        subtitle="Every KPI: Target → Actual → Achievement → Variance → Status → Trend"
        trailing={
          <button
            onClick={() => setSheetOpen(true)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            + New Target
          </button>
        }
      />

      {Object.entries(grouped).map(([category, kpis]) => (
        <div key={category} style={{ marginBottom: 8 }}>
          <div className="label" style={{ margin: '12px 0 10px' }}>
            {category.toUpperCase()}
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {kpis.map((k) => (
              <KpiCard key={k.name} kpi={k} />
            ))}
          </div>
        </div>
      ))}

      {sheetOpen && <NewTargetSheet onClose={() => setSheetOpen(false)} />}
    </div>
  )
}

function KpiCard({ kpi }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{kpi.name}</div>
        <StatusBadge status={kpi.status} compact />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{kpi.achievementPct.toFixed(1)}%</div>
      <div className="body-muted" style={{ marginTop: 4 }}>
        {kpi.unit === '₱' ? '₱' : ''}
        {kpi.actual.toFixed(0)} of {kpi.unit === '₱' ? '₱' : ''}
        {kpi.target.toFixed(0)}
        {kpi.unit === '%' ? '%' : ''}
      </div>
      <div style={{ flex: 1 }} />
      <hr className="divider" style={{ margin: '16px 0 10px' }} />
      <div style={{ display: 'flex' }}>
        <div className="caption">{kpi.period}</div>
        <div style={{ flex: 1 }} />
        {kpi.momChangePct != null && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: kpi.momChangePct >= 0 ? 'var(--status-on-target)' : 'var(--status-critical)',
            }}
          >
            {kpi.momChangePct >= 0 ? '▲' : '▼'} {Math.abs(kpi.momChangePct).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}

const CATEGORIES = ['People & Growth', 'Life Groups', 'Outreach', 'Financial', 'Ministry']
const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Annual']

function NewTargetSheet({ onClose }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [target, setTarget] = useState('')
  const [frequency, setFrequency] = useState(FREQUENCIES[1])

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--surface-muted)',
    fontSize: 14,
    fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30,42,34,0.35)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 24px 28px',
          width: '100%',
          maxWidth: 520,
          boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 16px' }} />
        <h1 className="serif" style={{ fontSize: 20, fontWeight: 700 }}>
          New KPI Target
        </h1>
        <div className="body-muted" style={{ marginTop: 4, marginBottom: 20 }}>
          Leadership defines a target — Shepherd OS calculates the rest.
        </div>

        <Field label="KPI Name">
          <input style={inputStyle} placeholder="e.g. First Timers" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div style={{ height: 14 }} />
        <Field label="Category">
          <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div style={{ height: 14, display: 'flex', gap: 14 }} />
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="Target Value">
              <input style={inputStyle} type="number" placeholder="e.g. 70" value={target} onChange={(e) => setTarget(e.target.value)} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Frequency">
              <select style={inputStyle} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {FREQUENCIES.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <button
          onClick={() => {
            alert(`Target "${name || 'Untitled KPI'}" created (demo — not persisted).`)
            onClose()
          }}
          style={{
            width: '100%',
            marginTop: 24,
            padding: 14,
            borderRadius: 10,
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Create Target
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
